# 데이터베이스 설계 가이드 (Database Schema)

본 문서는 [하루투자] 프로젝트의 Supabase (PostgreSQL) 데이터베이스 스키마 및 보안 정책을 정의합니다.

---

## 1. 데이터베이스 개요

- **플랫폼**: Supabase (PostgreSQL 15+)
- **인증**: Supabase Auth (Google OAuth 통합)
- **보안**: Row Level Security (RLS) 정책 적용
- **타입 생성**: `supabase gen types typescript` 명령어로 자동 생성

---

## 2. Phase 1 테이블 구조

### 2.1 `users` 테이블

사용자 기본 정보를 저장합니다. Supabase Auth의 `auth.users`와 연동됩니다.

#### 스키마
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_users_google_id ON public.users(google_id);
CREATE INDEX idx_users_email ON public.users(email);
```

#### RLS 정책
```sql
-- 사용자는 자신의 정보만 조회 가능
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- 사용자는 자신의 정보만 수정 가능
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);
```

#### TypeScript 타입
```typescript
export interface User {
  id: string;
  google_id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}
```

---

### 2.2 `stocks` 테이블

사용자가 등록한 관심 종목을 저장합니다.

#### 스키마
```sql
CREATE TABLE public.stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ticker TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 제약 조건
  CONSTRAINT stocks_name_not_empty CHECK (length(trim(name)) > 0)
);

-- 인덱스
CREATE INDEX idx_stocks_user_id ON public.stocks(user_id);
CREATE INDEX idx_stocks_created_at ON public.stocks(created_at DESC);
```

#### RLS 정책
```sql
-- RLS 활성화
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 종목만 조회 가능
CREATE POLICY "Users can view own stocks"
  ON public.stocks FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 종목만 생성 가능
CREATE POLICY "Users can create own stocks"
  ON public.stocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 종목만 삭제 가능
CREATE POLICY "Users can delete own stocks"
  ON public.stocks FOR DELETE
  USING (auth.uid() = user_id);
```

#### TypeScript 타입
```typescript
export interface Stock {
  id: string;
  user_id: string;
  name: string;
  ticker: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockInsert {
  user_id: string;
  name: string;
  ticker?: string | null;
}
```

---

### 2.3 `reports` 테이블

AI가 생성한 종목별 리포트를 저장합니다.

#### 스키마
```sql
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stock_id UUID NOT NULL REFERENCES public.stocks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 제약 조건
  CONSTRAINT reports_content_not_empty CHECK (length(trim(content)) > 0)
);

-- 인덱스
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_stock_id ON public.reports(stock_id);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);

-- 복합 인덱스 (종목별 최신 리포트 조회 최적화)
CREATE INDEX idx_reports_stock_created ON public.reports(stock_id, created_at DESC);
```

#### RLS 정책
```sql
-- RLS 활성화
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 리포트만 조회 가능
CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 리포트만 생성 가능
CREATE POLICY "Users can create own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 리포트만 삭제 가능
CREATE POLICY "Users can delete own reports"
  ON public.reports FOR DELETE
  USING (auth.uid() = user_id);
```

#### TypeScript 타입
```typescript
export interface Report {
  id: string;
  user_id: string;
  stock_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ReportInsert {
  user_id: string;
  stock_id: string;
  content: string;
}

// 리포트와 종목 정보를 함께 조회하는 타입
export interface ReportWithStock extends Report {
  stock: Stock;
}
```

---

## 3. 데이터베이스 함수 및 트리거

### 3.1 `updated_at` 자동 업데이트 함수

모든 테이블의 `updated_at` 컬럼을 자동으로 업데이트합니다.

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_stocks
  BEFORE UPDATE ON public.stocks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_reports
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

---

## 4. 초기 데이터 설정

### 4.1 사용자 생성 트리거

Google OAuth 로그인 시 `users` 테이블에 자동으로 레코드를 생성합니다.

```sql
-- Supabase Auth의 auth.users와 public.users 동기화
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, google_id, email, name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'google_id',
    NEW.email,
    NEW.raw_user_meta_data->>'name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 5. 쿼리 패턴 예시

### 5.1 사용자 종목 목록 조회

```typescript
// lib/supabase/queries/stocks.ts
import { createClient } from '@/lib/supabase/server';

export async function getUserStocks(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('stocks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
```

### 5.2 종목별 최신 리포트 조회

```typescript
// lib/supabase/queries/reports.ts
import { createClient } from '@/lib/supabase/server';

export async function getLatestReport(stockId: string, userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reports')
    .select('*, stock:stocks(*)')
    .eq('stock_id', stockId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) throw error;
  return data;
}
```

### 5.3 리포트 생성

```typescript
export async function createReport(
  userId: string,
  stockId: string,
  content: string
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reports')
    .insert({
      user_id: userId,
      stock_id: stockId,
      content: content.trim()
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
```

---

## 6. Phase 2 확장 스키마 (예비)

### 6.1 `user_settings` 테이블

사용자 알림 설정을 저장합니다.

```sql
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('EMAIL', 'KAKAO')),
  delivery_target TEXT NOT NULL,
  delivery_time TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, delivery_type)
);
```

### 6.2 `notifications` 테이블

알림 히스토리를 저장합니다.

```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. 마이그레이션 전략

### 7.1 Supabase CLI 사용

```bash
# 마이그레이션 파일 생성
supabase migration new create_initial_schema

# 로컬에서 마이그레이션 실행
supabase db reset

# 프로덕션에 적용
supabase db push
```

### 7.2 마이그레이션 파일 구조

```
supabase/
  migrations/
    20260128000000_create_initial_schema.sql
    20260128000001_add_rls_policies.sql
    20260128000002_add_triggers.sql
```

---

## 8. 보안 체크리스트

- [ ] 모든 테이블에 RLS 활성화
- [ ] 사용자별 데이터 격리 정책 적용
- [ ] 외래 키 제약 조건 설정
- [ ] 입력 검증 (CHECK 제약 조건)
- [ ] 인덱스 최적화
- [ ] 환경 변수로 DB 접근 정보 관리
- [ ] 서비스 롤 키는 서버에서만 사용

---

## 9. 성능 최적화

### 9.1 인덱스 전략
- 자주 조회되는 컬럼에 인덱스 생성
- 복합 인덱스로 쿼리 성능 향상
- `created_at DESC` 정렬 최적화

### 9.2 쿼리 최적화
- 필요한 컬럼만 SELECT (`select('id, name')`)
- 페이지네이션 적용 (Phase 2)
- JOIN 최소화

---

## 10. 참고 자료

- [Supabase 문서](https://supabase.com/docs)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)

---

**최종 업데이트**: 2026-01-28  
**버전**: 1.0.0
