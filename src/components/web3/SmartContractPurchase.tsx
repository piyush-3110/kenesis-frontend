/**
 * Smart Contract Purchase Component
 * Integrates smart contract functionality with the existing purchase flow
 */

import React, { useState, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  ExternalLink,
  CreditCard,
} from "lucide-react";
import {
  ChainSwitchCard,
  useChainSwitchRequired,
} from "@/components/web3/ChainSwitch";
import {
  usePurchaseQuote,
  useTokenApproval,
  usePurchaseCourse,
  usePurchaseValidation,
  formatPaymentAmount,
  type ContractPurchaseParams,
} from "@/lib/contracts/marketplaceService";
import { getTokenConfig, getChainConfig } from "@/lib/contracts/chainConfig";
import type { CourseResponse } from "@/lib/api/courseApi";
import type { PurchaseRecord, CourseAccess } from "@/lib/api/purchaseApi";

interface SmartContractPurchaseProps {
  course: CourseResponse;
  selectedToken: string; // e.g., "USDT-137"
  nftMetadataUri?: string; // The NFT metadata URI from Pinata
  affiliateAddress?: string;
  affiliatePercentage?: number;
  onPurchaseSuccess?: (result: {
    transactionHash: string;
    nftTokenId?: bigint;
    backendConfirmation?: {
      success: boolean;
      purchase?: PurchaseRecord;
      courseAccess?: CourseAccess;
      error?: string;
    };
  }) => void;
  onPurchaseError?: (error: string) => void;
  className?: string;
}

type PurchaseStep =
  | "validate"
  | "switch-chain"
  | "approve"
  | "purchase"
  | "confirming-backend"
  | "complete";

