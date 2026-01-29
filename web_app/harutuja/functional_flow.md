# Functional Flow List: Data-Centric Implementation

본 문서는 **화면이 아닌 데이터 흐름(Data Flow)**을 중심으로 작성된 실전 구현 가이드입니다.
"데이터 페칭 -> 상태/로직 처리 -> UI 바인딩" 순서로 개발하여 효율성을 극대화합니다.

---

## Phase 1: Foundation (공통 유틸리티 및 연결)

가장 먼저 데이터가 흐를 수 있는 파이프라인(DB, Auth)을 구축합니다.

### 1. Supabase Client & Type System
*   **Data Flow**: `Supabase Project` <-> `App (Type Safe)`
*   **Tech Spec**:
    *   `supabase gen types typescript`: DB 스키마 -> `types/supabase.ts` 생성 (HT_Profile, HT_Stock 등 확인)
    *   `@supabase/ssr` 패키지 활용:
        *   `createClient` (Server): Cookie 쿠키 제어 포함 (`lib/supabase/server.ts`)
        *   `createBrowserClient` (Client): Singleton 패턴 권장 (`lib/supabase/client.ts`)

### 2. Auth Middleware & Protection
*   **Data Flow**: `Request` -> `Middleware` -> `Session Check` -> `Response/Redirect`
*   **Tech Spec**:
    *   `updateSession` (`lib/supabase/middleware.ts`): 매 요청마다 토큰 갱신 및 `HT_PROFILE_ID` 확인
    *   Protected Routes: `/(dashboard)` 경로는 인증 실패 시 `/login`으로 리다이렉트

### 3. User Identity Synchronization
*   **Data Flow**: `Google OAuth` -> `Auth.Users (Supabase)` -> `(Trigger)` -> `public.HT_PROFILE`
*   **Tech Spec**:
    *   **Login**: `auth.signInWithOAuth({ provider: 'google' })`
    *   **Verification**: 로그인 후 `HT_PROFILE` 테이블에 `HT_PROFILE_ID`(=user_id) 생성되었는지 DB 직접 확인 (Trigger `HT_on_auth_user_created` 검증)

---

## Phase 2: Core Logic (Read/Write & Business Logic)

주요 비즈니스 로직을 하나씩 완성합니다. 각 단계는 **Backend 로직(Server Action) -> Frontend 바인딩** 순서로 진행합니다.

### 4. Stock List Inspection (Read)
*   **Scenario**: 메인 대시보드 진입 시 내 종목 리스트 출력
*   **Data Flow**:
    1.  **Fetch (Server Component)**: `app/(dashboard)/page.tsx`
        *   `createClient` (Server) -> `from('HT_STOCK').select('*')`
        *   RLS에 의해 자동 필터링 (`auth.uid() == HT_PROFILE_ID`)
    2.  **Prop Drill**: `StockList` (Client Component)로 `Stock[]` 데이터 전달
    3.  **UI Binding**: `map()`으로 `StockCard` 렌더링 (HT_NAME, HT_TICKER)

### 5. Stock Registration (Write)
*   **Scenario**: 새 종목 등록
*   **Data Flow**:
    1.  **Action (Server Action)**: `actions/stocks.ts -> createStock(formData)`
        *   Validation (Zod): `HT_NAME` `min(1)` 확인
        *   DB Insert: `.from('HT_STOCK').insert({ ... })`
        *   Cache Update: `revalidatePath('/')`로 메인 리스트 갱신
    2.  **Trigger (UI)**: `StockCreateForm` -> `submit` -> Action 호출

### 6. Stock Detail & Report Check (Read)
*   **Scenario**: 종목 상세 진입 및 기존 리포트 확인
*   **Data Flow**:
    1.  **Fetch (Server Component)**: `app/(dashboard)/stocks/[id]/page.tsx`
        *   Parallel Fetching:
            *   Stock Info: `.from('HT_STOCK').select('*').eq('HT_STOCK_ID', id)`
            *   Latest Report: `.from('HT_REPORT').select('*').eq('HT_STOCK_ID', id).order('HT_CREATED_AT', { ascending: false }).limit(1)`
    2.  **UI Binding**:
        *   종목 정보 표시
        *   리포트 존재 시: 리포트 뷰어 (Markdown) 표시
        *   리포트 미존재 시: "AI 요약 생성" 버튼 표시

