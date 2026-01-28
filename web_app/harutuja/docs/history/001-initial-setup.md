## 001 - Initial Setup (프로젝트 초기 세팅)

## 날짜 / 작업자
- **날짜**: 2026-01-28
- **작업자**: 시니어 개발자 & AI 파트너

## 변경 내용 (초기 세팅 요약)
- **프로젝트 부트스트랩**
  - Next.js(App Router) 기반으로 프로젝트 구성 (`app/` 디렉토리 중심)
  - 패키지 매니저: `pnpm`
- **타입스크립트/빌드 설정**
  - TypeScript `strict: true`, path alias `@/* -> ./*` 적용 (`tsconfig.json`)
  - 스크립트: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint` (`package.json`)
- **스타일링/디자인 시스템 기반**
  - Tailwind CSS v4 + PostCSS 플러그인(`@tailwindcss/postcss`) 구성 (`tailwind.config.ts`, `postcss.config.mjs`)
  - 전역 스타일 토큰/테마는 `app/globals.css`에서 관리
- **프로젝트 구조 확정(Phase 1 MVP 기준)**
  - Route Group: `(auth)`, `(dashboard)`로 Public/Private 영역 분리 (`app/(auth)`, `app/(dashboard)`)
  - 컴포넌트 레이어: `components/ui`(순수 UI), `components/domain`(도메인 로직), `components/common`(공용 레이아웃)
  - 공용 로직: `lib/`(AI, Auth, Supabase, Utils), `hooks/`, `types/`, `docs/`
- **문서/설계 기준 동봉**
  - PRD: Phase 1/2 범위 분리 (`docs/PRD.md`)
  - 사용자 흐름: Sequence Diagram/Flowchart (`docs/FLOW.md`)
  - 기술 스택/구조 원칙 (`docs/tech-stack.md`)
  - DB 스키마 가이드 (`docs/db-schema.md`)

## 변경 이유
- **교육/Phase 1 MVP 완주 가능한 범위**를 전제로, 인증/CRUD/AI/기본 UI에 집중하기 위함.
- App Router + TypeScript strict로 **초기부터 안전한 구조**를 강제하고, `@/*` alias로 import 복잡도를 낮추기 위함.
- Tailwind 기반으로 v0/shadcn UI 이식을 염두에 두되, **도메인/공용/UI 계층 분리**로 유지보수성을 확보하기 위함.
- PRD/FLOW/DB 스키마를 문서화해 구현이 커져도 **흐름/범위 이탈을 방지**하기 위함.

## 관련 이슈 / 에러 및 해결
- **임시/백업 소스가 빌드/타입체크에 끼어드는 문제(잠재)**
  - **상황**: v0 산출물/실험 폴더가 프로젝트에 존재(`tmp-vo/`)하면 타입체크/린트/빌드 노이즈가 늘어날 수 있음.
  - **해결**: `tsconfig.json`의 `exclude`에 `tmp-vo`를 포함해 타입체크 대상에서 제외(추가로 ESLint ignore도 후속 조치로 정리).
- **환경 변수/시크릿 커밋 방지**
  - **상황**: Supabase/NextAuth/AI 키 등 민감정보가 필요.
  - **해결**: `.gitignore`에서 `.env*` 패턴을 기본 제외하여 실수로 커밋되는 것을 방지.

## 참고(관련 문서/파일)
- **핵심 기준 문서**
  - `docs/PRD.md` (Phase 1 MVP 범위)
  - `docs/FLOW.md` (사용자 여정/데이터 흐름)
  - `docs/tech-stack.md` (기술 스택 및 구조 원칙)
  - `docs/db-schema.md` (DB 스키마/RLS 가이드)
- **주요 설정 파일**
  - `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.ts`, `.gitignore`
