/**
 * Blockchain Purchase Section
 * Handles only blockchain-based purchases with NFT generation
 */

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Award,
  CheckCircle,
  LogIn,
  Loader2,
  ShoppingCart,
  ExternalLink,
} from "lucide-react";
import { useAccount, useSwitchChain } from "wagmi";
import { isAddress } from "viem";
import { useAuth } from "@/features/auth/AuthProvider";
import TokenSelector from "@/components/product/TokenSelector";
import { SmartContractPurchase } from "@/components/web3/SmartContractPurchase";
import { validateTokensForPurchase } from "@/lib/contracts/chainConfig";
import { purchaseCourseWithNFT } from "@/lib/nft/purchaseFlow";
import type { CourseResponse } from "@/lib/api/courseApi";
import type { PurchaseWithNFTResult } from "@/lib/nft/purchaseFlow";
import type {
  PurchaseRecord,
  CourseAccess as ApiCourseAccess,
} from "@/lib/api/purchaseApi";
import { SiweAuthButton } from "@/features/wallet/SiweAuthButton";
import { useChainSwitchRequired } from "@/components/web3/ChainSwitch";
import { useUIStore } from "@/store/useUIStore";

interface CourseAccess {
  hasAccess: boolean;
  progress?: number;
}

interface BlockchainPurchaseSectionProps {
  price: number;
  courseAccess: CourseAccess;
  course: CourseResponse;
  onSuccess?: () => void;
  accessLoading?: boolean;
  tokenToPayWith?: string[];
  className?: string;
}

