/**
 * Wallet Authentication Core Hook
 * Focused only on wallet operations - nonce, signature, auth
 */

import { useCallback, useState, useEffect } from "react";
import {
  useAccount,
  useSignMessage,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { walletAuthAPI } from "@/lib/api/walletAuth";
import { setCurrentChainId } from "@/lib/walletConfig";
import type {
  WalletAuthResult,
  WalletLinkResult,
  AuthIntent,
} from "@/types/auth";

/**
 * Wallet authentication hook
 * Handles wallet connection, nonce generation, signing, and authentication
 */
export const useWalletAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Sync chain ID changes
  useEffect(() => {
    if (chainId) {
      setCurrentChainId(chainId);
    }
  }, [chainId]);

  /**
   * Prepare SIWE challenge (kept name generateNonce for compatibility)
   */
  const generateNonce = useCallback(async (walletAddress: string) => {
    try {
      const response = await walletAuthAPI.prepare({ walletAddress });
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to prepare challenge");
      }
      return response.data; // { challengeId, message, expiresAt }
    } catch (error) {
      console.error("Error preparing challenge:", error);
      throw error;
    }
  }, []);

  /**
   * Authenticate user with wallet signature
   */
  const authenticateWallet = useCallback(
    async (
      bio?: string,
      intent: AuthIntent = "auto"
    ): Promise<WalletAuthResult> => {
  // not used in the simplified flow yet, keep signature stable
  void bio;
  void intent;
      if (!address || !isConnected) {
        return {
          success: false,
          error: {
            type: "NETWORK_ERROR",
            message: "Wallet not connected",
          },
        };
      }

      try {
        setLoading(true);
        setError(null);

  // Step 1: Prepare challenge from backend
  const challenge = await generateNonce(address);

        // Step 2: Sign the message
        let signature: string;
        try {
          signature = await signMessageAsync({ message: challenge.message });
        } catch {
          return {
            success: false,
            error: {
              type: "USER_REJECTED",
              message: "User rejected signature request",
            },
          };
        }

        // Step 3: Verify signature (unified login/register)
        const verifyRes = await walletAuthAPI.verify({
          challengeId: challenge.challengeId,
          signature,
          message: challenge.message,
        });
        if (verifyRes.success && verifyRes.data) {
          return { success: true, data: verifyRes.data };
        }
        return {
          success: false,
          error: {
            type: "NETWORK_ERROR",
            message: verifyRes.message || "Authentication failed",
          },
        };

        return {
          success: false,
          error: {
            type: "NETWORK_ERROR",
            message: "Unexpected authentication error",
          },
        };
      } catch (error: unknown) {
        console.error("Wallet authentication error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Wallet authentication failed";
        setError(errorMessage);
        return {
          success: false,
          error: { type: "NETWORK_ERROR", message: errorMessage },
        };
      } finally {
        setLoading(false);
      }
    },
  [address, isConnected, generateNonce, signMessageAsync]
  );

  /**
   * Link wallet to existing email account
   */
  const linkWalletToAccount =
    useCallback(async (): Promise<WalletLinkResult> => {
      if (!address || !isConnected) {
        return {
          success: false,
          error: { type: "NETWORK_ERROR", message: "Wallet not connected" },
        };
      }

      try {
        setLoading(true);
        setError(null);

  // Step 1: Prepare (link mode if Authorization was present)
  const challenge = await generateNonce(address);

        // Add a small delay to ensure nonce is properly processed
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Step 2: Sign message
        let signature: string;
        try {
          signature = await signMessageAsync({ message: challenge.message });
        } catch {
          return {
            success: false,
            error: {
              type: "USER_REJECTED",
              message: "User rejected signature request",
            },
          };
        }

        // Step 3: Verify (links wallet in backend)
        const linkResponse = await walletAuthAPI.verify({
          challengeId: challenge.challengeId,
          signature,
          message: challenge.message,
        });
        if (linkResponse.success && linkResponse.data) {
          return { success: true, data: linkResponse.data };
        }

        return {
          success: false,
          error: {
            type: "NETWORK_ERROR",
            message: linkResponse.message || "Failed to link wallet",
          },
        };
      } catch (error: unknown) {
        console.error("Wallet linking error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        // Map specific error types
        if (errorMessage.includes("already linked")) {
          return {
            success: false,
            error: {
              type: "WALLET_ALREADY_LINKED",
              message: "This wallet is already linked to another account",
            },
          };
        }
        if (
          errorMessage.includes("nonce") ||
          errorMessage.includes("expired") ||
          errorMessage.includes("invalid") ||
          errorMessage.includes("signature") ||
          errorMessage.includes("domain")
        ) {
          return {
            success: false,
            error: {
              type: "NONCE_EXPIRED",
              message:
                "Challenge expired or invalid. Please try connecting your wallet again.",
            },
          };
        }

        setError(errorMessage);
        return {
          success: false,
          error: { type: "NETWORK_ERROR", message: errorMessage },
        };
      } finally {
        setLoading(false);
      }
  }, [address, isConnected, generateNonce, signMessageAsync]);

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    disconnect();
    setError(null);
  }, [disconnect]);

  /**
   * Switch to a specific chain
   */
  const switchToChain = useCallback(
    async (targetChainId: number) => {
      try {
        if (switchChain) {
          await switchChain({ chainId: targetChainId });
          setCurrentChainId(targetChainId);
        }
      } catch (error) {
        console.error("Failed to switch chain:", error);
        throw error;
      }
    },
    [switchChain]
  );

  /**
   * Clear errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Wallet state
    address,
    chainId,
    isConnected,

    // Actions
    authenticateWallet,
    linkWalletToAccount,
    disconnectWallet,
    switchToChain,
    generateNonce,

    // UI state
    loading,
    error,
    clearError,
  };
};
