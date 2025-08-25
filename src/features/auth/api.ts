import { http } from "@/lib/http/axios";
import type { ApiEnvelope, Tokens, User } from "./types";
import type { LoginInput, RegisterInput } from "./schemas";

export const AuthAPI = {
  register: (payload: RegisterInput) =>
    http.post<ApiEnvelope<{ user: User; tokens: Tokens }>>(
      "/api/auth/register",
      payload
    ),
  login: (payload: LoginInput) =>
    http.post<ApiEnvelope<{ user: User; tokens: Tokens }>>(
      "/api/auth/login",
      payload
    ),
  refresh: (refreshToken: string) =>
    http.post<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(
      "/api/auth/refresh-token",
      { refreshToken }
    ),
  logout: () => http.post<ApiEnvelope>("/api/auth/logout"),
  forgotPassword: (email: string) =>
    http.post<ApiEnvelope>("/api/auth/forgot-password", { email }),
  resetPassword: (token: string, newPassword: string) =>
    http.post<ApiEnvelope>("/api/auth/reset-password", { token, newPassword }),
  verifyEmail: (token: string) =>
    http.post<ApiEnvelope>("/api/auth/verify-email", { token }),
  resendVerification: (email: string) =>
    http.post<ApiEnvelope>("/api/auth/resend-verification", { email }),
  revokeSession: (token: string) =>
    http.post<ApiEnvelope>("/api/auth/revoke-session", { token }),
  revokeAllSessions: () =>
    http.post<ApiEnvelope>("/api/auth/revoke-all-sessions"),
  // Wallet
  walletPrepare: (walletAddress?: string) =>
    http.post<
      ApiEnvelope<{ challengeId: string; message: string; expiresAt: string }>
    >(
      "/api/auth/wallet/prepare",
      walletAddress ? { walletAddress } : undefined
    ),
  walletVerify: (payload: {
    challengeId: string;
    signature: string;
    message: string;
  }) =>
    http.post<ApiEnvelope<{ user: User; tokens: Tokens }>>(
      "/api/auth/wallet/verify",
      payload
    ),
};
