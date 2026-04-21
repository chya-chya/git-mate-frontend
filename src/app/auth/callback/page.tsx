"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAccessToken, setRefreshToken, setUser } = useUserStore();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const username = searchParams.get("username");
    
    if (accessToken) {
      // 1. 토큰 및 사용자 정보 저장
      localStorage.setItem("access_token", accessToken);
      setAccessToken(accessToken);
      
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
        setRefreshToken(refreshToken);
      }

      if (username) {
        setUser({ id: "0", githubId: "0", username });
      }
      
      // 2. 대시보드로 이동
      router.replace("/dashboard");
    } else {
      // 에러 발생 시 홈으로 리다이렉트
      console.error("Authentication failed: No access token found");
      router.replace("/?error=auth_failed");
    }
  }, [searchParams, router, setAccessToken, setRefreshToken, setUser]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">인증 완료 중...</h2>
        <p className="text-muted-foreground">잠시만 기다려 주세요. 대시보드로 이동합니다.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">인증 정보를 확인하고 있습니다...</p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

