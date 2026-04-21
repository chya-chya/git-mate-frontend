# CLAUDE.md - Git-Mate Frontend Guidelines

## 1. Project Overview
- **Project Name:** Git-Mate
- **Purpose:** GitHub PR 리뷰 및 코멘트 데이터를 분석하여 개발자의 커뮤니케이션 성향을 객관화하고, 상호보완적인 동료를 추천하는 서비스.
- **Target Audience:** 자신의 코드 리뷰 스타일을 객관적으로 파악하고 개선하고 싶은 개발자, 시너지를 고려해 팀을 구성하려는 리더.

## 2. Tech Stack
- **Framework:** Next.js 16.2.2 (App Router)
- **Language:** TypeScript, React 19
- **State Management:** Zustand
- **Data Fetching:** React Query (TanStack Query v5)
- **Styling:** Tailwind CSS v4, Framer Motion (Animations)
- **Data Visualization:** Recharts
- **HTTP Client:** Axios

## 3. Architecture
- `src/app/`: Next.js App Router 기반의 페이지 및 API 라우트
- 뷰(View)와 비즈니스 로직(State, API) 분리 지향.
- (상세 아키텍처는 추후 점진적으로 업데이트 예정)

## 4. Coding Conventions
- **TypeScript:** 타입을 명시적으로 작성하고 `any`의 사용을 최대한 지양합니다.
- **Components:** 함수형 컴포넌트 사용. 가급적 단일 책임을 가지도록 작게 분리합니다.
- **Naming:** 
  - 파일 및 폴더명: `kebab-case` 권장 (단, 컴포넌트는 `PascalCase` 파일명 가능). 
  - 컴포넌트: `PascalCase`
  - 함수 및 변수: `camelCase`

## 5. UI and Design System
- Tailwind CSS를 사용하여 반응형 디자인 구현 (`sm`, `md`, `lg` 등 브레이크포인트 활용).
- 친숙하고 전문적인 디자인. 애니메이션(Framer Motion)을 적절히 활용하여 생동감 제공.

## 6. Content and Copy Guidance
- 전문적이면서도 개발자들에게 친근한 톤앤매너 유지.
- 에러 메시지는 구체적이고 사용자가 이해하기 쉬운 언어로 작성.

## 7. Testing and Quality Bar
- 코드는 머지/커밋 전 반드시 `npm run lint` 검사를 통과해야 합니다.
- (테스트 관련 사항은 도입 시 업데이트)

## 8. File and Content Placement
- 공통 컴포넌트는 `/src/components/`, 상태 관리는 `/src/store/` (혹은 관련 디렉토리), 타입 선언은 `/src/types/` 등으로 분리하여 관리.
- 페이지 특정 컴포넌트는 해당 `/app` 경로 내의 컴포넌트 폴더나 개별 파일로 배치.

## 9. Safe Change Rules
- `package.json`, `next.config.ts`, `eslint.config.mjs` 등의 프로젝트 초기 설정 파일은 함부로 변경하지 않습니다.
- Zustand Store나 React Query 캐싱 키 등 전역 상태 설정 변경 시 부작용을 반드시 사전 확인합니다.

## 10. Specific Commands
- 개발 서버 실행: `npm run dev`
- 빌드: `npm run build`
- 린트 체크: `npm run lint`
