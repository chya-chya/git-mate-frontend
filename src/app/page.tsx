"use client";

import { useUserStore } from "@/store/useUserStore";
import { ArrowRight, GitBranch, Sparkles, Code2, GitPullRequest, LineChart, CheckCircle2, BrainCircuit, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { isAuthenticated } = useUserStore();
  const router = useRouter();

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

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/github`}
            className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-semibold text-lg shadow-lg shadow-primary/20"
          >
            <GitBranch size={20} />
            <span>GitHub으로 시작하기</span>
            <ArrowRight size={18} className="ml-1" />
          </Link>
          <Link
            href="#features"
            className="px-8 py-4 bg-transparent border border-muted hover:bg-accent/50 transition-all rounded-xl font-semibold text-lg"
          >
            기능 살펴보기
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-24 mt-12 border-t border-muted-foreground/10">
          {/* Feature 1 */}
          <div className="space-y-4 text-center p-6 rounded-2xl bg-accent/5">
            <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl mb-2">
              <Code2 className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">문맥 인식 코드 분석</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              코드 몇 줄을 작성했는지가 전부가 아닙니다. Git-Mate는 문맥을 이해하고, 프로젝트에 기여한 당신의 진짜 역량을 분석합니다.
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
              <LineChart className="w-8 h-8 text-indigo-500" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">실시간 성장 추적</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              대형 레포지토리에서도 최신 작업 내역이 곧바로 반영되어, 복잡한 설정 없이 당신의 성장 트렌드를 확인할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Analysis Report Mockup Section */}
        <div className="py-24 border-t border-muted-foreground/10 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">실제 분석 리포트 예시</h2>
            <p className="text-lg text-muted-foreground">Git-Mate가 분석한 상세 리포트를 미리 확인해 보세요.</p>
          </div>

          <div className="text-left space-y-8 bg-background border shadow-2xl rounded-2xl p-6 md:p-10 max-w-5xl mx-auto transform hover:scale-[1.01] transition-transform duration-500">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold">분석 리포트</h3>
                <span className="text-xs font-medium px-2 py-1 bg-green-500/10 text-green-600 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 완료
                </span>
              </div>
              <p className="text-sm text-muted-foreground">2026. 4. 13. 오후 3:26:32 분석</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* AI Summary Card */}
                <div className="p-6 rounded-xl border bg-card space-y-4">
                  <h4 className="font-bold flex items-center gap-2 text-lg">
                    <BrainCircuit className="w-6 h-6 text-purple-500" /> AI 분석 요약
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    이 개발자는 코드 리뷰와 PR 작성에서 높은 상호 존중과 수용성을 보여주며, 대부분의 PR에서 논리적 문제 정의와 주도적인 맥락 공유가 이루어졌습니다. 문서화에서 성실히 작성하려는 모습은 보이나 일부 자세한 설명 부족한 부분이 있으며, 기술적 영향력에 있어 어느 정도의 영향력을 행사하고 있으나 표준화된 기술 영향력은 부족합니다. 전반적으로 코드의 안정성은 확보되었지만, 깊이 있는 논의가 더 많았다면 더 좋았을 것입니다.
                  </p>
                </div>

                {/* Progress Bars Card */}
                <div className="p-6 rounded-xl border bg-card space-y-8">
                  <h4 className="font-bold text-lg">역량 지표 상세 (1.0 ~ 5.0)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {[
                      { label: "상호 존중", score: 4.5 },
                      { label: "갈등 관리", score: 3.5 },
                      { label: "문제 정의", score: 4.5 },
                      { label: "맥락 공유", score: 4.0 },
                      { label: "문서화", score: 3.5 },
                      { label: "지식 공유", score: 3.0 },
                      { label: "기술 영향력", score: 4.0 },
                      { label: "코드 안정성", score: 4.0 },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-foreground/80">{item.label}</span>
                          <span className="font-bold text-indigo-500">{item.score.toFixed(1)}</span>
                        </div>
                        <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${(item.score / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                {/* Target Repo Card */}
                <div className="p-6 rounded-xl border bg-card space-y-4 h-fit">
                  <h4 className="font-bold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" /> 분석 대상
                  </h4>
                  <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t">
                    <span className="text-muted-foreground whitespace-nowrap">저장소</span>
                    <span className="font-semibold text-foreground truncate pl-4" title="nb02-CODIIT-team2/CODIIT-backend">nb02-CODIIT-team2/CODIIT-backend</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
