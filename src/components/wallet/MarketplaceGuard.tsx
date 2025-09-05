/**
 * Marketplace Guard Component
 * Specific protection for marketplace pages with enhanced UX
 */

import React from "react";
import { useWalletAccess } from "@/hooks/useWalletAccess";
import { WalletConnectionPrompt } from "./WalletConnectionPrompt";
import { AccessDeniedScreen } from "./AccessDeniedScreen";
import { Store, ShoppingBag } from "lucide-react";

interface MarketplaceGuardProps {
  children: React.ReactNode;
}

export const MarketplaceGuard: React.FC<MarketplaceGuardProps> = ({ children }) => {
  const {
    isWalletConnected,
    isWalletAllowed,
    isAuthenticated,
    hasWalletAccess,
    needsWalletConnection
  } = useWalletAccess();

  // Show wallet connection prompt for marketplace
  if (needsWalletConnection) {
    return (
      <div className="min-h-screen bg-gradient-to-br mt-24 from-[#0A071A] via-[#0F0C2A] to-[#1A1435] flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          {/* Main Card */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl shadow-blue-500/10">
            {/* Icon Section */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                <div className="relative p-6 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-full border border-blue-400/30">
                  <Store className="w-20 h-20 text-blue-300" />
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-4">
                Access the Marketplace
              </h1>
              
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Connect your authorized wallet to browse and purchase courses in our exclusive marketplace.
              </p>
              
              {/* Connection Button */}
              <div className="mb-8">
                <WalletConnectionPrompt 
                  title=""
                  message=""
                  variant="connect"
                />
              </div>
            </div>

            {/* Features Section */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-xl p-6 border border-gray-600/30">
              <div className="flex items-center gap-3 text-blue-300 mb-4">
                <ShoppingBag className="w-5 h-5" />
                <span className="font-semibold text-base">Marketplace Features</span>
              </div>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span className="text-sm">Browse premium courses</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span className="text-sm">Secure blockchain transactions</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span className="text-sm">Instant access after purchase</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🔒 Secure wallet authentication • Only authorized addresses allowed
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A071A] via-[#0F0C2A] to-[#1A1435] flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl shadow-orange-500/10">
            <WalletConnectionPrompt
              title="Marketplace Authentication"
              message="Please authenticate your wallet to access the marketplace."
              variant="connect"
            />
          </div>
        </div>
      </div>
    );
  }

  // Check wallet authorization
  if (!isWalletAllowed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A071A] via-[#0F0C2A] to-[#1A1435] flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          <AccessDeniedScreen />
        </div>
      </div>
    );
  }

  // All checks passed
  if (hasWalletAccess) {
    return <>{children}</>;
  }

  // Fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A071A] via-[#0F0C2A] to-[#1A1435] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl shadow-yellow-500/10">
          <WalletConnectionPrompt
            title="Marketplace Access"
            message="Verifying marketplace access permissions..."
            variant="error"
          />
        </div>
      </div>
    </div>
  );
};
