"use client";

import { useUserStore } from "@/store/useUserStore";
import { ArrowRight, GitBranch, Sparkles, BarChart3, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { isAuthenticated } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-accent/20 px-4 text-center">
      <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-background/50 backdrop-blur">
          <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
          <span>AI-Powered GitHub Analysis is here</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Understand Your Code <br />
          <span className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Like Never Before
          </span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Git-Mate는 LLM을 기반으로 당신의 PR 코멘트, 커뮤니케이션 스타일 및 개발 성과를 정밀하게 분석하여 
          더 나은 개발자로 성장할 수 있는 인사이트를 제공합니다.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/github`}
            className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-semibold text-lg shadow-lg shadow-primary/20"
          >
            <GitBranch size={20} />
            <span>GitHub으로 시작하기</span>
            <ArrowRight size={18} className="ml-1" />
          </Link>
          <Link
            href="#features"
            className="px-8 py-4 bg-transparent border border-muted hover:bg-accent/50 transition-all rounded-xl font-semibold text-lg"
          >
            기능 살펴보기
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          {[
            {
              title: "LLM Context Analysis",
              desc: "PR 본문과 코멘트의 문맥을 깊이 있게 이해합니다.",
              icon: Sparkles,
              color: "text-blue-500",
            },
            {
              title: "Weighted Stats",
              desc: "시간에 따른 역량 변화를 가중 평균 지표로 산출합니다.",
              icon: BarChart3,
              color: "text-purple-500",
            },
            {
              title: "Delta Sync",
              desc: "변경된 데이터만 증분 동기화하여 속도를 높입니다.",
              icon: Clock,
              color: "text-indigo-500",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border bg-background/50 backdrop-blur hover:border-primary/50 transition-colors text-left space-y-4"
            >
              <feature.icon className={`w-8 h-8 ${feature.color}`} />
              <h3 className="text-lg font-bold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
