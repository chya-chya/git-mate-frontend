"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  ExternalLink,
  GitBranch,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useToast } from "@/components/ui/Toast";
import { GITHUB_AUTH_URL } from "@/utils/config";
import { userService } from "@/services/user";
import { useUserStore } from "@/store/useUserStore";

type DangerAction = "deactivate" | "unlink";

const CONFIRM_WORD = "비활성화";

const dangerCopy: Record<DangerAction, { title: string; button: string; description: string }> = {
  deactivate: {
    title: "계정 비활성화",
    button: "계정 비활성화",
    description: "Git-Mate 계정을 비활성화합니다.",
  },
  unlink: {
    title: "GitHub 연동 해제",
    button: "GitHub 연동 해제",
    description: "GitHub 연동을 해제하면 계정 비활성화와 동일하게 처리됩니다.",
  },
};

export default function SettingsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user, isAuthenticated, logout } = useUserStore();
  const [dangerAction, setDangerAction] = useState<DangerAction | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const reauthorizeUrl = useMemo(() => `${GITHUB_AUTH_URL}?mode=reauthorize`, []);
  const isConfirmValid = confirmText.trim() === CONFIRM_WORD || confirmText.trim() === user?.username;
  const activeDangerCopy = dangerAction ? dangerCopy[dangerAction] : null;

  const deactivateMutation = useMutation({
    mutationFn: userService.deactivateAccount,
    onSuccess: () => {
      logout();
      addToast("계정이 비활성화되었습니다.", "success");
      router.push("/");
    },
    onError: () => {
      addToast("계정 비활성화에 실패했습니다. 잠시 후 다시 시도해 주세요.", "error");
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

  if (!isAuthenticated) return null;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">설정</h1>
        <p className="text-muted-foreground">계정 상태와 GitHub 연동을 관리합니다.</p>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b pb-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UserRound size={20} />
              </span>
              <div>
                <h2 className="text-lg font-bold">계정 상태</h2>
                <p className="text-sm text-muted-foreground">현재 로그인된 GitHub 계정입니다.</p>
              </div>
            </div>
            <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
              활성
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border bg-muted">
                {user?.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={user.username} fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-bold text-muted-foreground">
                    {user?.username?.charAt(0).toUpperCase() || "G"}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xl font-bold">@{user?.username || "unknown"}</p>
                <p className="text-sm text-muted-foreground">GitHub OAuth로 인증된 계정</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openDangerModal("deactivate")}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
            >
              <AlertTriangle size={16} />
              계정 비활성화
            </button>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold">보안 상태</h2>
              <p className="text-sm text-muted-foreground">세션이 유지 중입니다.</p>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">로그인 방식</span>
              <span className="font-semibold">GitHub OAuth</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">계정 권한</span>
              <span className="font-semibold">사용자 본인</span>
            </div>
          </div>
        </div>
      </section>

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

          <a
            href={reauthorizeUrl}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ExternalLink size={16} />
            GitHub 권한 재승인
          </a>
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
                GitHub 연동 해제는 Git-Mate 계정 비활성화와 동일하게 처리됩니다.
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
