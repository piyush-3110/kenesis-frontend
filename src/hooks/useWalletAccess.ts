/**
 * Wallet Access Hook
 * Manages wallet connection state and access verification
 */
"use client";
import { useAccount } from "wagmi";
import { useAuth } from "@/features/auth/AuthProvider";
import { isWalletAllowed } from "@/config/walletAllowlist";
import { useEffect } from "react";

interface WalletAccessState {
  walletAddress: string | undefined;
  isWalletConnected: boolean;
  isWalletAllowed: boolean;
  isAuthenticated: boolean;
  hasWalletAccess: boolean;
  needsWalletConnection: boolean;
}

/**
 * Hook to manage wallet access verification
 */
export const useWalletAccess = (): WalletAccessState => {
  const { address, isConnected } = useAccount();
  const { isAuthenticated } = useAuth();

  // Check if connected wallet is in allowlist
  const isAllowed = isWalletAllowed(address);

  // Log wallet address for debugging
  useEffect(() => {
    if (address) {
      console.log("🔍 Fetched Wallet Address:", address);
      console.log("✅ Is Wallet Allowed:", isAllowed);
    } else {
      console.log("❌ No wallet address detected");
    }
  }, [address, isAllowed]);

  return {
    walletAddress: address,
    isWalletConnected: isConnected,
    isWalletAllowed: isAllowed,
    isAuthenticated,
    hasWalletAccess: isConnected && isAllowed && isAuthenticated,
    needsWalletConnection: !isConnected
  };
};
