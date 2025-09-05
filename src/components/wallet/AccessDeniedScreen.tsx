/**
 * Access Denied Screen Component
 * Shows when wallet is connected but not authorized
 */

import React from "react";
import { ShieldX, Home, RefreshCw } from "lucide-react";
import { useWalletAccess } from "@/hooks/useWalletAccess";

interface AccessDeniedScreenProps {
  onReturnHome?: () => void;
  onRetry?: () => void;
}

export const AccessDeniedScreen: React.FC<AccessDeniedScreenProps> = ({
  onReturnHome,
  onRetry
}) => {
  const { walletAddress } = useWalletAccess();

  const handleReturnHome = () => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      window.location.href = "/";
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="text-center">
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl shadow-red-500/10">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
            <div className="relative p-6 bg-gradient-to-br from-red-500/30 to-red-600/30 rounded-full border border-red-400/30">
              <ShieldX className="w-24 h-24 text-red-300" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-200 to-red-400 bg-clip-text text-transparent mb-6">
          Access Denied
        </h1>

        {/* Description */}
        <div className="space-y-6 mb-10">
          <p className="text-xl text-gray-300">
            Your wallet address is not authorized to access this content.
          </p>
          
          {walletAddress && (
            <div className="p-6 bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-xl border border-gray-600/30">
              <p className="text-sm text-gray-400 mb-2 font-medium">Connected Wallet:</p>
              <p className="text-lg font-mono text-white break-all bg-gray-900/50 p-3 rounded-lg border border-gray-600/30">
                {walletAddress}
              </p>
            </div>
          )}
          
          <p className="text-base text-gray-400 leading-relaxed">
            Please contact support if you believe this is an error, or use an authorized wallet address.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleReturnHome}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 font-medium shadow-lg shadow-blue-500/25"
          >
            <Home className="w-5 h-5" />
            Return to Home
          </button>
          
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl transition-all duration-200 font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>

        {/* Additional Info */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-500/20">
          <p className="text-sm text-yellow-200 leading-relaxed">
            <span className="font-semibold">🔒 Security Notice:</span> Only pre-authorized wallet addresses can access protected content on this platform for enhanced security.
          </p>
        </div>
      </div>
    </div>
  );
};
