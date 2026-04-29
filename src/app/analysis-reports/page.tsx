"use client";

import { useEffect, useState } from "react";
import { analysisService } from "@/services/analysis";
import { FileText, Calendar, GitBranch, ChevronRight, BarChart3 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [sharedReports, setSharedReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"history" | "shared">("history");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        if (activeTab === "history") {
          const data = await analysisService.getHistory();
          setHistory(data);
        } else {
          const data = await analysisService.getReports(true);
          setSharedReports(data);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [activeTab]);

  if (loading && history.length === 0 && sharedReports.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analysis Reports</h1>
            <p className="text-muted-foreground">내 전체 분석 보고서와 공유 중인 리포트를 한 곳에서 관리하세요.</p>
          </div>
        </div>

        <div className="flex space-x-1 bg-muted/30 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "history"
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50"
            }`}
          >
            전체 히스토리
          </button>
          <button
            onClick={() => setActiveTab("shared")}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "shared"
                ? "bg-white text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50"
            }`}
          >
            공유 중인 리포트
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : activeTab === "history" ? (
        history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-2xl bg-muted/30">
            <div className="p-4 bg-muted rounded-full mb-4">
              <GitBranch size={40} className="text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">아직 분석된 저장소가 없습니다.</h2>
            <p className="text-muted-foreground mt-2">저장소를 동기화하여 첫 번째 분석을 시작해 보세요.</p>
            <Link
              href="/repositories"
              className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              저장소 목록으로 가기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((report) => (
            <Link
              key={report.id}
              href={`/analysis-reports/${report.repositoryId}`}
              className="group block p-6 rounded-2xl border bg-card hover:border-primary/50 transition-all hover:shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-accent rounded-lg">
                  <GitBranch className="w-5 h-5 text-indigo-500" />
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              
              <h3 className="text-xl font-bold mb-1 truncate">{report.repository.fullName}</h3>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Calendar size={14} />
                <span>{format(new Date(report.syncTime), "PPP p", { locale: ko })}</span>
              </div>

              <div className="pt-4 border-t grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">최근 종합 점수</p>
                  <p className="text-2xl font-bold text-primary">
                    {report.metrics ? "참고" : "N/A"}
                  </p>
                </div>
                <div className="flex items-end justify-end">
                  <div className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium border border-green-500/20">
                    분석 완료
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        )
      ) : activeTab === "shared" ? (
        sharedReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-2xl bg-muted/30">
            <div className="p-4 bg-muted rounded-full mb-4">
              <BarChart3 size={40} className="text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">아직 공유 중인 리포트가 없습니다.</h2>
            <p className="text-muted-foreground mt-2">리포트 상세 페이지에서 스위치를 클릭해 공유하세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sharedReports.map((report) => (
              <Link
                key={report.id}
                href={`/analysis/${report.id}`}
                className="group block p-6 rounded-2xl border bg-card hover:border-indigo-500/50 transition-all hover:shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                  <div className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">
                    Public
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 pr-12 truncate">{report.repository.fullName}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <Calendar size={14} />
                  <span>{format(new Date(report.syncTime), "PPP", { locale: ko })}</span>
                </div>
                <div className="pt-4 border-t flex justify-between items-center">
                  <span className="text-sm font-medium text-indigo-600 group-hover:underline">리포트 보기</span>
                  <ChevronRight className="w-5 h-5 text-indigo-500 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}
