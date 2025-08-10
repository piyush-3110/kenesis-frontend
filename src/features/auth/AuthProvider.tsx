"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { TokenManager } from "./tokenManager";

interface AuthContextValue {
  isAuthenticated: boolean;
  accessToken: string | null;
  setTokens: (t: { accessToken: string; refreshToken: string }) => void;
  clear: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    TokenManager.getAccessToken()
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(accessToken),
      accessToken,
      setTokens: (t) => {
        TokenManager.setTokens(t);
        setAccessToken(t.accessToken);
      },
      clear: () => {
        TokenManager.clearTokens();
        setAccessToken(null);
      },
    }),
    [accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
