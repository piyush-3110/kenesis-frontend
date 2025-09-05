/**
 * Wallet Status Display Component
 * Shows current wallet connection and authorization status
 */

import React from "react";
import { useWalletAccess } from "@/hooks/useWalletAccess";
import { CheckCircle, XCircle, AlertCircle, Wallet } from "lucide-react";

interface WalletStatusProps {
  compact?: boolean;
  className?: string;
}

export const WalletStatus: React.FC<WalletStatusProps> = ({ 
  compact = false, 
  className = "" 
}) => {
  const {
    walletAddress,
    isWalletConnected,
    isWalletAllowed,
    isAuthenticated,
    hasWalletAccess
  } = useWalletAccess();

  if (!isWalletConnected) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <Wallet className="w-4 h-4" />
        {!compact && <span className="text-sm">No wallet connected</span>}
      </div>
    );
  }

  const getStatusIcon = () => {
    if (hasWalletAccess) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
    if (!isAuthenticated) {
      return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
    if (!isWalletAllowed) {
      return <XCircle className="w-4 h-4 text-red-400" />;
    }
    return <AlertCircle className="w-4 h-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (hasWalletAccess) return "Authorized";
    if (!isAuthenticated) return "Authentication required";
    if (!isWalletAllowed) return "Unauthorized wallet";
    return "Unknown status";
  };

  const getStatusColor = () => {
    if (hasWalletAccess) return "text-green-400";
    if (!isAuthenticated) return "text-yellow-400";
    if (!isWalletAllowed) return "text-red-400";
    return "text-gray-400";
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {getStatusIcon()}
      {!compact && (
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          {walletAddress && (
            <span className="text-xs text-gray-500 font-mono">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
