"use client";

type Tokens = { accessToken: string; refreshToken: string };

const ACCESS_KEY = "kenesis:accessToken";
const REFRESH_KEY = "kenesis:refreshToken";

let memoryTokens: Tokens | null = null;

const isBrowser = () => typeof window !== "undefined";

export const TokenManager = {
  getAccessToken(): string | null {
    if (memoryTokens?.accessToken) return memoryTokens.accessToken;
    if (!isBrowser()) return null;
    return window.localStorage.getItem(ACCESS_KEY);
  },
  getRefreshToken(): string | null {
    if (memoryTokens?.refreshToken) return memoryTokens.refreshToken;
    if (!isBrowser()) return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  setTokens(tokens: Tokens) {
    memoryTokens = tokens;
    if (isBrowser()) {
      window.localStorage.setItem(ACCESS_KEY, tokens.accessToken);
      window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    }
  },
  clearTokens() {
    memoryTokens = null;
    if (isBrowser()) {
      window.localStorage.removeItem(ACCESS_KEY);
      window.localStorage.removeItem(REFRESH_KEY);
    }
  },
};