const BlockchainPurchaseSection: React.FC<BlockchainPurchaseSectionProps> = ({
  price,
  courseAccess,
  course,
  onSuccess,
  accessLoading = false,
  tokenToPayWith = [],
  className = "",
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useUIStore();
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [nftResult, setNftResult] = useState<PurchaseWithNFTResult | null>(
    null
  );
  const [purchaseStep, setPurchaseStep] = useState<
    "idle" | "generating-nft" | "ready-for-purchase" | "purchasing"
  >("idle");
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  // Authentication and wallet state
  const { isAuthenticated } = useAuth();
  const { address: connectedWalletAddress, isConnected: isWalletConnected } =
    useAccount();

  // For purchase, we need:
  // 1. User must be logged in (via email OR wallet - doesn't matter)
  // 2. Wallet must be connected via wagmi
  // Email is optional - if they have it fine, if not nevermind
  const hasWalletConnected = Boolean(
    connectedWalletAddress && isWalletConnected
  );

  // Determine purchase button state
  const getPurchaseButtonState = (): "login" | "wallet" | "purchase" => {
    if (!isAuthenticated) return "login";
    if (!hasWalletConnected) return "wallet";
    return "purchase";
  };

  const purchaseButtonState = getPurchaseButtonState();

  // Token validation
  const tokenValidation = validateTokensForPurchase(tokenToPayWith);

  // Referral handling from URL (?ref=0x....)
  const referralFromUrl = searchParams?.get("ref") || undefined;
  const affiliateAddress = useMemo(() => {
    if (!referralFromUrl) return undefined;
    if (!isAddress(referralFromUrl)) return undefined;
    if (
      connectedWalletAddress &&
      referralFromUrl.toLowerCase() === connectedWalletAddress.toLowerCase()
    ) {
      return "__SELF__"; // marker to block self-referral
    }
    return referralFromUrl as `0x${string}`;
  }, [referralFromUrl, connectedWalletAddress]);

  // Load last-used token from localStorage, fallback to first available
  useEffect(() => {
    if (tokenToPayWith.length === 0) return;
    const key = `kenesis:lastToken:${course?.id || "global"}`;
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(key) : null;
    const validSaved = saved && tokenToPayWith.includes(saved) ? saved : null;
    setSelectedToken(validSaved || tokenToPayWith[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id, tokenToPayWith.join(",")]);

  // Persist selection when it changes
  useEffect(() => {
    if (!selectedToken) return;
    const key = `kenesis:lastToken:${course?.id || "global"}`;
    try {
      if (typeof window !== "undefined")
        localStorage.setItem(key, selectedToken);
    } catch {}
  }, [selectedToken, course?.id]);

  // Detect if a chain switch is required for the currently selected token
  // Always call hook to respect Rules of Hooks; pass empty string when none selected
  const chainSwitchInfo = useChainSwitchRequired(selectedToken || "");
  const { switchChain } = useSwitchChain();

  // Generate NFT metadata when purchase is initiated
  const generateNFTAndStartPurchase = async () => {
    if (!course || !selectedToken || !connectedWalletAddress) {
      return;
    }

    setPurchaseStep("generating-nft");
    setNftResult(null);

    try {
      console.log("Generating NFT metadata for course purchase...");

      const nftPurchaseResult = await purchaseCourseWithNFT({
        course,
        selectedToken,
        walletAddress: connectedWalletAddress,
      });

      setNftResult(nftPurchaseResult);

      if (nftPurchaseResult.success) {
        console.log(
          "NFT metadata created successfully:",
          nftPurchaseResult.nftMetadataUri
        );
        setPurchaseStep("ready-for-purchase");
      } else {
        console.error("NFT metadata creation failed:", nftPurchaseResult.error);
        addToast({
          type: "error",
          message: "Failed to prepare NFT certificate.",
        });
        setPurchaseStep("idle");
      }
    } catch (error) {
      console.error("Failed to generate NFT metadata:", error);
      setNftResult({
        success: false,
        steps: [],
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
      addToast({
        type: "error",
        message: "Failed to prepare NFT certificate.",
      });
      setPurchaseStep("idle");
    }
  };

  const handlePurchaseSuccess = (result: {
    transactionHash: string;
    nftTokenId?: bigint;
    backendConfirmation?: {
      success: boolean;
      purchase?: PurchaseRecord;
      courseAccess?: ApiCourseAccess;
      error?: string;
    };
  }) => {
    console.log("Blockchain purchase successful:", result);

    // Toast for blockchain success
    addToast({ type: "success", message: "Blockchain transaction confirmed." });

    // Log backend confirmation status
    if (result.backendConfirmation) {
      if (result.backendConfirmation.success) {
        console.log(
          "✅ Backend confirmation successful:",
          result.backendConfirmation
        );
        addToast({
          type: "success",
          message: "Purchase confirmed. Course access activated.",
        });
      } else {
        console.warn(
          "⚠️ Backend confirmation failed:",
          result.backendConfirmation.error
        );
        addToast({
          type: "warning",
          message:
            "Payment succeeded, but access activation failed. We will verify shortly.",
        });
      }
    }

    setPurchaseStep("idle"); // Reset state
    onSuccess?.(); // This will trigger course access refetch
  };

  const handlePurchaseError = (error: string) => {
    console.error("Blockchain purchase failed:", error);
    addToast({ type: "error", message: `Purchase failed: ${error}` });
    setPurchaseStep("idle"); // Reset state
  };

  const handleStartPurchase = async () => {
    if (
      !course ||
      !selectedToken ||
      !connectedWalletAddress ||
      !tokenValidation.valid ||
      purchaseStep !== "idle"
    ) {
      return;
    }

    // Block self-referral
    if (affiliateAddress === "__SELF__") {
      addToast({
        type: "warning",
        message: "You cannot use your own wallet as a referral.",
      });
      return;
    }

    // If the selected token requires a different chain, switch automatically first
    if (chainSwitchInfo.needsSwitch && chainSwitchInfo.requiredChainId) {
      try {
        setIsSwitchingNetwork(true);
        addToast({
          type: "info",
          message: `Switching to ${chainSwitchInfo.requiredChainName}...`,
        });
        await switchChain({ chainId: chainSwitchInfo.requiredChainId });
        // Small delay to allow provider state to settle
        await new Promise((r) => setTimeout(r, 800));
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to switch network";
        addToast({ type: "error", message: msg });
        return;
      } finally {
        setIsSwitchingNetwork(false);
      }
    }

    generateNFTAndStartPurchase();
  };

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
            Sign In to Purchase
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
                disabled={purchaseStep !== "idle"}
              />
            )}

            {/* We auto-switch on purchase; no separate switch button here */}

            {/* Warning when no token is selected */}
            {tokenToPayWith.length > 0 && !selectedToken && (
              <div className="p-3 rounded-lg bg-yellow-600/20 border border-yellow-600/30 text-yellow-400">
                <p className="text-sm">
                  Please select a payment token to proceed.
                </p>
              </div>
            )}

            {/* Blockchain validation warnings */}
            {selectedToken && !tokenValidation.valid && (
              <div className="p-3 rounded-lg bg-red-600/20 border border-red-600/30 text-red-400">
                <p className="text-sm">
                  Selected token is not supported for blockchain purchases.
                  Please select a different token.
                </p>
              </div>
            )}

            {/* Show NFT generation progress or purchase button */}
            {purchaseStep === "generating-nft" && (
              <div className="p-4 rounded-lg bg-blue-600/20 border border-blue-600/30">
                <div className="flex items-center gap-3">
                  <Loader2 size={20} className="text-blue-400 animate-spin" />
                  <div>
                    <h4 className="text-blue-400 font-medium">
                      Preparing NFT Certificate
                    </h4>
                    <p className="text-blue-300 text-sm">
                      Generating NFT metadata for your course certificate...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Show purchase button when idle */}
            {purchaseStep === "idle" &&
              selectedToken &&
              tokenValidation.valid && (
                <button
                  onClick={handleStartPurchase}
                  disabled={isSwitchingNetwork}
                  className="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-3"
                  style={{
                    background: isSwitchingNetwork
                      ? "#374151"
                      : "linear-gradient(107.31deg, #00C9FF -30.5%, #4648FF 54.41%, #0D01F6 100%)",
                    color: "white",
                  }}
                >
                  {isSwitchingNetwork ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Switching network...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      <span>
                        Purchase Course with {selectedToken.split("-")[0]}
                      </span>
                    </>
                  )}
                </button>
              )}

            {/* Smart Contract Purchase - only show when NFT is ready */}
            {purchaseStep === "ready-for-purchase" &&
              nftResult?.success &&
              selectedToken &&
              tokenValidation.valid && (
                <SmartContractPurchase
                  course={course}
                  selectedToken={selectedToken}
                  nftMetadataUri={nftResult.nftMetadataUri}
                  affiliateAddress={
                    affiliateAddress && affiliateAddress !== "__SELF__"
                      ? (affiliateAddress as `0x${string}`)
                      : undefined
                  }
                  onPurchaseSuccess={handlePurchaseSuccess}
                  onPurchaseError={handlePurchaseError}
                />
              )}

            {/* Show error if NFT generation or validation failed */}
            {purchaseStep === "idle" &&
              selectedToken &&
              !tokenValidation.valid && (
                <div className="p-4 rounded-lg bg-yellow-600/20 border border-yellow-600/30">
                  <p className="text-yellow-400 text-sm">
                    Please select a supported token for blockchain purchase.
                  </p>
                </div>
              )}
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
        <span className="font-medium">NFT Certificate Included</span>
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
                    NFT Certificate Ready!
                  </h4>
                  <p className="text-green-300 text-sm mb-3">
                    Your NFT certificate metadata has been prepared. Proceed
                    with the blockchain purchase to mint your NFT.
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
                      Preview NFT Metadata
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
                    NFT Preparation Failed
                  </h4>
                  <p className="text-red-300 text-sm">
                    {nftResult.error || "Failed to prepare NFT certificate."}
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

export default BlockchainPurchaseSection;
