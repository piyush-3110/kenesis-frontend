"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";
import { useWalletAccess } from "@/hooks/useWalletAccess";
import { WalletConnectionPrompt } from "@/components/wallet/WalletConnectionPrompt";
import { AccessDeniedScreen } from "@/components/wallet/AccessDeniedScreen";
import { Shield } from "lucide-react";

function RequireAuthInternal({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { 
    isWalletConnected, 
    isWalletAllowed, 
    hasWalletAccess, 
    needsWalletConnection 
  } = useWalletAccess();
  const router = useRouter();

  React.useEffect(() => {
    if (!isAuthenticated) {
      // Redirect directly to home instead of login to avoid double-redirect
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Check authentication first
  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-gray-400">Redirecting...</div>
      </div>
    );
  }

  // Show wallet connection prompt if wallet is not connected
  if (needsWalletConnection) {
    return (
      <div className="min-h-screen bg-gradient-to-br mt-24 from-[#0A071A] via-[#0F0C2A] to-[#1A1435] flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl shadow-blue-500/10">
            {/* Icon Section */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                <div className="relative p-6 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-full border border-blue-400/30">
                  <Shield className="w-20 h-20 text-blue-300" />
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-4">
                Wallet Connection Required
              </h1>
              
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Connect your authorized wallet to access this section of the platform.
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

            {/* Security Notice */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-xl p-6 border border-gray-600/30">
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-2">
                  🔒 Secure Access Protection
                </p>
                <p className="text-xs text-gray-500">
                  Only authorized wallet addresses are permitted to access this area
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if connected wallet is in allowlist
  if (isWalletConnected && !isWalletAllowed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A071A] via-[#0F0C2A] to-[#1A1435] flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          <AccessDeniedScreen />
        </div>
      </div>
    );
  }

  // All checks passed - wallet is connected, allowed, and user is authenticated
  if (hasWalletAccess) {
    return <>{children}</>;
  }

  // Fallback loading state
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-gray-400">Verifying access...</div>
    </div>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      }
    >
      <RequireAuthInternal>{children}</RequireAuthInternal>
    </Suspense>
  );
}
