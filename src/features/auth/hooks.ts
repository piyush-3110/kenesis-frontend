"use client";

import { useMutation } from "@tanstack/react-query";
import { AuthAPI } from "./api";
import { useAuth } from "./AuthProvider";
import type { LoginInput, RegisterInput } from "./schemas";
import type { ApiEnvelope, Tokens, User } from "./types";
import { useUIStore } from "@/store/useUIStore";
import { useRouter } from "next/navigation";

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
  const { addToast } = useUIStore();
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (payload: LoginInput) => {
      // Show login loading toast
      addToast({
        type: "info",
        message: "Signing you in...",
        duration: 2000,
      });

      const res = await AuthAPI.login(payload);
      const data = res.data as ApiEnvelope<{ user: User; tokens: Tokens }>;
      if (!data.success) throw new Error(data.message);
      setTokens(data.data!.tokens);
      return data.data;
    },
    onSuccess: () => {
      // Show success toast
      addToast({
        type: "success",
        message: "Welcome back! Redirecting to dashboard...",
        duration: 2000,
      });

      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    },
    onError: (error: Error) => {
      addToast({
        type: "error",
        message: error.message || "Login failed. Please try again.",
        duration: 4000,
      });
    },
  });
}

export function useLogout() {
  const { clear } = useAuth();
  const { addToast } = useUIStore();
  const router = useRouter();
  
  return useMutation({
    mutationFn: async () => {
      // Show logout loading toast
      addToast({
        type: "info",
        message: "Signing you out...",
        duration: 1500,
      });

      try {
        const res = await AuthAPI.logout();
        const data = res.data as ApiEnvelope<null>;
        if (!data.success) throw new Error(data.message);
      } finally {
        clear();
      }
    },
    onSuccess: () => {
      // Show success toast and redirect
      addToast({
        type: "success",
        message: "Successfully signed out. Redirecting...",
        duration: 2000,
      });

      // Redirect to home page after a brief delay
      setTimeout(() => {
        router.push("/");
      }, 500);
    },
    onError: (error: Error) => {
      addToast({
        type: "error",
        message: error.message || "Logout failed",
        duration: 3000,
      });
      
      // Even on error, redirect to home as a fallback
      setTimeout(() => {
        router.push("/");
      }, 1000);
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
