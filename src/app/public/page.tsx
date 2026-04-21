"use client";

import { useQuery } from "@tanstack/react-query";
import { analysisService } from "@/services/analysis";
import { Loader2, Users, GitBranch } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function PublicReportsList() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["public-reports"],
    queryFn: () => analysisService.getAllPublicReports(),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">공유된 분석 리포트를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !users) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
        <Users className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">데이터를 불러오는데 실패했습니다</h1>
        <p className="text-muted-foreground max-w-md">
          잠시 후 다시 시도해주세요.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-xl animate-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-2xl font-bold mb-2">개발자 역량 탐색</h2>
          <p className="text-primary-foreground/90 opacity-90">
            다른 개발자들의 분석 결과를 살펴보고 인사이트를 얻어보세요.
          </p>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-center mb-4 text-gray-300">
               <Users size={48} />
             </div>
             <p className="text-gray-500 font-medium">아직 공개된 분석 리포트가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user: { id: number; username: string; avatarUrl: string | null; representativeReport?: { repository?: { fullName: string } } }) => (
              <Link 
                key={user.id} 
                href={`/public/${user.username}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
              >
                <div className="p-6 flex items-start gap-4">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.username}
                      width={56}
                      height={56}
                      className="rounded-full bg-gray-100 ring-2 ring-transparent group-hover:ring-primary/20 transition-all"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 truncate">
                      {user.username}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                      <GitBranch size={14} />
                      <span className="truncate">{user.representativeReport?.repository?.fullName || 'Repository'}</span>
                 </div>
                  </div>
                </div>

                <div className="px-6 pb-6 mt-auto">
                  <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-xl">
                    <span className="font-medium">리포트 보기</span>
                    <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
