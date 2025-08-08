import React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

interface ProductPageErrorProps {
  error?: { message?: string } | null;
  onRetry?: () => void;
}

const ProductPageError: React.FC<ProductPageErrorProps> = ({
  error,
  onRetry,
}) => {
  const isAuthError = error?.message === "AUTHENTICATION_REQUIRED";

  return (
    <div className="min-h-screen bg-[#0A071A]">
      <div className="pt-24 md:pt-28 p-4 sm:p-8 max-w-7xl mx-auto">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle
              size={48}
              className={isAuthError ? "text-yellow-400" : "text-red-400"}
            />
          </div>
          <h1 className="text-white text-2xl mb-4">
            {isAuthError
              ? "Authentication Required"
              : error
              ? "Failed to load course"
              : "Course not found"}
          </h1>
          <p className="text-gray-400 mb-6">
            {isAuthError
              ? "Your session has expired. Please log in to view this course."
              : error?.message ||
                "The course you're looking for doesn't exist or has been removed."}
          </p>
          <div className="space-x-4">
            <Link
              href="/marketplace"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Back to Marketplace
            </Link>
            {isAuthError ? (
              <Link
                href="/auth"
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                Log In
              </Link>
            ) : error && onRetry ? (
              <button
                onClick={onRetry}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                Try Again
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPageError;
