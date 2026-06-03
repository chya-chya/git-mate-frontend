"use client";

import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { GitBranch, Star, Search, Filter, Play, Loader2, Pin, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Repository {
  id: number;
  githubRepoId: string;
  fullName: string;
  isOptedIn: boolean;
  lastSyncTime: string | null;
}

export default function RepositoriesPage() {
  const { isAuthenticated } = useUserStore();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [pinnedRepoIds, setPinnedRepoIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pinned_repos");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse pinned repos", e);
        }
      }
    }
    return [];
  });

  // 즐겨찾기 토글 핸들러
  const togglePin = (repoId: string) => {
    setPinnedRepoIds((prev) => {
      const next = prev.includes(repoId)
        ? prev.filter((id) => id !== repoId)
        : [...prev, repoId];
      localStorage.setItem("pinned_repos", JSON.stringify(next));
      return next;
    });
  };

  // 저장소 목록 조회
  const { data: repos, isLoading, error } = useQuery<Repository[]>({
    queryKey: ["repositories"],
    queryFn: async () => {
      const { data } = await api.get("/collection/repos");
      return data;
    },
    enabled: isAuthenticated,
  });


  if (!isAuthenticated) return null;

  // 이름 분석 기반 가상 언어 스펙 반환 헬퍼
  const getRepoLanguage = (fullName: string) => {
    const name = fullName.toLowerCase();
    if (name.includes("frontend") || name.includes("react") || name.includes("next") || name.includes("ui")) {
      return { name: "TypeScript", color: "#3178c6" };
    }
    if (name.includes("backend") || name.includes("api") || name.includes("server") || name.includes("lambda")) {
      return { name: "Python", color: "#3572A5" };
    }
    if (name.includes("go-") || name.includes("golang")) {
      return { name: "Go", color: "#00ADD8" };
    }
    if (name.includes("rust") || name.includes("rs-")) {
      return { name: "Rust", color: "#dea584" };
    }
    return { name: "JavaScript", color: "#f1e05a" };
  };

  const filteredRepos = repos?.filter(repo => 
    repo.fullName.toLowerCase().includes(search.toLowerCase())
  );

  // 즐겨찾기(Pin) 기준 정렬 로직
  const sortedRepos = filteredRepos ? [...filteredRepos].sort((a, b) => {
    const aPinned = pinnedRepoIds.includes(a.githubRepoId);
    const bPinned = pinnedRepoIds.includes(b.githubRepoId);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  }) : [];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">내 저장소</h1>
          <p className="text-muted-foreground">분석할 GitHub 저장소를 선택하세요.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="저장소 검색..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg bg-background w-full md:w-64 focus:ring-2 focus:ring-primary outline-none text-sm"
            />
          </div>
          <button className="p-2 border rounded-lg hover:bg-accent">
            <Filter size={18} />
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">GitHub 저장소를 불러오고 있습니다...</p>
        </div>
      ) : error ? (
        <div className="p-12 text-center border rounded-2xl bg-destructive/5 text-destructive">
          저장소를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {sortedRepos.map((repo) => {
              const isPinned = pinnedRepoIds.includes(repo.githubRepoId);
              const lang = getRepoLanguage(repo.fullName);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  key={repo.id} 
                  className={`group p-6 rounded-2xl border bg-card transition-all space-y-4 relative flex flex-col justify-between h-[255px] ${
                    isPinned 
                      ? "border-indigo-400 bg-indigo-50/10 shadow-md shadow-indigo-50/30" 
                      : "hover:border-slate-300 hover:shadow-md border-slate-200"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg transition-colors ${
                        isPinned ? "bg-indigo-600 text-white" : "bg-indigo-500/10 text-indigo-500"
                      }`}>
                        <GitBranch size={22} />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => togglePin(repo.githubRepoId)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isPinned 
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20" 
                              : "text-muted-foreground hover:bg-accent border-transparent cursor-pointer"
                          }`}
                          title={isPinned ? "즐겨찾기 해제" : "즐겨찾기 등록"}
                        >
                          <Pin size={15} className={isPinned ? "fill-amber-500 text-amber-500" : ""} />
                        </button>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-slate-50 border rounded-full px-2 py-1">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">0</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {isPinned && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-600 text-white rounded">
                            고정됨
                          </span>
                        )}
                        <h3 className="font-bold text-base group-hover:text-primary transition-colors cursor-pointer truncate max-w-[200px]" title={repo.fullName}>
                          {repo.fullName.split('/')[1] || repo.fullName}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {repo.fullName} 저장소 분석 정보 및 성과 리포트
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1.5 border-t border-slate-100">
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-semibold text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lang.color }} />
                        {lang.name}
                      </span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock size={11} />
                        {repo.lastSyncTime ? new Date(repo.lastSyncTime).toLocaleDateString() : "분석 이력 없음"}
                      </span>
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push(`/repositories/${repo.githubRepoId}/analyze?fullName=${encodeURIComponent(repo.fullName)}`)}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-secondary text-secondary-foreground rounded-xl hover:bg-indigo-600 hover:text-white transition-all font-semibold text-xs shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <Play size={12} fill="currentColor" />
                      {repo.lastSyncTime ? "다시 분석하기" : "분석 시작"}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
