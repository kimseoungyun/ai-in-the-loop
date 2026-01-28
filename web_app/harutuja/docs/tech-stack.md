# 기술 명세서 (Tech Stack)

본 문서는 [하루투자] 프로젝트의 기술 스택 및 컴포넌트 설계 원칙을 정의합니다.

---

## 1. 핵심 기술 스택

### 1.1 Frontend Framework
- **Next.js 15** (App Router)
  - React Server Components 활용
  - Server Actions를 통한 데이터 변경
  - 파일 기반 라우팅
  - 자동 코드 스플리팅

### 1.2 언어 및 타입 시스템
- **TypeScript 5.x**
  - 엄격한 타입 체크 (`strict: true`)
  - 도메인별 타입 분리 (`types/` 디렉토리)

### 1.3 스타일링
- **Tailwind CSS 4.x**
  - 유틸리티 퍼스트 접근
  - 모바일 우선 반응형 디자인
  - 다크 모드 지원 (Phase 2 예비)

### 1.4 UI 컴포넌트 라이브러리
- **shadcn/ui**
  - Radix UI 기반 접근성 컴포넌트
  - Tailwind CSS 스타일링
  - 커스터마이징 가능한 디자인 시스템
  - 주요 컴포넌트: Button, Card, Input, Form

### 1.5 아이콘
- **Lucide React**
  - 일관된 아이콘 세트
  - Tree-shaking 지원
  - TypeScript 타입 정의 포함

### 1.6 인증
- **NextAuth.js (Auth.js)**
  - Google OAuth Provider
  - 세션 관리 (JWT 또는 Database)
  - 미들웨어 기반 라우트 보호

### 1.7 데이터베이스
- **Supabase (PostgreSQL)**
  - Row Level Security (RLS) 정책
  - 실시간 구독 (Phase 2 예비)
  - 자동 타입 생성 (`supabase gen types`)

### 1.8 AI 서비스
- **Google Gemini API** 또는 **OpenAI API**
  - 텍스트 완성 (Text Completion)
  - 프롬프트 템플릿 관리 (`lib/ai/prompts.ts`)

### 1.9 개발 도구
- **ESLint** - 코드 품질 검사
- **TypeScript** - 타입 체크
- **pnpm** - 패키지 관리자

---

## 2. 프로젝트 구조 원칙

### 2.1 폴더 구조 철학

```
app/              # 라우트 및 페이지 (Next.js App Router)
components/       # 재사용 가능한 컴포넌트
  ├── ui/        # 순수 UI 컴포넌트 (비즈니스 로직 없음)
  └── domain/    # 도메인별 비즈니스 컴포넌트
lib/              # 유틸리티 및 외부 서비스 클라이언트
hooks/            # 커스텀 React 훅
types/            # TypeScript 타입 정의
docs/             # 프로젝트 문서
```

### 2.2 컴포넌트 설계 원칙

#### UI 컴포넌트 (`components/ui/`)
- **목적**: 재사용 가능한 순수 UI 컴포넌트
- **특징**:
  - 비즈니스 로직 없음
  - Props 기반 제어
  - shadcn/ui 패턴 준수
  - 접근성 (a11y) 고려

**예시 구조:**
```typescript
// components/ui/button.tsx
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'default', size = 'md', ...props }: ButtonProps) {
  // UI 로직만 포함
}
```

#### 도메인 컴포넌트 (`components/domain/`)
- **목적**: 비즈니스 로직이 포함된 도메인별 컴포넌트
- **특징**:
  - 도메인별 폴더 분리 (auth, stocks, reports)
  - 커스텀 훅 사용 (`hooks/`)
  - 서버 액션 또는 API 호출 포함 가능

**예시 구조:**
```typescript
// components/domain/stocks/stock-card.tsx
'use client';

import { useStocks } from '@/hooks/use-stocks';
import { Button } from '@/components/ui/button';

export function StockCard({ stockId }: { stockId: string }) {
  const { stock, deleteStock } = useStocks(stockId);
  // 비즈니스 로직 포함
}
```

### 2.3 라우트 그룹 (Route Groups)

#### `(auth)` - 인증 영역
- 공개 접근 가능
- 로그인 페이지 포함
- 레이아웃: 최소한의 UI

