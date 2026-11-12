"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useToast } from "@/components/ui/Toast";
import { Loader2, Coins, ArrowRight, X, AlertTriangle, ShieldCheck, Bot, Sparkles, RotateCcw } from "lucide-react";
import { getErrorMessage } from "@/utils/error";
import { Suspense } from "react";
import {
  analysisJobService,
  getAnalysisJobErrorCode,
  isActiveJobStatus,
  type AnalysisJob,
  type AnalysisJobStage,
} from "@/services/analysisJob";

// 토큰 정보 DTO
interface UserTokens {
  availableTokens: number;
}
interface EstimateData {
  prCount: number;
  estimatedTokens: number;
}

// 분석 단계별 안내 문구
const STAGE_MESSAGES: Record<AnalysisJobStage, string> = {
  WAITING: "분석 대기열에서 순서를 기다리는 중...",
  COLLECTING: "최근 Pull Request와 리뷰 데이터 수집 중...",
  RESERVING_TOKENS: "분석에 필요한 토큰 확인 중...",
  ANALYZING: "AI가 협업 패턴과 역량을 분석하는 중...",
  SAVING: "분석 리포트 결과 저장 중...",
};

// 백엔드 Job 실패 코드를 사용자 안내 문구로 변환
const JOB_ERROR_MESSAGES: Record<string, string> = {
  INSUFFICIENT_TOKENS: "보유 토큰이 부족해 분석을 진행할 수 없습니다.",
  TOKEN_BUDGET_EXCEEDED: "분석에 필요한 토큰이 예상보다 많아 중단되었습니다.",
  NO_ANALYZABLE_DATA: "분석할 수 있는 PR·리뷰 데이터가 없습니다.",
  REPOSITORY_NOT_FOUND: "저장소를 찾을 수 없습니다. GitHub App 저장소 권한을 확인해 주세요.",
  REPOSITORY_UNAVAILABLE: "저장소에 접근할 수 없습니다. GitHub App 저장소 권한을 확인해 주세요.",
  RATE_LIMITED: "요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.",
  GITHUB_TEMPORARY_FAILURE: "GitHub 응답이 일시적으로 불안정합니다. 잠시 후 다시 시도해 주세요.",
  INPUT_LIMIT_EXCEEDED: "분석 데이터가 너무 많아 처리할 수 없습니다.",
  ACCOUNT_DEACTIVATED: "비활성화된 계정입니다.",
  JOB_ACCEPTANCE_UNAVAILABLE: "지금은 분석 요청을 받을 수 없습니다. 잠시 후 다시 시도해 주세요.",
};

const describeJobError = (code?: string, fallback?: string) =>
  (code && JOB_ERROR_MESSAGES[code]) || fallback || "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";

