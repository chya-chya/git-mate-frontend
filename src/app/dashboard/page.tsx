"use client";

import { useUserStore } from "@/store/useUserStore";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { Sparkles, TrendingUp, History, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

interface UserStats {
  codeStabilityScore: number;
  conflictManagementScore: number;
  documentationScore: number;
  knowledgeSharingScore: number;
  logicalProblemScore: number;
  mutualRespectScore: number;
  reviewGuidingScore: number;
  technicalInfluenceScore: number;
}

interface Report {
  id: number;
  syncTime: string;
  repository?: {
    fullName: string;
  };
  metrics?: {
    summary: string;
  };
}

const getCategoryDescription = (subject: string) => {
  switch (subject) {
    case "코드 신뢰도": return "코드의 안정성 및 프로젝트 전반에 미치는 기술적 영향력을 의미합니다.";
    case "논리 및 문서화": return "복잡한 문제의 논리적인 해결과 명확한 문서화 작성 능력을 평가합니다.";
    case "지식 공유 및 멘토링": return "코드 리뷰 참여도 및 동료들에게 유용한 지식을 공유하는 역량입니다.";
    case "커뮤니케이션": return "프로젝트 진행 과정상 발생하는 문제를 원활하게 조율하는 소통 능력입니다.";
    case "협업 마인드": return "동료에 대한 상호 존중 및 긍정적인 협업 태도를 보여줍니다.";
    default: return "";
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border shadow-lg rounded-xl p-4 text-sm max-w-[280px]">
        <p className="font-bold text-foreground mb-2 flex items-center justify-between gap-4">
          <span>{data.subject}</span>
          <span className="text-primary">{data.A}점</span>
        </p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {getCategoryDescription(data.subject)}
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user, isAuthenticated } = useUserStore();

  const { data: stats, isLoading: isStatsLoading } = useQuery<UserStats>({
    queryKey: ["userStats"],
    queryFn: async () => {
      const { data } = await api.get<UserStats>("/analysis/stats");
      return data;
    },
    enabled: isAuthenticated,
  });

  const { data: reports, isLoading: isReportsLoading } = useQuery<Report[]>({
    queryKey: ["userReports"],
    queryFn: async () => {
      const { data } = await api.get<Report[]>("/analysis/reports");
      return data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) return null;

  const radarData = stats ? [
    { 
      subject: "코드 신뢰도", 
      A: Number(((stats.codeStabilityScore + stats.technicalInfluenceScore) / 2 || 0).toFixed(1)), 
      fullMark: 100 
    },
    { 
      subject: "논리 및 문서화", 
      A: Number(((stats.logicalProblemScore + stats.documentationScore) / 2 || 0).toFixed(1)), 
      fullMark: 100 
    },
    { 
      subject: "지식 공유 및 멘토링", 
      A: Number(((stats.knowledgeSharingScore + stats.reviewGuidingScore) / 2 || 0).toFixed(1)), 
      fullMark: 100 
    },
    { 
      subject: "커뮤니케이션", 
      A: Number((stats.conflictManagementScore || 0).toFixed(1)), 
      fullMark: 100 
    },
    { 
      subject: "협업 마인드", 
      A: Number((stats.mutualRespectScore || 0).toFixed(1)), 
      fullMark: 100 
    },
  ] : [];

  const latestReport = reports && reports.length > 0 ? reports[0] : null;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">안녕하세요, {user?.username}님! 👋</h1>
        <p className="text-muted-foreground">당신의 최근 개발 역량 분석 결과입니다.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 요약 카드 */}
        <div className="col-span-1 md:col-span-1 lg:col-span-2 p-6 rounded-2xl border bg-card shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="text-indigo-500" />
              전체 역량 지표
            </h2>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            {isStatsLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : !stats ? (
              <p className="text-muted-foreground">아직 분석된 역량 데이터가 없습니다.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Radar
                    name="Capability"
                    dataKey="A"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="var(--primary)"
                    fillOpacity={0.8}
                    dot={{ r: 4, fill: "var(--primary)", strokeWidth: 2, stroke: "var(--background)" }}
                    activeDot={{ r: 6, fill: "var(--primary)", strokeWidth: 0 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 상세 통계 및 최근 활동 */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-4">
            <h2 className="font-bold flex items-center gap-2">
              <Sparkles className="text-yellow-500" size={20} />
              AI 요약
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {latestReport?.metrics?.summary || "아직 생성된 AI 요약 리포트가 없습니다. 저장소에서 분석을 먼저 진행해주세요."}
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-4">
            <h2 className="font-bold flex items-center gap-2">
              <History className="text-blue-500" size={20} />
              최근 활동
            </h2>
            <div className="space-y-3">
              {isReportsLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>
              ) : reports && reports.length > 0 ? (
                reports.slice(0, 5).map((report: Report) => (
                  <div key={report.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                    <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">리포트 #{report.id} 분석 완료</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.syncTime).toLocaleDateString()} · {report.repository?.fullName.split('/')[1] || "Unknown"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">최근 활동 내역이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
