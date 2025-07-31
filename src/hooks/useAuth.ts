import { useState, useCallback } from 'react';
import { AuthAPI, handleApiError, TokenManager, type RegisterRequest, type LoginRequest } from '@/lib/api';

/**
 * Custom hook for user registration
 * Handles registration logic, loading states, and error handling
 */
export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      setLoading(true);
      setError(null);

      // Validate input
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const response = await AuthAPI.register(userData);

      if (response.success && response.data) {
        // Store tokens securely
        TokenManager.setTokens(response.data.tokens);
        return response.data;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
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
 * Handles login logic, loading states, and error handling
 */
export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);

      // Validate input
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      const response = await AuthAPI.login(credentials);

      if (response.success && response.data) {
        // Store tokens securely
        TokenManager.setTokens(response.data.tokens);
        return response.data;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
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
 * Custom hook for email verification
 * Handles verification and resend logic with timer
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
        throw new Error(response.message || 'Email verification failed');
      }

      return response;
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    try {
      setResendLoading(true);
      setError(null);

      const response = await AuthAPI.resendVerification(email);

      if (response.success) {
        // Start 60-second countdown
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

        return response;
      } else {
        throw new Error(response.message || 'Failed to resend verification email');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
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
 * Custom hook for session management
 * Handles logout and session revocation
 */
export const useSession = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revokeSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await AuthAPI.revokeSession();
      TokenManager.clearTokens();
      
      return true;
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeAllSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await AuthAPI.revokeAllSessions();
      TokenManager.clearTokens();
      
      return true;
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (revokeAll: boolean = false) => {
    try {
      if (revokeAll) {
        await revokeAllSessions();
      } else {
        await revokeSession();
      }
    } catch (error) {
      // Even if API call fails, clear local tokens
      TokenManager.clearTokens();
      throw error;
    }
  }, [revokeSession, revokeAllSessions]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    logout,
    revokeSession,
    revokeAllSessions,
    loading,
    error,
    clearError,
  };
};
