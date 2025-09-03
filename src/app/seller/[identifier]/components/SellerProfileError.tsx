"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  User,
  Wallet,
} from "lucide-react";

interface SellerProfileErrorProps {
  error: unknown;
  identifier: string;
  isWalletAddress: boolean;
}

/**
 * SellerProfileError Component
 * Error state for seller profile page
 */
const SellerProfileError: React.FC<SellerProfileErrorProps> = ({
  error,
  identifier,
  isWalletAddress,
}) => {
  const router = useRouter();
  const getErrorMessage = () => {
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as {
        response?: { status: number; data?: { message?: string } };
      };

      switch (apiError.response?.status) {
        case 404:
          return {
            title: "Seller Not Found",
            message: `No seller found with ${
              isWalletAddress ? "wallet address" : "identifier"
            }: ${identifier}`,
            icon: <User className="w-16 h-16 text-gray-400" />,
          };
        case 429:
          return {
            title: "Rate Limit Exceeded",
            message: "Too many requests. Please try again in a few minutes.",
            icon: <AlertTriangle className="w-16 h-16 text-yellow-400" />,
          };
        case 500:
          return {
            title: "Server Error",
            message: "Something went wrong on our end. Please try again later.",
            icon: <AlertTriangle className="w-16 h-16 text-red-400" />,
          };
        default:
          return {
            title: "Error Loading Profile",
            message:
              apiError.response?.data?.message ||
              "An unexpected error occurred",
            icon: <AlertTriangle className="w-16 h-16 text-red-400" />,
          };
      }
    }

    return {
      title: "Connection Error",
      message:
        "Unable to connect to the server. Please check your internet connection.",
      icon: <AlertTriangle className="w-16 h-16 text-red-400" />,
    };
  };

  const errorInfo = getErrorMessage();

  const handleRetry = () => {
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 text-white flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-12 backdrop-blur-sm text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">{errorInfo.icon}</div>

          {/* Error Title */}
          <h1 className="text-3xl font-bold mb-4 text-white">
            {errorInfo.title}
          </h1>

          {/* Error Message */}
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            {errorInfo.message}
          </p>

          {/* Identifier Display */}
          <div className="bg-gray-700/50 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              {isWalletAddress ? (
                <Wallet className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
              <span className="font-mono text-sm">
                {isWalletAddress
                  ? `${identifier.slice(0, 6)}...${identifier.slice(-4)}`
                  : identifier}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>

            <Link
              href="/marketplace"
              className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Marketplace
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-600/50">
            <p className="text-gray-400 text-sm">
              If you believe this is an error, please{" "}
              <Link
                href="/contact"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfileError;
