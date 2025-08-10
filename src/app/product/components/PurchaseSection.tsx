import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  CheckCircle,
  ShoppingCart,
  LogIn,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { UsePurchaseFlowReturn } from "../hooks/usePurchaseFlow";
import TokenSelector from "@/components/product/TokenSelector";
import type { CourseResponse } from "@/lib/api/courseApi";
import { SiweAuthButton } from "@/features/wallet/SiweAuthButton";

interface CourseAccess {
  hasAccess: boolean;
  progress?: number;
}

interface PurchaseSectionProps {
  price: number;
  courseAccess: CourseAccess;
  productId: string;
  course: CourseResponse; // Full course data for NFT creation
  purchaseFlow: UsePurchaseFlowReturn;
  accessLoading?: boolean; // Loading state for course access check
  tokenToPayWith?: string[]; // Available payment tokens
  className?: string;
}

const PurchaseSection: React.FC<PurchaseSectionProps> = ({
  price,
  courseAccess,
  productId,
  course,
  purchaseFlow,
  accessLoading = false,
  tokenToPayWith = [],
  className = "",
}) => {
  const router = useRouter();
  const [selectedToken, setSelectedToken] = useState<string | null>(
    tokenToPayWith.length > 0 ? tokenToPayWith[0] : null
  );

  // Update selected token when available tokens change
  useEffect(() => {
    if (tokenToPayWith.length > 0 && !selectedToken) {
      setSelectedToken(tokenToPayWith[0]);
    }
  }, [tokenToPayWith, selectedToken]);

  const { purchasing, handlePurchase, purchaseButtonState, nftResult } =
    purchaseFlow;

  const renderPurchaseButton = () => {
    // Show loading state while checking course access
    if (accessLoading) {
      return (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-600/20 text-gray-400 border border-gray-600/30">
          <Loader2 size={20} className="animate-spin" />
          <span className="font-medium">Checking access...</span>
        </div>
      );
    }

    if (courseAccess.hasAccess) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-600/20 text-green-400 border border-green-600/30">
            <CheckCircle size={20} />
            <span className="font-medium">You own this course</span>
          </div>

          {courseAccess.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-white font-medium">
                  {courseAccess.progress}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-700"
                  style={{ width: `${courseAccess.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    switch (purchaseButtonState) {
      case "login":
        return (
          <button
            onClick={() => router.push("/auth")}
            className="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-3"
            style={{
              background:
                "linear-gradient(107.31deg, #10B981 -30.5%, #059669 54.41%, #047857 100%)",
              color: "white",
            }}
          >
            <LogIn size={20} />
            Log in to Purchase
          </button>
        );

      case "wallet":
        return (
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-blue-600/20 border border-blue-600/30">
              <p className="text-blue-400 text-sm mb-3">
                Connect your wallet to complete the purchase
              </p>
              <SiweAuthButton />
            </div>
          </div>
        );

      case "purchase":
        return (
          <div className="space-y-4">
            {/* Token Selector - only show if tokens are available */}
            {tokenToPayWith.length > 0 && (
              <TokenSelector
                tokens={tokenToPayWith}
                selectedToken={selectedToken}
                onTokenSelect={setSelectedToken}
                disabled={purchasing}
              />
            )}

            {/* Warning when no token is selected */}
            {tokenToPayWith.length > 0 && !selectedToken && (
              <div className="p-3 rounded-lg bg-yellow-600/20 border border-yellow-600/30 text-yellow-400">
                <p className="text-sm">
                  Please select a payment token to proceed.
                </p>
              </div>
            )}

            <button
              onClick={() => handlePurchase(productId, selectedToken, course)}
              disabled={
                purchasing || (tokenToPayWith.length > 0 && !selectedToken)
              }
              className="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              style={{
                background:
                  purchasing || (tokenToPayWith.length > 0 && !selectedToken)
                    ? "#4a5568"
                    : "linear-gradient(107.31deg, #00C9FF -30.5%, #4648FF 54.41%, #0D01F6 100%)",
                color: "white",
              }}
            >
              <ShoppingCart size={20} />
              {purchasing ? "Creating NFT..." : "Purchase Course"}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-white text-4xl font-bold">${price.toFixed(2)}</div>

      {/* Certificate Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-600/30">
        <Award size={20} />
        <span className="font-medium">Certificate Included</span>
      </div>

      {/* NFT Result Display */}
      {nftResult && (
        <div className="space-y-3">
          {nftResult.success ? (
            <div className="p-4 rounded-lg bg-green-600/20 border border-green-600/30">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-green-400 font-medium mb-2">
                    NFT Metadata Created!
                  </h4>
                  <p className="text-green-300 text-sm mb-3">
                    Your NFT metadata has been created and uploaded to IPFS. The
                    NFT will be minted during transaction processing.
                  </p>
                  {nftResult.nftMetadataUri && (
                    <a
                      href={nftResult.nftMetadataUri.replace(
                        "ipfs://",
                        "https://gateway.pinata.cloud/ipfs/"
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300"
                    >
                      <ExternalLink size={14} />
                      View NFT Metadata on IPFS
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-red-600/20 border border-red-600/30">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-red-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-red-400 font-medium mb-2">
                    NFT Creation Failed
                  </h4>
                  <p className="text-red-300 text-sm">
                    {nftResult.error ||
                      "Failed to create NFT metadata. You can still proceed with the purchase."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Purchase Status */}
      <div className="space-y-3">{renderPurchaseButton()}</div>
    </div>
  );
};

export default PurchaseSection;
