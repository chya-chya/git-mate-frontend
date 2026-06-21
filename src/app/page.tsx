"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { GITHUB_AUTH_URL } from "@/utils/config";
import { 
  ArrowRight, 
  GitBranch, 
  Sparkles, 
  Code2, 
  GitPullRequest, 
  Radar,
  CheckCircle2, 
  ShieldCheck,
  BrainCircuit, 
  TrendingUp,
  Lightbulb,
  Award
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface DemoMetric {
  label: string;
  score: number;
  description: string;
  summary: string;
  solution: string;
  template: string;
}

const DEMO_METRICS: DemoMetric[] = [
  {
    label: "상호 존중",
    score: 4.5,
    description: "리뷰 및 의견 제시 시 상대에 대한 지지와 긍정적 지지도를 유지합니다.",
    summary: "이 개발자는 코드 리뷰와 PR 토론 시 동료의 기여를 먼저 인정하고 존중의 언어를 적극적으로 활용합니다. 🤝",
    solution: "성급하게 수정 요구를 하기보다, '이러한 대안도 고려해 볼 수 있을까요?'와 같은 부드러운 제안 어법(I-message)을 유지하는 것이 좋습니다.",
    template: "멋진 코드 감사드립니다! 말씀해주신 아키텍처에 깊이 공감합니다.\n이 메소드의 복잡도만 조금 덜어내면 훨씬 가독성이 좋아질 것 같습니다."
  },
  {
    label: "갈등 관리",
    score: 3.5,
    description: "의견 대립 상황에서 타협점과 합리적인 해결 방안을 도출합니다.",
    summary: "기술 스택 및 구현 논의 중 발생하는 견해차를 감정적 대립으로 키우지 않고 논리적 타협점을 제안하는 조율 능력이 돋보입니다. ⚖️",
    solution: "의견이 평행선을 달릴 때는 비동기식 텍스트 토론에 매몰되기보다 5분간의 짧은 구글 미트 등 다이렉트 소통을 이끌어 빠른 접점을 조립해 보세요.",
    template: "두 방안 모두 분명한 트레이드오프가 있네요.\n이번 마일스톤은 런칭 속도가 우선이니 A안으로 먼저 진행하고,\n부하 테스트 결과를 본 뒤 B안 리팩토링을 기획해보면 어떨까요?"
  },
  {
    label: "문제 정의",
    score: 4.5,
    description: "해결하고자 하는 문제의 핵심 원인과 목적을 명확히 명시합니다.",
    summary: "PR 개설 시 해당 티켓의 목표와 백그라운드 맥락을 정확하고 풍부하게 기재하여 리뷰어의 인지 복잡도를 크게 덜어줍니다. 🎯",
    solution: "비즈니스 요구사항 외에도 기술적인 측면에서 이 변경사항이 미치는 의존성 리스크(Side-effect)도 함께 목록화하면 리스크 방어가 완벽해집니다.",
    template: "이번 PR은 사용자 다량 트래픽 유입 시 장바구니 DB 락 현상을 방지하기 위해 비동기 큐 처리 로직을 가미한 변경입니다.\n테스트 시나리오는 하단에 작성해 두었습니다."
  },
  {
    label: "맥락 공유",
    score: 4.0,
    description: "의사결정 이유와 코드가 변경된 이면의 히스토리를 친절히 밝힙니다.",
    summary: "복잡해 보이는 리팩토링이나 레거시 코드를 건드렸을 때, 주석이나 디스크립션을 통해 동료들이 히스토리를 추적하기 용이하게 지원합니다. 📖",
    solution: "코드의 한계점을 알고 있다면 숨기지 말고 'TODO: 향후 마이크로서비스 분리 시 수정 필요' 등의 노트를 셀프 코멘트로 명시해 팀 지식을 자산화해 보세요.",
    template: "이 부분은 원래 공통 유틸이었으나, 회원가입 모듈에서만 특이 조건이 추가되어 독립된 헬퍼 함수로 분리하였습니다.\n이전 히스토리는 #124 이슈를 참고해 주세요."
  },
  {
    label: "문서화",
    score: 3.5,
    description: "프로젝트 진행 과정상 필요한 가이드라인과 변경 사양을 친절히 기재합니다.",
    summary: "신규 환경변수 추가나 API 스펙 변경 시 관련 문서를 성실하게 업데이트하여 온보딩 장벽을 경감하는 데 기여합니다. 📝",
    solution: "단순 텍스트 설명 외에도 API의 Request/Response 스펙이나 Swagger 명세를 복사하기 좋은 형식으로 문서에 직접 얹어주면 동료의 작업 효율이 대폭 향상됩니다.",
    template: "🚀 신규 API 환경설정\n• `.env.local` 에 `API_GATEWAY_URL`을 반드시 로컬 주소로 설정해야 작동합니다.\n• 추가된 API 스펙은 노션 페이지를 참고하세요."
  },
  {
    label: "지식 공유",
    score: 3.0,
    description: "리뷰 및 스터디를 통해 팀원들에게 새로운 기술 정보와 인사이트를 나눕니다.",
    summary: "좋은 레퍼런스나 최신 동향 기사를 발견하면 슬랙 채널이나 위키에 간헐적으로 포스팅하여 팀 전반의 학습 동력을 서포트합니다. 💡",
    solution: "리뷰 과정에서 '이 글을 참고하시면 유용합니다'와 같은 우수 링크 공유를 일상화하고, 매주 15분 정도의 짧은 기술 디브리핑을 시도하며 팀 내 영향력을 키워 보세요.",
    template: "이번에 도입한 Redux Toolkit 2.0의 신규 미들웨어 패턴입니다.\n공식 문서 중 [이 아티클]이 가장 정리가 잘 되어 있어 공유해 드립니다.\n함께 읽어보면 좋겠습니다!"
  },
  {
    label: "기술 영향력",
    score: 4.0,
    description: "새로운 방법론을 전파하거나 팀의 기술 표준 수립에 힘을 보탭니다.",
    summary: "코드 가독성 규칙이나 빌드 성능 최적화 가이드 등 전반적인 엔지니어링 퀄리티 상승에 기여하는 템플릿과 린트 룰 제안을 솔선수범합니다. 🛠️",
    solution: "제안한 아이디어가 실제로 얼마나 개선되었는지(예: 번들 사이즈 15% 절감 등) 데이터를 바탕으로 포스트를 남겨 기술 신뢰 기반을 탄탄히 다지세요.",
    template: "기존에 매번 직접 구현하던 에러 핸들러 보일러플레이트를 커스텀 미들웨어로 축약했습니다.\n이를 통해 전체 소스 코드 100줄을 감축하고 에러 누수를 전면 차단했습니다."
  },
  {
    label: "코드 안정성",
    score: 4.0,
    description: "버그 예방, 엣지 케이스 고려 및 견고한 설계를 보증합니다.",
    summary: "예외 처리 및 널 포인터 방어 코드를 꼼꼼히 작성하여 배포 시 장애 발생 확률을 선제적으로 통제합니다. 🛡️",
    solution: "유닛 테스트나 통합 테스트 커버리지 리포트를 PR 스펙에 캡처해 추가함으로써 배포 안정성에 대한 정량적인 자신감을 동료들에게 불어넣어 보세요.",
    template: "사용자가 입력한 값이 null이거나 빈 문자열일 때 발생할 수 있는 런타임 NullPointerException 에러를 삼항 연산자와 디폴트 팩토리로 차단하고 방어 로직을 테스트했습니다."
  }
];

export default function HomePage() {
  const { isAuthenticated } = useUserStore();
  const router = useRouter();
  const [selectedIdx, setSelectedIdx] = useState(0);

  const currentMetric = DEMO_METRICS[selectedIdx];

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-accent/20 px-4 text-center">
      <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-background/50 backdrop-blur">
          <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
          <span>AI-Powered GitHub Analysis is here</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Code shows your skill. <br />
          <span className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            PRs reveal your value.
          </span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Git-Mate는 LLM을 기반으로 당신의 PR 코멘트, 커뮤니케이션 스타일 및 개발 성과를 정밀하게 분석하여 
          더 나은 개발자로 성장할 수 있는 인사이트를 제공합니다.
        </p>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          소스 코드를 읽지 않고, GitHub App에서 허용한 저장소의 PR/리뷰/코멘트만 분석합니다.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href={GITHUB_AUTH_URL}
            className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-semibold text-lg shadow-lg shadow-primary/20"
          >
            <GitBranch size={20} />
            <span>GitHub으로 시작하기</span>
            <ArrowRight size={18} className="ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-24 mt-12 border-t border-muted-foreground/10">
          {/* Feature 1 */}
          <div className="space-y-4 text-center p-6 rounded-2xl bg-accent/5">
            <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl mb-2">
              <Code2 className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">PR 문맥 기반 분석</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              PR 설명, 리뷰, 코멘트에서 드러나는 협업 방식과 커뮤니케이션 역량을 분석합니다.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="space-y-4 text-center p-6 rounded-2xl bg-accent/5">
            <div className="inline-flex items-center justify-center p-3 bg-purple-500/10 rounded-2xl mb-2">
              <GitPullRequest className="w-8 h-8 text-purple-500" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">PR 및 커뮤니케이션 가치</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              성공적인 프로젝트의 핵심은 원활한 소통에 있습니다. 당신이 리뷰 및 논의 과정에서 보여준 커뮤니케이션 스킬을 시각화합니다.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="space-y-4 text-center p-6 rounded-2xl bg-accent/5">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-2">
              <Radar className="w-8 h-8 text-indigo-500" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">5대 핵심 역량 입체 진단</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              코드 신뢰도, 커뮤니케이션, 협업 마인드 등 개발자에게 꼭 필요한 5대 지표를 레이더 차트로 시각화하여 나의 강약점 밸런스를 직관적으로 보여줍니다.
            </p>
          </div>
        </div>

        <div className="py-20 border-t border-muted-foreground/10 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">권한 범위를 투명하게 관리합니다</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Git-Mate는 분석에 필요한 PR/리뷰/코멘트 데이터만 사용하며, GitHub App에서 사용자가 허용한 저장소 범위 안에서만 동작합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="rounded-2xl border bg-background/70 p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-lg">소스 코드는 읽지 않음</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Git-Mate는 저장소의 소스 코드를 읽거나 평가하지 않습니다. PR 설명, 리뷰, 코멘트만으로 협업 역량을 분석합니다.
              </p>
            </div>
            <div className="rounded-2xl border bg-background/70 p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-lg">허용한 저장소만 접근</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                GitHub App 설치 시 사용자가 선택한 저장소만 분석 대상이 됩니다.
              </p>
            </div>
            <div className="rounded-2xl border bg-background/70 p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-lg">허용하지 않은 저장소는 제외</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                선택하지 않은 저장소의 데이터는 가져오지 않으며, 분석 대상에도 포함하지 않습니다.
              </p>
            </div>
          </div>
        </div>

        {/* Analysis Report Mockup Section */}
        <div className="py-24 border-t border-muted-foreground/10 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">실제 분석 리포트 예시</h2>
            <p className="text-lg text-muted-foreground">지표를 클릭하여 Git-Mate가 제공하는 성장 코칭을 직접 체험해 보세요.</p>
          </div>

          <div className="text-left space-y-8 bg-background border shadow-2xl rounded-3xl p-6 md:p-10 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold">분석 리포트</h3>
                <span className="text-xs font-medium px-2 py-1 bg-green-500/10 text-green-600 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 완료
                </span>
              </div>
              <p className="text-sm text-muted-foreground">체험용 실시간 데모 리포트입니다</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 좌측: 8대 역량 클릭 그리드 (2열 구조) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                      <TrendingUp className="text-indigo-500" size={20} />
                      역량 지표 상세 (클릭 가능)
                    </h4>
                    <span className="text-xs text-muted-foreground font-medium hidden sm:inline">카드를 선택하면 AI 코칭이 변경됩니다</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DEMO_METRICS.map((item, idx) => {
                      const isSelected = selectedIdx === idx;
                      return (
                        <motion.button
                          key={idx}
                          onClick={() => setSelectedIdx(idx)}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between h-[105px] overflow-hidden ${
                            isSelected 
                              ? "bg-indigo-50/50 border-indigo-200 shadow-md shadow-indigo-100/50" 
                              : "bg-white hover:border-slate-300 hover:shadow-sm border-slate-200 cursor-pointer"
                          }`}
                        >
                          {/* active 백그라운드 라인 인디케이터 */}
                          {isSelected && (
                            <motion.div
                              layoutId="activeDemoIndicator"
                              className="absolute inset-y-0 left-0 w-1 bg-indigo-600 z-0"
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          <div className="relative z-10 w-full">
                            <div className="flex justify-between items-center w-full mb-1">
                              <span className={`font-bold text-sm ${isSelected ? "text-indigo-700" : "text-slate-700"}`}>
                                {item.label}
                              </span>
                              <span className={`font-extrabold text-sm ${isSelected ? "text-indigo-600" : "text-slate-500"}`}>
                                {item.score.toFixed(1)} / 5.0
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-normal line-clamp-2 pr-1">
                              {item.description}
                            </p>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative z-10">
                            <motion.div 
                              className={`h-full rounded-full ${isSelected ? "bg-indigo-600" : "bg-slate-400"}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(item.score / 5) * 100}%` }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 우측: AI 요약 및 상세 솔루션 */}
              <div className="lg:col-span-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="p-6 rounded-2xl border bg-card shadow-sm space-y-6 flex flex-col justify-between h-full min-h-[460px] relative overflow-hidden"
                  >
                    <div className="space-y-5">
                      {/* 파트 1: AI 진단 분석 */}
                      <div className="space-y-2">
                        <h4 className="font-bold flex items-center gap-2 text-sm text-slate-800">
                          <BrainCircuit className="w-4 h-4 text-indigo-500" />
                          AI 역량 진단 ({currentMetric.label})
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {currentMetric.summary}
                        </p>
                      </div>

                      {/* 파트 2: 시니어 솔루션 */}
                      <div className="space-y-2">
                        <h4 className="font-bold flex items-center gap-2 text-sm text-slate-800">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          성장 가이드 솔루션
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {currentMetric.solution}
                        </p>
                      </div>

                      {/* 파트 3: 소통 모범 템플릿 */}
                      <div className="space-y-2">
                        <h4 className="font-bold flex items-center gap-2 text-sm text-emerald-600">
                          <Award className="w-4 h-4 text-emerald-500" />
                          추천 피드백 템플릿
                        </h4>
                        <div className="bg-emerald-50/20 border border-emerald-100/50 rounded-xl p-3 whitespace-pre-line">
                          <p className="text-xs text-emerald-800 leading-relaxed italic font-semibold">
                            &quot;{currentMetric.template}&quot;
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={GITHUB_AUTH_URL}
                      className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold hover:text-indigo-800 group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">
                        내 깃허브 연동하고 맞춤 리포트 받기
                      </span>
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
