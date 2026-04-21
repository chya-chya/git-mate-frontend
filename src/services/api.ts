import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useUserStore } from "@/store/useUserStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키 기반 인증 지원
});

interface FailedQueueItem {
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}

// 요청 인터셉터: 헤더에 토큰 주입 (필요 시)
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    let token = localStorage.getItem("access_token");

    // 만약 access_token 키가 없으면 Zustand의 user-storage에서 찾아봄
    if (!token) {
      const persistedUser = localStorage.getItem("user-storage");
      if (persistedUser) {
        try {
          const parsed = JSON.parse(persistedUser);
          token = parsed?.state?.accessToken;
        } catch (e) {
          console.error("Failed to parse user-storage", e);
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 응답 인터셉터: 에러 핸들링
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;

      if (refreshToken) {
        try {
          // 리프레시 토큰으로 새 액세스 토큰 요청
          // 백엔드 구현상 Authorization 헤더에 리프레시 토큰을 담아야 함
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });

          const { access_token, refresh_token } = data;

          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", access_token);
            if (refresh_token) {
              localStorage.setItem("refresh_token", refresh_token);
            }
          }

          processQueue(null, access_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          if (typeof window !== "undefined") {
            useUserStore.getState().logout();
            window.location.href = "/"; // 메인으로 리다이렉트 (로그아웃)
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // 리프레시 토큰이 없으면 로그아웃 처리
        if (typeof window !== "undefined") {
          useUserStore.getState().logout();
          window.location.href = "/";
        }
      }
    }
    return Promise.reject(error);
  }
);
