import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TokenManager, type ApiUser, type AuthTokens, type LoginResponse, type RefreshTokenResponse } from '@/lib/api';
import { useRegister, useLogin, useLogout, useEmailVerification, useRefreshToken, useForgotPassword, useResetPassword } from '@/hooks/useAuth';
import { tokenRefreshManager } from '@/lib/tokenRefresh';
import { useUIStore } from '@/store/useUIStore';

/**
 * User interface for authentication store
 * Maps to backend user model
 */
export interface User {
  id: string;
  email: string;
  username: string;
  bio?: string;
  emailVerified: boolean;
  createdAt: string;
}

/**
 * Signup data interface
 */
export interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  bio?: string;
}

/**
 * Login data interface
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Authentication state interface
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  tokens: AuthTokens | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  updateUserVerification: (verified: boolean) => void;
  clearAuth: () => void;
}

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
const mapLoginUserToUser = (loginUser: LoginResponse['user']): User => ({
  id: loginUser.id,
  email: loginUser.email,
  username: loginUser.username,
  bio: loginUser.bio,
  emailVerified: loginUser.emailVerified,
  createdAt: loginUser.createdAt,
});

/**
 * Auth Store Implementation using Zustand
 * Handles authentication state with proper token management
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      tokens: null,

      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user 
        });
      },

      setTokens: (tokens) => {
        set({ tokens });
        if (tokens) {
          TokenManager.setTokens(tokens);
        } else {
          TokenManager.clearTokens();
        }
      },

      updateUserVerification: (verified) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, emailVerified: verified }
          });
        }
      },

      clearAuth: () => {
        TokenManager.clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          tokens: null
        });
      },
    }),
    {
      name: 'kenesis-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Auth Actions Hook
 * Integrates authentication hooks with the store
 * Follows integration.md guidelines for clean separation
 */
