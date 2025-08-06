"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet, AlertCircle } from "lucide-react";
import {
  useAuthActions,
  useIsAuthenticated,
  useAuthUser,
} from "@/store/useAuthStore";
import { useAccount, useDisconnect } from "wagmi";

interface WalletConnectButtonProps {
  variant?: "default" | "auth-page" | "dashboard";
  showWalletInfo?: boolean;
  onConnected?: () => void;
  className?: string;
  authIntent?: "signup" | "signin" | "auto"; // New prop to specify auth intent
}

export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  variant = "default",
  showWalletInfo = true,
  onConnected,
  className = "",
  authIntent = "auto",
}) => {
  const { walletAuth, linkWallet, disconnectWallet, refreshTokens } =
    useAuthActions();
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Track when we're waiting to link a wallet after connection
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
      // Add a small delay to ensure wallet state is stable
      await new Promise((resolve) => setTimeout(resolve, 500));

      await linkWallet();
    } catch (error) {
      console.error("Wallet linking failed:", error);

      // Check if it's a 401 token expiration error
      const errorMessage = error instanceof Error ? error.message : "";
      const isTokenExpired =
        errorMessage.includes("Token has expired") ||
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized");

      if (isTokenExpired && !isRetrying) {
        setIsRetrying(true);

        try {
          // Attempt to refresh the token
          await refreshTokens();

          // Important: After token refresh, linkWallet() will automatically:
          // 1. Call generateNonce() to get a fresh nonce
          // 2. Ask user to sign the new message with new nonce
          // 3. Make API call with new token and new nonce
          await linkWallet();
          setIsRetrying(false);
        } catch (refreshError) {
          console.error("Token refresh or retry failed:", refreshError);
          setIsRetrying(false);

          // Don't logout user - just show error and let them try again
          throw refreshError;
        }
      } else {
        // For non-401 errors or if already retrying, just throw the error
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

      // Check if it's a 401 token expiration error
      const errorMessage = error instanceof Error ? error.message : "";
      const isTokenExpired =
        errorMessage.includes("Token has expired") ||
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized");

      if (isTokenExpired && !isRetrying) {
        setIsRetrying(true);

        try {
          // Attempt to refresh the token
          await refreshTokens();

          await walletAuth(undefined, authIntent);
          setIsRetrying(false);
        } catch (refreshError) {
          console.error("Token refresh or retry failed:", refreshError);
          setIsRetrying(false);

          // Don't logout user - just show error and let them try again
          throw refreshError;
        }
      } else {
        // For non-401 errors or if already retrying, just throw the error
        throw error;
      }
    }
  }, [walletAuth, refreshTokens, isRetrying, authIntent]);

  // Monitor wallet connection changes and trigger linking when appropriate
  useEffect(() => {
    const handleWalletConnected = async () => {
      // Prevent processing the same address multiple times and avoid unnecessary re-processing
      if (
        isConnected &&
        address &&
        !isRetrying &&
        !isProcessingWallet &&
        address !== lastProcessedAddress
      ) {
        setIsProcessingWallet(true);
        setLastProcessedAddress(address);

        // Add a longer delay to ensure wallet connection is fully stable
        await new Promise((resolve) => setTimeout(resolve, 1000));

        try {
          if (
            isAuthenticated &&
            user?.email &&
            !user?.walletAddress &&
            isWaitingToLink
          ) {
            // User is logged in with email and wallet is not linked yet - link it
            setIsWaitingToLink(false);
            await linkWalletWithRetry();
            onConnected?.();
          } else if (!isAuthenticated) {
            // User is not logged in - do wallet auth (signup/login flow)
            await walletAuthWithRetry();
            onConnected?.();
          }
          // For other states (already authenticated with wallet, etc.), no action needed
        } catch (error) {
          console.error("Error handling wallet connection:", error);

          // If backend operations fail, disconnect the wallet to maintain consistency
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

          // Error toast is already handled in the auth actions
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
      // User is logged in with email, prepare to link wallet after connection
      setIsWaitingToLink(true);
    }
    // The openConnectModal() will be called by the ConnectButton.Custom render
  };

  const handleWalletDisconnect = () => {
    setIsWaitingToLink(false);
    setIsRetrying(false);
    setIsProcessingWallet(false);
    setLastProcessedAddress(null);
    disconnectWallet();
  };

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

                  {/* Disconnect button for wallet-only users */}
                  {user?.authMethod === "wallet" && (
                    <button
                      onClick={handleWalletDisconnect}
                      type="button"
                      className="text-xs px-2 py-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      Disconnect
                    </button>
                  )}
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

  // Default connect button styles
  if (variant === "auth-page") {
    return `${baseStyles} w-full py-3 px-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 hover:border-purple-400/50 text-white rounded-xl`;
  }

  if (variant === "dashboard") {
    return `${baseStyles} px-3 lg:px-4 py-2 lg:py-3 rounded-lg border border-blue-500/50 bg-gradient-to-r from-blue-600/20 to-transparent hover:from-blue-600/30 text-white`;
  }

  // Default variant
  return `${baseStyles} px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg`;
}
