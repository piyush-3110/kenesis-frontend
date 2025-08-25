"use client";

import React from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useAuth } from "@/features/auth/AuthProvider";
import { PENDING_SIWE_KEY } from "@/lib/wallet/constants";
import { useCurrentUser } from "@/features/auth/useCurrentUser";
import { useLogout } from "@/features/auth/hooks";

export function WalletGuard() {
  const { isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { isAuthenticated } = useAuth();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  // Track whether we've already logged out for the current disconnected state
  const didLogoutRef = React.useRef(false);

  // Reset the logout guard when connection returns
  React.useEffect(() => {
    if (isConnected) didLogoutRef.current = false;
  }, [isConnected]);

  React.useEffect(() => {
    const pending =
      typeof window !== "undefined" && localStorage.getItem(PENDING_SIWE_KEY);
    if (isConnected && !isAuthenticated && !pending) {
      // Ensure wallet does not remain connected without auth/link
      disconnectAsync().catch(() => {});
    }
  }, [isConnected, isAuthenticated, disconnectAsync]);

  // If user disconnects their wallet, always log them out (as per user requirement)
  React.useEffect(() => {
    if (!isConnected && isAuthenticated && user && !didLogoutRef.current) {
      didLogoutRef.current = true;
      // Clear the authenticated address since wallet is disconnected
      if (typeof window !== "undefined") {
        localStorage.removeItem("lastAuthenticatedAddress");
      }
      // Fire and forget; AuthProvider.clear() runs in hook finally
      logout.mutate(undefined, {
        onError: () => {
          // swallow; we already cleared on finally
        },
      });
    }
  }, [isConnected, isAuthenticated, user, logout]);

  return null;
}
