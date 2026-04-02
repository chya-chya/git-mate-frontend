import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키 기반 인증 지원
});

// 요청 인터셉터: 헤더에 토큰 주입 (필요 시)
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 에러 핸들링
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 만료 시 처리 (예: 로그아웃 또는 토큰 갱신)
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        // window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
