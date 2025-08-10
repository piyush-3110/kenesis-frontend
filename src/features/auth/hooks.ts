"use client";

import { useMutation } from "@tanstack/react-query";
import { AuthAPI } from "./api";
import { useAuth } from "./AuthProvider";
import type { LoginInput, RegisterInput } from "./schemas";
import type { ApiEnvelope, Tokens, User } from "./types";

export function useRegister() {
  const { setTokens } = useAuth();
  return useMutation({
    mutationFn: async (payload: RegisterInput) => {
      const res = await AuthAPI.register(payload);
      const data = res.data as ApiEnvelope<{ user: User; tokens: Tokens }>;
      if (!data.success) throw new Error(data.message);
      setTokens(data.data!.tokens);
      return data.data;
    },
  });
}

export function useLogin() {
  const { setTokens } = useAuth();
  return useMutation({
    mutationFn: async (payload: LoginInput) => {
      const res = await AuthAPI.login(payload);
      const data = res.data as ApiEnvelope<{ user: User; tokens: Tokens }>;
      if (!data.success) throw new Error(data.message);
      setTokens(data.data!.tokens);
      return data.data;
    },
  });
}

export function useLogout() {
  const { clear } = useAuth();
  return useMutation({
    mutationFn: async () => {
      try {
        const res = await AuthAPI.logout();
        const data = res.data as ApiEnvelope<null>;
        if (!data.success) throw new Error(data.message);
      } finally {
        clear();
      }
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await AuthAPI.forgotPassword(email);
      const data = res.data as ApiEnvelope<null>;
      if (!data.success) throw new Error(data.message);
      return data.message;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (payload: { token: string; newPassword: string }) => {
      const res = await AuthAPI.resetPassword(
        payload.token,
        payload.newPassword
      );
      const data = res.data as ApiEnvelope<null>;
      if (!data.success) throw new Error(data.message);
      return data.message;
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (token: string) => {
      const res = await AuthAPI.verifyEmail(token);
      const data = res.data as ApiEnvelope<null>;
      if (!data.success) throw new Error(data.message);
      return data.message;
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await AuthAPI.resendVerification(email);
      const data = res.data as ApiEnvelope<null>;
      if (!data.success) throw new Error(data.message);
      return data.message;
    },
  });
}

export function useRevokeSession() {
  return useMutation({
    mutationFn: async (token: string) => {
      const res = await AuthAPI.revokeSession(token);
      const data = res.data as ApiEnvelope<null>;
      if (!data.success) throw new Error(data.message);
      return data.message;
    },
  });
}

export function useRevokeAllSessions() {
  const { clear } = useAuth();
  return useMutation({
    mutationFn: async () => {
      const res = await AuthAPI.revokeAllSessions();
      const data = res.data as ApiEnvelope<null>;
      if (!data.success) throw new Error(data.message);
      // Optional: clearing tokens after revoking all sessions
      clear();
      return data.message;
    },
  });
}
