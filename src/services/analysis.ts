import { api } from "./api";

export const analysisService = {
  /**
   * 분석된 저장소 목록 및 최신 리포트 요약 조회
   */
  getHistory: async () => {
    const { data } = await api.get("/analysis/history");
    return data;
  },

  /**
   * 특정 저장소의 전체 분석 히스토리 조회
   */
  getRepositoryHistory: async (repositoryId: number) => {
    const { data } = await api.get(`/analysis/history/${repositoryId}`);
    return data;
  },

  /**
   * 특정 분석 리포트 상세 조회
   */
  getReportById: async (id: number) => {
    const { data } = await api.get(`/analysis/reports/${id}`);
    return data;
  },

  /**
   * 사용자 전체 분석 리포트 조회 (공유 상태 필터 옵션)
   */
  getReports: async (shared?: boolean) => {
    const url = shared !== undefined ? `/analysis/reports?shared=${shared}` : "/analysis/reports";
    const { data } = await api.get(url);
    return data;
  },

  /**
   * 현재 사용자의 통합 역량 통계 조회
   */
  getStats: async () => {
    const { data } = await api.get("/analysis/stats");
    return data;
  },

  /**
   * 특정 리포트를 대표 분석 결과로 설정
   */
  setRepresentative: async (id: number) => {
    const { data } = await api.patch(`/analysis/reports/${id}/representative`);
    return data;
  },

  /**
   * 리포트 공유 상태 토글
   */
  toggleSharing: async (id: number, isShared: boolean) => {
    const { data } = await api.patch(`/analysis/reports/${id}/share`, {
      isShared,
    });
    return data;
  },

  /**
   * 공개된 대표 분석 리포트 조회
   */
  getPublicReport: async (username: string) => {
    const { data } = await api.get(`/analysis/public/${username}`);
    return data;
  },

  /**
   * 플랫폼에 공유된 모든 대표 분석 리포트 목록 조회
   */
  getAllPublicReports: async () => {
    const { data } = await api.get("/analysis/public");
    return data;
  },
};
