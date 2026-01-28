# 하루투자 서비스 흐름도

## 사용자 여정 및 로직 흐륵 (Sequence Diagram)
sequenceDiagram
    autonumber
    actor User as 사용자
    participant FE as Frontend (Next.js)
    participant Auth as NextAuth (Google)
    participant Server as Server/API
    participant DB as PostgreSQL (Prisma)
    participant AI as AI API (Gemini/OpenAI)

    Note over User, Auth: [인증 단계]
    [cite_start]User->>FE: 로그인 버튼 클릭 [cite: 85]
    FE->>Auth: Google 로그인 요청
    Auth-->>FE: 세션 및 사용자 정보 반환
    FE->>DB: 최초 로그인 시 User 생성/저장

    Note over User, DB: [종목 관리 단계]
    [cite_start]User->>FE: 종목명 및 티커 입력 [cite: 297, 300]
    [cite_start]FE->>Server: 종목 등록 요청 (Create) [cite: 29]
    Server->>DB: Stock 데이터 저장
    DB-->>FE: 등록 완료 응답
    [cite_start]FE->>User: 메인 리스트에 종목 출력 [cite: 108]

    Note over User, AI: [AI 리포트 생성 단계]
    [cite_start]User->>FE: 종목 상세 페이지 진입 [cite: 170]
    FE->>DB: 기존 리포트 존재 여부 확인
    [cite_start]User->>FE: "AI 요약 생성" 버튼 클릭 [cite: 207]
    FE->>Server: 리포트 생성 요청
    Server->>AI: 최근 이슈 요약 프롬프트 전송
    [cite_start]AI-->>Server: 요약 텍스트 반환 [cite: 192]
    Server->>DB: Report 데이터 저장 (stockId, userId 포함)
    DB-->>FE: 리포트 데이터 반환
    [cite_start]FE-->>User: 화면에 AI 리포트 출력 [cite: 203]




## 서비스 아키텍처 및 페이지 구조 (Flowchart)
flowchart TD
    Start((시작)) --> LoginCheck{로그인 여부}

    subgraph Public_Area [비인증 영역]
        [cite_start]LoginCheck -- No --> Landing[랜딩 페이지: 서비스 소개] [cite: 117]
        [cite_start]Landing --> LoginPage[로그인 페이지: Google OAuth] [cite: 81]
    end

    subgraph Private_Area [인증 영역 - Phase 1]
        [cite_start]LoginCheck -- Yes --> Main[메인 페이지: 종목 리스트] [cite: 101]
        [cite_start]Main --> AddStock[종목 등록 페이지] [cite: 25]
        [cite_start]Main --> StockDetail[종목 상세 페이지] [cite: 153]
        
        [cite_start]AddStock -- "저장" --> Main [cite: 294]
        [cite_start]StockDetail -- "AI 요약 생성" --> AI_Service[AI 리포트 서비스] [cite: 197]
        AI_Service -- "결과 표시" --> StockDetail
    end

    subgraph Components [공통 컴포넌트]
        [cite_start]Header[헤더: 로그아웃/사용자명] [cite: 227]
        [cite_start]StockCard[종목 카드] [cite: 275]
        [cite_start]Notification[알림 설정 UI - Phase 2 예비] [cite: 241]
    end

    LoginPage -- "인증 성공" --> Main
    Main -.-> Header
    Main -.-> StockCard
    StockDetail -.-> Notification

