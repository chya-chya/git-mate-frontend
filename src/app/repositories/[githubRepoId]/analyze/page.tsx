"use client";

import { useUserStore } from "@/store/useUserStore";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useToast } from "@/components/ui/Toast";
import { Loader2, Coins, ArrowRight, X, AlertTriangle, ShieldCheck, Bot, Sparkles } from "lucide-react";
import { getErrorMessage } from "@/utils/error";
import { Suspense } from "react";

// 토큰 정보 DTO
interface UserTokens {
  availableTokens: number;
}
interface EstimateData {
  prCount: number;
  estimatedTokens: number;
}

function AnalyzePreviewContent() {
  const { isAuthenticated } = useUserStore();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const githubRepoId = params.githubRepoId as string;
  const fullName = searchParams.get("fullName") || "알 수 없는 저장소";

  // 보유 토큰 조회
  const { data: userTokens, isLoading: isTokensLoading } = useQuery<UserTokens>({
    queryKey: ["userTokens"],
    queryFn: async () => {
      const { data } = await api.get("/user/tokens");
      return data;
    },
    enabled: isAuthenticated,
  });

  // 분석 비용 및 데이터 견적 조회
  const { data: estimateData, isLoading: isEstimateLoading } = useQuery<EstimateData>({
    queryKey: ["estimate", githubRepoId],
    queryFn: async () => {
      const { data } = await api.get(`/collection/estimate/${githubRepoId}`);
      return data;
    },
    enabled: isAuthenticated && !!githubRepoId,
  });

  // 분석 시작 뮤테이션
  const syncMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/collection/sync/${id}`);
      return data;
    },
    onSuccess: () => {
      addToast("분석이 성공적으로 시작되었습니다. 완료 시 대시보드에서 확인 가능합니다.", "success");
      // 분석이 완료되었으므로 대시보드로 이동
      router.push("/dashboard");
    },
    onError: (err: Error) => {
      // 에러 메시지는 구체적이고 사용자가 이해하기 쉬운 언어로 (CLAUDE.md 규칙 적용)
      const errMessage = getErrorMessage ? getErrorMessage(err) : "분석 요청 중 오류가 발생했습니다.";
      addToast(errMessage, "error");
    }
  });

  if (!isAuthenticated) return null;

  const actualPrCount = estimateData?.prCount || 0;
  const actualTokensNeeded = estimateData?.estimatedTokens || 0;
  const currentTokens = userTokens?.availableTokens || 0;
  
  const isNotEnoughTokens = currentTokens < actualTokensNeeded;
  const isZeroPr = actualPrCount === 0 && !isEstimateLoading;

  if (syncMutation.isPending) {
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-12 min-h-[60vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="relative w-full max-w-md mx-auto">
          {/* Glowing background effect */}
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
          
          <div className="relative bg-card border border-primary/20 shadow-2xl rounded-3xl p-10 flex flex-col items-center text-center space-y-6">
            
            {/* Animated Icons Container */}
            <div className="relative flex items-center justify-center w-24 h-24">
              <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" style={{ animationDuration: '3s' }}></div>
              <div className="absolute inset-2 rounded-full border-r-2 border-indigo-500 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
              <Bot className="w-10 h-10 text-primary animate-pulse" />
              <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-500 animate-ping" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent animate-pulse">
                AI가 저장소를 분석 중입니다
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                개발자님의 코드 리뷰 스타일, 커뮤니케이션 성향, 
                숨겨진 강점을 추출하고 있습니다.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full space-y-2">
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden relative">
                <div className="absolute left-0 top-0 h-full w-[80%] bg-gradient-to-r from-primary to-indigo-500 opacity-80 animate-pulse"></div>
              </div>
              <p className="text-xs text-muted-foreground font-mono transition-opacity animate-pulse">
                Processing PR Data & Generating Insights...
              </p>
            </div>

            {/* Warning Message */}
            <div className="w-full mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-left">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-500">페이지를 이탈하지 마세요!</p>
                <p className="text-xs text-amber-600/80 dark:text-amber-500/80">
                  심층 분석에 <b>최대 30초</b>가 소요될 수 있습니다. 진행 중 새로고침하거나 창을 닫으면 결과를 즉시 확인할 수 없습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-12 space-y-8 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">분석 시작하기</h1>
        <p className="text-muted-foreground flex items-center gap-2">
          선택한 저장소: <span className="font-semibold text-primary">{fullName}</span>
        </p>
      </header>

      <div className="p-6 border rounded-2xl bg-card space-y-6">
        
        {/* Step 1: 보낼 데이터 정보 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ShieldCheck className="text-indigo-500" size={24} />
            수집 예정 데이터 확인
          </h2>
          <div className="p-4 rounded-xl bg-secondary/50 text-sm space-y-2 text-secondary-foreground">
            <p><strong>수집 대상:</strong> 최근 PR 및 리뷰, 코멘트 등</p>
            {isEstimateLoading ? (
              <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> 데이터를 불러오는 중...</p>
            ) : (
              <p>
                <strong>수집된 분석 PR 수:</strong> {actualPrCount} 개 
                {isZeroPr && <span className="text-destructive ml-2 font-semibold"> (분석할 데이터가 없습니다)</span>}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2 border-t pt-2 border-border/50">
              * GitHub 정책과 접근 권한 내에서 수집 가능한 최신 내역만 분석합니다.
            </p>
          </div>
        </div>

        {/* Step 2: 예측 비용 및 보유 토큰 정보 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Coins className="text-yellow-500" size={24} />
            토큰 사용 예상치
          </h2>
          {isTokensLoading || isEstimateLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" /> 사용 예상치 계산 중...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border bg-background space-y-1">
                <p className="text-sm text-muted-foreground">내 보유 토큰</p>
                <div className="text-2xl font-bold text-primary">
                  {currentTokens.toLocaleString()} <span className="text-sm font-normal">Tokens</span>
                </div>
              </div>
              <div className="p-4 rounded-xl border bg-background space-y-1">
                <p className="text-sm text-muted-foreground">{isZeroPr ? "소요 예상 토큰" : "소요 예상 토큰"}</p>
                <div className="text-2xl font-bold text-amber-500">
                  {actualTokensNeeded.toLocaleString()} <span className="text-sm font-normal">Tokens</span>
                </div>
              </div>
            </div>
          )}

          {isNotEnoughTokens && !isTokensLoading && !isEstimateLoading && !isZeroPr && (
            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm flex items-center gap-2">
              <AlertTriangle size={16} />
              보유 토큰이 부족합니다. 분석을 진행하려면 토큰 충전이 필요합니다.
            </div>
          )}
        </div>

      </div>

      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        <button
          onClick={() => router.back()}
          disabled={syncMutation.isPending}
          className="px-6 py-2.5 rounded-xl border hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <X size={16} />
          취소 돌아가기
        </button>

        <button
          onClick={() => syncMutation.mutate(githubRepoId)}
          disabled={syncMutation.isPending || isTokensLoading || isEstimateLoading || isNotEnoughTokens || isZeroPr}
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {syncMutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              분석 진행 중...
            </>
          ) : (
            <>
              분석 시작 승인
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

    </div>
  );
}

export default function AnalyzePreviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <AnalyzePreviewContent />
    </Suspense>
  );
}