export const useAuthActions = () => {
  const { setUser, setTokens, clearAuth, updateUserVerification } = useAuthStore();
  const { addToast } = useUIStore();
  const registerHook = useRegister();
  const loginHook = useLogin();
  const logoutHook = useLogout();
  const verificationHook = useEmailVerification();
  const refreshTokenHook = useRefreshToken();
  const forgotPasswordHook = useForgotPassword();
  const resetPasswordHook = useResetPassword();

  return {
    // Register action following the task requirements
    register: async (userData: SignupData) => {
      try {
        const response = await registerHook.register({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
          bio: userData.bio,
        });
        
        if (!response) {
          throw new Error('Registration failed - no response received');
        }
        
        const user = mapApiUserToUser(response.user);
        const tokens = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
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
    },

    // Login action
    login: async (data: LoginData) => {
      try {
        const response = await loginHook.login(data);
        
        if (!response) {
          throw new Error('Login failed - no response received');
        }
        
        const user = mapLoginUserToUser(response.user);
        const tokens = {
          accessToken: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken
        };
        
        // Only store tokens if email is verified (per task requirements)
        if (response.user.emailVerified) {
          setUser(user);
          setTokens(tokens);
          
          // Start automatic token refresh for verified users
          tokenRefreshManager.startAutoRefresh(async () => {
            const currentRefreshToken = TokenManager.getRefreshToken();
            if (!currentRefreshToken) return false;
            
            const refreshResult = await refreshTokenHook.refreshToken(currentRefreshToken);
            if (refreshResult) {
              setTokens({
                accessToken: refreshResult.accessToken,
                refreshToken: refreshResult.refreshToken
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
    },

    // Logout action
    logout: async () => {
      try {
        const result = await logoutHook.logout();
        
        // Stop automatic token refresh
        tokenRefreshManager.stopAutoRefresh();
        
        // Always clear auth state regardless of API result
        clearAuth();
        
        // Handle different logout scenarios with appropriate toasts
        if (result.success) {
          // Success case (200) - show success toast
          if (typeof window !== 'undefined') {
            // Import toast dynamically to avoid SSR issues
            const { useUIStore } = await import('@/store/useUIStore');
            useUIStore.getState().addToast({
              type: 'success',
              message: result.message
            });
            
            // Redirect to home page
            window.location.href = '/';
          }
        } else if (result.isSessionExpired) {
          // 401 Unauthorized - session expired
          if (typeof window !== 'undefined') {
            const { useUIStore } = await import('@/store/useUIStore');
            useUIStore.getState().addToast({
              type: 'warning',
              message: result.message
            });
            
            // Redirect to login/auth page
            window.location.href = '/auth';
          }
        } else {
          // Other errors (429, network failures, etc.)
          if (typeof window !== 'undefined') {
            const { useUIStore } = await import('@/store/useUIStore');
            useUIStore.getState().addToast({
              type: 'error',
              message: result.message
            });
            
            // Still redirect to home page
            window.location.href = '/';
          }
        }
      } catch (error) {
        // Fallback error handling
        console.error('Logout action error:', error);
        
        // Always clear auth even if everything fails
        tokenRefreshManager.stopAutoRefresh();
        clearAuth();
        
        if (typeof window !== 'undefined') {
          const { useUIStore } = await import('@/store/useUIStore');
          useUIStore.getState().addToast({
            type: 'error',
            message: 'Something went wrong while logging out. Please try again.'
          });
          
          // Redirect to home page
          window.location.href = '/';
        }
      }
    },

    // Email verification actions
    verifyEmail: async (token: string) => {
      try {
        await verificationHook.verifyEmail(token);
        updateUserVerification(true);
        
        // Now that email is verified, we can store tokens if user exists
        const { user } = useAuthStore.getState();
        if (user && !useAuthStore.getState().tokens) {
          // User was logged in but tokens weren't stored due to unverified email
          // We should prompt them to log in again or handle this case
          console.log('Email verified - user may need to log in again to get tokens');
        }
      } catch (error) {
        throw error;
      }
    },

    resendVerification: async (email: string) => {
      try {
        const result = await verificationHook.resendVerification(email);
        
        if (result.success) {
          addToast({
            type: 'success',
            message: result.message
          });
        } else {
          if (typeof window !== 'undefined') {
            const { addToast } = useUIStore.getState();
            
            if (result.isRateLimit) {
              addToast({
                type: 'error',
                message: result.message
              });
            } else if (result.isValidationError) {
              addToast({
                type: 'error',
                message: 'Invalid email format.'
              });
            } else {
              addToast({
                type: 'error',
                message: 'Something went wrong. Please try again later.'
              });
            }
          }
        }
        
        return result;
      } catch (error) {
        console.error('Resend verification error:', error);
        if (typeof window !== 'undefined') {
          const { useUIStore } = await import('@/store/useUIStore');
          useUIStore.getState().addToast({
            type: 'error',
            message: 'Something went wrong. Please try again later.'
          });
        }
        return { success: false, message: 'Something went wrong. Please try again later.' };
      }
    },

    // Forgot password action following task requirements
    forgotPassword: async (email: string) => {
      try {
        const result = await forgotPasswordHook.forgotPassword(email);
        
        if (result.success) {
          addToast({
            type: 'success',
            message: result.message
          });
        } else {
          if (result.isRateLimit) {
            addToast({
              type: 'error',
              message: result.message
            });
          } else if (result.isValidationError) {
            addToast({
              type: 'error',
              message: 'Invalid email format.'
            });
          } else {
            addToast({
              type: 'error',
              message: result.message
            });
          }
        }
        
        return result;
      } catch (error) {
        console.error('Forgot password error:', error);
        addToast({
          type: 'error',
          message: 'Something went wrong. Please try again later.'
        });
        return { success: false, message: 'Something went wrong. Please try again later.' };
      }
    },

    // Reset password action following task requirements
    resetPassword: async (token: string, newPassword: string) => {
      try {
        const result = await resetPasswordHook.resetPassword(token, newPassword);
        
        if (result.success) {
          addToast({
            type: 'success',
            message: result.message
          });
          
          // Redirect to login after success
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/auth';
            }
          }, 2000);
        } else {
          if (result.isRateLimit) {
            addToast({
              type: 'error',
              message: result.message
            });
          } else if (result.isValidationError) {
            addToast({
              type: 'error',
              message: result.message
            });
          } else if (result.isTokenInvalid) {
            addToast({
              type: 'error',
              message: result.message
            });
            
            // Redirect to forgot password after token invalid
            setTimeout(() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/auth';
              }
            }, 3000);
          } else {
            addToast({
              type: 'error',
              message: result.message
            });
          }
        }
        
        return result;
      } catch (error) {
        console.error('Reset password error:', error);
        addToast({
          type: 'error',
          message: 'Something went wrong. Please try again later.'
        });
        return { success: false, message: 'Something went wrong. Please try again later.' };
      }
    },

    // Refresh token action - silent background refresh
    refreshTokens: async () => {
      try {
        const currentRefreshToken = TokenManager.getRefreshToken();
        if (!currentRefreshToken) {
          console.error('No refresh token available for refresh');
          clearAuth();
          return false;
        }

        const result = await refreshTokenHook.refreshToken(currentRefreshToken);
        
        if (result) {
          // Update stored tokens with new ones
          const newTokens = {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
          };
          setTokens(newTokens);
          console.log('Tokens refreshed successfully');
          return true;
        } else {
          // Refresh failed - clear auth per task requirements
          console.error('Token refresh failed - session expired');
          tokenRefreshManager.stopAutoRefresh();
          clearAuth();
          
          // Handle redirect if we're in a browser environment
          if (typeof window !== 'undefined') {
            window.location.href = '/auth';
          }
          
          return false;
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        tokenRefreshManager.stopAutoRefresh();
        clearAuth();
        
        // Handle redirect if we're in a browser environment
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
        
        return false;
      }
    },

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

// Selectors for optimal performance
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthTokens = () => useAuthStore((state) => state.tokens);

/**
 * Fetch and update user profile from backend
 * Handles all error scenarios and updates global state
 */
export const useUserProfile = () => {
  const { setUser, clearAuth } = useAuthStore();
  const { addToast } = useUIStore();

  const fetchUserProfile = async () => {
    const result = await (await import('@/lib/api')).UserAPI.getProfile();
    if (result.success && result.data?.user) {
      setUser({
        id: result.data.user._id,
        email: result.data.user.email,
        username: result.data.user.username,
        bio: result.data.user.bio,
        emailVerified: result.data.user.emailVerified,
        createdAt: result.data.user.createdAt,
      });
      return result.data.user;
    } else {
      // Error handling per integration.md
      if (result.message?.includes('Access token required') || result.message?.includes('Invalid or expired token')) {
        clearAuth();
        addToast({ type: 'error', message: 'Session expired. Please log in again.' });
        if (typeof window !== 'undefined') window.location.href = '/login';
      } else if (result.message?.includes('deactivated')) {
        addToast({ type: 'error', message: 'Your account has been deactivated.' });
        // Optionally redirect to support/help page
      } else if (result.message?.includes('not found')) {
        addToast({ type: 'error', message: 'User not found. Please contact support.' });
        if (typeof window !== 'undefined') window.location.href = '/login';
      } else if (result.message?.includes('Too many requests')) {
        addToast({ type: 'error', message: `Too many requests. Try again in ${result.retryAfter || 60} seconds.` });
      } else {
        addToast({ type: 'error', message: 'Something went wrong while fetching your profile.' });
      }
      return null;
    }
  };

  return { fetchUserProfile };
};
