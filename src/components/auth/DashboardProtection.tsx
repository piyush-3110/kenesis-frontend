'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthUser, useIsAuthenticated } from '@/store/useAuthStore';

/**
 * DashboardProtection Component
 * Protects dashboard pages from unauthenticated and unverified users
 * Redirects based on authentication and verification status
 */
export const DashboardProtection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser();

  useEffect(() => {
    // If not authenticated, redirect to auth page
    if (!isAuthenticated || !user) {
      router.push('/auth');
      return;
    }

    // If authenticated but email not verified, redirect to verification page
    if (!user.emailVerified) {
      router.push('/auth/verify-email');
      return;
    }
  }, [isAuthenticated, user, router]);

  // Show loading or redirect state while checking
  if (!isAuthenticated || !user || !user.emailVerified) {
    return (
      <div className="min-h-screen bg-[#0A071A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
