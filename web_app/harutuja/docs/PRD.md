# [하루투자] Phase 1 · Phase 2 분리 PRD

본 문서는 기존 **[하루투자] PRD**를 기반으로,  
**3일 수업 내 구현 가능한 MVP(Phase 1)** 와 **수업 이후 고도화 단계(Phase 2)** 를 명확히 분리하여 재작성한 실행 중심 PRD이다.

설계 기준은 다음과 같다.
- 교육 환경에서 **완주 가능한 범위**
- Auth / CRUD / AI / UI 핵심 학습 포인트 집중
- Phase 2에서 실제 서비스 수준으로 자연스럽게 확장 가능

---

## 0. 서비스 핵심 재정의

### 핵심 사용자 가치
- 사용자는 관심 있는 종목을 등록한다
- AI는 해당 종목의 **최근 주요 이슈를 요약**한다
- 사용자는 웹 화면에서 리포트를 확인한다

> Phase 1에서는 **"웹 내 리포트 생성·조회"** 가 서비스의 본질이다.

---

# Phase 1: MVP (3일 수업 내 구현 목표)

## Phase 1 목표 한 줄 요약
> Google 로그인 → 관심 종목 등록 → AI 요약 리포트 생성 → 웹 화면에서 조회

### Phase 1에서 의도적으로 제외하는 것
- 이메일 / 카카오톡 발송
- 스케줄링 (cron, queue)
- 실시간 알림
- 외부 유료 금융 API

---

## 1. Phase 1 기능 정의

## 1.1 인증 (Auth)

### 목적
- 표준 OAuth 인증 흐름 학습

### 구현 범위
- Google Social Login
- NextAuth 기반

### 인증 흐름
1. 로그인 버튼 클릭
2. Google OAuth 인증
3. 최초 로그인 시 User 자동 생성
4. 세션 기반 인증 유지

### 데이터 모델

**User**
- id (PK)
- googleId (unique)
- email
- name
- createdAt

---

## 1.2 관심 종목 관리 (CRUD)

### 목적
- 기본적인 CRUD 흐름 구현

### 기능 범위
- Create: 관심 종목 등록
- Read: 관심 종목 리스트 조회
- Read: 종목 상세 조회
- Delete: 관심 종목 삭제

> Update는 교육 단순화를 위해 Delete + Create로 대체

### 입력 값
- name: string (필수, 예: "Apple")
- ticker: string (선택, 예: "AAPL")

### 데이터 모델

**Stock**
- id (PK)
- userId (FK → User.id)
- name
- ticker
- createdAt

---

## 1.3 AI 리포트 생성 (단순 요약)

### 목적
- AI API 연동 경험
- 결과 저장 및 화면 출력

### AI 기능 정의
- 종목별 "최근 주요 이슈 요약" 생성

### 프롬프트 예시
```
최근 1~2주 기준으로 {종목명}과 관련된 주요 이슈를
투자 초보자도 이해할 수 있도록 5줄 이내로 요약해줘
```

### 처리 흐름
1. 종목 상세 페이지 진입
2. "AI 요약 생성" 버튼 클릭
3. 서버에서 AI API 호출
4. 텍스트 응답 수신
5. DB 저장
6. 화면에 결과 출력

### 데이터 모델

**Report**
- id (PK)
- userId (FK)
- stockId (FK)
- content (TEXT)
- createdAt

---

## 1.4 UI 설계 (v0.dev 기준)

### 화면 구성 (3종)

### 1) 메인 페이지
- 로그인 상태 확인
- 관심 종목 리스트 출력
- "종목 추가" 버튼

### 2) 종목 등록 페이지
- 종목명 입력 폼
- 티커 입력 필드 (선택)
- 저장 버튼

### 3) 종목 상세 페이지
- 종목 정보 표시
- AI 요약 결과 영역
- "AI 요약 생성" 버튼
- 기존 리포트가 있으면 바로 표시

### UI 원칙
- Tailwind 기반
- 모바일 우선
- 대시보드/차트 UI 제외

---

## 1.5 Phase 1 기술 스택

- Frontend: Next.js (App Router, TypeScript)
- Auth: NextAuth + Google Provider
- Backend: Next.js Server Actions / API Routes
- DB: PostgreSQL + Prisma
- AI: Gemini 또는 OpenAI (Text Completion)

---

# Phase 2: 고도화 (수업 이후 개별 진행)

## Phase 2 목표 한 줄 요약
> 리포트를 자동화·확장하여 실제 서비스 수준으로 발전

---

## 2. Phase 2 고도화 기능

## 2.1 리포트 자동 발송

### 기능
- 이메일 발송
- 카카오톡 채널 발송

### 추가 데이터 모델

**UserSetting**
- id
- userId (FK)
- deliveryType (EMAIL | KAKAO)
- deliveryTarget
- deliveryTime (HH:mm)

---

## 2.2 스케줄링 & 백그라운드 작업

- cron 기반 리포트 생성
- queue 기반 발송 처리
- 실패 재시도 로직

---

## 2.3 실시간 알림 & UX 고도화

- 웹 실시간 알림 (WebSocket)
- 알림 읽음 처리
- 알림 히스토리

---

## 2.4 데이터 시각화

- 종목별 리포트 생성 빈도 차트
- 기간별 이슈 트렌드
- 고급 필터링 (종목 / 기간)

---

## 2.5 고급 기능 확장

- 이미지/파일 업로드
- 사용자 간 리포트 공유
- 외부 유료 금융 API 연동
- AI 프롬프트 고도화 (구조화된 리포트)

---

## 3. Phase 분리 요약

| 구분 | Phase 1 (수업) | Phase 2 (고도화) |
|---|---|---|
| 인증 | Google Login | 유지 |
| CRUD | 종목 관리 | 고급 관리 |
| AI | 단순 요약 | 자동 생성·분석 |
| UI | 3개 핵심 화면 | 대시보드 |
| 알림 | 없음 | 이메일/카카오 |
| 스케줄 | 없음 | cron/queue |

---

본 PRD는 **교육용 MVP → 실서비스 고도화**로 자연스럽게 확장되도록 설계된 기준 문서다.

