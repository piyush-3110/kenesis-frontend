"use client";

import { useCallback, useState, useEffect } from "react";
import {
  useAccount,
  useSignMessage,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import {
  AuthAPI,
  type WalletAuthResponse,
  type WalletLinkResponse,
} from "@/lib/api";
import { setCurrentChainId, getSupportedChainId } from "@/lib/walletConfig";

export interface WalletAuthError {
  type:
    | "USER_NOT_FOUND"
    | "WALLET_ALREADY_REGISTERED"
    | "WALLET_ALREADY_LINKED"
    | "INVALID_SIGNATURE"
    | "NONCE_EXPIRED"
    | "NETWORK_ERROR"
    | "USER_REJECTED";
  message: string;
}

export interface WalletAuthResult {
  success: boolean;
  data?: WalletAuthResponse;
  error?: WalletAuthError;
}

export interface WalletLinkResult {
  success: boolean;
  data?: WalletLinkResponse;
  error?: WalletAuthError;
}

/**
 * Custom hook for wallet authentication
 * Handles the complete wallet auth flow: nonce -> sign -> register/login
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
   * Generate nonce for wallet authentication
   */
  const generateNonce = useCallback(async (walletAddress: string) => {
    try {
      const response = await AuthAPI.requestWalletNonce({ walletAddress });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to generate nonce");
      }

      return response.data;
    } catch (error) {
      console.error("Error generating nonce:", error);
      throw error;
    }
  }, []);

  /**
   * Authenticate user with wallet signature
   * Tries login first, then registration if user doesn't exist (or vice versa based on intent)
   * @param bio - Optional bio for registration
   * @param intent - Whether to prioritize 'signup', 'signin', or 'auto' (current behavior)
   */
  const authenticateWallet = useCallback(
    async (
      bio?: string,
      intent: "signup" | "signin" | "auto" = "auto"
    ): Promise<WalletAuthResult> => {
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

        // Step 1: Get nonce from backend
        const nonceData = await generateNonce(address);

        // Step 2: Sign the message
        let signature: string;
        try {
          signature = await signMessageAsync({ message: nonceData.message });
        } catch {
          return {
            success: false,
            error: {
              type: "USER_REJECTED",
              message: "User rejected signature request",
            },
          };
        }

        // Step 3: Choose authentication flow based on intent
        if (intent === "signup") {
          // For signup intent, try registration first
          try {
            const supportedChainId = getSupportedChainId(chainId);

            const registerResponse = await AuthAPI.walletRegister({
              walletAddress: address,
              signature,
              message: nonceData.message,
              nonce: nonceData.nonce,
              bio,
              chainId: supportedChainId,
            });

            if (registerResponse.success && registerResponse.data) {
              return {
                success: true,
                data: registerResponse.data,
              };
            }
          } catch (registerError: unknown) {
            const regErrorMessage =
              registerError instanceof Error
                ? registerError.message
                : "Unknown error";
            if (
              regErrorMessage.includes("already exists") ||
              regErrorMessage.includes("WALLET_ALREADY_REGISTERED")
            ) {
              // If wallet already exists, try login
              try {
                const loginResponse = await AuthAPI.walletLogin({
                  walletAddress: address,
                  signature,
                  message: nonceData.message,
                  nonce: nonceData.nonce,
                });

                if (loginResponse.success && loginResponse.data) {
                  return {
                    success: true,
                    data: loginResponse.data,
                  };
                }
              } catch (loginError: unknown) {
                const loginErrorMessage =
                  loginError instanceof Error
                    ? loginError.message
                    : "Unknown error";
                return {
                  success: false,
                  error: {
                    type: "NETWORK_ERROR",
                    message: loginErrorMessage || "Authentication failed",
                  },
                };
              }
            }

            return {
              success: false,
              error: {
                type: "NETWORK_ERROR",
                message: regErrorMessage || "Registration failed",
              },
            };
          }
        } else if (intent === "signin") {
          // For signin intent, try login first
          try {
            const loginResponse = await AuthAPI.walletLogin({
              walletAddress: address,
              signature,
              message: nonceData.message,
              nonce: nonceData.nonce,
            });

            if (loginResponse.success && loginResponse.data) {
              return {
                success: true,
                data: loginResponse.data,
              };
            }
          } catch (loginError: unknown) {
            const errorMessage =
              loginError instanceof Error
                ? loginError.message
                : "Unknown error";
            if (
              errorMessage.includes("User not found") ||
              errorMessage.includes("USER_NOT_FOUND")
            ) {
              // If user not found, try registration
              try {
                const supportedChainId = getSupportedChainId(chainId);

                const registerResponse = await AuthAPI.walletRegister({
                  walletAddress: address,
                  signature,
                  message: nonceData.message,
                  nonce: nonceData.nonce,
                  bio,
                  chainId: supportedChainId,
                });

                if (registerResponse.success && registerResponse.data) {
                  return {
                    success: true,
                    data: registerResponse.data,
                  };
                }
              } catch (registerError: unknown) {
                const regErrorMessage =
                  registerError instanceof Error
                    ? registerError.message
                    : "Unknown error";
                return {
                  success: false,
                  error: {
                    type: "NETWORK_ERROR",
                    message: regErrorMessage || "Registration failed",
                  },
                };
              }
            }

            return {
              success: false,
              error: {
                type: "NETWORK_ERROR",
                message: errorMessage || "Authentication failed",
              },
            };
          }
        } else {
          // For 'auto' intent, use the original logic (login first, then registration)
          try {
            const loginResponse = await AuthAPI.walletLogin({
              walletAddress: address,
              signature,
              message: nonceData.message,
              nonce: nonceData.nonce,
            });

            if (loginResponse.success && loginResponse.data) {
              return {
                success: true,
                data: loginResponse.data,
              };
            }
          } catch (loginError: unknown) {
            const errorMessage =
              loginError instanceof Error
                ? loginError.message
                : "Unknown error";
            if (
              errorMessage.includes("User not found") ||
              errorMessage.includes("USER_NOT_FOUND")
            ) {
              try {
                const supportedChainId = getSupportedChainId(chainId);

                const registerResponse = await AuthAPI.walletRegister({
                  walletAddress: address,
                  signature,
                  message: nonceData.message,
                  nonce: nonceData.nonce,
                  bio,
                  chainId: supportedChainId,
                });

                if (registerResponse.success && registerResponse.data) {
                  return {
                    success: true,
                    data: registerResponse.data,
                  };
                }
              } catch (registerError: unknown) {
                console.error("Registration failed:", registerError);

                const regErrorMessage =
                  registerError instanceof Error
                    ? registerError.message
                    : "Unknown error";
                if (
                  regErrorMessage.includes("already exists") ||
                  regErrorMessage.includes("WALLET_ALREADY_REGISTERED")
                ) {
                  return {
                    success: false,
                    error: {
                      type: "WALLET_ALREADY_REGISTERED",
                      message:
                        "This wallet is already registered with another account",
                    },
                  };
                }

                return {
                  success: false,
                  error: {
                    type: "NETWORK_ERROR",
                    message: regErrorMessage || "Registration failed",
                  },
                };
              }
            }

            return {
              success: false,
              error: {
                type: "NETWORK_ERROR",
                message: errorMessage || "Authentication failed",
              },
            };
          }
        }

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
          error: {
            type: "NETWORK_ERROR",
            message: errorMessage,
          },
        };
      } finally {
        setLoading(false);
      }
    },
    [address, isConnected, generateNonce, signMessageAsync, chainId]
  );

  /**
   * Link wallet to existing email account (requires user to be logged in)
   */
  const linkWalletToAccount =
    useCallback(async (): Promise<WalletLinkResult> => {
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

        // Step 1: Get fresh nonce
        const nonceData = await generateNonce(address);

        // Add a small delay to ensure nonce is properly processed
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Step 2: Sign message
        let signature: string;
        try {
          signature = await signMessageAsync({ message: nonceData.message });
        } catch {
          return {
            success: false,
            error: {
              type: "USER_REJECTED",
              message: "User rejected signature request",
            },
          };
        }

        // Step 3: Link wallet
        const supportedChainId = getSupportedChainId(chainId);

        const linkResponse = await AuthAPI.linkWallet({
          walletAddress: address,
          signature,
          message: nonceData.message,
          nonce: nonceData.nonce,
          chainId: supportedChainId,
        });

        if (linkResponse.success && linkResponse.data) {
          return {
            success: true,
            data: linkResponse.data,
          };
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

        // Handle chain ID validation errors
        if (
          errorMessage.includes("Unsupported chain ID") ||
          errorMessage.includes("chainId")
        ) {
          return {
            success: false,
            error: {
              type: "NETWORK_ERROR",
              message: `Unsupported network. Please switch to a supported network and try again.`,
            },
          };
        }

        if (
          errorMessage.includes("already linked") ||
          errorMessage.includes("WALLET_ALREADY_LINKED")
        ) {
          return {
            success: false,
            error: {
              type: "WALLET_ALREADY_LINKED",
              message: "This wallet is already linked to another account",
            },
          };
        }

        // Check for nonce-related errors
        if (
          errorMessage.includes("nonce") ||
          errorMessage.includes("expired") ||
          errorMessage.includes("invalid")
        ) {
          return {
            success: false,
            error: {
              type: "NONCE_EXPIRED",
              message:
                "Nonce expired or invalid. Please try connecting your wallet again.",
            },
          };
        }

        setError(errorMessage);

        return {
          success: false,
          error: {
            type: "NETWORK_ERROR",
            message: errorMessage,
          },
        };
      } finally {
        setLoading(false);
      }
    }, [address, isConnected, generateNonce, signMessageAsync, chainId]);

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
