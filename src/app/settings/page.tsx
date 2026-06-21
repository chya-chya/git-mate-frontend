"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  ExternalLink,
  GitBranch,
  Loader2,
} from "lucide-react";

import { useToast } from "@/components/ui/Toast";
import { githubAppService, type GithubInstallation } from "@/services/githubApp";
import { userService } from "@/services/user";
import { useUserStore } from "@/store/useUserStore";

const CONFIRM_WORD = "계정 삭제";

const dangerCopy = {
  title: "계정 삭제",
  button: "계정 삭제",
  description: "Git-Mate 계정 삭제를 진행합니다.",
};

export default function SettingsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user, isAuthenticated, logout } = useUserStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isOpeningAppSettings, setIsOpeningAppSettings] = useState(false);
  const [installationOptions, setInstallationOptions] = useState<GithubInstallation[]>([]);

  const isConfirmValid = confirmText.trim() === CONFIRM_WORD || confirmText.trim() === user?.username;

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

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
    setConfirmText("");
  };

  const closeDeleteModal = () => {
    if (deactivateMutation.isPending) return;
    setIsDeleteModalOpen(false);
    setConfirmText("");
  };

  const handleConfirmDangerAction = () => {
    if (!isConfirmValid || deactivateMutation.isPending) return;
    deactivateMutation.mutate();
  };

  const handleGitHubAppSettings = async () => {
    if (isOpeningAppSettings) return;

    setIsOpeningAppSettings(true);
    setInstallationOptions([]);

    try {
      const installations = await githubAppService.getInstallations();
      const activeInstallations = installations.filter(
        (installation) => installation.status === "ACTIVE" && installation.settingsUrl
      );

      if (activeInstallations.length === 0) {
        addToast("GitHub App 설치가 필요합니다.", "info");
        const { url } = await githubAppService.getInstallUrl();
        window.location.href = url;
        return;
      }

      if (activeInstallations.length === 1) {
        window.location.href = activeInstallations[0].settingsUrl;
        return;
      }

      setInstallationOptions(activeInstallations);
    } catch (error: unknown) {
      const status = typeof error === "object" && error !== null && "response" in error
        ? (error as { response?: { status?: number; data?: { code?: string } } }).response?.status
        : undefined;
      const code = typeof error === "object" && error !== null && "response" in error
        ? (error as { response?: { data?: { code?: string } } }).response?.data?.code
        : undefined;

      if (status === 401) {
        logout();
        addToast("로그인이 만료되었습니다. 다시 로그인해 주세요.", "error");
        router.push("/");
        return;
      }

      if (status === 403) {
        addToast(
          code === "ACCOUNT_DEACTIVATED"
            ? "비활성화된 계정입니다. 계정 상태를 확인해 주세요."
            : "GitHub App 접근 권한이 없습니다.",
          "error"
        );
        return;
      }

      addToast("GitHub App 설정 화면을 열 수 없습니다.", "error");
    } finally {
      setIsOpeningAppSettings(false);
    }
  };

  const handleSelectInstallation = (installation: GithubInstallation) => {
    window.location.href = installation.settingsUrl;
  };

  if (!isAuthenticated) return null;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">설정</h1>
        <p className="text-muted-foreground">GitHub App 저장소 선택을 관리합니다.</p>
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
                GitHub App에서 Git-Mate가 읽을 저장소를 선택합니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGitHubAppSettings}
            disabled={isOpeningAppSettings}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isOpeningAppSettings ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
            분석할 저장소 변경
          </button>
        </div>
      </section>

      {false && (
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
            onClick={openDeleteModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            <AlertTriangle size={16} />
            계정 삭제
          </button>
        </div>
      </section>
      )}

      {isDeleteModalOpen && (
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
                  {dangerCopy.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{dangerCopy.description}</p>
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
                onClick={closeDeleteModal}
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
                {dangerCopy.button}
              </button>
            </div>
          </div>
        </div>
      )}

      {installationOptions.length > 0 && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="installation-select-title"
            className="w-full max-w-2xl rounded-xl border bg-background p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="installation-select-title" className="text-xl font-bold">
                  GitHub 계정 선택
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  저장소 선택을 변경할 GitHub App 설치 계정을 선택하세요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInstallationOptions([])}
                className="rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-accent"
              >
                닫기
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {installationOptions.map((installation) => (
                <button
                  key={installation.installationId}
                  type="button"
                  onClick={() => handleSelectInstallation(installation)}
                  className="flex w-full flex-col gap-3 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-accent/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold">{installation.accountLogin}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {installation.accountType === "ORGANIZATION" ? "조직" : "개인"} 계정
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border px-2 py-1 font-semibold">
                      {installation.repositorySelection}
                    </span>
                    <span className="rounded-full border px-2 py-1 font-semibold text-green-600 dark:text-green-400">
                      {installation.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
