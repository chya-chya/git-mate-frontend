"use client";

import { useParams } from "next/navigation";
import { useAnalysisStatus } from "@/hooks/useAnalysisStatus";
import { ReportView } from "@/components/analysis/ReportView";
import { analysisService } from "@/services/analysis";
import { useUserStore } from "@/store/useUserStore";
import { useState, useEffect, useRef } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Star, 
  Share2, 
  Copy,
  ExternalLink,
  X,
  Download,
  CreditCard,
  Twitter,
  Linkedin
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { toPng } from "html-to-image";
import { motion, AnimatePresence } from "framer-motion";

interface MetricInfo {
  score: number;
  reason?: string;
  improvement?: string;
  example?: string;
}

interface MetricsData {
  summary?: string;
  mutual_respect?: MetricInfo;
  conflict_management?: MetricInfo;
  logical_problem_definition?: MetricInfo;
  review_guiding?: MetricInfo;
  documentation?: MetricInfo;
  knowledge_sharing?: MetricInfo;
  technical_influence?: MetricInfo;
  code_stability?: MetricInfo;
}

export default function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useAnalysisStatus(id);
  const { user } = useUserStore();
  const { addToast } = useToast();
  const [isRepresentative, setIsRepresentative] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 최고 득점 지표 기반 맞춤형 칭호 생성 헬퍼
  const getBadgeTitle = (metrics: MetricsData | undefined | null) => {
    if (!metrics) return { title: "팀의 조력자", icon: "🤝", desc: "협업과 상호 존중이 뛰어난 개발자", score: 0 };
    const list = [
      { id: "mutual_respect", title: "팀의 조율자", icon: "🤝", score: metrics.mutual_respect?.score || 0, desc: "상호 존중과 신뢰를 중시하는 협업가" },
      { id: "conflict_management", title: "팀의 해결사", icon: "🛡️", score: metrics.conflict_management?.score || 0, desc: "갈등을 조화롭게 중재하는 해결사" },
      { id: "logical_problem_definition", title: "브레인 아키텍트", icon: "🧠", score: metrics.logical_problem_definition?.score || 0, desc: "복잡한 비즈니스 문제를 명료히 정의하는 지성" },
      { id: "review_guiding", title: "친절한 멘토", icon: "💡", score: metrics.review_guiding?.score || 0, desc: "코드 리뷰와 피드백에 탁월한 등대" },
      { id: "documentation", title: "기록의 명가", icon: "✍️", score: metrics.documentation?.score || 0, desc: "개발 문맥과 설정을 철저히 문서화하는 기록자" },
      { id: "knowledge_sharing", title: "지식의 등대", icon: "🌟", score: metrics.knowledge_sharing?.score || 0, desc: "지식 공유와 개발 문화 확산에 헌신적인 전파자" },
      { id: "technical_influence", title: "기술 선도자", icon: "🚀", score: metrics.technical_influence?.score || 0, desc: "팀의 아키텍처와 솔루션을 리드하는 촉진제" },
      { id: "code_stability", title: "견고한 수호자", icon: "🏰", score: metrics.code_stability?.score || 0, desc: "견고하고 안정적인 배포와 안정성을 다지는 수호자" },
    ];
    list.sort((a, b) => b.score - a.score);
    return list[0];
  };

  // 명함 고화질 PNG 다운로드
  const downloadCard = async () => {
    if (cardRef.current === null) return;
    addToast("명함 이미지를 생성하는 중입니다...", "success");
    try {
      // 폰트 및 스타일 렌더링 동기화를 위해 약간의 딜레이 보장
      await new Promise(resolve => setTimeout(resolve, 100));
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true, 
        pixelRatio: 3, // 고해상도 지원
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: cardRef.current.offsetWidth + 'px',
          height: cardRef.current.offsetHeight + 'px'
        }
      });
      const link = document.createElement("a");
      link.download = `git-mate-card-${user?.username || "developer"}.png`;
      link.href = dataUrl;
      link.click();
      addToast("명함 이미지가 성공적으로 저장되었습니다!", "success");
    } catch (err) {
      console.error("Oops, something went wrong!", err);
      addToast("이미지 저장 중 오류가 발생했습니다.", "error");
    }
  };

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
            onClick={() => setIsCardModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50/40 text-indigo-700 hover:bg-indigo-50 transition-all text-sm font-semibold shadow-sm cursor-pointer"
          >
            <CreditCard size={17} />
            소통 명함 만들기
          </button>

          <button
            onClick={handleSetRepresentative}
            disabled={isUpdating}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium cursor-pointer ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium cursor-pointer ${
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
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 text-sm text-blue-700 overflow-hidden flex-1">
            <ExternalLink size={16} className="shrink-0" />
            <span className="font-semibold whitespace-nowrap">공개 공유 링크:</span>
            <code className="bg-white/50 px-2 py-0.5 rounded border border-blue-200 truncate">{shareUrl}</code>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors px-3 py-1.5 bg-white border border-blue-200 rounded-lg shadow-sm cursor-pointer"
            >
              <Copy size={13} /> 복사
            </button>
            <a 
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `Git-Mate에서 나의 개발 협업 역량 리포트를 확인해보세요! 🚀 나의 대표 칭호: ${getBadgeTitle(report.metrics).icon} ${getBadgeTitle(report.metrics).title}`
              )}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-black transition-colors"
            >
              <Twitter size={13} fill="currentColor" /> X 공유
            </a>
            <a 
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-[#0077b5] text-white rounded-lg hover:bg-[#006297] transition-colors"
            >
              <Linkedin size={13} fill="currentColor" /> LinkedIn 공유
            </a>
          </div>
        </div>
      )}

      <ReportView report={report} showStatus={false} />

      {/* 개발자 소통 명함 생성 및 다운로드 모달 */}
      <AnimatePresence>
        {isCardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative flex flex-col items-center gap-6 max-w-sm w-full"
            >
              {/* 닫기 버튼 */}
              <button 
                onClick={() => setIsCardModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="text-center space-y-1">
                <h3 className="text-white font-bold text-lg">나만의 소통 명함</h3>
                <p className="text-xs text-slate-400">개발 성과와 협업 역량을 증명하는 오리지널 명함 카드</p>
              </div>

              {/* 캡처 대상 명함 바디 */}
              <div 
                ref={cardRef}
                className="w-[320px] h-[450px] rounded-2xl bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-950 border border-indigo-500/30 p-6 flex flex-col justify-between relative shadow-inner overflow-hidden select-none"
              >
                {/* 배경 글래스 효과 장식 */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* 카드 탑 라인 */}
                <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3.5 z-10">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-indigo-400 tracking-wider">GIT-MATE CARD</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">ID: #{id}</span>
                </div>

                {/* 프로필 및 칭호 */}
                <div className="flex flex-col items-center text-center space-y-3.5 my-auto z-10">
                  {user?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={user.avatarUrl} 
                      alt="Avatar" 
                      className="w-16 h-16 rounded-full border-2 border-indigo-500/40 object-cover shadow-lg"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-500/40 flex items-center justify-center text-indigo-400 text-xl font-bold shadow-lg">
                      {user?.username?.charAt(0).toUpperCase() || "G"}
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <h4 className="text-white font-extrabold text-lg tracking-tight">@{user?.username || "developer"}</h4>
                    <p className="text-[9px] text-slate-400 font-medium">GitHub Active Contributor</p>
                  </div>

                  {/* 칭호 배지 */}
                  <div className="px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-1.5 shadow-sm">
                    <span className="text-xs">{getBadgeTitle(report.metrics).icon}</span>
                    <span className="text-[11px] font-bold text-indigo-200">{getBadgeTitle(report.metrics).title}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 max-w-[220px] italic">
                    &ldquo;{getBadgeTitle(report.metrics).desc}&rdquo;
                  </p>
                </div>

                {/* 하단 세부 점수 리스트 */}
                <div className="space-y-2 border-t border-indigo-500/10 pt-3.5 z-10">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] font-medium text-slate-300">
                    <div className="flex justify-between items-center bg-white/5 px-2 py-0.5 rounded">
                      <span className="text-slate-400">상호 존중</span>
                      <span className="font-bold text-indigo-300">{(report.metrics.mutual_respect?.score || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 px-2 py-0.5 rounded">
                      <span className="text-slate-400">갈등 관리</span>
                      <span className="font-bold text-indigo-300">{(report.metrics.conflict_management?.score || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 px-2 py-0.5 rounded">
                      <span className="text-slate-400">문제 정의</span>
                      <span className="font-bold text-indigo-300">{(report.metrics.logical_problem_definition?.score || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 px-2 py-0.5 rounded">
                      <span className="text-slate-400">맥락 공유</span>
                      <span className="font-bold text-indigo-300">{(report.metrics.review_guiding?.score || 0).toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono mt-1">
                    <span>Generated by Git-Mate</span>
                    <span>{new Date(report.syncTime).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* 하단 제어 버튼 */}
              <div className="flex items-center gap-2 w-full mt-1">
                <button
                  onClick={() => setIsCardModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-transparent text-slate-300 hover:text-white hover:bg-slate-800 font-semibold text-xs transition-all cursor-pointer animate-none"
                >
                  취소
                </button>
                <button
                  onClick={downloadCard}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer animate-none"
                >
                  <Download size={13} /> 명함 저장 (PNG)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
