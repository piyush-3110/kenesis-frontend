"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser, useIsAuthenticated } from "@/store/auth";

/**
 * DashboardProtection Component
 * Protects dashboard pages from unauthenticated and unverified users
 * Redirects based on authentication and verification status
 */
export const DashboardProtection: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser();

  useEffect(() => {
    // If not authenticated, redirect to auth page
    if (!isAuthenticated || !user) {
      router.push("/auth");
      return;
    }

    // For users with email addresses, require email verification
    // For wallet-only users (no email), allow access
    const hasEmail = !!user.email;
    const isEmailVerified = user.emailVerified === true;

    if (hasEmail && !isEmailVerified) {
      // User has email but it's not verified - redirect to verification
      router.push("/auth/verify-email");
      return;
    }

    // Allow access if:
    // 1. User has verified email, OR
    // 2. User is wallet-only (no email to verify)
  }, [isAuthenticated, user, router]);

  // Show loading or redirect state while checking
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#0A071A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user should have access
  const hasEmail = !!user.email;
  const isEmailVerified = user.emailVerified === true;
  const isWalletOnlyUser = user.authMethod === "wallet" && !hasEmail;
  const shouldHaveAccess = (hasEmail && isEmailVerified) || isWalletOnlyUser;

  if (!shouldHaveAccess) {
    return (
      <div className="min-h-screen bg-[#0A071A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
