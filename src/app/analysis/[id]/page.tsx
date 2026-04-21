"use client";

import { useParams } from "next/navigation";
import { useAnalysisStatus } from "@/hooks/useAnalysisStatus";
import { ReportView } from "@/components/analysis/ReportView";
import { analysisService } from "@/services/analysis";
import { useUserStore } from "@/store/useUserStore";
import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Star, 
  Share2, 
  Copy,
  ExternalLink 
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useAnalysisStatus(id);
  const { user } = useUserStore();
  const { addToast } = useToast();
  const [isRepresentative, setIsRepresentative] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (data?.result) {
      setIsShared(data.result.isShared);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">분석 데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <AlertCircle className="w-10 h-10 text-destructive" />
        <p className="text-muted-foreground">분석 데이터를 불러오지 못했습니다.</p>
      </div>
    );
  }

  const report = data.result;
  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">분석이 진행 중입니다... ({data.progress}%)</p>
      </div>
    );
  }

  const handleSetRepresentative = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await analysisService.setRepresentative(Number(id));
      setIsRepresentative(true);
      addToast("대표 리포트로 설정되었습니다.", "success");
    } catch {
      addToast("대표 설정에 실패했습니다.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleShare = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    const newStatus = !isShared;
    try {
      await analysisService.toggleSharing(Number(id), newStatus);
      setIsShared(newStatus);
      addToast(
        newStatus ? "공유가 활성화되었습니다." : "공유가 비활성화되었습니다.",
        "success"
      );
    } catch {
      addToast("공유 상태 변경에 실패했습니다.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = () => {
    const shareUrl = `${window.location.origin}/public/${user?.username}`;
    navigator.clipboard.writeText(shareUrl);
    addToast("공유 링크가 복사되었습니다.", "success");
  };

  const shareUrl = `${window.location.origin}/public/${user?.username}`;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">분석 리포트</h1>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-500 flex items-center gap-1">
              <CheckCircle2 size={12} /> 완료
            </span>
            {isRepresentative && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500/10 text-yellow-600 flex items-center gap-1">
                <Star size={12} fill="currentColor" /> 대표 설정됨
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            ID: {id} · {new Date(report.syncTime).toLocaleString("ko-KR")} 분석
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSetRepresentative}
            disabled={isUpdating}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium ${
              isRepresentative 
                ? "bg-yellow-50 border-yellow-200 text-yellow-700 shadow-sm" 
                : "bg-white hover:bg-gray-50 text-gray-700 hover:border-gray-300"
            }`}
          >
            <Star size={18} fill={isRepresentative ? "currentColor" : "none"} />
            {isRepresentative ? "대표 리포트" : "대표로 설정"}
          </button>
          
          <button
            onClick={handleToggleShare}
            disabled={isUpdating}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium ${
              isShared 
                ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm" 
                : "bg-white hover:bg-gray-50 text-gray-700 hover:border-gray-300"
            }`}
          >
            <Share2 size={18} />
            {isShared ? "공유 중" : "공유하기"}
          </button>
        </div>
      </header>

      {isShared && user && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 text-sm text-blue-700 overflow-hidden">
            <ExternalLink size={16} className="shrink-0" />
            <span className="font-semibold whitespace-nowrap">공개 공유 링크:</span>
            <code className="bg-white/50 px-2 py-0.5 rounded border border-blue-200 truncate">{shareUrl}</code>
          </div>
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors shrink-0"
          >
            <Copy size={16} /> 복사
          </button>
        </div>
      )}

      <ReportView report={report} showStatus={false} />
    </div>
  );
}
