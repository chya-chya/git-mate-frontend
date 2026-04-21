"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { analysisService } from "@/services/analysis";
import { GitBranch, Calendar, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function RepositoryHistoryPage() {
  const params = useParams();
  const repoId = Number(params.repoId);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepoHistory = async () => {
      try {
        const data = await analysisService.getRepositoryHistory(repoId);
        setReports(data);
      } catch (error) {
        console.error("Failed to fetch repo history:", error);
      } finally {
        setLoading(false);
      }
    };
    if (repoId) fetchRepoHistory();
  }, [repoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const repoName = reports[0]?.repository?.fullName || "Repository History";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/history"
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="w-5 h-5 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">{repoName}</h1>
          </div>
          <p className="text-muted-foreground">이 저장소에 대한 과거 분석 기록을 모두 조회합니다.</p>
        </div>
      </div>

      <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {reports.map((report, index) => (
          <div key={report.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            {/* Dot */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <div className="w-3 h-3 rounded-full bg-primary" />
            </div>

            {/* Content */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl border bg-card hover:border-primary/50 transition-all hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Calendar size={16} />
                  <span>{format(new Date(report.syncTime), "yyyy. MM. dd (E)", { locale: ko })}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(report.syncTime), "HH:mm:ss")}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm line-clamp-2">
                  {report.metrics?.summary || "분석 요약 정보가 없습니다."}
                </p>
                
                <Link
                  href={`/analysis/${report.id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline group/btn"
                >
                  상세 리포트 보기
                  <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
