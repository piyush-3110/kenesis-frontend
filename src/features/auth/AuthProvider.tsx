"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { TokenManager } from "./tokenManager";

interface AuthContextValue {
  isAuthenticated: boolean;
  accessToken: string | null;
  isLoading: boolean;
  setTokens: (t: { accessToken: string; refreshToken: string }) => void;
  clear: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate auth state on client side
  useEffect(() => {
    const token = TokenManager.getAccessToken();
    setAccessToken(token);
    setIsLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(accessToken),
      accessToken,
      isLoading,
      setTokens: (t) => {
        TokenManager.setTokens(t);
        setAccessToken(t.accessToken);
      },
      clear: () => {
        TokenManager.clearTokens();
        setAccessToken(null);
      },
    }),
    [accessToken, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