### 7. AI Report Generation (Write + External API)
*   **Scenario**: AI 리포트 생성 요청
*   **Data Flow**:
    1.  **Action (Server Action)**: `actions/reports.ts -> generateReport(stockId)`
        *   Validation: `stockId` 소유권 확인 (`HT_STOCK` 조회) or RLS 의존
        *   **External API**: `Google Gemini` or `OpenAI` 호출 (Prompt: "{종목명} 최근 이슈...")
        *   DB Insert: `.from('HT_REPORT').insert({ HT_CONTENT: ai_response, ... })`
        *   Cache Update: `revalidatePath('/stocks/[id]')`
    2.  **Feedback**: Action 실행 중 Loading Indicator 표시 (useTransition)

---

## Phase 3: Interaction & Feedback (UX Polish)

기능 구현 후, 사용자 경험을 다듬습니다.

### 8. Optimistic UI & Loading States
*   **Tech Spec**:
    *   **Streaming**: `loading.tsx` 와 `Suspense`를 활용해 데이터 로딩 중 Skeleton UI 표시
    *   **Pending State**: `useActionState` (React 19) 또는 `useTransition`을 사용해 "생성 중..." 버튼 비활성화

### 9. Error Handling & Notifications
*   **Tech Spec**:
    *   **Toast**: Server Action 결과(성공/실패)에 따라 `sonner` 또는 `react-hot-toast` 알림 표시
    *   **Error Boundary**: `error.tsx`를 통해 DB 연결 실패/API 에러 시 Graceful degradation 처리

### 10. Deletion Flow (Write)
*   **Scenario**: 종목 삭제
*   **Data Flow**:
    *   **Action**: `deleteStock(id)` -> DB Delete
    *   **UX**: 삭제 전 `confirm` 대화상자 -> 삭제 후 메인으로 리다이렉트 or 리스트에서 즉시 제거

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] **1. Supabase Client Setup**
    - [ ] `supabase gen types typescript`
    - [ ] `lib/supabase/server.ts` (Cookie handling)
    - [ ] `lib/supabase/client.ts` (Singleton)
- [ ] **2. Auth Middleware**
    - [ ] `lib/supabase/middleware.ts` (Session update)
    - [ ] `middleware.ts` (Route matching)
- [ ] **3. User Sync**
    - [ ] Google Login Page (`app/(auth)/login/page.tsx`)
    - [ ] DB Trigger Verification (`HT_PROFILE` creation)

### Phase 2: Core Logic
- [ ] **4. Stock Read (List)**
    - [ ] `app/(dashboard)/page.tsx` Fetch Logic
    - [ ] `StockList` Component & `StockCard`
- [ ] **5. Stock Write (Create)**
    - [ ] `actions/stocks.ts` -> `createStock`
    - [ ] `StockCreateForm` UI & Validation
- [ ] **6. Stock Detail (Read)**
    - [ ] `app/(dashboard)/stocks/[id]/page.tsx` Fetch Logic
    - [ ] Detail UI & Report Status Check
- [ ] **7. AI Report (Write)**
    - [ ] `lib/ai/client.ts` Setup
    - [ ] `actions/reports.ts` -> `generateReport`
    - [ ] Markdown Rendering in UI

### Phase 3: Interaction
- [ ] **8. Loading UI**
    - [ ] `loading.tsx` for Dashboard
    - [ ] Button Pending States
- [ ] **9. Error Handling**
    - [ ] Global `error.tsx`
    - [ ] Toast Notifications (Success/Error)
- [ ] **10. Deletion**
    - [ ] `actions/stocks.ts` -> `deleteStock`
    - [ ] Delete Confirmation UI
