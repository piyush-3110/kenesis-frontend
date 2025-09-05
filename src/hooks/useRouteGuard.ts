/**
 * Route Guard Hook
 * Provides route-specific access control logic
 */

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useWalletAccess } from "./useWalletAccess";
import { isProtectedRoute, isPublicRoute } from "@/config/walletAllowlist";
import { useUIStore } from "@/store/useUIStore";

interface RouteGuardOptions {
  redirectOnUnauthorized?: boolean;
  redirectTo?: string;
  showToasts?: boolean;
}

interface RouteGuardState {
  canAccess: boolean;
  isLoading: boolean;
  needsConnection: boolean;
  needsAuth: boolean;
  isUnauthorized: boolean;
}

/**
 * Hook for route-specific access control
 */
export const useRouteGuard = (options: RouteGuardOptions = {}): RouteGuardState => {
  const {
    redirectOnUnauthorized = false,
    redirectTo = "/",
    showToasts = true
  } = options;

  const pathname = usePathname();
  const router = useRouter();
  const { addToast } = useUIStore();
  
  const {
    isWalletConnected,
    isWalletAllowed,
    isAuthenticated,
    hasWalletAccess,
    walletAddress
  } = useWalletAccess();

  const routeIsProtected = isProtectedRoute(pathname);
  const routeIsPublic = isPublicRoute(pathname);

  // Determine access state
  const canAccess = routeIsPublic || (routeIsProtected && hasWalletAccess);
  const needsConnection = routeIsProtected && !isWalletConnected;
  const needsAuth = routeIsProtected && isWalletConnected && !isAuthenticated;
  const isUnauthorized = routeIsProtected && isWalletConnected && isAuthenticated && !isWalletAllowed;
  const isLoading = false; // Could add loading states if needed

  // Handle unauthorized access
  useEffect(() => {
    if (routeIsProtected && !canAccess && showToasts) {
      if (needsConnection) {
        addToast({
          type: "warning",
          message: "Please connect your wallet to access this page",
          duration: 4000
        });
      } else if (needsAuth) {
        addToast({
          type: "warning", 
          message: "Please authenticate your wallet to continue",
          duration: 4000
        });
      } else if (isUnauthorized) {
        addToast({
          type: "error",
          message: "Your wallet is not authorized to access this content",
          duration: 5000
        });
      }
    }
  }, [routeIsProtected, canAccess, needsConnection, needsAuth, isUnauthorized, showToasts, addToast]);

  // Handle redirects
  useEffect(() => {
    if (redirectOnUnauthorized && routeIsProtected && !canAccess && !isLoading) {
      console.log("🚫 Redirecting unauthorized user from:", pathname);
      router.push(redirectTo);
    }
  }, [redirectOnUnauthorized, routeIsProtected, canAccess, isLoading, pathname, router, redirectTo]);

  // Log access attempts for debugging
  useEffect(() => {
    if (routeIsProtected) {
      console.log("🔒 Route Guard Check:", {
        pathname,
        walletAddress,
        isWalletConnected,
        isAuthenticated,
        isWalletAllowed,
        canAccess
      });
    }
  }, [pathname, walletAddress, isWalletConnected, isAuthenticated, isWalletAllowed, canAccess, routeIsProtected]);

  return {
    canAccess,
    isLoading,
    needsConnection,
    needsAuth,
    isUnauthorized
  };
};
