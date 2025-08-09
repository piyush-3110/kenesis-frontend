/**
 * Email verification hooks
 * Handles email verification and resend verification
 */

import { useState, useCallback } from 'react';
import { emailAuthAPI } from '@/lib/api/emailAuth';
import type { AuthActionResult } from '@/types/auth';

/**
 * Custom hook for email verification
 */
export const useEmailVerification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const verifyEmail = useCallback(async (token: string): Promise<AuthActionResult> => {
    try {
      setLoading(true);
      setError(null);

      const response = await emailAuthAPI.verifyEmail(token);

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
            message: 'Verification link has expired. Please request a new one.',
            isTokenInvalid: true,
          };
        } else {
          return {
            success: false,
            message: response.message || 'Email verification failed',
          };
        }
      }

      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const resendVerification = useCallback(async (email: string): Promise<AuthActionResult> => {
    try {
      setResendLoading(true);
      setError(null);

      const response = await emailAuthAPI.resendVerification(email);

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
            message: response.message || 'Failed to resend verification email',
          };
        }
      }

      // Start countdown for resend button
      setCanResend(false);
      setCountdown(60);
      
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return {
        success: true,
        message: 'Verification email sent successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification email';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
      };
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
