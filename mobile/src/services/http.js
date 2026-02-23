import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl || 'http://192.168.100.9:4000/api';

let authFailureHandler = null;

export function setAuthFailureHandler(handler) {
  authFailureHandler = handler;
}

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

http.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('sm_access_token');
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
      !String(originalRequest?.url || '').includes('/auth/refresh')
    ) {
      const refreshToken = await SecureStore.getItemAsync('sm_refresh_token');
      if (!refreshToken) {
        if (authFailureHandler) authFailureHandler();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
          });
        }

        const refreshResponse = await refreshPromise;
        refreshPromise = null;

        const nextAccessToken = refreshResponse.data.accessToken;
        const nextRefreshToken = refreshResponse.data.refreshToken;

        await SecureStore.setItemAsync('sm_access_token', nextAccessToken);
        await SecureStore.setItemAsync('sm_refresh_token', nextRefreshToken);

        if (refreshResponse.data.user) {
          await SecureStore.setItemAsync(
            'sm_user',
            JSON.stringify(refreshResponse.data.user),
          );
        }

        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
        return http.request(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        if (authFailureHandler) authFailureHandler();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
