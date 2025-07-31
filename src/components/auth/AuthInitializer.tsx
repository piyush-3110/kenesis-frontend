'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * AuthInitializer Component
 * Handles authentication initialization on app startup
 * Restores auth state from stored tokens
 */
export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from stored tokens
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
};