export const SmartContractPurchase: React.FC<SmartContractPurchaseProps> = ({
  course,
  selectedToken,
  nftMetadataUri = "",
  affiliateAddress,
  affiliatePercentage = 0,
  onPurchaseSuccess,
  onPurchaseError,
  className = "",
}) => {
  useAccount();
  const [currentStep, setCurrentStep] = useState<PurchaseStep>("validate");
  const [error, setError] = useState<string | null>(null);
  const [backendConfirmationResult, setBackendConfirmationResult] = useState<{
    success: boolean;
    purchase?: PurchaseRecord;
    courseAccess?: CourseAccess;
    error?: string;
  } | null>(null);

  // Contract hooks
  const purchaseParams: ContractPurchaseParams = useMemo(
    () => ({
      course,
      tokenString: selectedToken,
      nftMetadataUri,
      affiliateAddress,
      affiliatePercentage,
    }),
    [
      course,
      selectedToken,
      nftMetadataUri,
      affiliateAddress,
      affiliatePercentage,
    ]
  );

  const validation = usePurchaseValidation(purchaseParams);
  const chainSwitch = useChainSwitchRequired(selectedToken);
  const quote = usePurchaseQuote(selectedToken, course.price);
  const approval = useTokenApproval(
    selectedToken,
    quote.quote?.tokenAmount || BigInt(0)
  );
  const purchase = usePurchaseCourse();

  // Token and chain configs
  const tokenConfig = getTokenConfig(selectedToken);
  const chainConfig = getChainConfig(chainSwitch.requiredChainId || 0);

  // Determine current step based on validation and state
  useEffect(() => {
    if (!validation.isValid) {
      setCurrentStep("validate");
    } else if (chainSwitch.needsSwitch) {
      setCurrentStep("switch-chain");
    } else if (approval.needsApproval && !approval.isApproved) {
      setCurrentStep("approve");
    } else {
      setCurrentStep("purchase");
    }
  }, [
    validation.isValid,
    chainSwitch.needsSwitch,
    approval.needsApproval,
    approval.isApproved,
  ]);

  // Handle blockchain transaction success and trigger backend confirmation
  useEffect(() => {
    const handleBackendConfirmation = async () => {
      if (!purchase.transactionHash) return;

      try {
        console.log("🔄 Starting backend confirmation...");
        const backendResult = await purchase.handleBackendConfirmation(
          purchaseParams,
          purchase.transactionHash,
          purchase.nftTokenId
        );

        setBackendConfirmationResult(backendResult);

        if (backendResult.success) {
          console.log("✅ Backend confirmation successful");
          setCurrentStep("complete");
          onPurchaseSuccess?.({
            transactionHash: purchase.transactionHash,
            nftTokenId: purchase.nftTokenId,
            backendConfirmation: backendResult,
          });
        } else {
          console.warn("⚠️ Backend confirmation failed:", backendResult.error);
          // Still mark as complete since blockchain transaction succeeded
          // But show a warning about backend
          setCurrentStep("complete");
          onPurchaseSuccess?.({
            transactionHash: purchase.transactionHash,
            nftTokenId: purchase.nftTokenId,
            backendConfirmation: backendResult,
          });
        }
      } catch (error) {
        console.error("❌ Backend confirmation error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Backend confirmation failed";

        setBackendConfirmationResult({
          success: false,
          error: errorMessage,
        });

        // Still mark as complete since blockchain transaction succeeded
        setCurrentStep("complete");
        onPurchaseSuccess?.({
          transactionHash: purchase.transactionHash,
          nftTokenId: purchase.nftTokenId,
          backendConfirmation: {
            success: false,
            error: errorMessage,
          },
        });
      }
    };

    if (
      purchase.isSuccess &&
      purchase.transactionHash &&
      currentStep !== "confirming-backend" &&
      currentStep !== "complete"
    ) {
      setCurrentStep("confirming-backend");
      handleBackendConfirmation();
    }
  }, [purchase, currentStep, purchaseParams, onPurchaseSuccess]);

  // Backend confirmation handler (removed since it's now inline)

  // Handle errors from both transaction write and receipt
  useEffect(() => {
    if (purchase.error) {
      const errorMessage = purchase.error.message || "Purchase failed";
      setError(errorMessage);
      onPurchaseError?.(errorMessage);
      console.error("Purchase error detected:", purchase.error);

      // Reset to purchase step when there's an error so user can retry
      setCurrentStep("purchase");
    }
  }, [purchase.error, onPurchaseError]);

  const handlePurchase = async () => {
    setError(null);
    console.log("Starting purchase with params:", purchaseParams);
    console.log("NFT Metadata URI:", nftMetadataUri);

    try {
      const result = await purchase.purchaseCourse(purchaseParams);
      console.log("Purchase result:", result);

      if (!result.success && result.error) {
        setError(result.error);
        onPurchaseError?.(result.error);
      }
    } catch (error) {
      console.error("Purchase error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      onPurchaseError?.(errorMessage);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "validate":
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-600/20 border border-red-600/30">
              <AlertTriangle size={20} className="text-red-400 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-medium mb-2">
                  Cannot Purchase
                </h4>
                <ul className="text-red-300 text-sm space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case "switch-chain":
        return (
          <ChainSwitchCard
            tokenString={selectedToken}
            onSwitchComplete={() => setCurrentStep("purchase")}
            onSwitchError={(err) => setError(err.message)}
          />
        );

      case "approve":
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-600/20 border border-blue-600/30">
              <div className="flex items-start gap-3">
                <CreditCard size={20} className="text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-blue-400 font-medium mb-2">
                    Token Approval Required
                  </h4>
                  <p className="text-blue-300 text-sm mb-4">
                    You need to approve the marketplace to spend your{" "}
                    {tokenConfig?.symbol} tokens.
                  </p>

                  {quote.quote && (
                    <div className="mb-4 p-3 rounded-lg bg-gray-800/50">
                      <p className="text-sm text-gray-300">
                        Approval amount:{" "}
                        {formatPaymentAmount(
                          quote.quote.tokenAmount,
                          quote.quote.tokenDecimals,
                          quote.quote.tokenSymbol
                        )}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={approval.approve}
                    disabled={
                      approval.isApproving || approval.isWaitingApproval
                    }
                    className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background:
                        approval.isApproving || approval.isWaitingApproval
                          ? "#374151"
                          : "linear-gradient(107.31deg, #10B981 -30.5%, #059669 54.41%, #047857 100%)",
                      color: "white",
                    }}
                  >
                    {approval.isApproving || approval.isWaitingApproval ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>
                          {approval.isApproving
                            ? "Approving..."
                            : "Confirming..."}
                        </span>
                      </>
                    ) : (
                      <span>Approve {tokenConfig?.symbol}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "purchase":
        return (
          <div className="space-y-4">
            {/* Purchase summary */}
            {quote.quote && (
              <div className="p-4 rounded-lg bg-gray-800/50">
                <h4 className="text-white font-medium mb-3">
                  Purchase Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Course Price:</span>
                    <span className="text-white">${course.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Amount:</span>
                    <span className="text-white">
                      {formatPaymentAmount(
                        quote.quote.tokenAmount,
                        quote.quote.tokenDecimals,
                        quote.quote.tokenSymbol
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network:</span>
                    <span className="text-white">{chainConfig?.name}</span>
                  </div>
                  {quote.quote.marketplaceFeePercent > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Marketplace Fee:</span>
                      <span className="text-white">
                        {quote.quote.marketplaceFeePercent}%
                      </span>
                    </div>
                  )}
                  {affiliatePercentage > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        Affiliate Commission:
                      </span>
                      <span className="text-white">{affiliatePercentage}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Purchase button */}
            <button
              onClick={handlePurchase}
              disabled={purchase.isLoading || !quote.quote}
              className="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              style={{
                background:
                  purchase.isLoading || !quote.quote
                    ? "#374151"
                    : "linear-gradient(107.31deg, #00C9FF -30.5%, #4648FF 54.41%, #0D01F6 100%)",
                color: "white",
              }}
            >
              {purchase.isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Processing Purchase...</span>
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  <span>Purchase with {tokenConfig?.symbol}</span>
                </>
              )}
            </button>
          </div>
        );

      case "confirming-backend":
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-600/20 border border-blue-600/30">
              <div className="flex items-start gap-3">
                <Loader2
                  size={20}
                  className="text-blue-400 mt-0.5 animate-spin"
                />
                <div className="flex-1">
                  <h4 className="text-blue-400 font-medium mb-2">
                    Confirming Purchase
                  </h4>
                  <p className="text-blue-300 text-sm mb-3">
                    Your blockchain transaction was successful! We&apos;re now
                    confirming your purchase with our backend to activate your
                    course access.
                  </p>

                  {purchase.transactionHash && chainConfig && (
                    <a
                      href={`${chainConfig.blockExplorer}/tx/${purchase.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink size={14} />
                      View transaction on {chainConfig.name} Explorer
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "complete":
        const hasBackendError =
          backendConfirmationResult && !backendConfirmationResult.success;

        return (
          <div className="space-y-4">
            {/* Main success message */}
            <div className="p-4 rounded-lg bg-green-600/20 border border-green-600/30">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-green-400 font-medium mb-2">
                    Purchase Successful!
                  </h4>
                  <p className="text-green-300 text-sm mb-3">
                    Your blockchain transaction has been completed successfully
                    {hasBackendError
                      ? "."
                      : " and your course access has been activated!"}
                  </p>

                  {purchase.transactionHash && chainConfig && (
                    <a
                      href={`${chainConfig.blockExplorer}/tx/${purchase.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300"
                    >
                      <ExternalLink size={14} />
                      View on {chainConfig.name} Explorer
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Backend confirmation warning if it failed */}
            {hasBackendError && (
              <div className="p-4 rounded-lg bg-yellow-600/20 border border-yellow-600/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-yellow-400 font-medium mb-2">
                      Course Access Pending
                    </h4>
                    <p className="text-yellow-300 text-sm mb-2">
                      Your payment was successful, but we couldn&apos;t
                      automatically activate your course access. Our team will
                      manually verify your purchase and activate access shortly.
                    </p>
                    <p className="text-yellow-300 text-xs">
                      Error: {backendConfirmationResult?.error}
                    </p>
                  </div>
                </div>
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
      {/* Loading states */}
      {(quote.isLoading || validation.isLoading) && (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 size={16} className="animate-spin" />
          <span>Loading purchase information...</span>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-4 rounded-lg bg-red-600/20 border border-red-600/30">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-400 mt-0.5" />
            <div>
              <h4 className="text-red-400 font-medium mb-2">Error</h4>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Step content */}
      {!quote.isLoading && !validation.isLoading && renderStepContent()}
    </div>
  );
};
