# [하루투자] Implementation Roadmap (Phase 1 MVP)

본 문서는 `PRD.md`, `FLOW.md`, `db-schema.md` 및 `HT_` 마이그레이션 파일들을 기반으로 작성된 **실제 구현 로드맵**입니다.
Phase 1 MVP(3일 수업 내 구현) 목표 달성을 위해 **Supabase `HT_` 스키마 연동**과 **Next.js 15 App Router** 구현에 집중합니다.

## Phase 1: MVP Development Roadmap

### Step 1: Project & Database Setup (Day 1 Morning)

**목표**: 로컬 개발 환경 구성 및 Supabase `HT_` 스키마 배포

1.  **Project Initialization**
    *   [ ] Next.js 15 + Tailwind CSS 4 + TypeScript 프로젝트 설정 (shadcn/ui init)
    *   [ ] 필수 패키지 설치: `@supabase/ssr`, `@supabase/supabase-js`, `next-auth`, `lucide-react`, `zod`
    *   [ ] 환경 변수 설정 (`.env.local`): Supabase URL, Anon Key, Google OAuth Client ID/Secret

2.  **Database Migration (`HT_` Schema)**
    *   [ ] `docs/migrations/*.sql` 파일 확인
        *   `20260129_111500_HT_schema_bootstrap_v1.sql` (Tables, Functions, Triggers)
        *   `20260129_111700_HT_rls_policies_v1.sql` (RLS Policies)
    *   [ ] local supabase or cloud supabase에 마이그레이션 적용
    *   [ ] `supabase gen types typescript` 실행하여 `types/supabase.ts` 생성
        *   **주의**: 생성된 타입에서 `HT_` 접두사가 붙은 테이블(`HT_PROFILE`, `HT_STOCK` 등) 확인 필수

3.  **Supabase Client Setup**
    *   [ ] `lib/supabase/server.ts`: Server Component/Action용 클라이언트 (Cookie CookieAuth)
    *   [ ] `lib/supabase/client.ts`: Client Component용 클라이언트
    *   [ ] `lib/supabase/middleware.ts`: 세션 갱신 및 라우트 보호 미들웨어

---

### Step 2: Authentication & User Management (Day 1 Afternoon)

**목표**: Google 로그인 및 `HT_PROFILE` 동기화

1.  **Google OAuth Integration**
    *   [ ] NextAuth.js (Auth.js v5) 또는 Supabase Auth UI 설정
    *   [ ] 로그인 페이지 (`app/(auth)/login/page.tsx`) 구현: "Google로 시작하기" 버튼
    *   [ ] `auth/callback` 라우트 처리

2.  **User Synchronization Strategy (`HT_PROFILE`)**
    *   [ ] **Trigger Verification**: `auth.users` 생성 시 `public.HT_PROFILE`에 자동 insert되는 트리거(`HT_on_auth_user_created`) 동작 확인
    *   [ ] **Server Action**: `getUserProfile()` (Server-side) 구현
        *   `HT_PROFILE` 테이블에서 `HT_PROFILE_ID` (= `auth.uid()`)로 조회

3.  **Layout & Header**
    *   [ ] `app/(dashboard)/layout.tsx`: 인증된 사용자 전용 레이아웃
    *   [ ] `Header` 컴포넌트: 로고, 네비게이션, 사용자 프로필(Avatar), 로그아웃

---

### Step 3: Stock Management (CRUD) (Day 2 Morning)

**목표**: 관심 종목 등록/조회 및 `HT_STOCK` 연동

1.  **Stock Listing (Read)**
    *   [ ] `app/(dashboard)/page.tsx` (메인): `HT_STOCK` 리스트 조회
    *   [ ] `lib/supabase/queries/stocks.ts`: `getStocks(userId)` 함수 구현
        *   Query: `.from('HT_STOCK').select('*').eq('HT_PROFILE_ID', userId).order('HT_CREATED_AT', { ascending: false })`
    *   [ ] `StockCard` 컴포넌트 구현: 종목명(`HT_NAME`), 티커(`HT_TICKER`) 표시

