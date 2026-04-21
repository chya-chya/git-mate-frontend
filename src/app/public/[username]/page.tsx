"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { analysisService } from "@/services/analysis";
import { ReportView } from "@/components/analysis/ReportView";
import { Loader2, AlertCircle, GitBranch, ExternalLink } from "lucide-react";
import Link from "next/link";


export default function PublicReportPage() {
  const { username } = useParams<{ username: string }>();

  const { data: report, isLoading, error } = useQuery({
    queryKey: ["public-report", username],
    queryFn: () => analysisService.getPublicReport(username),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">{username}님의 분석 데이터를 가져오는 중...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
        <AlertCircle className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">공유된 리포트를 찾을 수 없습니다</h1>
        <p className="text-muted-foreground max-w-md">
          사용자가 리포트를 공유하지 않았거나, 해당 사용자가 존재하지 않습니다.
        </p>
        <Link href="/" className="mt-4 text-primary hover:underline font-semibold">Git-Mate 홈으로 가기</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl animate-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{username}님의 대표 역량 리포트</h2>
              <p className="text-indigo-100 opacity-90 font-medium">
                GitHub 활동 패턴을 기반으로 AI가 분석한 {username}님의 전문성 요약입니다.
              </p>
            </div>
            <a 
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-all border border-white/30 group w-fit backdrop-blur-sm"
              title={`${username}님의 GitHub 프로필 방문`}
            >
              <GitBranch size={16} />
              GitHub 프로필 방문
              <ExternalLink size={14} className="opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
        
        <ReportView report={report} showStatus={true} />
      </div>
    </main>
  );
}
