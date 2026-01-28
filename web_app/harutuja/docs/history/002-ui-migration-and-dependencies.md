## 002 - UI Migration & Dependencies (pnpm add 기록)

## 1) 설치 날짜 및 작업자
- **날짜**: 2026-01-28
- **작업자**: 시니어 개발자 & AI 파트너

## 2) 설치된 라이브러리 목록 (pnpm add)
아래 라이브러리들은 v0/shadcn 스타일 UI 이식 및 Tailwind 기반 스타일 유틸리티 정착을 위해 추가했습니다.

### Runtime dependencies (`dependencies`)
- **`lucide-react`**
  - **목적**: v0/shadcn 계열 UI에서 사용하는 아이콘 세트(예: `ArrowLeft`, `Building2`, `Bell`, `Clock`)를 표준화하기 위함.
- **`clsx`**
  - **목적**: 조건부 className 조합을 간결하게 처리(예: `clsx(a && "x")`).
- **`tailwind-merge`**
  - **목적**: Tailwind class 충돌을 자동으로 정리(예: `p-2` vs `p-4`)하여 UI 이식 시 스타일 일관성을 유지.
- **`class-variance-authority`**
  - **목적**: shadcn/ui 패턴의 `cva()` 기반 variant(버튼/뱃지 등) 스타일 설계를 위해 사용.
- **`@radix-ui/react-select`**
  - **목적**: `Select` UI 컴포넌트 구현(접근성 포함) 기반. `components/ui/select.tsx` 계열에서 사용.
- **`@radix-ui/react-label`**
  - **목적**: 폼 라벨 컴포넌트 구현(접근성 포함) 기반(shadcn/ui 패턴).
- **`@radix-ui/react-slot`**
  - **목적**: shadcn/ui의 `Slot` 패턴(컴포지션/`asChild`) 지원을 위해 사용.

### Dev dependencies (`devDependencies`)
- **`tw-animate-css`**
  - **목적**: Tailwind 기반 애니메이션 유틸을 제공. `globals.css`에서 `@import 'tw-animate-css';`로 사용.
  - **비고**: shadcn/v0 예제에서 자주 등장하는 애니메이션 유틸을 Tailwind v4 환경에 맞춰 적용.

## 3) 각 라이브러리를 설치한 이유 (요약)
- **v0 UI 이식**: v0/shadcn 스타일의 Card/Select/Button 등 컴포넌트 구조를 그대로 가져오려면 Radix + cva + className 유틸( `clsx`, `tailwind-merge`) 조합이 사실상 “표준 세트”로 필요합니다.
- **스타일 충돌/유지보수성 개선**: Tailwind 유틸이 늘어날수록 class 충돌/중복이 잦아져 `tailwind-merge`로 일관성 있게 정리하고, 조건부 스타일은 `clsx`로 정리합니다.
- **아이콘 표준화**: `lucide-react`로 프로젝트 아이콘을 단일 라이브러리로 통일해 디자인 톤을 맞추고, 컴포넌트 간 재사용을 높입니다.

## 4) 발생했던 에러와 해결 과정 (요약)
- **Tailwind 애니메이션 import/의존성 이슈**
  - **증상**: UI 이식 과정에서 애니메이션 유틸이 필요했으나, Tailwind v4 구성에서 기존 예제(예: `tailwindcss-animate`)를 그대로 쓰면 설정/플러그인 불일치로 적용이 깨질 수 있음.
  - **해결**: `tw-animate-css`를 설치하고 `globals.css` 상단에 import를 추가하여(`@import 'tw-animate-css';`) 애니메이션 유틸을 안정적으로 제공.
- **ESLint가 임시/백업 폴더까지 분석하는 문제**
  - **증상**: `tmp-vo/`, `tmp-v0/` 등 실험/백업 소스가 린트 대상에 포함되면 불필요한 경고/에러가 발생하고 CI/로컬 DX가 나빠짐.
  - **해결**: `eslint.config.mjs`에서 `globalIgnores([...])`로 해당 폴더를 명시적으로 제외해 린트 노이즈를 제거.

## 참고
- 실제 UI 이식은 `globals.css`(테마/토큰), `components/ui/*`(shadcn/ui), 도메인 컴포넌트(예: `components/domain/*`)에서 진행되었습니다.
- (중요) Phase 1 MVP 범위 밖 기능(예: 알림 스케줄/발송)은 구현 범위에서 제외되어야 하며, UI 샘플/목업이 들어갔다면 추후 범위 정리 시 제거/비활성화가 필요합니다.
