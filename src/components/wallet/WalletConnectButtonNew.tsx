/**
 * Simplified Wallet Connect Button Component
 * Clean, focused implementation with clear state management
 */

import React, { useEffect, useState, useCallback } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet, AlertCircle } from "lucide-react";
import { useAuthActions, useIsAuthenticated, useAuthUser } from "@/store/auth";
import { useAccount, useDisconnect } from "wagmi";
import type { AuthIntent } from "@/types/auth";

interface WalletConnectButtonProps {
  variant?: "default" | "auth-page" | "dashboard";
  showWalletInfo?: boolean;
  onConnected?: () => void;
  className?: string;
  authIntent?: AuthIntent;
}

export const WalletConnectButtonNew: React.FC<WalletConnectButtonProps> = ({
  variant = "default",
  showWalletInfo = true,
  onConnected,
  className = "",
  authIntent = "auto",
}) => {
  const { walletAuth, linkWallet, disconnectWallet, refreshTokens } = useAuthActions();
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Component state
  const [isWaitingToLink, setIsWaitingToLink] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessedAddress, setLastProcessedAddress] = useState<string | null>(null);

  /**
   * Handle wallet authentication with retry logic
   */
  const handleWalletAuth = useCallback(async (): Promise<void> => {
    try {
      await walletAuth(undefined, authIntent);
    } catch (error) {
      console.error("Wallet authentication failed:", error);
      
      // Check if it's a token expiration error and retry
      const errorMessage = error instanceof Error ? error.message : "";
      if (errorMessage.includes("Token has expired") || errorMessage.includes("401")) {
        try {
          await refreshTokens();
          await walletAuth(undefined, authIntent);
        } catch (retryError) {
          console.error("Wallet auth retry failed:", retryError);
          throw retryError;
        }
      } else {
        throw error;
      }
    }
  }, [walletAuth, authIntent, refreshTokens]);

  /**
   * Handle wallet linking with retry logic
   */
  const handleWalletLink = useCallback(async (): Promise<void> => {
    try {
      // Add a small delay to ensure wallet state is stable
      await new Promise(resolve => setTimeout(resolve, 500));
      await linkWallet();
    } catch (error) {
      console.error("Wallet linking failed:", error);
      
      // Check if it's a token expiration error and retry
      const errorMessage = error instanceof Error ? error.message : "";
      if (errorMessage.includes("Token has expired") || errorMessage.includes("401")) {
        try {
          await refreshTokens();
          await linkWallet();
        } catch (retryError) {
          console.error("Wallet link retry failed:", retryError);
          throw retryError;
        }
      } else {
        throw error;
      }
    }
  }, [linkWallet, refreshTokens]);

  /**
   * Process wallet connection
   */
  useEffect(() => {
    const processWalletConnection = async () => {
      // Prevent duplicate processing
      if (!isConnected || !address || isProcessing || address === lastProcessedAddress) {
        return;
      }

      setIsProcessing(true);
      setLastProcessedAddress(address);
      
      // Add delay to ensure wallet connection is stable
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        if (isAuthenticated && user?.email && !user?.walletAddress && isWaitingToLink) {
          // User is logged in with email and wants to link wallet
          setIsWaitingToLink(false);
          await handleWalletLink();
          onConnected?.();
        } else if (!isAuthenticated) {
          // User is not authenticated - do wallet auth
          await handleWalletAuth();
          onConnected?.();
        }
        // For other states (already authenticated with wallet, etc.), no action needed
      } catch (error) {
        console.error("Error processing wallet connection:", error);
        
        // Reset state and disconnect wallet on failure
        setIsWaitingToLink(false);
        setIsProcessing(false);
        setLastProcessedAddress(null);
        
        try {
          disconnect();
        } catch (disconnectError) {
          console.error("Error disconnecting wallet:", disconnectError);
        }
      } finally {
        setIsProcessing(false);
      }
    };

    processWalletConnection();
  }, [
    isConnected,
    address,
    isAuthenticated,
    user?.email,
    user?.walletAddress,
    isWaitingToLink,
    isProcessing,
    lastProcessedAddress,
    handleWalletAuth,
    handleWalletLink,
    disconnect,
    onConnected,
  ]);

  /**
   * Handle connect button click
   */
  const handleConnectClick = () => {
    if (isAuthenticated && user?.email && !user?.walletAddress) {
      // User is logged in with email, prepare to link wallet after connection
      setIsWaitingToLink(true);
    }
  };

  /**
   * Handle wallet disconnect
   */
  const handleWalletDisconnect = () => {
    setIsWaitingToLink(false);
    setIsProcessing(false);
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
                      {isProcessing
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
                        ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
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

/**
 * Get button styles based on variant and state
 */
function getButtonStyles(variant: string, state?: "error" | "connected"): string {
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
