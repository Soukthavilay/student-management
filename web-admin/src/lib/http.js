import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

let authFailureHandler = null;

export function setAuthFailureHandler(handler) {
  authFailureHandler = handler;
}

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("sm_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error?.response?.status === 401 &&
      !originalRequest?._retry &&
      !String(originalRequest?.url || "").includes("/auth/refresh")
    ) {
      const refreshToken = localStorage.getItem("sm_refresh_token");
      if (!refreshToken) {
        if (authFailureHandler) {
          authFailureHandler();
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        }

        const refreshResponse = await refreshPromise;
        refreshPromise = null;

        const nextAccessToken = refreshResponse.data.accessToken;
        const nextRefreshToken = refreshResponse.data.refreshToken;
        const nextUser = refreshResponse.data.user;

        localStorage.setItem("sm_access_token", nextAccessToken);
        localStorage.setItem("sm_refresh_token", nextRefreshToken);
        if (nextUser) {
          localStorage.setItem("sm_user", JSON.stringify(nextUser));
        }

        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
        return http.request(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        if (authFailureHandler) {
          authFailureHandler();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
