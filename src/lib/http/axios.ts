"use client";

import axios, { AxiosRequestConfig } from "axios";
import { TokenManager } from "../../features/auth/tokenManager";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://kenesis-backend.onrender.com";

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;
let requestQueue: Array<() => void> = [];

function onRefreshed() {
  requestQueue.forEach((cb) => cb());
  requestQueue = [];
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

http.interceptors.request.use((config) => {
  const token = TokenManager.getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };
    const originalRequest = error.config as RetryableConfig;
    const status = error?.response?.status;
    const shouldTryRefresh =
      status === 401 ||
      status === 403 ||
      typeof error?.response?.data?.message === "string";

    if (!shouldTryRefresh) return Promise.reject(error);

    if (originalRequest._retry) return Promise.reject(error);
    originalRequest._retry = true;

    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      TokenManager.clearTokens();
      return Promise.reject(error);
    }

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          const res = await axios.post(
            `${API_BASE_URL}/api/auth/refresh-token`,
            { refreshToken }
          );
          const { accessToken, refreshToken: newRt } =
            res.data?.data || res.data || {};
          if (!accessToken || !newRt)
            throw new Error("Invalid refresh payload");
          TokenManager.setTokens({ accessToken, refreshToken: newRt });
        } catch (e) {
          TokenManager.clearTokens();
          throw e;
        } finally {
          isRefreshing = false;
        }
      })();
    }

    return new Promise((resolve, reject) => {
      requestQueue.push(() => {
        const token = TokenManager.getAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
        http.request(originalRequest).then(resolve).catch(reject);
      });

      refreshPromise
        ?.then(() => onRefreshed())
        .catch((e) => {
          requestQueue = [];
          reject(e);
        });
    });
  }
);

export type Http = typeof http;
