"use client";

import { ReportView } from "@/components/analysis/ReportView";

export default function PreviewPage() {
  const mockReport = {
    syncTime: new Date().toISOString(),
    repository: {
      fullName: "google/advanced-agentic-coding"
    },
    metrics: {
      summary: "피평가자는 주도적인 예외 처리 설계와 정교한 비즈니스 로직 해체 능력(Hard Skills 4.7)이 대단히 뛰어난 시니어급 백엔드 엔지니어입니다. 동료의 리뷰에 적극적으로 피드백을 수락하고, 지식 공유를 전파하는 등 기술적 리더십(Seniority 4.8)을 모범적으로 발휘하고 있습니다. 다만, 갈등 관리 단계에서 데이터 벤치마크 기반의 합리적인 정량 지표 제시를 보완한다면 팀의 의사결정 속도를 한층 더 견인할 수 있습니다.",
      mutual_respect: {
        score: 4.8,
        reason: "PR 리뷰 과정에서 상대방의 설계 의도를 먼저 경청하고 존중하는 정중한 문체를 일관되게 사용했습니다.",
        improvement: "코멘트 작성 시 '이렇게 고쳐주세요' 보다는 설득력 있는 공식 문서 링크나 설계 아키텍처 비교표를 부록으로 추가해주면 협업 시너지가 배가됩니다.",
        example: "\"작성해주신 구조 덕분에 확장 시 결합도가 크게 낮아졌네요! 혹시 이 컴포넌트에 Composite 패턴(링크)을 더하면 결합도를 제로로 만들 수 있을 것 같은데 의견이 궁금합니다.\""
      },
      conflict_management: {
        score: 3.9,
        reason: "의견이 갈리는 복잡한 아키텍처 토론에서 타협안을 제시하며 완충 역할을 수행했습니다.",
        improvement: "타협안을 낼 때 정성적인 협의에 치우치기보다, TPS(초당트랜잭션) 벤치마크 테스트 결과나 메모리 프로파일링 수치를 직접 수집해 판단을 유도하는 것이 시니어의 정석입니다.",
        example: "\"두 아이디어 모두 매우 흥미롭네요! 대규모 트래픽 유입 상황을 가정해 Redis 분산 락 방식과 DB 낙관적 락 방식의 1분 부하 테스트(TPS/Latency)를 돌린 결과를 바탕으로 선정하는 건 어떨까요?\""
      },
      logical_problem_definition: {
        score: 4.7,
        reason: "거대한 비즈니스 요구사항을 독립적이고 격리된 하위 마이크로서비스 모듈로 구조적으로 해체해 냈습니다.",
        improvement: "추상화 단계를 무리하게 깊게 설계하기보다 기획 부서의 요구사항 변동 주기와 일치하도록 도메인 경계를 유연하게 열어두십시오.",
        example: "\"이 비즈니스 규칙은 정산 주기에 따라 월별로 가변적입니다. 따라서 Core 패키지에 고정하기보다 Strategy 패턴으로 추출하여 동적으로 정책을 주입받게 리팩토링했습니다.\""
      },
      review_guiding: {
        score: 4.6,
        reason: "리뷰어들이 수백 줄의 코드를 한눈에 검토할 수 있도록 셀프 코멘트와 도메인 맥락(Why)을 훌륭히 공유했습니다.",
        improvement: "데이터 흐름이 복잡한 배치 잡(Batch Job)이나 분산 서버 처리 흐름은 Mermaid 시각화 다이어그램을 코멘트에 인라인으로 심어 리뷰 시간을 혁신적으로 단축하세요.",
        example: "\"이번 PR은 락 점유 흐름이 매우 복잡하여 15번~24번 라인에 락의 획득 및 해제 시점을 도식으로 정리해 두었습니다. 리뷰 시 참고해주시면 감사하겠습니다!\""
      },
      documentation: {
        score: 4.5,
        reason: "이슈 리포트, PR 설명 템플릿, 그리고 주요 에러 상태 코드 명세서가 빈틈없이 문서화되어 있습니다.",
        improvement: "기존 텍스트 위주 서술에 더해 API 요청-응답 스키마의 구체적인 JSON Mock 페이로드를 샘플로 상시 수록하세요.",
        example: "\"# API 응답 변경 명세 (v1.2)\n- 400 Bad Request 발생 시 기존의 'ERR' 스트링 대신 세부 에러 객체(`{code: string, message: string}`)를 반환하도록 규격을 통일하고 테스트 케이스를 보강했습니다.\""
      },
      knowledge_sharing: {
        score: 4.8,
        reason: "팀 내부 Wiki에 난도 높은 트러블슈팅 이력(AWS Lambda 프리징 극복기)을 정성껏 수록하고 팀원들의 러닝 커브를 크게 단축시켰습니다.",
        improvement: "알아낸 지식을 공유할 때, 텍스트 요약본 외에 3분 내외의 '핵심 코드 훑어보기 동영상'이나 한 장짜리 핵심 아키텍처 이미지를 동봉하면 팀 전파력이 3배로 증가합니다.",
        example: "\"람다 환경에서 비동기 이벤트 루프 프리징 원인을 진단하고 await를 강제해 해결한 구조를 사내 아카이브 Wiki(링크)에 정리했습니다. 동일 현상 발생 시 참고하세요!\""
      },
      technical_influence: {
        score: 4.9,
        reason: "팀 전체가 레거시 패턴에 갇히지 않도록 Redis Redlock 기반 분산 락, 지수 백오프 서킷 브레이커 등 고가용성 설계 표준을 성공적으로 이식했습니다.",
        improvement: "신규 아키텍처 이식 후, 팀원들의 적응을 위해 Boilerplate 예제 템플릿 패키지를 직접 빌드하여 제공해 학습 허들을 더 낮춰주세요.",
        example: "\"서버 순간 단절에 대응하기 위해 서킷 브레이커(Resilience4j) 패턴을 백엔드 핵심 코어에 적용했습니다. 템플릿 코드(링크)를 참고하면 3줄의 어노테이션 추가만으로 즉시 안전한 호출을 누릴 수 있습니다.\""
      },
      code_stability: {
        score: 4.7,
        reason: "비정상 흐름, 동시성 격리 레벨, 순간 트래픽 폭증 등 엣지 케이스들을 선제적으로 예측하고 철저히 방어 코드를 작성했습니다.",
        improvement: "성능 한계를 선제적으로 파악하기 위해 주 1회 카오스 엔지니어링(Chaos Engineering) 개념을 로컬 통합 테스트 단계에 이식하는 방안을 고려하십시오.",
        example: "\"이번 정산 배치 코드는 천만 건 누적 시 힙 메모리 OOM(Out Of Memory) 리스크가 예상됩니다. 청크 사이즈를 1,000개로 쪼개어 스트리밍 방식으로 메모리 점유율을 50MB 이내로 유지시켰습니다.\""
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50/30 min-h-screen">
      <div className="flex flex-col gap-2 border-b pb-6 border-slate-100">
        <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">GitMate Interactive Demo</h2>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          시니어 AI 역량 평가 대시보드 미리보기
        </h1>
        <p className="text-muted-foreground text-sm">
          DB와 서버 연동 없이 100% 동작하는 신형 시니어 HR 평가 대시보드의 실시간 기능 확인용 데모 페이지입니다.
        </p>
      </div>

      <ReportView report={mockReport} showStatus={true} />
    </div>
  );
}
