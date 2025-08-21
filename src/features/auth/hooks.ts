"use client";

import { useMutation } from "@tanstack/react-query";
import { AuthAPI } from "./api";
import { useAuth } from "./AuthProvider";
import type { LoginInput, RegisterInput } from "./schemas";
import type { ApiEnvelope, Tokens, User } from "./types";
import { useUIStore } from "@/store/useUIStore";
import { useRouter, usePathname } from "next/navigation";

export function useRegister() {
  const { setTokens } = useAuth();
  const { addToast } = useUIStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: RegisterInput) => {
      const res = await AuthAPI.register(payload);
      const data = res.data as ApiEnvelope<{ user: User; tokens: Tokens }>;
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    onSuccess: (data) => {
      if (data && data.user && data.tokens) {
        // Check if email is verified
        if (data.user.emailVerified) {
          // Email already verified (shouldn't happen in registration but handle it)
          setTokens(data.tokens);
          addToast({
            type: "success",
            message: "Account created! Redirecting to your dashboard...",
            duration: 3000,
          });
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        } else {
          // Email needs verification - don't store tokens yet
          addToast({
            type: "warning",
            message: "Please verify your email before accessing the dashboard.",
            duration: 4000,
          });
          setTimeout(() => {
            router.push("/auth/verify-email");
          }, 1000);
        }
      }
    },
    onError: (error: unknown) => {
      // Handle different error types according to backend API documentation
      let errorMessage = "Registration failed. Please try again.";

      const apiError = error as {
        response?: {
          status?: number;
          data?: {
            success?: boolean;
            message?: string;
            errors?: Array<{ field: string; message: string }>;
            data?: { retryAfter?: number } | null;
          };
          headers?: { "retry-after"?: string };
        };
        message?: string;
      };

      const responseData = apiError?.response?.data;
      const status = apiError?.response?.status;

      // Handle validation errors (400 Bad Request)
      if (
        status === 400 &&
        responseData?.errors &&
        Array.isArray(responseData.errors)
      ) {
        // Show each validation error as a separate toast for better UX
        responseData.errors.forEach(
          (err: { field: string; message: string }) => {
            const fieldName = err.field.replace("body.", ""); // Remove 'body.' prefix if present
            addToast({
              type: "error",
              message: `${fieldName}: ${err.message}`,
              duration: 5000,
            });
          }
        );
        return; // Exit early to avoid showing additional error toast
      }

      // Handle user already exists (409 Conflict)
      if (status === 409) {
        const message = responseData?.message;
        if (message?.includes("email already exists")) {
          errorMessage = "User with this email already exists";
        } else if (message?.includes("Username is already taken")) {
          errorMessage = "Username is already taken";
        } else {
          errorMessage = message || "User already exists";
        }
      }

      // Handle rate limit exceeded (429 Too Many Requests)
      else if (status === 429) {
        const retryAfter =
          responseData?.data?.retryAfter ||
          apiError?.response?.headers?.["retry-after"];
        if (retryAfter) {
          const minutes = Math.ceil(parseInt(retryAfter.toString()) / 60);
          errorMessage = `Too many registration attempts, please try again in ${minutes} minute${
            minutes > 1 ? "s" : ""
          }.`;
        } else {
          errorMessage =
            responseData?.message ||
            "Too many registration attempts, please try again later.";
        }
      }

      // Handle server error (500 Internal Server Error)
      else if (status === 500) {
        errorMessage =
          "Registration failed due to server error. Please try again later.";
      }

      // Handle other status codes or use the provided message
      else if (responseData?.message) {
        errorMessage = responseData.message;
      } else if (apiError?.message) {
        errorMessage = apiError.message;
      }

      addToast({
        type: "error",
        message: errorMessage,
        duration: 5000,
      });
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
    onError: (error: unknown) => {
      // Handle different error types according to backend API documentation
      let errorMessage = "Login failed. Please try again.";

      const apiError = error as {
        response?: {
          status?: number;
          data?: {
            success?: boolean;
            message?: string;
            errors?: Array<{ field: string; message: string }>;
            data?: { retryAfter?: number } | null;
          };
          headers?: { "retry-after"?: string };
        };
        message?: string;
      };

      const responseData = apiError?.response?.data;
      const status = apiError?.response?.status;

      // Handle validation errors (400 Bad Request)
      if (
        status === 400 &&
        responseData?.errors &&
        Array.isArray(responseData.errors)
      ) {
        // Show each validation error as a separate toast for better UX
        responseData.errors.forEach(
          (err: { field: string; message: string }) => {
            const fieldName = err.field.replace("body.", ""); // Remove 'body.' prefix if present
            addToast({
              type: "error",
              message: `${fieldName}: ${err.message}`,
              duration: 5000,
            });
          }
        );
        return; // Exit early to avoid showing additional error toast
      }

      // Handle invalid credentials (401 Unauthorized)
      if (status === 401) {
        errorMessage = responseData?.message || "Invalid email or password";
      }

      // Handle account deactivated (403 Forbidden)
      else if (status === 403) {
        errorMessage = responseData?.message || "Account is deactivated";
      }

      // Handle account locked (423 Locked)
      else if (status === 423) {
        errorMessage =
          responseData?.message ||
          "Account is temporarily locked due to multiple failed login attempts";
      }

      // Handle rate limit exceeded (429 Too Many Requests)
      else if (status === 429) {
        const retryAfter =
          responseData?.data?.retryAfter ||
          apiError?.response?.headers?.["retry-after"];
        if (retryAfter) {
          const minutes = Math.ceil(parseInt(retryAfter.toString()) / 60);
          errorMessage = `Too many login attempts, please try again in ${minutes} minute${
            minutes > 1 ? "s" : ""
          }.`;
        } else {
          errorMessage =
            responseData?.message ||
            "Too many login attempts, please try again later.";
        }
      }

      // Handle server error (500 Internal Server Error)
      else if (status === 500) {
        errorMessage =
          responseData?.message ||
          "Login failed due to server error. Please try again later.";
      }

      // Handle other status codes or use the provided message
      else if (responseData?.message) {
        errorMessage = responseData.message;
      } else if (apiError?.message) {
        errorMessage = apiError.message;
      }

      addToast({
        type: "error",
        message: errorMessage,
        duration: 4000,
      });
    },
  });
}

export function useLogout() {
  const { clear } = useAuth();
  const { addToast } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();

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
        // Clear the authenticated address from localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("lastAuthenticatedAddress");
        }
      }
    },
    onSuccess: () => {
      // Show success toast
      addToast({
        type: "success",
        message: "Successfully signed out.",
        duration: 2000,
      });

      // Only redirect to home from specific pages (not marketplace/product pages)
      if (
        pathname &&
        (pathname.startsWith("/dashboard") || pathname.startsWith("/auth"))
      ) {
        // Redirect to home page after a brief delay for dashboard/auth pages
        setTimeout(() => {
          router.push("/");
        }, 500);
      }
      // For marketplace/product pages, stay on the same page
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