2.  **Stock Creation (Create)**
    *   [ ] `app/(dashboard)/stocks/new/page.tsx` 또는 Modal UI
    *   [ ] `actions/stocks.ts`: `createStock(formData)` Server Action 구현
    *   [ ] Validation (Zod): `HT_NAME` 필수, `HT_TICKER` 포맷 확인
    *   [ ] Insert Query: `.from('HT_STOCK').insert({ HT_PROFILE_ID: userId, HT_NAME: name, HT_TICKER: ticker })`
    *   [ ] RLS Policy(`HT_STOCK_insert_own`)에 의해 본인 데이터만 입력됨을 확인

3.  **Stock Deletion (Delete)**
    *   [ ] `StockCard` 내 삭제 버튼 추가
    *   [ ] `actions/stocks.ts`: `deleteStock(stockId)` 구현
    *   [ ] Delete Query: `.from('HT_STOCK').delete().eq('HT_STOCK_ID', stockId).eq('HT_PROFILE_ID', userId)`

---

### Step 4: AI Report Generation (Day 2 Afternoon)

**목표**: `HT_REPORT` 생성 및 AI API 연동

1.  **Stock Detail Page**
    *   [ ] `app/(dashboard)/stocks/[id]/page.tsx`
    *   [ ] Dynamic Route 파라미터(`id`)로 `HT_STOCK` 상세 정보 조회

2.  **AI Service Integration**
    *   [ ] `lib/ai/client.ts`: Google Gemini 또는 OpenAI 클라이언트 설정
    *   [ ] `lib/ai/prompts.ts`: 요약 프롬프트 템플릿 정의 ("{종목명}의 최근 1주 이슈 요약...")

3.  **Report Generation Logic**
    *   [ ] UI: "AI 요약 생성" 버튼
    *   [ ] `actions/reports.ts`: `generateReport(stockId)` Server Action
        1. `HT_STOCK` 정보 조회
        2. AI API 호출 (텍스트 생성)
        3. `HT_REPORT` 테이블에 저장
           *   Insert: `.from('HT_REPORT').insert({ HT_PROFILE_ID: userId, HT_STOCK_ID: stockId, HT_CONTENT: aiContent })`
    *   [ ] **Constraint Check**: `HT_REPORT_insert_own_stock` RLS 정책 (내 종목에만 리포트 생성 가능) 검증

4.  **Displaying Reports**
    *   [ ] 상세 페이지에 최신 `HT_REPORT` 내용(`HT_CONTENT`) 렌더링
    *   [ ] Markdown 렌더러 적용 (AI 응답 포맷팅)

---

### Step 5: UI Polish & Final Review (Day 3)

**목표**: UI 완성도 향상 및 배포 준비

1.  **UI Components Polish**
    *   [ ] Loading States (`loading.tsx`, Skeleton UI)
    *   [ ] Error Handling (`error.tsx`, Toast Messages)
    *   [ ] Responsive Design 점검 (Mobile View)

2.  **Verification**
    *   [ ] **Auth Flow**: 로그인 -> 메인 -> 로그아웃 반복 테스트
    *   [ ] **Cycle Test**: 종목 등록 -> 상세 진입 -> 리포트 생성 -> 리포트 확인 -> 종목 삭제 -> 삭제 확인
    *   [ ] **DB Data**: Supabase Dashboard에서 `HT_` 테이블 데이터 적재 확인

3.  **Deployment**
    *   [ ] Vercel 배포
    *   [ ] Production 환경 변수 설정
    *   [ ] Live 테스트

## Technical Constraints & Standards

*   **Database**: 모든 테이블 접근은 반드시 `HT_` 접두사가 붙은 테이블명을 사용해야 합니다.
*   **Type Safety**: `supabase gen types`로 생성된 `Database` 타입을 활용하여 엄격한 타입을 유지합니다.
*   **RLS**: 클라이언트 사이드 쿼리는 RLS를 통해 자동 필터링되므로, `where user_id = ...` 조건을 중복으로 넣지 않아도 되지만, 명시적인 것이 좋습니다. (Server Action에서는 `auth.uid()` 검증 필수)
*   **Server Actions**: 데이터 변형(Mutation)은 반드시 Server Actions를 통합니다.
