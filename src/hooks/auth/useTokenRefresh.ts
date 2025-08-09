/**
 * Token management hooks
 * Handles token refresh operations
 */

import { useState, useCallback } from 'react';
import { tokenAPI } from '@/lib/api/tokens';
import type { AuthTokens } from '@/types/auth';

/**
 * Custom hook for token refresh
 */
export const useTokenRefresh = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshToken = useCallback(async (refreshToken: string): Promise<AuthTokens | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await tokenAPI.refreshToken({ refreshToken });

      if (!response.success) {
        console.error('Token refresh failed:', response.message);
        return null;
      }

      return response.data as AuthTokens;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      setError(errorMessage);
      console.error('Token refresh error:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    refreshToken,
    loading,
    error,
    clearError,
  };
};
