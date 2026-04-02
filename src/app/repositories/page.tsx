"use client";

import { useUserStore } from "@/store/useUserStore";
import { GitBranch, Star, Search, Filter, Play, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useToast } from "@/components/ui/Toast";
import { useState } from "react";

interface Repository {
  id: number;
  githubRepoId: string;
  fullName: string;
  isOptedIn: boolean;
  lastSyncTime: string | null;
}

export default function RepositoriesPage() {
  const { isAuthenticated } = useUserStore();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // 저장소 목록 조회
  const { data: repos, isLoading, error } = useQuery<Repository[]>({
    queryKey: ["repositories"],
    queryFn: async () => {
      const { data } = await api.get("/collection/repos");
      return data;
    },
    enabled: isAuthenticated,
  });

  // 분석 트리거 (Sync)
  const syncMutation = useMutation({
    mutationFn: async (githubRepoId: string) => {
      const { data } = await api.post(`/collection/sync/${githubRepoId}`);
      return data;
    },
    onSuccess: () => {
      addToast("분석이 시작되었습니다. 잠시 후 대시보드에서 확인해 주세요.", "success");
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
    },
    onError: () => {
      addToast("분석 요청 중 오류가 발생했습니다.", "error");
    }
  });

  if (!isAuthenticated) return null;

  const filteredRepos = repos?.filter(repo => 
    repo.fullName.toLowerCase().includes(search.toLowerCase())
  );

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
          {filteredRepos?.map((repo) => (
            <div key={repo.id} className="group p-6 rounded-2xl border bg-card hover:border-primary/50 hover:shadow-md transition-all space-y-4">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                  <GitBranch size={24} />
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span>0</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors cursor-pointer truncate">
                  {repo.fullName}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                  {repo.fullName.split('/')[1]} 저장소 분석 정보
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  Code
                </span>
                <span>마지막 분석: {repo.lastSyncTime ? new Date(repo.lastSyncTime).toLocaleDateString() : "없음"}</span>
              </div>

              <button 
                onClick={() => syncMutation.mutate(repo.githubRepoId)}
                disabled={syncMutation.isPending}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-secondary text-secondary-foreground rounded-xl hover:bg-primary hover:text-primary-foreground transition-all font-semibold text-sm disabled:opacity-50"
              >
                {syncMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Play size={14} fill="currentColor" />
                )}
                {repo.lastSyncTime ? "다시 분석하기" : "분석 시작"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
