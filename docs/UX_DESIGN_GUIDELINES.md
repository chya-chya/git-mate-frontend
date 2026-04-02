# Git-Mate UX 디자인 가이드

이 문서는 Git-Mate 프론트엔드의 사용자 경험(UX)과 인터페이스(UI) 설계 원칙을 정의합니다. 개발자 대상의 서비스로서 전문적이고 직관적인 환경을 제공하는 것을 최우선으로 합니다.

## 1. 디자인 컨셉: "Data Clarity & Developer Focus"

- **핵심 키워드**: 정교함(Precision), 투명성(Transparency), 생산성(Productivity).
- **시각적 아이덴티티**: GitHub의 Look & Feel을 유지하면서도 LLM 분석 특유의 '스마트함'을 강조하기 위해 세련된 유리모피즘(Glassmorphism)과 마이크로 인터랙션을 사용합니다.

## 2. 컬러 시스템 (Color Palette)

- **Primary**: GitHub Blue (`#0969da`) 및 Indigo 기반의 딥 블루 계열.
- **Accent**: LLM 분석의 핵심 지표(예: '수용적', '논리적')를 나타내기 위한 보라색(Violet) 및 연두색(Emerald).
- **Background**:
  - Dark Mode (기본): `#0d1117` (GitHub Dark 배경색과 동일).
  - Light Mode: `#ffffff`.

## 3. 타이포그래피 (Typography)

- **Main Font**: `Inter` 또는 `Geist Sans` (가독성과 현대적인 느낌 강조).
- **Mono Font**: `JetBrains Mono` 또는 `Fira Code` (코드 스니펫 및 수치 데이터 표시용).

## 4. 데이터 시각화 (Data Visualization)

- **레이더 차트 (Radar Chart)**: 다각적인 역량 점수(`UserStat`)를 한눈에 파악할 수 있도록 표현합니다.
- **막대/선형 차트**: 시간에 따른 분석 리포트의 점수 변화 추이를 나타냅니다.
- **공통 규칙**: 데이터 포인트에는 항상 툴팁(Tooltip)을 제공하여 구체적인 수치를 확인할 수 있게 합니다.

## 5. 주요 인터랙션 및 피드백

- **Skeleton Screen**: 데이터 수집 및 분석 리포트 로딩 시 빈 화면 대신 스켈레톤 UI를 제공하여 체감 대기 시간을 단축합니다.
- **Progress Stepper**: 백엔드의 '수집 -> 정제 -> LLM 분석 -> 지표 산출' 단계를 사용자에게 실시간으로 시각화하여 현재 진행 상태를 명확히 전달합니다.
- **Empty State**: 연동된 저장소가 없거나 분석 결과가 아직 없는 경우, '가이드'와 함께 친숙한 일러스트를 제공합니다.

## 6. 가이드라인 준수 사항

- 한 화면에 너무 많은 정보를 배치하지 않고 제어 가능한 수준의 정보 밀도를 유지합니다.
- 모든 버튼과 인터랙티브 요소는 호버(Hover) 상태 변화를 명확히 주어 조작 가능함을 암시합니다.
