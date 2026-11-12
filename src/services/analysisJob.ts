import { isAxiosError } from "axios";
import { api } from "./api";

export type AnalysisJobStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED";
export type AnalysisJobStage = "WAITING" | "COLLECTING" | "RESERVING_TOKENS" | "ANALYZING" | "SAVING";

export interface AnalysisJob {
  jobId: string;
  status: AnalysisJobStatus;
  stage: AnalysisJobStage | null;
  progress: number;
  attempt: number;
  repository: { id: number; githubRepoId: string; fullName: string };
  result: { reportId: number; href: string } | null;
  error: { code: string; message: string; retryable: boolean } | null;
  createdAt: string;
  updatedAt: string;
}

interface AnalysisJobList {
  items: AnalysisJob[];
  nextCursor: string | null;
}

/** 백엔드 Job API가 내려주는 에러 코드를 꺼냅니다. */
export const getAnalysisJobErrorCode = (error: unknown): string | undefined => {
  if (isAxiosError<{ code?: string }>(error)) {
    return error.response?.data?.code;
  }
  return undefined;
};

export const isActiveJobStatus = (status: AnalysisJobStatus) =>
  status === "QUEUED" || status === "RUNNING";

const newIdempotencyKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const analysisJobService = {
  /** 비동기 분석 Job 접수 (202 Accepted) */
  create: async (githubRepoId: string, idempotencyKey = newIdempotencyKey()) => {
    const { data } = await api.post<AnalysisJob>(
      "/analysis/jobs",
      { githubRepoId },
      { headers: { "Idempotency-Key": idempotencyKey } },
    );
    return data;
  },

  /** Job 상태 조회 */
  get: async (jobId: string) => {
    const { data } = await api.get<AnalysisJob>(`/analysis/jobs/${jobId}`);
    return data;
  },

  /** 같은 저장소에서 이미 진행 중인 Job 찾기 (409 ACTIVE_JOB_EXISTS 대응) */
  findActiveByGithubRepoId: async (githubRepoId: string) => {
    const { data } = await api.get<AnalysisJobList>("/analysis/jobs", {
      params: { limit: 20 },
    });
    return (
      data.items.find(
        (job) => job.repository.githubRepoId === githubRepoId && isActiveJobStatus(job.status),
      ) ?? null
    );
  },

  /** 재시도 가능한 실패 Job을 새 Job으로 재접수 */
  retry: async (jobId: string, idempotencyKey = newIdempotencyKey()) => {
    const { data } = await api.post<AnalysisJob>(
      `/analysis/jobs/${jobId}/retry`,
      undefined,
      { headers: { "Idempotency-Key": idempotencyKey } },
    );
    return data;
  },

  /** 비동기 분석이 꺼진 환경을 위한 기존 동기 분석 (deprecated API) */
  syncLegacy: async (githubRepoId: string) => {
    const { data } = await api.post(`/collection/sync/${githubRepoId}`);
    return data;
  },
};
