'use client';

import { useEffect } from 'react';
import { tokenRefreshManager } from '@/lib/tokenRefresh';
import { useAuthStore, useAuthActions } from '@/store/useAuthStore';
import { TokenManager } from '@/lib/api';

/**
 * AuthInitializer Component
 * Handles auth state restoration and auto-refresh setup on app startup
 * Following task requirements for automatic token management
 */
export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, tokens } = useAuthStore();
  const { refreshTokens } = useAuthActions();

  useEffect(() => {
    // Restore tokens from localStorage to TokenManager on app start
    // This ensures API calls have access to tokens immediately
    if (tokens) {
      TokenManager.setTokens(tokens);
      
      // Start auto-refresh for verified users with tokens
      if (user?.emailVerified) {
        tokenRefreshManager.startAutoRefresh(async () => {
          return await refreshTokens();
        });
      }
    }

    // Cleanup on unmount
    return () => {
      tokenRefreshManager.stopAutoRefresh();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps // Run once on mount

  return <>{children}</>;
};
