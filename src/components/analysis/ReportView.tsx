"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { CheckCircle2, MessageSquare, BrainCircuit } from "lucide-react";

interface ReportViewProps {
  report: any;
  showStatus?: boolean;
}

export function ReportView({ report, showStatus = true }: ReportViewProps) {
  const metrics = [
    { name: "상호 존중", score: report.metrics.mutual_respect },
    { name: "갈등 관리", score: report.metrics.conflict_management },
    { name: "문제 정의", score: report.metrics.logical_problem_definition },
    { name: "맥락 공유", score: report.metrics.review_guiding },
    { name: "문서화", score: report.metrics.documentation },
    { name: "지식 공유", score: report.metrics.knowledge_sharing },
    { name: "기술 영향력", score: report.metrics.technical_influence },
    { name: "코드 안정성", score: report.metrics.code_stability },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {showStatus && (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">분석 리포트</h1>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-500 flex items-center gap-1">
                <CheckCircle2 size={12} /> 완료
              </span>
            </div>
            <p className="text-muted-foreground">
              {new Date(report.syncTime).toLocaleString("ko-KR")} 분석
            </p>
          </div>
        </header>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="p-6 rounded-2xl border bg-card space-y-4 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BrainCircuit className="text-purple-500" />
              AI 분석 요약
            </h2>
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{report.metrics.summary}</p>
          </section>

          <section className="p-6 rounded-2xl border bg-card space-y-6 shadow-sm">
            <h2 className="text-xl font-bold">역량 지표 상세 (1.0 ~ 5.0)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {metrics.map((m) => (
                <div key={m.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{m.name}</span>
                    <span className="text-sm font-bold text-primary">{m.score.toFixed(1)}</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                      style={{ width: `${(m.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="p-6 rounded-2xl border bg-card space-y-4 shadow-sm">
            <h2 className="font-bold flex items-center gap-2">
              <MessageSquare className="text-blue-500" size={20} />
              분석 대상
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">저장소</span>
                <span className="font-semibold">{report.repository?.fullName || "알 수 없음"}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
