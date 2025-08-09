/**
 * Email Authentication Actions
 * Handles email-based auth operations with the store
 */

import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from './authState';
import { useRegister, useLogin, useLogout, useForgotPassword, useResetPassword } from '@/hooks/auth/useEmailAuth';
import { useEmailVerification } from '@/hooks/auth/useEmailVerification';
import { useTokenRefresh } from '@/hooks/auth/useTokenRefresh';
import { tokenRefreshManager } from '@/lib/tokenRefresh';
import type { SignupData, LoginData, User } from '@/types/auth';
import type { ApiUser, LoginResponse } from '@/lib/api/types';

/**
 * Convert API user to store user format (for register)
 */
const mapApiUserToUser = (apiUser: ApiUser): User => ({
  id: apiUser._id,
  email: apiUser.email,
  username: apiUser.username,
  bio: apiUser.bio,
  emailVerified: apiUser.emailVerified,
  createdAt: apiUser.createdAt,
});

/**
 * Convert login response user to store user format
 */
const mapLoginUserToUser = (loginUser: LoginResponse["user"]): User => ({
  id: loginUser.id,
  email: loginUser.email,
  username: loginUser.username,
  bio: loginUser.bio,
  emailVerified: loginUser.emailVerified,
  createdAt: loginUser.createdAt,
  authMethod: "email",
});

/**
 * Email authentication actions hook
 */
