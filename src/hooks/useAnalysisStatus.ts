import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export interface MetricInfo {
  score: number;
  reason?: string;
  improvement?: string;
  example?: string;
}

export interface MetricsData {
  summary?: string;
  mutual_respect?: MetricInfo;
  conflict_management?: MetricInfo;
  logical_problem_definition?: MetricInfo;
  review_guiding?: MetricInfo;
  documentation?: MetricInfo;
  knowledge_sharing?: MetricInfo;
  technical_influence?: MetricInfo;
  code_stability?: MetricInfo;
}

export interface AnalysisReportResult {
  id: string;
  repositoryId: number;
  syncTime: string;
  isShared: boolean;
  isRepresentative: boolean;
  metrics: MetricsData;
}

interface AnalysisStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  result?: AnalysisReportResult;
}

export function useAnalysisStatus(analysisId: string | null) {
  return useQuery({
    queryKey: ["analysis", analysisId],
    queryFn: async () => {
      if (!analysisId) return null;
      const { data } = await api.get<AnalysisStatus>(`/analysis/status/${analysisId}`);
      return data;
    },
    enabled: !!analysisId,
    // 상태가 'completed' 또는 'failed'가 아닐 때만 3초마다 폴링
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "completed" || status === "failed" ? false : 3000;
    },
  });
}