function AnalyzePreviewContent() {
  const { isAuthenticated } = useUserStore();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const githubRepoId = params.githubRepoId as string;
  const fullName = searchParams.get("fullName") || "알 수 없는 저장소";

  const queryClient = useQueryClient();

  // 비동기 Job ID는 URL(?jobId=)에 남겨 새로고침·재방문 시에도 진행 상황을 이어서 봅니다.
  const [jobId, setJobId] = useState<string | null>(searchParams.get("jobId"));
  const idempotencyKeyRef = useRef<string | null>(null);

  const trackJob = (job: AnalysisJob) => {
    queryClient.setQueryData(["analysisJob", job.jobId], job);
    setJobId(job.jobId);
    const query = new URLSearchParams(searchParams.toString());
    query.set("jobId", job.jobId);
    router.replace(`?${query.toString()}`, { scroll: false });
  };

  // 비동기 Job 진행 상태 폴링 (QUEUED/RUNNING 동안 2초 간격)
  const { data: job, isError: isJobLookupFailed } = useQuery({
    queryKey: ["analysisJob", jobId],
    queryFn: () => analysisJobService.get(jobId as string),
    enabled: isAuthenticated && !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && !isActiveJobStatus(status) ? false : 2000;
    },
  });

  // 완료되면 리포트 화면으로 한 번만 이동
  const redirectedJobRef = useRef<string | null>(null);
  useEffect(() => {
    if (job?.status === "SUCCEEDED" && job.result && redirectedJobRef.current !== job.jobId) {
      redirectedJobRef.current = job.jobId;
      addToast("분석이 완료되었습니다.", "success");
      queryClient.invalidateQueries({ queryKey: ["userTokens"] });
      router.push(`/analysis/${job.result.reportId}`);
    }
  }, [job?.jobId, job?.status, job?.result, addToast, queryClient, router]);

  // 분석 시작: 비동기 Job API 우선, 비동기 경로가 꺼진 환경이면 기존 동기 API로 전환
  const startMutation = useMutation({
    mutationFn: async (id: string) => {
      // 같은 클릭에 대한 재요청이 중복 Job을 만들지 않도록 키를 재사용합니다.
      idempotencyKeyRef.current ??= crypto.randomUUID();
      try {
        const created = await analysisJobService.create(id, idempotencyKeyRef.current);
        return { mode: "async" as const, job: created };
      } catch (err) {
        const code = getAnalysisJobErrorCode(err);
        if (code === "ACTIVE_JOB_EXISTS") {
          const active = await analysisJobService.findActiveByGithubRepoId(id);
          if (active) return { mode: "async" as const, job: active };
        }
        if (code === "ASYNC_ANALYSIS_DISABLED") {
          await analysisJobService.syncLegacy(id);
          return { mode: "sync" as const };
        }
        throw err;
      }
    },
    onSuccess: (outcome) => {
      idempotencyKeyRef.current = null;
      if (outcome.mode === "async") {
        trackJob(outcome.job);
        return;
      }
      addToast("분석이 완료되었습니다. 대시보드에서 결과를 확인하세요.", "success");
      router.push("/dashboard");
    },
    onError: (err: Error) => {
      idempotencyKeyRef.current = null;
      addToast(describeJobError(getAnalysisJobErrorCode(err), getErrorMessage(err)), "error");
    },
  });

  // 실패한 Job 재시도
  const retryMutation = useMutation({
    mutationFn: (failedJobId: string) => analysisJobService.retry(failedJobId),
    onSuccess: (retried) => trackJob(retried),
    onError: (err: Error) => {
      addToast(describeJobError(getAnalysisJobErrorCode(err), getErrorMessage(err)), "error");
    },
  });

  // 조회 실패(만료·잘못된 jobId)면 진행 화면 대신 시작 화면을 보여줍니다.
  const isJobActive = !!jobId && !isJobLookupFailed && (!job || job.status !== "FAILED");
  const isLegacySyncRunning = startMutation.isPending;
  const isRunning = isJobActive || isLegacySyncRunning;

  const loadingMessages = useMemo(() => [
    "데이터 수집을 위한 보안 연결 초기화 중...",
    "최근 Pull Request와 리뷰 데이터 수집 중...",
    "코드 리뷰 및 코멘트 패턴 분석 중...",
    "AI를 활용한 개발자 인사이트 추출 중...",
    "분석 리포트 결과 생성 및 최종 정리 중...",
  ], []);

  // 요청 처리 중(동기 fallback 포함)에는 서버 진행률이 없으므로 예상 시간 기반으로 진행 바를 채웁니다.
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLegacySyncRunning) {
      const startTime = Date.now();
      const duration = 25000; // 약 25초 동안 점진적 증가

      timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const rawProgress = Math.min((elapsed / duration) * 100, 98);

        setProgress(prev => Math.max(prev, rawProgress));

        const msgIdx = Math.min(
          Math.floor((elapsed / duration) * loadingMessages.length),
          loadingMessages.length - 1
        );
        setMessageIndex(msgIdx);
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isLegacySyncRunning, loadingMessages.length]);

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


  if (!isAuthenticated) return null;

  const actualPrCount = estimateData?.prCount || 0;
  const actualTokensNeeded = estimateData?.estimatedTokens || 0;
  const currentTokens = userTokens?.availableTokens || 0;
  
  const isNotEnoughTokens = currentTokens < actualTokensNeeded;
  const isZeroPr = actualPrCount === 0 && !isEstimateLoading;

  // 실패한 Job 안내
  if (job?.status === "FAILED") {
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-12 min-h-[60vh] flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="w-full max-w-md bg-card border border-destructive/30 shadow-xl rounded-3xl p-10 flex flex-col items-center text-center space-y-6">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">분석을 완료하지 못했습니다</h2>
            <p className="text-sm text-muted-foreground">
              {describeJobError(job.error?.code, job.error?.message)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/repositories")}
              className="px-5 py-2.5 rounded-xl border hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-2"
            >
              <X size={16} />
              저장소 목록으로
            </button>
            {job.error?.retryable && (
              <button
                onClick={() => retryMutation.mutate(job.jobId)}
                disabled={retryMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {retryMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                다시 시도
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isRunning) {
    const displayProgress = isJobActive ? (job?.status === "SUCCEEDED" ? 100 : job?.progress ?? 0) : progress;
    const displayMessage = isJobActive
      ? job?.status === "SUCCEEDED"
        ? "분석이 완료되어 리포트로 이동합니다..."
        : job?.stage
        ? STAGE_MESSAGES[job.stage]
        : "분석 요청을 접수하는 중..."
      : loadingMessages[messageIndex];

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
                <div 
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-indigo-500 opacity-80 transition-all duration-500 ease-out"
                  style={{ width: `${displayProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground font-mono transition-opacity duration-500">
                {displayMessage}
              </p>
            </div>

            {isJobActive ? (
              <div className="w-full mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3 text-left">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  분석은 서버에서 백그라운드로 진행됩니다. 이 페이지를 닫아도 분석은 계속되며, 다시 열면 진행 상황을 이어서 확인할 수 있습니다.
                </p>
              </div>
            ) : (
              <div className="w-full mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-left">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-500">페이지를 이탈하지 마세요!</p>
                  <p className="text-xs text-amber-600/80 dark:text-amber-500/80">
                    심층 분석에 <b>최대 30초</b>가 소요될 수 있습니다. 진행 중 새로고침하거나 창을 닫으면 결과를 즉시 확인할 수 없습니다.
                  </p>
                </div>
              </div>
            )}
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
          disabled={isRunning}
          className="px-6 py-2.5 rounded-xl border hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <X size={16} />
          취소 돌아가기
        </button>

        <button
          onClick={() => startMutation.mutate(githubRepoId)}
          disabled={isRunning || isTokensLoading || isEstimateLoading || isNotEnoughTokens || isZeroPr}
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isRunning ? (
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

