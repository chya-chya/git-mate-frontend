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
import { 
  Sparkles, 
  TrendingUp, 
  History, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ChevronRight 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import Link from "next/link";
import { motion } from "framer-motion";

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

const getQuickFeedback = (subject: string, isStrength: boolean) => {
  if (isStrength) {
    switch (subject) {
      case "코드 신뢰도": return "안정적인 기술 설계와 뛰어난 버그 방어력을 보여주어 동료들의 기술적 신뢰가 매우 높습니다! 💻";
      case "논리 및 문서화": return "복잡한 알고리즘 분석과 명확한 기술 문서화 작성으로 프로젝트의 지식 공유 기반을 튼튼히 다집니다. 📝";
      case "지식 공유 및 멘토링": return "코드 리뷰에 적극적이고 공유 문화에 활력을 불어넣는 훌륭한 러닝 파트너입니다! 🤝";
      case "커뮤니케이션": return "의견 대립 상황에서 합리적으로 조율하여 협업 리스크를 최소화하는 조율사입니다. 💬";
      case "협업 마인드": return "상호 존중을 실천하며 팀의 긍정적인 심리적 안정감을 이끄는 배려 깊은 팀플레이어입니다. ❤️";
      default: return "";
    }
  } else {
    switch (subject) {
      case "코드 신뢰도": return "엣지 케이스 분석이나 코드의 구조적 안정성을 한 단계 높이기 위해 동료 리뷰를 다듬어 보세요.";
      case "논리 및 문서화": return "문제 해결 로직을 아키텍처 다이어그램이나 핵심 요약문 형태로 동료들에게 자주 문서로 남겨보세요.";
      case "지식 공유 및 멘토링": return "동료들의 PR에 적극적인 피드백을 남기거나 작은 세미나를 주도하며 영향력을 넓혀 보세요.";
      case "커뮤니케이션": return "갈등 상황에서 조금 더 적극적으로 1:1 싱크를 제안하여 소통의 오해를 풀어 보세요.";
      case "협업 마인드": return "적극적인 상호 칭찬과 작은 기여에 대한 감사를 전해 팀 시너지를 한 단계 끌어올려 보세요.";
      default: return "";
    }
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

  const sortedMetrics = radarData.length > 0 ? [...radarData].sort((a, b) => b.A - a.A) : [];
  const strength = sortedMetrics.length > 0 ? sortedMetrics[0] : null;
  const weakness = sortedMetrics.length > 0 ? sortedMetrics[sortedMetrics.length - 1] : null;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">안녕하세요, {user?.username}님! 👋</h1>
        <p className="text-muted-foreground">당신의 최근 개발 역량 분석 결과입니다.</p>
      </header>

      {/* 오늘의 개발 역량 진단 퀵 보드 */}
      {stats && strength && weakness && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* 강점 카드 */}
          <div className="p-6 rounded-2xl border bg-gradient-to-br from-indigo-50/30 via-white to-white shadow-sm border-indigo-100/50 flex flex-col justify-between hover:shadow-md hover:border-indigo-200 transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all text-indigo-600">
              <CheckCircle2 size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
                  <CheckCircle2 size={13} className="shrink-0 text-indigo-600" />
                  최대 강점
                </span>
                <span className="text-sm font-semibold text-indigo-600">
                  {strength.A}점 / 5.0
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                독보적인 <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{strength.subject}</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {getQuickFeedback(strength.subject, true)}
              </p>
            </div>
            {latestReport && (
              <Link
                href={`/analysis-reports/${latestReport.id}`}
                className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold hover:text-indigo-800 relative z-10"
              >
                <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  리포트에서 솔루션 확인하기 <ChevronRight size={12} />
                </span>
                <ArrowUpRight size={14} className="group-hover:rotate-45 transition-transform" />
              </Link>
            )}
          </div>

          {/* 보완 카드 */}
          <div className="p-6 rounded-2xl border bg-gradient-to-br from-amber-50/20 via-white to-white shadow-sm border-amber-100/50 flex flex-col justify-between hover:shadow-md hover:border-amber-200 transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all text-amber-600">
              <AlertCircle size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-100">
                  <AlertCircle size={13} className="shrink-0 text-amber-600" />
                  보완 필요 역량
                </span>
                <span className="text-sm font-semibold text-amber-600">
                  {weakness.A}점 / 5.0
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                성장이 기대되는 <span className="text-amber-600">{weakness.subject}</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {getQuickFeedback(weakness.subject, false)}
              </p>
            </div>
            {latestReport && (
              <Link
                href={`/analysis-reports/${latestReport.id}`}
                className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-semibold hover:text-amber-800 relative z-10"
              >
                <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  피드백 템플릿 확인하기 <ChevronRight size={12} />
                </span>
                <ArrowUpRight size={14} className="group-hover:rotate-45 transition-transform" />
              </Link>
            )}
          </div>
        </motion.div>
      )}

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
                  <defs>
                    <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.1} />
                    </linearGradient>
                    <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Radar
                    name="Capability"
                    dataKey="A"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fill="url(#radarGradient)"
                    dot={{ r: 4, fill: "var(--primary)", strokeWidth: 2, stroke: "var(--background)" }}
                    activeDot={{ r: 6, fill: "var(--primary)", strokeWidth: 0, filter: "url(#glowFilter)" }}
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
                  <Link
                    key={report.id}
                    href={`/analysis-reports/${report.id}`}
                    className="block group"
                  >
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors border-b last:border-0 pb-3 last:pb-2"
                    >
                      <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 flex-shrink-0 group-hover:bg-primary transition-colors" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-primary transition-colors">
                            리포트 #{report.id} 분석 완료
                          </p>
                          <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(report.syncTime).toLocaleDateString()} · {report.repository?.fullName.split('/')[1] || "Unknown"}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
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