export const useEmailAuthActions = () => {
  const { setUser, setTokens, clearAuth, updateUserVerification } = useAuthStore();
  const { addToast } = useUIStore();
  
  const registerHook = useRegister();
  const loginHook = useLogin();
  const logoutHook = useLogout();
  const verificationHook = useEmailVerification();
  const refreshTokenHook = useTokenRefresh();
  const forgotPasswordHook = useForgotPassword();
  const resetPasswordHook = useResetPassword();

  const register = async (userData: SignupData) => {
    try {
      const response = await registerHook.register(userData);

      if (!response) {
        throw new Error("Registration failed - no response received");
      }

      const user = mapApiUserToUser(response.user);
      const tokens = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };

      // Only store tokens if email is verified (per task requirements)
      if (response.user.emailVerified) {
        setUser(user);
        setTokens(tokens);
        return { user, needsVerification: false, canAccessDashboard: true };
      } else {
        // Set user but don't store tokens
        setUser(user);
        // Don't store tokens for unverified users
        return { user, needsVerification: true, canAccessDashboard: false };
      }
    } catch (error) {
      throw error;
    }
  };

  const login = async (data: LoginData) => {
    try {
      const response = await loginHook.login(data);

      if (!response) {
        throw new Error("Login failed - no response received");
      }

      const user = mapLoginUserToUser(response.user);
      const tokens = {
        accessToken: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
      };

      // Only store tokens if email is verified (per task requirements)
      if (response.user.emailVerified) {
        setUser(user);
        setTokens(tokens);

        // Start automatic token refresh for verified users
        tokenRefreshManager.startAutoRefresh(async () => {
          const currentRefreshToken = useAuthStore.getState().tokens?.refreshToken;
          if (!currentRefreshToken) return false;

          const refreshResult = await refreshTokenHook.refreshToken(currentRefreshToken);
          if (refreshResult) {
            setTokens({
              accessToken: refreshResult.accessToken,
              refreshToken: refreshResult.refreshToken,
            });
            return true;
          }
          return false;
        });

        return { user, needsVerification: false, canAccessDashboard: true };
      } else {
        setUser(user);
        // Don't store tokens for unverified users
        return { user, needsVerification: true, canAccessDashboard: false };
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const result = await logoutHook.logout();

      // Stop automatic token refresh
      tokenRefreshManager.stopAutoRefresh();

      // Always clear auth state regardless of API result
      clearAuth();

      // Handle different logout scenarios with appropriate toasts
      if (result.success) {
        // Success case (200) - show success toast
        if (typeof window !== "undefined") {
          addToast({
            type: "success",
            message: result.message,
          });

          // Redirect to home page
          window.location.href = "/";
        }
      } else if (result.isSessionExpired) {
        // 401 Unauthorized - session expired
        if (typeof window !== "undefined") {
          addToast({
            type: "warning",
            message: result.message,
          });

          // Redirect to login/auth page
          window.location.href = "/auth";
        }
      } else {
        // Other errors (429, network failures, etc.)
        if (typeof window !== "undefined") {
          addToast({
            type: "error",
            message: result.message,
          });

          // Still redirect to home page
          window.location.href = "/";
        }
      }
    } catch (error) {
      // Fallback error handling
      console.error("Logout action error:", error);

      // Always clear auth even if everything fails
      tokenRefreshManager.stopAutoRefresh();
      clearAuth();

      if (typeof window !== "undefined") {
        addToast({
          type: "error",
          message: "Something went wrong while logging out. Please try again.",
        });

        // Redirect to home page
        window.location.href = "/";
      }
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      await verificationHook.verifyEmail(token);
      updateUserVerification(true);

      // Now that email is verified, we can store tokens if user exists
      const { user } = useAuthStore.getState();
      if (user && !useAuthStore.getState().tokens) {
        // User was logged in but tokens weren't stored due to unverified email
        // We should prompt them to log in again or handle this case
        console.log(
          "Email verified - user may need to log in again to get tokens"
        );
      }
    } catch (error) {
      throw error;
    }
  };

  const resendVerification = async (email: string) => {
    try {
      const result = await verificationHook.resendVerification(email);

      if (result.success) {
        addToast({
          type: "success",
          message: result.message,
        });
      } else {
        if (result.isRateLimit) {
          addToast({
            type: "error",
            message: result.message,
          });
        } else if (result.isValidationError) {
          addToast({
            type: "error",
            message: "Invalid email format.",
          });
        } else {
          addToast({
            type: "error",
            message: "Something went wrong. Please try again later.",
          });
        }
      }

      return result;
    } catch (error) {
      console.error("Resend verification error:", error);
      addToast({
        type: "error",
        message: "Something went wrong. Please try again later.",
      });
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
      };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const result = await forgotPasswordHook.forgotPassword(email);

      if (result.success) {
        addToast({
          type: "success",
          message: result.message,
        });
      } else {
        if (result.isRateLimit) {
          addToast({
            type: "error",
            message: result.message,
          });
        } else if (result.isValidationError) {
          addToast({
            type: "error",
            message: "Invalid email format.",
          });
        } else {
          addToast({
            type: "error",
            message: result.message,
          });
        }
      }

      return result;
    } catch (error) {
      console.error("Forgot password error:", error);
      addToast({
        type: "error",
        message: "Something went wrong. Please try again later.",
      });
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
      };
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const result = await resetPasswordHook.resetPassword(token, newPassword);

      if (result.success) {
        addToast({
          type: "success",
          message: result.message,
        });

        // Redirect to login after success
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.href = "/auth";
          }
        }, 2000);
      } else {
        if (result.isRateLimit) {
          addToast({
            type: "error",
            message: result.message,
          });
        } else if (result.isValidationError) {
          addToast({
            type: "error",
            message: result.message,
          });
        } else if (result.isTokenInvalid) {
          addToast({
            type: "error",
            message: result.message,
          });

          // Redirect to forgot password after token invalid
          setTimeout(() => {
            if (typeof window !== "undefined") {
              window.location.href = "/auth";
            }
          }, 3000);
        } else {
          addToast({
            type: "error",
            message: result.message,
          });
        }
      }

      return result;
    } catch (error) {
      console.error("Reset password error:", error);
      addToast({
        type: "error",
        message: "Something went wrong. Please try again later.",
      });
      return {
        success: false,
        message: "Something went wrong. Please try again later.",
      };
    }
  };

  const refreshTokens = async () => {
    try {
      const currentRefreshToken = useAuthStore.getState().tokens?.refreshToken;
      if (!currentRefreshToken) {
        console.error("No refresh token available for refresh");
        clearAuth();
        return false;
      }

      const result = await refreshTokenHook.refreshToken(currentRefreshToken);

      if (result) {
        // Update stored tokens with new ones
        const newTokens = {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        };
        setTokens(newTokens);
        console.log("Tokens refreshed successfully");
        return true;
      } else {
        // Refresh failed - clear auth per task requirements
        console.error("Token refresh failed - session expired");
        tokenRefreshManager.stopAutoRefresh();
        clearAuth();

        // Handle redirect if we're in a browser environment
        if (typeof window !== "undefined") {
          window.location.href = "/auth";
        }

        return false;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      tokenRefreshManager.stopAutoRefresh();
      clearAuth();

      // Handle redirect if we're in a browser environment
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }

      return false;
    }
  };

  return {
    // Actions
    register,
    login,
    logout,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    refreshTokens,

    // Hook states
    registerLoading: registerHook.loading,
    registerError: registerHook.error,
    loginLoading: loginHook.loading,
    loginError: loginHook.error,
    logoutLoading: logoutHook.loading,
    logoutError: logoutHook.error,
    verificationLoading: verificationHook.loading,
    verificationError: verificationHook.error,
    resendLoading: verificationHook.resendLoading,
    canResend: verificationHook.canResend,
    countdown: verificationHook.countdown,
    forgotPasswordLoading: forgotPasswordHook.loading,
    forgotPasswordError: forgotPasswordHook.error,
    resetPasswordLoading: resetPasswordHook.loading,
    resetPasswordError: resetPasswordHook.error,

    // Clear errors
    clearRegisterError: registerHook.clearError,
    clearLoginError: loginHook.clearError,
    clearLogoutError: logoutHook.clearError,
    clearVerificationError: verificationHook.clearError,
    clearForgotPasswordError: forgotPasswordHook.clearError,
    clearResetPasswordError: resetPasswordHook.clearError,
  };
};
