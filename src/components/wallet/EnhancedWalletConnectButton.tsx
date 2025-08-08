/**
 * Enhanced Wallet Connect Button Component
 * Implements improved auth flow and disconnect button management
 */

import React, { useEffect, useState, useCallback } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet, AlertCircle } from "lucide-react";
import { useAuthActions, useIsAuthenticated, useAuthUser } from "@/store/auth";
import { useAccount, useDisconnect } from "wagmi";
import { useWalletConnectionManager } from "@/hooks/auth/useWalletConnectionManager";
import type { AuthIntent } from "@/types/auth";

interface EnhancedWalletConnectButtonProps {
  variant?: "default" | "auth-page" | "dashboard";
  showWalletInfo?: boolean;
  onConnected?: () => void;
  className?: string;
  authIntent?: AuthIntent;
}

export const EnhancedWalletConnectButton: React.FC<
  EnhancedWalletConnectButtonProps
> = ({
  variant = "default",
  showWalletInfo = true,
  onConnected,
  className = "",
  authIntent = "auto",
}) => {
  const { walletAuth, linkWallet, refreshTokens } = useAuthActions();
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectionState, enforceAuthCompletion } =
    useWalletConnectionManager();

  // Local state for tracking operations
  const [isWaitingToLink, setIsWaitingToLink] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isProcessingWallet, setIsProcessingWallet] = useState(false);
  const [lastProcessedAddress, setLastProcessedAddress] = useState<
    string | null
  >(null);

  /**
   * Enhanced wallet linking with automatic token refresh on 401 errors
   */
  const linkWalletWithRetry = useCallback(async (): Promise<void> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await linkWallet();
    } catch (error) {
      console.error("Wallet linking failed:", error);

      const errorMessage = error instanceof Error ? error.message : "";
      const isTokenExpired =
        errorMessage.includes("Token has expired") ||
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized");

      if (isTokenExpired && !isRetrying) {
        setIsRetrying(true);
        try {
          await refreshTokens();
          await linkWallet();
          setIsRetrying(false);
        } catch (refreshError) {
          console.error("Token refresh or retry failed:", refreshError);
          setIsRetrying(false);
          throw refreshError;
        }
      } else {
        throw error;
      }
    }
  }, [linkWallet, refreshTokens, isRetrying]);

  /**
   * Enhanced wallet authentication with automatic token refresh on 401 errors
   */
  const walletAuthWithRetry = useCallback(async (): Promise<void> => {
    try {
      await walletAuth(undefined, authIntent);
    } catch (error) {
      console.error("Wallet authentication failed:", error);

      const errorMessage = error instanceof Error ? error.message : "";
      const isTokenExpired =
        errorMessage.includes("Token has expired") ||
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized");

      if (isTokenExpired && !isRetrying) {
        setIsRetrying(true);
        try {
          await refreshTokens();
          await walletAuth(undefined, authIntent);
          setIsRetrying(false);
        } catch (refreshError) {
          console.error("Token refresh or retry failed:", refreshError);
          setIsRetrying(false);
          throw refreshError;
        }
      } else {
        throw error;
      }
    }
  }, [walletAuth, refreshTokens, isRetrying, authIntent]);

  /**
   * Monitor wallet connection and enforce auth completion
   */
  useEffect(() => {
    if (connectionState.isAwaitingSignature) {
      // Set a timeout to auto-disconnect if user doesn't sign within reasonable time
      const timeout = setTimeout(() => {
        enforceAuthCompletion();
      }, 300000); // 5 minutes

      return () => clearTimeout(timeout);
    }
  }, [connectionState.isAwaitingSignature, enforceAuthCompletion]);

  /**
   * Handle wallet connection processing
   */
  useEffect(() => {
    const handleWalletConnected = async () => {
      if (
        isConnected &&
        address &&
        !isRetrying &&
        !isProcessingWallet &&
        address !== lastProcessedAddress
      ) {
        setIsProcessingWallet(true);
        setLastProcessedAddress(address);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        try {
          if (
            isAuthenticated &&
            user?.email &&
            !user?.walletAddress &&
            isWaitingToLink
          ) {
            setIsWaitingToLink(false);
            await linkWalletWithRetry();
            onConnected?.();
          } else if (!isAuthenticated) {
            await walletAuthWithRetry();
            onConnected?.();
          }
        } catch (error) {
          console.error("Error handling wallet connection:", error);

          // Reset state and disconnect wallet on failure
          setIsWaitingToLink(false);
          setIsRetrying(false);
          setIsProcessingWallet(false);
          setLastProcessedAddress(null);

          // Disconnect the wallet since the backend operation failed
          try {
            disconnect();
          } catch (disconnectError) {
            console.error("Error disconnecting wallet:", disconnectError);
          }
        } finally {
          setIsProcessingWallet(false);
        }
      }
    };

    handleWalletConnected();
  }, [
    isConnected,
    address,
    isAuthenticated,
    user?.email,
    user?.walletAddress,
    onConnected,
    disconnect,
    isRetrying,
    isWaitingToLink,
    isProcessingWallet,
    lastProcessedAddress,
    linkWalletWithRetry,
    walletAuthWithRetry,
  ]);

  const handleConnectClick = () => {
    if (isAuthenticated && user?.email && !user?.walletAddress) {
      setIsWaitingToLink(true);
    }
  };

  // Remove unused handleWalletDisconnect function

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            className={className}
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                const isProcessing =
                  isWaitingToLink || isRetrying || isProcessingWallet;
                return (
                  <button
                    onClick={() => {
                      handleConnectClick();
                      openConnectModal();
                    }}
                    type="button"
                    className={getButtonStyles(variant)}
                    disabled={isProcessing}
                  >
                    <Wallet
                      size={20}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span>
                      {isRetrying
                        ? "Retrying..."
                        : isProcessingWallet
                        ? "Processing..."
                        : isWaitingToLink
                        ? "Connecting..."
                        : "Connect Wallet"}
                    </span>
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className={getButtonStyles(variant, "error")}
                  >
                    <AlertCircle size={20} />
                    <span>Wrong Network</span>
                  </button>
                );
              }

              // Only show connected state if auth is completed
              if (!connectionState.hasCompletedAuth) {
                return (
                  <button
                    onClick={() => {
                      handleConnectClick();
                      openConnectModal();
                    }}
                    type="button"
                    className={getButtonStyles(variant)}
                    disabled={connectionState.isAwaitingSignature}
                  >
                    <Wallet
                      size={20}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span>
                      {connectionState.isAwaitingSignature
                        ? "Complete Signing..."
                        : "Connect Wallet"}
                    </span>
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className={getButtonStyles(variant, "connected")}
                  >
                    <Wallet size={20} />
                    {showWalletInfo && (
                      <span className="hidden sm:inline">
                        {account.displayName}
                        {account.displayBalance
                          ? ` (${account.displayBalance})`
                          : ""}
                      </span>
                    )}
                    <span className="sm:hidden">
                      {account.address
                        ? `${account.address.slice(
                            0,
                            6
                          )}...${account.address.slice(-4)}`
                        : "●"}
                    </span>
                  </button>

                  {/* Remove disconnect button - handled consistently through profile/logout */}
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

function getButtonStyles(
  variant: string,
  state?: "error" | "connected"
): string {
  const baseStyles =
    "flex items-center justify-center space-x-2 group transition-all duration-300 font-medium";

  if (state === "error") {
    return `${baseStyles} px-3 py-2 bg-red-600/20 border border-red-500/50 text-red-300 hover:bg-red-600/30 rounded-lg`;
  }

  if (state === "connected") {
    return `${baseStyles} px-3 py-2 bg-green-600/20 border border-green-500/50 text-green-300 hover:bg-green-600/30 rounded-lg`;
  }

  if (variant === "auth-page") {
    return `${baseStyles} w-full py-3 px-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 hover:border-purple-400/50 text-white rounded-xl`;
  }

  if (variant === "dashboard") {
    return `${baseStyles} px-3 lg:px-4 py-2 lg:py-3 rounded-lg border border-blue-500/50 bg-gradient-to-r from-blue-600/20 to-transparent hover:from-blue-600/30 text-white`;
  }

  return `${baseStyles} px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg`;
}
