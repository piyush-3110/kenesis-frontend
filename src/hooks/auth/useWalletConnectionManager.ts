/**
 * Wallet Connection Manager Hook
 * Handles wallet connection state management and enforces auth flow completion
 */

import { useCallback, useEffect, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useIsAuthenticated, useAuthUser } from "@/store/auth";

interface WalletConnectionState {
  isConnected: boolean;
  address: string | null;
  isAwaitingSignature: boolean;
  hasCompletedAuth: boolean;
}

/**
 * Hook to manage wallet connection with enforced authentication completion
 * Ensures users cannot use wallet features until they complete the signing process
 */
export const useWalletConnectionManager = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser();

  const [connectionState, setConnectionState] = useState<WalletConnectionState>(
    {
      isConnected: false,
      address: null,
      isAwaitingSignature: false,
      hasCompletedAuth: false,
    }
  );

  /**
   * Update connection state based on wallet and auth status
   */
  useEffect(() => {
    const hasCompletedAuth = Boolean(
      isAuthenticated &&
        ((user?.authMethod === "wallet" && user?.walletAddress) ||
          (user?.authMethod === "hybrid" && user?.walletAddress) ||
          user?.authMethod === "email")
    );

    const isAwaitingSignature = isConnected && !hasCompletedAuth && !!address;

    setConnectionState({
      isConnected,
      address: address || null,
      isAwaitingSignature,
      hasCompletedAuth,
    });
  }, [isConnected, address, isAuthenticated, user]);

  /**
   * Force disconnect wallet if authentication was not completed
   */
  const enforceAuthCompletion = useCallback(() => {
    if (connectionState.isAwaitingSignature) {
      disconnect();
      setConnectionState((prev) => ({
        ...prev,
        isConnected: false,
        address: null,
        isAwaitingSignature: false,
      }));
    }
  }, [connectionState.isAwaitingSignature, disconnect]);

  /**
   * Check if wallet connection should be allowed for current user state
   */
  const canUseWallet = useCallback(() => {
    return connectionState.hasCompletedAuth || !connectionState.isConnected;
  }, [connectionState.hasCompletedAuth, connectionState.isConnected]);

  return {
    connectionState,
    enforceAuthCompletion,
    canUseWallet,
    // Expose underlying wagmi state for compatibility
    isConnected: connectionState.hasCompletedAuth ? isConnected : false,
    address: connectionState.hasCompletedAuth ? address : null,
  };
};
