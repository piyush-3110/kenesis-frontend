/**
 * Wallet Access Provider
 * Global provider for wallet access management
 */
"use client";
import React, { createContext, useContext, useEffect } from "react";
import { useWalletAccess } from "@/hooks/useWalletAccess";
import { useUIStore } from "@/store/useUIStore";

interface WalletAccessContextType {
  walletAddress: string | undefined;
  isWalletConnected: boolean;
  isWalletAllowed: boolean;
  isAuthenticated: boolean;
  hasWalletAccess: boolean;
  needsWalletConnection: boolean;
}

const WalletAccessContext = createContext<WalletAccessContextType | undefined>(undefined);

interface WalletAccessProviderProps {
  children: React.ReactNode;
}

export const WalletAccessProvider: React.FC<WalletAccessProviderProps> = ({ children }) => {
  const walletAccess = useWalletAccess();
  const { addToast } = useUIStore();

  // Monitor wallet connection changes
  useEffect(() => {
    const { walletAddress, isWalletConnected, isWalletAllowed } = walletAccess;

    // Show toast when wallet connects
    if (isWalletConnected && walletAddress) {
      if (isWalletAllowed) {
        addToast({
          type: "success", 
          message: "✅ Wallet connected and authorized!",
          duration: 3000
        });
      } else {
        addToast({
          type: "error",
          message: "❌ Wallet not authorized for this platform",
          duration: 5000
        });
      }
    }
  }, [walletAccess.isWalletConnected, walletAccess.walletAddress, walletAccess.isWalletAllowed, addToast]);

  return (
    <WalletAccessContext.Provider value={walletAccess}>
      {children}
    </WalletAccessContext.Provider>
  );
};

/**
 * Hook to use wallet access context
 */
export const useWalletAccessContext = (): WalletAccessContextType => {
  const context = useContext(WalletAccessContext);
  if (context === undefined) {
    throw new Error("useWalletAccessContext must be used within a WalletAccessProvider");
  }
  return context;
};
