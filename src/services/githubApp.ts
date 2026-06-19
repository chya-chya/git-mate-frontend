import { api } from "./api";

export interface GithubInstallation {
  installationId: string;
  accountLogin: string;
  accountType: "USER" | "ORGANIZATION";
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  repositorySelection: string;
  settingsUrl: string;
  membershipVerifiedAt: string;
}

export const githubAppService = {
  getInstallations: async () => {
    const { data } = await api.get<GithubInstallation[]>("/github-app/installations");
    return data;
  },

  getInstallUrl: async () => {
    const { data } = await api.get<{ url: string }>("/github-app/installations/install-url");
    return data;
  },
};
