/**
 * Protected Route Component
 * Handles wallet-based access control for protected pages
 */
"use client";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useWalletAccess } from "@/hooks/useWalletAccess";
import { WalletConnectionPrompt } from "./WalletConnectionPrompt";
import { AccessDeniedScreen } from "./AccessDeniedScreen";
import { isProtectedRoute, isPublicRoute } from "@/config/walletAllowlist";
import { useUIStore } from "@/store/useUIStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const pathname = usePathname();
  const { addToast } = useUIStore();
  const {
    walletAddress,
    isWalletConnected,
    isWalletAllowed,
    isAuthenticated,
    hasWalletAccess,
    needsWalletConnection
  } = useWalletAccess();

  // Check if current route needs protection
  const routeIsProtected = isProtectedRoute(pathname);
  const routeIsPublic = isPublicRoute(pathname);

  // Show toast notifications for access issues
  useEffect(() => {
    if (!routeIsProtected) return;

    if (isWalletConnected && !isWalletAllowed && walletAddress) {
      addToast({
        type: "error",
        message: `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} is not authorized for this platform.`,
        duration: 5000
      });
    }
  }, [isWalletConnected, isWalletAllowed, walletAddress, routeIsProtected, addToast]);

  // Public routes are always accessible
  if (routeIsPublic) {
    return <>{children}</>;
  }

  // Protected routes require wallet verification
  if (routeIsProtected) {
    // Step 1: Check if wallet is connected
    if (needsWalletConnection) {
      return (
        <WalletConnectionPrompt 
          title="Wallet Required"
          message="Please connect your wallet to access this content. Only authorized wallet addresses can proceed."
          variant="connect"
        />
      );
    }

    // Step 2: Check if connected wallet is authenticated
    if (!isAuthenticated) {
      return (
        <WalletConnectionPrompt
          title="Authentication Required"
          message="Please authenticate your wallet to continue."
          variant="connect"
        />
      );
    }

    // Step 3: Check if wallet is in allowlist
    if (!isWalletAllowed) {
      return <AccessDeniedScreen />;
    }

    // Step 4: All checks passed, render protected content
    if (hasWalletAccess) {
      return <>{children}</>;
    }

    // Fallback for unexpected states
    return (
      <WalletConnectionPrompt
        title="Access Verification"
        message="Verifying your wallet access permissions..."
        variant="error"
      />
    );
  }

  // Default: render children for non-categorized routes
  return <>{children}</>;
};
