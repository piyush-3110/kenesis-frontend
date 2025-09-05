/**
 * Wallet Connection Prompt Component
 * Shows when user needs to connect wallet to access protected content
 */

import React from "react";
import { Wallet, Shield, AlertTriangle } from "lucide-react";
import { SiweAuthButton } from "@/features/wallet/SiweAuthButton";

interface WalletConnectionPromptProps {
  title?: string;
  message?: string;
  variant?: "connect" | "unauthorized" | "error";
}

export const WalletConnectionPrompt: React.FC<WalletConnectionPromptProps> = ({
  title,
  message,
  variant = "connect"
}) => {
  const getContent = () => {
    switch (variant) {
      case "unauthorized":
        return {
          icon: <Shield className="w-20 h-20 text-red-400" />,
          title: title || "Access Restricted",
          message: message || "Your wallet address is not authorized to access this content. Please contact support if you believe this is an error.",
          iconBg: "from-red-500/30 to-red-600/30",
          glowColor: "shadow-red-500/10"
        };
      case "error":
        return {
          icon: <AlertTriangle className="w-20 h-20 text-yellow-400" />,
          title: title || "Connection Error",
          message: message || "There was an issue verifying your wallet connection. Please try reconnecting.",
          iconBg: "from-yellow-500/30 to-orange-600/30",
          glowColor: "shadow-yellow-500/10"
        };
      default:
        return {
          icon: <Wallet className="w-20 h-20 text-blue-300" />,
          title: title || "Connect Your Wallet",
          message: message || "Please connect your wallet to access this content. Only authorized wallet addresses can proceed.",
          iconBg: "from-blue-500/30 to-indigo-600/30",
          glowColor: "shadow-blue-500/10"
        };
    }
  };

  const content = getContent();

  return (
    <div className="text-center">
      {/* Icon Section */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className={`absolute inset-0 bg-gradient-to-br ${content.iconBg} blur-xl rounded-full`}></div>
          <div className={`relative p-6 bg-gradient-to-br ${content.iconBg} rounded-full border border-white/10`}>
            {content.icon}
          </div>
        </div>
      </div>
      
      {/* Title */}
      {content.title && (
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-4">
          {content.title}
        </h2>
      )}
      
      {/* Message */}
      {content.message && (
        <p className="text-gray-300 text-base leading-relaxed mb-8">
          {content.message}
        </p>
      )}
      
      {/* Connect Button */}
      {variant === "connect" && (
        <div className="space-y-4">
          <SiweAuthButton variant="default" />
          <p className="text-sm text-gray-400">
            🔒 Secure authentication via wallet signature
          </p>
        </div>
      )}
      
      {/* Return Home Button */}
      {variant === "unauthorized" && (
        <div className="mt-6">
          <button
            onClick={() => window.location.href = "/"}
            className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg transition-all duration-200 font-medium"
          >
            Return to Home
          </button>
        </div>
      )}
    </div>
  );
};
