import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

interface AnalysisStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  result?: any;
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
