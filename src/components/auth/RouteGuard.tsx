'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthUser, useIsAuthenticated } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';

/**
 * RouteGuard Component
 * Protects routes that require authentication and email verification
 * Following task requirements: no dashboard access unless verified
 */
export const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser();
  const { addToast } = useUIStore();

  // Define protected routes that require authentication and verification
  const protectedRoutes = ['/dashboard'];
  
  // Define routes that require authentication but not verification
  const authRequiredRoutes = ['/profile', '/settings'];
  
  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRequiredRoute = authRequiredRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    // Skip protection for non-protected routes
    if (!isProtectedRoute && !isAuthRequiredRoute) {
      return;
    }

    // Check authentication
    if (!isAuthenticated || !user) {
      addToast({
        type: 'error',
        message: 'Please log in to access this page'
      });
      router.push('/auth');
      return;
    }

    // For protected routes, also check email verification
    if (isProtectedRoute && !user.emailVerified) {
      addToast({
        type: 'warning',
        message: 'Please verify your email before accessing the dashboard'
      });
      router.push('/auth/verify-email');
      return;
    }

  }, [isAuthenticated, user, isProtectedRoute, isAuthRequiredRoute, pathname, router, addToast]);

  // Show loading state while checking authentication
  if ((isProtectedRoute || isAuthRequiredRoute) && (!isAuthenticated || !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000526]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading state while checking email verification for protected routes
  if (isProtectedRoute && user && !user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000526]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting to email verification...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
