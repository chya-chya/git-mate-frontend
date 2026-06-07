"use client";

import { useState } from "react";
import { 
  CheckCircle2, 
  BrainCircuit, 
  Sparkles, 
  Lightbulb, 
  TrendingUp, 
  Award,
  GitPullRequest
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MetricDetail {
  score: number;
  reason?: string;
  improvement?: string;
  example?: string;
}

interface ReportData {
  syncTime: string;
  repository?: {
    fullName: string;
  };
  metrics: {
    summary?: string;
    mutual_respect?: MetricDetail;
    conflict_management?: MetricDetail;
    logical_problem_definition?: MetricDetail;
    review_guiding?: MetricDetail;
    documentation?: MetricDetail;
    knowledge_sharing?: MetricDetail;
    technical_influence?: MetricDetail;
    code_stability?: MetricDetail;
  };
}

interface ReportViewProps {
  report: ReportData;
  showStatus?: boolean;
}

function renderTextWithLinks(text: string) {
  if (!text) return null;

  // Split text by markdown link, PR parenthesis link, or plain URL
  const regex = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|PR\s+#\d+\s*\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s()]+)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    // 1. Check markdown link pattern: [Text](Url)
    const mdMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (mdMatch) {
      const [, linkText, url] = mdMatch;
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:underline font-semibold"
        >
          {linkText}
        </a>
      );
    }

    // 2. Check PR parenthesis link pattern: PR #249(https://...)
    const prMatch = part.match(/^(PR\s+#\d+)\s*\((https?:\/\/[^\s)]+)\)$/);
    if (prMatch) {
      const [, prLabel, url] = prMatch;
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:underline font-semibold"
        >
          {prLabel}
        </a>
      );
    }

    // 3. Check plain URL pattern
    const urlMatch = part.match(/^(https?:\/\/[^\s()]+)$/);
    if (urlMatch) {
      const url = urlMatch[1];
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:underline font-semibold break-all"
        >
          {url}
        </a>
      );
    }

    // 4. Regular text
    return part;
  });
}

