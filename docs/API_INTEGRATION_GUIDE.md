# Git-Mate API 연동 가이드

이 문서는 프론트엔드 애플리케이션이 `git-mate-backend`와 통신할 때 준수해야 하는 규칙과 전략을 정의합니다.

## 1. 기본 설정 (Base Configuration)

- **API Base URL**: 환경 변수(`NEXT_PUBLIC_API_URL`)를 통해 관리합니다.
- **클라이언트 라이브러리**: `Axios`를 기본으로 하며, 요청/응답 인터셉터를 활용합니다.

## 2. 인증 및 보안 (Authentication)

- **GitHub OAuth**: 백엔드의 `/auth/github` 엔드포인트를 통해 로그인을 수행합니다.
- **JWT 관리**: 로그인 성공 시 발급되는 `AccessToken`을 브라우저의 `Cookie` (HttpOnly 권장) 또는 로컬 스토리지에 저장합니다.
- **인터셉터 활용**: 모든 요청의 헤더에 `Authorization: Bearer <Token>`을 자동으로 주입합니다.

## 3. 주요 API 엔드포인트 연동 내역

| 기능                | 엔드포인트                 | 방식 | 설명                                     |
| :------------------ | :------------------------- | :--- | :--------------------------------------- |
| **로그인**          | `/auth/login/github`       | GET  | GitHub OAuth 로그인 시작                 |
| **레포지토리 목록** | `/collection/repositories` | GET  | 연동된 레포지토리 리스트 조회            |
| **분석 상세 조회**  | `/analysis/report/:id`     | GET  | 특정 분석 세션의 상세 결과(JSON) 조회    |
| **전체 역량 통계**  | `/analysis/stats`          | GET  | 누적된 사용자 역량 지표(`UserStat`) 조회 |

## 4. 실시간 상태 동기화 (Asynchronous Task Handling)

백엔드에서는 `BullMQ`를 사용하여 비동기 분석 작업을 수행하므로, 프론트엔드는 다음 전략 중 하나를 선택하여 진행률을 표시합니다.

- **분석 시작**: 사용자가 분석 버튼 클릭 시 `/analysis/start` 호출.
- **상태 폴링(Polling)**: `TanStack Query`의 `refetchInterval`을 활용하여 수집/분석 상태를 주기적으로 확인.
- **Websocket (추후 제안)**: 진행률을 실시간으로 스트리밍하기 위해 `Socket.io` 연동 고려 가능.

## 5. 에러 핸들링 전략

- **Global Filter**: 백엔드의 표준 에러 응답 형식 `{ statusCode, message, error }`에 맞추어 `Toast` 메시지를 통해 사용자에게 알림을 제공합니다.
- **Retry Policy**: 네트워크 일시 오류 또는 API 요청 실패 시 `TanStack Query`의 기본 재시도(Retry) 옵션을 활용합니다.

## 6. 데이터 변환 가이드 (Normalization)

- **가중 평균 처리**: 백엔드에서 전송되는 0~100 사이의 역량 수치를 `Recharts`에서 활용 가능한 객체 배열 형태로 변환하여 시각화합니다.
- **날짜 포맷팅**: 모든 응답의 ISO 8601 날짜 문자열을 `dayjs` 또는 `date-fns`를 사용하여 로컬 시간대에 맞게 변환합니다.
