import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  githubId: string;
  username: string;
  avatarUrl?: string;
  email?: string;
}

interface UserState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAccessToken: (accessToken) => {
        set({ accessToken });
        if (typeof window !== "undefined" && accessToken) {
          localStorage.setItem("access_token", accessToken);
        }
      },
      setRefreshToken: (refreshToken) => {
        set({ refreshToken });
        if (typeof window !== "undefined" && refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }
      },
      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      },
    }),
    {
      name: "user-storage",
    }
  )
);
