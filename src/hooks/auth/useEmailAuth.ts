/**
 * Email Authentication Hooks
 * Handles registration, login, logout, and password reset
 */

import { useState, useCallback } from 'react';
import { emailAuthAPI } from '@/lib/api/emailAuth';
import type { 
  SignupData, 
  LoginData, 
  AuthActionResult 
} from '@/types/auth';
import type { 
  RegisterRequest, 
  LoginRequest, 
  LoginResponse 
} from '@/lib/api/types';

/**
 * Custom hook for user registration
 */
export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (data: SignupData) => {
    try {
      setLoading(true);
      setError(null);

      // Frontend validation
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (data.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const registerData: RegisterRequest = {
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        bio: data.bio,
      };

      const response = await emailAuthAPI.register(registerData);

      if (!response.success) {
        if (response.retryAfter) {
          throw new Error(`Too many requests. Please try again in ${Math.ceil(response.retryAfter / 60)} minutes.`);
        }
        throw new Error(response.message || 'Registration failed');
      }

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    register,
    loading,
    error,
    clearError,
  };
};

/**
 * Custom hook for user login
 */
export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (data: LoginData): Promise<LoginResponse> => {
    try {
      setLoading(true);
      setError(null);

      const loginData: LoginRequest = {
        email: data.email,
        password: data.password,
      };

      const response = await emailAuthAPI.login(loginData);

      if (!response.success) {
        if (response.retryAfter) {
          throw new Error(`Too many requests. Please try again in ${Math.ceil(response.retryAfter / 60)} minutes.`);
        }
        throw new Error(response.message || 'Login failed');
      }

      return response.data as LoginResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    login,
    loading,
    error,
    clearError,
  };
};

/**
 * Custom hook for user logout
 */
export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(async (): Promise<AuthActionResult> => {
    try {
      setLoading(true);
      setError(null);

      const response = await emailAuthAPI.logout();

      if (!response.success) {
        if (response.retryAfter) {
          return {
            success: false,
            message: `Too many requests. Please try again in ${Math.ceil(response.retryAfter / 60)} minutes.`,
            isRateLimit: true,
          };
        } else if (response.message?.includes('Invalid or expired token')) {
          return {
            success: false,
            message: 'Session expired. Please log in again.',
            isSessionExpired: true,
          };
        } else {
          return {
            success: false,
            message: response.message || 'Logout failed',
          };
        }
      }

      return { 
        success: true, 
        message: 'You have been logged out.' 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong while logging out. Please try again.';
      setError(errorMessage);
      
      return { 
        success: false, 
        message: errorMessage,
        isSessionExpired: errorMessage.includes('Session expired')
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    logout,
    loading,
    error,
    clearError,
  };
};

/**
 * Custom hook for forgot password
 */
export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forgotPassword = useCallback(async (email: string): Promise<AuthActionResult> => {
    try {
      setLoading(true);
      setError(null);

      const response = await emailAuthAPI.forgotPassword(email);

      if (!response.success) {
        if (response.retryAfter) {
          return {
            success: false,
            message: `Too many requests. Please try again in ${Math.ceil(response.retryAfter / 60)} minutes.`,
            isRateLimit: true,
          };
        } else if (response.message?.includes('validation')) {
          return {
            success: false,
            message: 'Invalid email format.',
            isValidationError: true,
          };
        } else {
          return {
            success: false,
            message: response.message || 'Failed to send reset email',
          };
        }
      }

      return {
        success: true,
        message: 'Password reset email sent successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again later.';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    forgotPassword,
    loading,
    error,
    clearError,
  };
};

/**
 * Custom hook for reset password
 */
export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<AuthActionResult> => {
    try {
      setLoading(true);
      setError(null);

      const response = await emailAuthAPI.resetPassword(token, newPassword);

      if (!response.success) {
        if (response.retryAfter) {
          return {
            success: false,
            message: `Too many requests. Please try again in ${Math.ceil(response.retryAfter / 60)} minutes.`,
            isRateLimit: true,
          };
        } else if (response.message?.includes('validation')) {
          return {
            success: false,
            message: response.message,
            isValidationError: true,
          };
        } else if (response.message?.includes('Invalid or expired token')) {
          return {
            success: false,
            message: 'Reset link has expired. Please request a new one.',
            isTokenInvalid: true,
          };
        } else {
          return {
            success: false,
            message: response.message || 'Failed to reset password',
          };
        }
      }

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again later.';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    resetPassword,
    loading,
    error,
    clearError,
  };
};
