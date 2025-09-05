/**
 * Example Wallet Access Usage Component
 * Demonstrates how to use wallet access system in any component
 */

import React from "react";
import { useWalletAccess } from "@/hooks/useWalletAccess";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { WalletStatus } from "@/components/wallet";
import { SiweAuthButton } from "@/features/wallet/SiweAuthButton";

export const WalletAccessExample: React.FC = () => {
  // Basic wallet access information
  const {
    walletAddress,
    isWalletConnected,
    isWalletAllowed,
    isAuthenticated,
    hasWalletAccess
  } = useWalletAccess();

  // Route-specific guard (optional)
  const {
    canAccess,
    needsConnection,
    needsAuth,
    isUnauthorized
  } = useRouteGuard({
    showToasts: false // Disable toasts for example
  });

  return (
    <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">
        Wallet Access Status
      </h3>
      
      {/* Wallet Status Display */}
      <div className="mb-6">
        <WalletStatus />
      </div>

      {/* Detailed Status */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Connected:</span>
          <span className={isWalletConnected ? "text-green-400" : "text-red-400"}>
            {isWalletConnected ? "Yes" : "No"}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Authenticated:</span>
          <span className={isAuthenticated ? "text-green-400" : "text-red-400"}>
            {isAuthenticated ? "Yes" : "No"}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Authorized:</span>
          <span className={isWalletAllowed ? "text-green-400" : "text-red-400"}>
            {isWalletAllowed ? "Yes" : "No"}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Full Access:</span>
          <span className={hasWalletAccess ? "text-green-400" : "text-red-400"}>
            {hasWalletAccess ? "Yes" : "No"}
          </span>
        </div>
      </div>

      {/* Wallet Address */}
      {walletAddress && (
        <div className="mb-6 p-3 bg-gray-900 rounded">
          <p className="text-xs text-gray-400 mb-1">Wallet Address:</p>
          <p className="text-sm font-mono text-white break-all">
            {walletAddress}
          </p>
        </div>
      )}

      {/* Connection Button */}
      {!hasWalletAccess && (
        <div className="flex justify-center">
          <SiweAuthButton variant="default" />
        </div>
      )}

      {/* Status Messages */}
      <div className="mt-4 text-sm">
        {needsConnection && (
          <p className="text-yellow-400">⚠️ Wallet connection required</p>
        )}
        {needsAuth && (
          <p className="text-yellow-400">⚠️ Wallet authentication required</p>
        )}
        {isUnauthorized && (
          <p className="text-red-400">❌ Wallet not authorized</p>
        )}
        {hasWalletAccess && (
          <p className="text-green-400">✅ Full access granted</p>
        )}
      </div>
    </div>
  );
};
