"use client";

import { useParams } from "next/navigation";
import { useAnalysisStatus } from "@/hooks/useAnalysisStatus";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { CheckCircle2, AlertCircle, Loader2, MessageSquare, BrainCircuit } from "lucide-react";

// 가상의 리포트 데이터
const mockReport = {
  summary: "사용자는 매우 논리적이고 구조적인 리뷰 스타일을 가지고 있습니다. 코드의 성능 최적화에 민감하며, 가독성 개선을 위한 구체적인 대안을 제시하는 경향이 있습니다.",
  metrics: [
    { name: "수용성", score: 78 },
    { name: "논리성", score: 92 },
    { name: "친절도", score: 65 },
    { name: "정확성", score: 88 },
  ],
  trends: [
    { date: "03/25", PRs: 4, Comments: 12 },
    { date: "03/26", PRs: 2, Comments: 5 },
    { date: "03/27", PRs: 6, Comments: 18 },
  ]
};

export default function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isLoading } = useAnalysisStatus(id);

  // 실제 데이터가 없을 경우 Mock 데이터 사용 (데모용)
  const report = mockReport;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">분석 데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">분석 리포트</h1>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-500 flex items-center gap-1">
              <CheckCircle2 size={12} /> 완료
            </span>
          </div>
          <p className="text-muted-foreground">ID: {id} · 2026년 4월 1일 분석</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 요약 및 지표 */}
        <div className="lg:col-span-2 space-y-8">
          <section className="p-6 rounded-2xl border bg-card space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BrainCircuit className="text-purple-500" />
              AI 분석 요약
            </h2>
            <p className="text-lg leading-relaxed">{report.summary}</p>
          </section>

          <section className="p-6 rounded-2xl border bg-card space-y-6">
            <h2 className="text-xl font-bold">정량 지표 상세</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.metrics} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" tick={{ fill: "var(--foreground)", fontSize: 13 }} width={80} />
                  <Tooltip 
                    cursor={{ fill: "transparent" }}
                    contentStyle={{ backgroundColor: "var(--card)", borderRadius: "8px", border: "1px solid var(--border)" }}
                  />
                  <Bar dataKey="score" fill="url(#colorGradient)" radius={[0, 4, 4, 0]} barSize={24} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* 오른쪽: 세부 정보 카드 */}
        <div className="space-y-6">
          <section className="p-6 rounded-2xl border bg-card space-y-4">
            <h2 className="font-bold flex items-center gap-2">
              <MessageSquare className="text-blue-500" size={20} />
              분석 대상 통계
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">총 PR 수</span>
                <span className="font-bold">12개</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">분석된 코멘트</span>
                <span className="font-bold">48개</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">정제된 데이터</span>
                <span className="font-bold">35개</span>
              </div>
            </div>
          </section>

          <section className="p-6 rounded-2xl border bg-yellow-500/5 border-yellow-500/20 space-y-4">
            <h2 className="font-bold flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
              <AlertCircle size={20} />
              개선 제안
            </h2>
            <ul className="text-sm space-y-2 text-muted-foreground leading-relaxed">
              <li>• 리뷰 시 &quot;친절도&quot; 점수가 평균보다 낮습니다.</li>
              <li>• 이모지 사용이나 칭찬의 말을 섞어보세요.</li>
              <li>• 복잡한 코드 설계에 대한 설명력을 높이면 좋습니다.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
