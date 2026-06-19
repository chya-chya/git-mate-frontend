"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  ExternalLink,
  GitBranch,
  Loader2,
  LockKeyhole,
} from "lucide-react";

import { useToast } from "@/components/ui/Toast";
import { API_BASE_URL } from "@/utils/config";
import { userService } from "@/services/user";
import { useUserStore } from "@/store/useUserStore";

type DangerAction = "deactivate" | "unlink";

const CONFIRM_WORD = "계정 삭제";

const dangerCopy: Record<DangerAction, { title: string; button: string; description: string }> = {
  deactivate: {
    title: "계정 삭제",
    button: "계정 삭제",
    description: "Git-Mate 계정 삭제를 진행합니다.",
  },
  unlink: {
    title: "GitHub 연동 해제",
    button: "GitHub 연동 해제",
    description: "GitHub 연동을 해제하면 계정 삭제와 동일하게 처리됩니다.",
  },
};

export default function SettingsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user, accessToken, isAuthenticated, logout } = useUserStore();
  const [dangerAction, setDangerAction] = useState<DangerAction | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [isReauthorizing, setIsReauthorizing] = useState(false);

  const isConfirmValid = confirmText.trim() === CONFIRM_WORD || confirmText.trim() === user?.username;
  const activeDangerCopy = dangerAction ? dangerCopy[dangerAction] : null;

  const deactivateMutation = useMutation({
    mutationFn: userService.deactivateAccount,
    onSuccess: () => {
      logout();
      addToast("계정 삭제가 완료되었습니다.", "success");
      router.push("/");
    },
    onError: () => {
      addToast("계정 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.", "error");
    },
  });

  const openDangerModal = (action: DangerAction) => {
    setDangerAction(action);
    setConfirmText("");
  };

  const closeDangerModal = () => {
    if (deactivateMutation.isPending) return;
    setDangerAction(null);
    setConfirmText("");
  };

  const handleConfirmDangerAction = () => {
    if (!isConfirmValid || deactivateMutation.isPending) return;
    deactivateMutation.mutate();
  };

  const handleGitHubReauthorize = async () => {
    if (isReauthorizing) return;

    const token =
      accessToken ||
      (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);

    if (!token) {
      logout();
      addToast("로그인이 만료되었습니다. 다시 로그인해 주세요.", "error");
      router.push("/");
      return;
    }

    setIsReauthorizing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/github/reauthorize-url`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        logout();
        addToast("로그인이 만료되었습니다. 다시 로그인해 주세요.", "error");
        router.push("/");
        return;
      }

      if (response.status === 403 && data?.code === "ACCOUNT_DEACTIVATED") {
        addToast("비활성화된 계정입니다. 계정 상태를 확인해 주세요.", "error");
        return;
      }

      if (!response.ok || !data?.url) {
        addToast("GitHub 권한 재승인 URL을 가져오지 못했습니다.", "error");
        return;
      }

      window.location.href = data.url;
    } catch {
      addToast("GitHub 권한 재승인 URL을 가져오지 못했습니다.", "error");
    } finally {
      setIsReauthorizing(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">설정</h1>
        <p className="text-muted-foreground">GitHub 연동과 계정 삭제를 관리합니다.</p>
      </header>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950">
              <GitBranch size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold">GitHub 연동</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                저장소와 리뷰 데이터를 다시 가져와야 할 때 GitHub 권한을 재승인할 수 있습니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGitHubReauthorize}
            disabled={isReauthorizing}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isReauthorizing ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
            GitHub 권한 재승인
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-red-500/20 bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
              <AlertTriangle size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-red-700 dark:text-red-300">계정 삭제</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Git-Mate 로그인을 사용할 수 없고 저장소 분석을 새로 실행할 수 없습니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openDangerModal("deactivate")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            <AlertTriangle size={16} />
            계정 삭제
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
              <LockKeyhole size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-red-700 dark:text-red-300">위험 작업</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                GitHub 연동 해제는 Git-Mate 계정 삭제와 동일하게 처리됩니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openDangerModal("unlink")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            <AlertTriangle size={16} />
            GitHub 연동 해제
          </button>
        </div>
      </section>

      {activeDangerCopy && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="danger-action-title"
            className="w-full max-w-lg rounded-xl border bg-background p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                <AlertTriangle size={20} />
              </span>
              <div>
                <h2 id="danger-action-title" className="text-xl font-bold">
                  {activeDangerCopy.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{activeDangerCopy.description}</p>
              </div>
            </div>

            <ul className="mt-5 space-y-2 rounded-lg border border-red-500/20 bg-red-500/[0.04] p-4 text-sm text-muted-foreground">
              <li>Git-Mate 로그인을 사용할 수 없음</li>
              <li>저장소 분석을 새로 실행할 수 없음</li>
              <li>공개 프로필 접근이 제한될 수 있음</li>
            </ul>

            <label className="mt-5 block text-sm font-semibold" htmlFor="confirm-danger-action">
              계속하려면 <span className="text-red-600 dark:text-red-400">{CONFIRM_WORD}</span>
              {user?.username ? ` 또는 ${user.username}` : ""}을 입력하세요.
            </label>
            <input
              id="confirm-danger-action"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              autoComplete="off"
              disabled={deactivateMutation.isPending}
            />

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDangerModal}
                disabled={deactivateMutation.isPending}
                className="rounded-lg border px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDangerAction}
                disabled={!isConfirmValid || deactivateMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deactivateMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                {activeDangerCopy.button}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