export function ReportView({ report, showStatus = true }: ReportViewProps) {
  const metrics = [
    { 
      id: "mutual_respect",
      name: "상호 존중", 
      score: report.metrics.mutual_respect?.score || 0,
      reason: report.metrics.mutual_respect?.reason || "충분한 협업 데이터가 확보되지 않았습니다.",
      improvement: report.metrics.mutual_respect?.improvement || "협업 시 동료의 코드와 의견에 대한 긍정적 피드백 빈도를 늘려보세요.",
      example: report.metrics.mutual_respect?.example || "\"작성해주신 로직 덕분에 결함이 사전에 차단되었네요. 세심한 검토 감사드립니다!\"",
      category: "Soft Skills"
    },
    { 
      id: "conflict_management",
      name: "갈등 관리", 
      score: report.metrics.conflict_management?.score || 0,
      reason: report.metrics.conflict_management?.reason || "의견 대립이 발생했을 때 합리적인 근거에 기반한 중재안 제시 이력이 분석되었습니다.",
      improvement: report.metrics.conflict_management?.improvement || "갈등 상황에서 주관적인 견해 대신 정량화된 수치와 벤치마크 데이터를 제시해 의견 차이를 좁혀보세요.",
      example: report.metrics.conflict_management?.example || "\"두 대안의 장단점이 분명하군요. 서비스 부하 테스트 결과(TPS/레이턴시)를 기준으로 최종 결정하는 것은 어떨까요?\"",
      category: "Soft Skills"
    },
    { 
      id: "logical_problem_definition",
      name: "문제 정의", 
      score: report.metrics.logical_problem_definition?.score || 0,
      reason: report.metrics.logical_problem_definition?.reason || "복잡한 비즈니스 요건을 간결하고 직관적인 개발 요건으로 해체하는 로직 분석 능력이 돋보입니다.",
      improvement: report.metrics.logical_problem_definition?.improvement || "문제를 해결할 때 단순히 개발 구현에 그치지 않고, 기획 의도와 비즈니스 임팩트를 역으로 정의해 기술 부채를 방어하세요.",
      example: report.metrics.logical_problem_definition?.example || "\"현재 제안된 기획은 장기적으로 데이터 정합성이 깨질 리스크가 있습니다. 아키텍처를 분리해 이 단계를 우회하는 설계를 제안합니다.\"",
      category: "Hard Skills"
    },
    { 
      id: "review_guiding",
      name: "맥락 공유", 
      score: report.metrics.review_guiding?.score || 0,
      reason: report.metrics.review_guiding?.reason || "작성한 코드의 의도를 리뷰어가 직관적으로 파악할 수 있도록 셀프 코멘트와 핵심 컨텍스트를 친절하게 배려했습니다.",
      improvement: report.metrics.review_guiding?.improvement || "변경이 발생한 복잡한 도메인 도식이나 데이터베이스 흐름도를 링크 또는 이미지로 첨부하여 리뷰어의 인지 리소스를 단축해 보세요.",
      example: report.metrics.review_guiding?.example || "\"이번 PR은 결제 정산 모듈의 코어 로직 개편입니다. 복잡한 계산식의 예외 케이스 4가지를 12번~18번 라인에 셀프 코멘트로 미리 해설해 두었습니다!\"",
      category: "Hard Skills"
    },
    { 
      id: "documentation",
      name: "문서화", 
      score: report.metrics.documentation?.score || 0,
      reason: report.metrics.documentation?.reason || "PR 템플릿 작성과 이슈 설명 등에서 변경 배경(Why)과 영향도(How)를 꼼꼼하게 기록하는 습관이 정착되어 있습니다.",
      improvement: report.metrics.documentation?.improvement || "단순 텍스트 설명에서 더 나아가, 테스트 캡처나 에러 로그 원본을 동봉하고 변경 전후의 UI/API 응답 상태 비교표를 수록해 보세요.",
      example: report.metrics.documentation?.example || "\"# 변경 사항 요약\n- [이전]: 정산 데이터 누적 시 동시성 이슈 발생 가능성 존재\n- [이후]: Redis 분산 락(Redlock)을 차용해 안정적 원자성 확보 완료 (테스트 결과 첨부)\"",
      category: "Hard Skills"
    },
    { 
      id: "knowledge_sharing",
      name: "지식 공유", 
      score: report.metrics.knowledge_sharing?.score || 0,
      reason: report.metrics.knowledge_sharing?.reason || "자신이 학습한 공식 레퍼런스나 고난도 기술 해결 사례를 팀원들의 PR 리뷰 과정에서 적극적으로 전파하고 있습니다.",
      improvement: report.metrics.knowledge_sharing?.improvement || "참고한 공식 라이브러리 레포지토리나 테크 블로그 글을 인용할 때, 링크만 주기보다 핵심 아키텍처 요약본을 세 줄 내외로 축약해 전달해 보세요.",
      example: report.metrics.knowledge_sharing?.example || "\"이 이슈는 React 18 Concurrent 모드의 렌더링 생명주기와 관련이 있습니다. 상세 분석을 다룬 공식 블로그(링크)를 참고하면 이해하시는 데 더 큰 도움이 될 것 같아 공유합니다!\"",
      category: "Seniority"
    },
    { 
      id: "technical_influence",
      name: "기술 영향력", 
      score: report.metrics.technical_influence?.score || 0,
      reason: report.metrics.technical_influence?.reason || "동료 개발자들이 설계상 혼선이 올 수 있는 패턴을 예리하게 검출하고, 대안 아키텍처를 설득력 있게 제시해 팀의 기술 표준에 기여했습니다.",
      improvement: report.metrics.technical_influence?.improvement || "기존 구조를 리팩토링하자고 지적할 때, 대안을 코드로 먼저 간결하게 구현해 PR 코멘트(Suggested Changes)로 즉시 제공하여 설득 비용을 줄이세요.",
      example: report.metrics.technical_influence?.example || "\"현재 구조는 확장 시 상속 지옥에 빠질 우려가 있어 보입니다. 구성(Composition) 패턴을 활용한 아래의 Suggested Changes 코드를 제안하오니 고려해 주세요!\"",
      category: "Seniority"
    },
    { 
      id: "code_stability",
      name: "코드 안정성", 
      score: report.metrics.code_stability?.score || 0,
      reason: report.metrics.code_stability?.reason || "동시성 이슈, 널 포인터 참조, 예외 처리 미비 등 치명적인 성능 병목이나 보안상 취약할 수 있는 엣지 케이스(Edge Case)들을 검증해 냈습니다.",
      improvement: report.metrics.code_stability?.improvement || "동기식 코드 실행 흐름 외에 비동기 타임아웃, 서킷 브레이커 패턴 등의 리질리언스(회복탄력성) 관점까지 염두에 둔 방어 코드를 논의해 보세요.",
      example: report.metrics.code_stability?.example || "\"이 외부 API 호출부는 순간 장애 시 무한 커넥션 풀 점유로 서버가 다운될 위험이 있습니다. 지수 백오프 기반의 지연 재시도와 최대 타임아웃(2s)을 명시해야 안전합니다.\"",
      category: "Seniority"
    },
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const activeMetric = metrics[activeIdx];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {showStatus && (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">역량 분석 대시보드</h1>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-500 flex items-center gap-1">
                <CheckCircle2 size={12} /> 분석 완료
              </span>
            </div>
            <p className="text-muted-foreground">
              {new Date(report.syncTime).toLocaleString("ko-KR")}
            </p>
          </div>
        </header>
      )}

      {/* AI 종합 요약 평 */}
      <section className="p-6 rounded-2xl border bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BrainCircuit size={120} className="text-indigo-600" />
        </div>
        <div className="space-y-4 max-w-4xl">
          <h2 className="text-xl font-bold flex items-center gap-2.5 text-indigo-950">
            <BrainCircuit className="text-indigo-600 w-6 h-6 animate-pulse" />
            AI 시니어 HR 기술 종합 요약평
          </h2>
          <p className="text-lg leading-relaxed text-slate-700 font-medium whitespace-pre-wrap">
            {report.metrics.summary ? renderTextWithLinks(report.metrics.summary) : "종합 분석 요약이 작성되고 있습니다."}
          </p>
        </div>
      </section>

      {/* 역량 스케일 인터랙티브 대시보드 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 왼쪽: 8대 지표 점수 그리드 목록 */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" size={20} />
              핵심 개발 역량 평정 점수 (1.0 ~ 5.0)
            </h2>
            <span className="text-xs text-muted-foreground font-semibold">지표 클릭 시 성장 가이드 로드</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {metrics.map((m, idx) => {
              const isActive = activeIdx === idx;
              return (
                <motion.button
                  key={m.id}
                  onClick={() => setActiveIdx(idx)}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className={`p-5 rounded-2xl border text-left transition-all duration-300 relative group overflow-hidden z-0 ${
                    isActive 
                      ? "text-white border-transparent shadow-lg shadow-indigo-600/20" 
                      : "bg-white hover:bg-slate-50/80 border-slate-100 hover:border-indigo-200 hover:shadow-md"
                  }`}
                >
                  {/* 무빙 하이라이트 인디케이터 */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors duration-300 ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {m.category}
                    </span>
                    <span className={`text-xl font-bold flex items-center gap-1 transition-colors duration-300 ${
                      isActive ? "text-white" : "text-indigo-600"
                    }`}>
                      <Award size={16} className="shrink-0" />
                      {m.score.toFixed(1)}
                    </span>
                  </div>

                  <h3 className={`text-lg font-bold transition-colors duration-300 relative z-10 ${
                    isActive ? "text-white" : "text-slate-800"
                  }`}>
                    {m.name}
                  </h3>

                  {/* 미니 프로그레스 바 */}
                  <div className="mt-4 h-1.5 w-full bg-black/10 rounded-full overflow-hidden relative z-10">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        isActive ? "bg-white" : "bg-gradient-to-r from-indigo-500 to-purple-500"
                      }`}
                      style={{ width: `${(m.score / 5) * 100}%` }}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 오른쪽: 활성 지표의 상세 성장 피드백 카드 */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMetric.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="sticky top-6 p-6 rounded-3xl border bg-white shadow-md shadow-slate-100 border-slate-100 space-y-6"
            >
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 px-2 py-1 bg-indigo-50 rounded">
                    {activeMetric.category}
                  </span>
                  <h3 className="text-2xl font-black text-slate-800 mt-2">{activeMetric.name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-muted-foreground">역량 점수</div>
                  <div className="text-3xl font-black text-indigo-600 flex items-baseline justify-end gap-1">
                    {activeMetric.score.toFixed(1)}
                    <span className="text-xs text-muted-foreground">/ 5.0</span>
                  </div>
                </div>
              </div>

              {/* 1. 구체적 근거 (Reason) */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <BrainCircuit size={16} className="text-purple-500 shrink-0" />
                  현상 진단 및 점수 산출 근거
                </h4>
                <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100/50 text-slate-700 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                  {renderTextWithLinks(activeMetric.reason)}
                </div>
              </div>

              {/* 2. 개선점 및 도약 전략 (Improvement) */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Lightbulb size={16} className="text-amber-500 shrink-0" />
                  시니어 도약을 위한 성장 솔루션
                </h4>
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100/50 text-slate-700 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                  {renderTextWithLinks(activeMetric.improvement)}
                </div>
              </div>

              {/* 3. 모범 발화/행동 꿀팁 예시 (Example) */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-indigo-500 shrink-0" />
                  동료 소통 실전 적용 템플릿
                </h4>
                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/50 text-indigo-950 text-sm italic font-semibold leading-relaxed relative">
                  <span className="absolute top-2 left-2 text-indigo-200/50 text-3xl font-serif pointer-events-none">“</span>
                  <div className="pl-4 pr-2 whitespace-pre-wrap">{renderTextWithLinks(activeMetric.example)}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* 분석 메타 정보 */}
      <section className="p-5 rounded-2xl border bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <GitPullRequest size={16} className="text-indigo-500" />
          <span className="font-semibold text-slate-700">분석 대상 저장소:</span>
          <span className="font-bold text-indigo-600">{report.repository?.fullName || "알 수 없는 저장소"}</span>
        </div>
        <div className="text-xs">
          © GitMate AI Core Engine v1.1.0 · CoT Enabled
        </div>
      </section>
    </div>
  );
}