#### `(dashboard)` - 인증 후 영역
- 인증 필수 (미들웨어 보호)
- 메인 대시보드, 종목 관리, 리포트 조회
- 레이아웃: 헤더, 네비게이션 포함

---

## 3. 데이터 흐름 설계

### 3.1 Server Components vs Client Components

**Server Components (기본)**
- 데이터 페칭
- 정적 콘텐츠 렌더링
- 서버 액션 호출

**Client Components (`'use client'`)**
- 인터랙티브 UI (버튼 클릭, 폼 입력)
- 상태 관리 (useState, useEffect)
- 커스텀 훅 사용

### 3.2 데이터 페칭 전략

#### Server Components에서의 데이터 페칭
```typescript
// app/(dashboard)/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: stocks } = await supabase
    .from('stocks')
    .select('*');
  
  return <StockList stocks={stocks} />;
}
```

#### Client Components에서의 데이터 페칭
```typescript
// hooks/use-stocks.ts
'use client';

export function useStocks() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  
  useEffect(() => {
    fetchStocks().then(setStocks);
  }, []);
  
  return { stocks };
}
```

### 3.3 서버 액션 (Server Actions)

데이터 변경은 Server Actions를 우선 사용:

```typescript
// app/(dashboard)/stocks/new/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';

export async function createStock(formData: FormData) {
  const supabase = createClient();
  // 데이터 저장 로직
}
```

---

## 4. 상태 관리 전략

### Phase 1: React 기본 상태 관리
- `useState` - 컴포넌트 로컬 상태
- `useEffect` - 사이드 이펙트
- Server Components - 서버 상태

### Phase 2 예비: 상태 관리 라이브러리
- **Zustand** 또는 **TanStack Query** 고려
- 실시간 데이터 동기화 (Supabase Realtime)

---

## 5. 에러 처리 및 로딩 상태

### 5.1 에러 바운더리
- `error.tsx` 파일 활용 (Next.js App Router)
- 사용자 친화적 에러 메시지

### 5.2 로딩 상태
- `loading.tsx` 파일 활용
- Suspense 경계 설정

### 5.3 폼 검증
- 클라이언트: React Hook Form + Zod
- 서버: Server Actions에서 재검증

---

## 6. 보안 고려사항

### 6.1 인증 및 인가
- NextAuth.js 세션 검증
- Supabase RLS 정책으로 데이터 접근 제어
- 미들웨어를 통한 라우트 보호

### 6.2 환경 변수
- `.env.local`에 민감 정보 저장
- `.env.example`에 예시 제공
- Git에 커밋하지 않음

### 6.3 API 보안
- CORS 설정
- Rate Limiting (Phase 2)
- 입력 검증 및 Sanitization

---

## 7. 성능 최적화

### 7.1 이미지 최적화
- Next.js `Image` 컴포넌트 사용
- WebP 포맷 지원

### 7.2 코드 스플리팅
- 동적 임포트 (`dynamic()`)
- 라우트 기반 자동 스플리팅

### 7.3 캐싱 전략
- Server Components 캐싱
- Supabase 쿼리 캐싱 (Phase 2)

---

## 8. 개발 워크플로우

### 8.1 로컬 개발 환경
```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 타입 체크
pnpm type-check

# 린트 검사
pnpm lint
```

### 8.2 환경 변수 설정
`.env.local` 파일 생성:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
AI_API_KEY=your_ai_api_key
```

---

## 9. Phase 2 확장 고려사항

### 9.1 추가 라이브러리
- **React Hook Form** - 폼 관리
- **Zod** - 스키마 검증
- **Date-fns** - 날짜 처리
- **React Query** - 서버 상태 관리
- **Zustand** - 클라이언트 상태 관리

### 9.2 모니터링 및 분석
- **Vercel Analytics** - 성능 모니터링
- **Sentry** - 에러 추적 (선택)

### 9.3 테스팅
- **Vitest** - 단위 테스트
- **Playwright** - E2E 테스트

---

## 10. 참고 자료

- [Next.js 15 공식 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com)
- [NextAuth.js 문서](https://next-auth.js.org)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

---

**최종 업데이트**: 2026-01-28  
**버전**: 1.0.0
