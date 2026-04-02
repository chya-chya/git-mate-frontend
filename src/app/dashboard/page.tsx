"use client";

import { useUserStore } from "@/store/useUserStore";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from "recharts";
import { Sparkles, TrendingUp, History } from "lucide-react";

// 가상의 데이터 (API 연동 전)
const mockData = [
  { subject: "Acceptance", A: 85, fullMark: 100 },
  { subject: "Logic", A: 90, fullMark: 100 },
  { subject: "Communication", A: 75, fullMark: 100 },
  { subject: "Problem Solving", A: 80, fullMark: 100 },
  { subject: "Review Quality", A: 70, fullMark: 100 },
];

export default function DashboardPage() {
  const { user } = useUserStore();

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
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <Radar
                  name="Capability"
                  dataKey="A"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
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
              최근 PR 리뷰에서 <strong>논리적 프레임워크</strong> 기반의 피드백이 두드러집니다. 
              커뮤니케이션 수용성을 조금 더 높인다면 협업 효율이 극대화될 것으로 보입니다.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-4">
            <h2 className="font-bold flex items-center gap-2">
              <History className="text-blue-500" size={20} />
              최근 활동
            </h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">#124 PR 분석 완료</p>
                    <p className="text-xs text-muted-foreground">2시간 전 · git-mate-backend</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
