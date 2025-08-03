import { useState, useCallback } from 'react';
import { AuthAPI, formatApiError, formatRetryAfter, type RegisterRequest, type LoginRequest, type LoginResponse, type RefreshTokenResponse } from '@/lib/api';

/**
 * Custom hook for user registration
 * Handles all registration logic including validation and API calls
 */
export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (data: RegisterRequest) => {
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

      const response = await AuthAPI.register(data);

      if (!response.success) {
        // Handle specific error cases
        if (response.retryAfter) {
          throw new Error(`Too many requests. Please try again in ${formatRetryAfter(response.retryAfter)}.`);
        }
        throw new Error(formatApiError(response));
      }

      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      console.error('Registration error:', errorMessage);
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
 * Handles login logic and API calls according to task specifications
 */
export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await AuthAPI.login(data);

      if (!response.success) {
        // Handle specific error cases according to task requirements
        if (response.retryAfter) {
          throw new Error(`Too many requests. Please try again in ${formatRetryAfter(response.retryAfter)}.`);
        }
        throw new Error(formatApiError(response));
      }

      console.log('Login successful:', response.data);
      return response.data!;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      console.error('Login error:', errorMessage);
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
 * Custom hook for logout
 * Handles logout API call with proper error handling and toast notifications
 */
export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await AuthAPI.logout();
      
      if (!response.success) {
        // Handle specific error scenarios according to task requirements
        if (response.retryAfter) {
          throw new Error(`Too many requests. Please try again in ${formatRetryAfter(response.retryAfter)}.`);
        } else if (response.message?.includes('Invalid or expired token')) {
          // 401 Unauthorized - treat as already logged out but show warning
          throw new Error('Session expired. Please log in again.');
        } else {
          throw new Error(formatApiError(response));
        }
      }

      // Success case - API logout successful
      console.log('Logout API completed successfully');
      return { success: true, message: 'You have been logged out.' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong while logging out. Please try again.';
      setError(errorMessage);
      console.error('Logout error:', errorMessage);
      
      // Return error info for the auth store to handle
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
 * Custom hook for email verification
 * Handles email verification and resend functionality
 */
export const useEmailVerification = () => {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const verifyEmail = useCallback(async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await AuthAPI.verifyEmail(token);

      if (!response.success) {
        throw new Error(formatApiError(response));
      }

      console.log('Email verification successful');
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
      setError(errorMessage);
      console.error('Email verification error:', errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    try {
      setResendLoading(true);
      setError(null);

      console.log('🔍 Starting resend verification for email:', email);
      const response = await AuthAPI.resendVerification(email);
      console.log('📤 Resend verification API response:', response);

      if (!response.success) {
        // Handle specific error scenarios according to task requirements
        if (response.retryAfter) {
          const message = `Too many requests. Please try again in ${formatRetryAfter(response.retryAfter)}.`;
          setError(message);
          console.error('Resend verification rate limited:', message);
          return { success: false, message, isRateLimit: true };
        }
        
        // Handle validation errors (400)
        if (response.errors && response.errors.length > 0) {
          const message = 'Invalid email format.';
          setError(message);
          console.error('Resend verification validation error:', response.errors);
          return { success: false, message, isValidationError: true };
        }
        
        // Other API errors
        const message = formatApiError(response);
        setError(message);
        console.error('Resend verification failed:', message);
        return { success: false, message };
      }

      // Success - start countdown
      setCanResend(false);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      console.log('Verification email sent successfully');
      return { success: true, message: 'Verification email sent successfully.' };
    } catch (error) {
      const message = 'Something went wrong. Please try again later.';
      setError(message);
      console.error('Resend verification error:', error);
      return { success: false, message };
    } finally {
      setResendLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    verifyEmail,
    resendVerification,
    loading,
    resendLoading,
    error,
    canResend,
    countdown,
    clearError,
  };
};

/**
 * Custom hook for forgot password
 * Handles forgot password API call with proper error handling according to task requirements
 */
export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await AuthAPI.forgotPassword(email);

      if (!response.success) {
        // Handle specific error scenarios according to task requirements
        if (response.retryAfter) {
          const message = `Too many requests. Please try again in ${formatRetryAfter(response.retryAfter)}.`;
          setError(message);
          console.error('Forgot password rate limited:', message);
          return { success: false, message, isRateLimit: true };
        }
        
        // Handle validation errors (400)
        if (response.errors && response.errors.length > 0) {
          const message = 'Invalid email format.';
          setError(message);
          console.error('Forgot password validation error:', response.errors);
          return { success: false, message, isValidationError: true };
        }
        
        // Other API errors
        const message = formatApiError(response);
        setError(message);
        console.error('Forgot password failed:', message);
        return { success: false, message };
      }

      console.log('Password reset link sent successfully');
      return { success: true, message: 'Password reset link sent to your email.' };
    } catch (error) {
      const message = 'Something went wrong. Please try again later.';
      setError(message);
      console.error('Forgot password error:', error);
      return { success: false, message };
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
 * Handles password reset API call with proper error handling according to task requirements
 */
export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);

      // Frontend validation
      if (!newPassword.trim()) {
        const message = 'Password is required.';
        setError(message);
        return { success: false, message, isValidationError: true };
      }

      if (newPassword.length < 6) {
        const message = 'Password must be at least 6 characters.';
        setError(message);
        return { success: false, message, isValidationError: true };
      }

      const response = await AuthAPI.resetPassword(token, newPassword);

      if (!response.success) {
        // Handle specific error scenarios according to task requirements
        if (response.retryAfter) {
          const message = `Too many requests. Please try again in ${formatRetryAfter(response.retryAfter)}.`;
          setError(message);
          console.error('Reset password rate limited:', message);
          return { success: false, message, isRateLimit: true };
        }
        
        // Handle validation errors (400)
        if (response.errors && response.errors.length > 0) {
          const message = 'Invalid input. Please check your password.';
          setError(message);
          console.error('Reset password validation error:', response.errors);
          return { success: false, message, isValidationError: true };
        }
        
        // Handle invalid/expired token (401)
        if (response.message?.includes('Invalid or expired token')) {
          const message = 'This link is invalid or has expired.';
          setError(message);
          console.error('Reset password token invalid:', response.message);
          return { success: false, message, isTokenInvalid: true };
        }
        
        // Other API errors
        const message = formatApiError(response);
        setError(message);
        console.error('Reset password failed:', message);
        return { success: false, message };
      }

      console.log('Password reset successful');
      return { success: true, message: 'Your password has been reset successfully.' };
    } catch (error) {
      const message = 'Something went wrong. Please try again later.';
      setError(message);
      console.error('Reset password error:', error);
      return { success: false, message };
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

/**
 * Custom hook for token refresh
 * Handles silent token refresh in background according to task specifications
 */
export const useRefreshToken = () => {
  const refreshToken = useCallback(async (refreshTokenValue: string): Promise<RefreshTokenResponse | null> => {
    try {
      const response = await AuthAPI.refreshToken({ refreshToken: refreshTokenValue });

      if (!response.success) {
        // Handle specific error cases according to task requirements
        if (response.retryAfter) {
          console.error(`Token refresh rate limited. Retry after ${formatRetryAfter(response.retryAfter)}.`);
        } else {
          console.error('Token refresh failed:', formatApiError(response));
        }
        return null;
      }

      console.log('Token refresh successful');
      return response.data!;
    } catch (error) {
      console.error('Token refresh error:', error instanceof Error ? error.message : 'Failed to refresh token');
      return null;
    }
  }, []);

  return {
    refreshToken,
  };
};
