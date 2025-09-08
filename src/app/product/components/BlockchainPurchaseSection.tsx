/**
 * Blockchain Purchase Section
 * Handles only blockchain-based purchases with NFT generation
 */

import TokenSelector from "@/components/product/TokenSelector";
import { useChainSwitchRequired } from "@/components/web3/ChainSwitch";
import { SmartContractPurchase } from "@/components/web3/SmartContractPurchase";
import { useAuth } from "@/features/auth/AuthProvider";
import { SiweAuthButton } from "@/features/wallet/SiweAuthButton";
import type { CourseResponse } from "@/lib/api/courseApi";
import { validateTokensForPurchase } from "@/lib/contracts/chainConfig";
import type { PurchaseWithNFTResult } from "@/lib/nft/purchaseFlow";
import { purchaseCourseWithNFT } from "@/lib/nft/purchaseFlow";
import { getPurchaseErrorMessage } from "@/lib/utils/errorMessages";
import { useUIStore } from "@/store/useUIStore";
import { Award, CheckCircle, ExternalLink, Loader2, Play, ShoppingCart, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useMemo, useReducer, useState } from "react";
import { isAddress } from "viem";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

// --- State Machine for Purchase Flow ---

type PurchaseState = {
    value: "idle" | "switchingNetwork" | "generatingMetadata" | "awaitingPurchase" | "error";
    error?: string;
    nftResult?: PurchaseWithNFTResult | null;
};

type PurchaseAction =
    | { type: "START_PURCHASE" }
    | { type: "SWITCH_NETWORK" }
    | { type: "NETWORK_SWITCH_SUCCESS" }
    | { type: "METADATA_SUCCESS"; payload: PurchaseWithNFTResult }
    | { type: "METADATA_FAILURE"; payload: string }
    | { type: "PURCHASE_COMPLETE" }
    | { type: "FAIL"; payload: string }
    | { type: "CANCEL" };

const initialState: PurchaseState = {
    value: "idle",
    error: undefined,
    nftResult: null,
};

function purchaseReducer(state: PurchaseState, action: PurchaseAction): PurchaseState {
    switch (action.type) {
        case "START_PURCHASE":
            return { ...state, value: "generatingMetadata", error: undefined };
        case "SWITCH_NETWORK":
            return { ...state, value: "switchingNetwork", error: undefined };
        case "NETWORK_SWITCH_SUCCESS":
            // After switching, we immediately try to generate metadata
            return { ...state, value: "generatingMetadata" };
        case "METADATA_SUCCESS":
            return {
                ...state,
                value: "awaitingPurchase",
                nftResult: action.payload,
            };
        case "METADATA_FAILURE":
            return {
                ...state,
                value: "error",
                error: action.payload,
                nftResult: { success: false, error: action.payload, steps: [] },
            };
        case "PURCHASE_COMPLETE":
            return initialState;
        case "FAIL":
            return { ...state, value: "error", error: action.payload };
        case "CANCEL":
            return initialState;
        default:
            return state;
    }
}

// --- Component Interfaces ---
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

function BlockchainPurchaseSectionContent({
    price,
    courseAccess,
    course,
    onSuccess,
    accessLoading = false,
    tokenToPayWith = [],
    className = "",
}: BlockchainPurchaseSectionProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addToast } = useUIStore();
    const [selectedToken, setSelectedToken] = useState<string | null>(null);

    const [state, dispatch] = useReducer(purchaseReducer, initialState);

    // Authentication and wallet state
    const { isAuthenticated } = useAuth();
    const { address: connectedWalletAddress, isConnected: isWalletConnected } = useAccount();

    // For purchase, we need:
    // 1. User must be logged in (via email OR wallet - doesn't matter)
    // 2. Wallet must be connected via wagmi
    // Email is optional - if they have it fine, if not nevermind
    const hasWalletConnected = Boolean(connectedWalletAddress && isWalletConnected);

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
        // The self-referral check is primarily a UX convenience.
        // The definitive security check is on the backend/smart contract.
        if (connectedWalletAddress && referralFromUrl.toLowerCase() === connectedWalletAddress.toLowerCase()) {
            return "__SELF__"; // marker to block self-referral
        }
        return referralFromUrl as `0x${string}`;
    }, [referralFromUrl, connectedWalletAddress]);

    // Load last-used token from localStorage, fallback to first available
    useEffect(() => {
        if (tokenToPayWith.length === 0) return;
        const key = `kenesis:lastToken:${course?.id || "global"}`;
        const saved = typeof window !== "undefined" ? localStorage.getItem(key) : null;
        const validSaved = saved && tokenToPayWith.includes(saved) ? saved : null;
        setSelectedToken(validSaved || tokenToPayWith[0]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [course?.id, tokenToPayWith.join(",")]);

    // Persist selection when it changes
    useEffect(() => {
        if (!selectedToken) return;
        const key = `kenesis:lastToken:${course?.id || "global"}`;
        try {
            if (typeof window !== "undefined") localStorage.setItem(key, selectedToken);
        } catch {}
    }, [selectedToken, course?.id]);

    // --- Purchase Flow Logic ---

    const chainSwitchInfo = useChainSwitchRequired(selectedToken || "");
    const { switchChain } = useSwitchChain();
    const currentChainId = useChainId();

    // Effect to react to network changes
    useEffect(() => {
        if (
            state.value === "switchingNetwork" &&
            chainSwitchInfo.requiredChainId &&
            currentChainId === chainSwitchInfo.requiredChainId
        ) {
            addToast({
                type: "success",
                message: "Network switched successfully.",
            });
            dispatch({ type: "NETWORK_SWITCH_SUCCESS" });
        }
    }, [currentChainId, state.value, chainSwitchInfo.requiredChainId, addToast]);

    // Effect to trigger metadata generation when the state is right
    useEffect(() => {
        if (state.value === "generatingMetadata") {
            generateNFTAndStartPurchase();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.value]);

    const generateNFTAndStartPurchase = async () => {
        if (!course || !selectedToken || !connectedWalletAddress) {
            dispatch({
                type: "FAIL",
                payload: "Missing required information for purchase.",
            });
            return;
        }

        try {
            console.log("Generating NFT metadata for course purchase...");

            const nftPurchaseResult = await purchaseCourseWithNFT({
                course,
                selectedToken,
                walletAddress: connectedWalletAddress,
            });

            if (nftPurchaseResult.success) {
                console.log("NFT metadata created successfully:", nftPurchaseResult.nftMetadataUri);
                dispatch({ type: "METADATA_SUCCESS", payload: nftPurchaseResult });
            } else {
                console.error("NFT metadata creation failed:", nftPurchaseResult.error);
                const friendlyError = nftPurchaseResult.error || "Failed to prepare NFT certificate.";
                dispatch({ type: "METADATA_FAILURE", payload: friendlyError });
                addToast({ type: "error", message: friendlyError });
            }
        } catch (error) {
            console.error("Failed to generate NFT metadata:", error);
            const friendlyErrorMessage = getPurchaseErrorMessage(error);
            dispatch({ type: "METADATA_FAILURE", payload: friendlyErrorMessage });
            addToast({
                type: "error",
                message: "Failed to prepare NFT certificate. " + friendlyErrorMessage,
            });
        }
    };

    const handlePurchaseSuccess = (result: {
        transactionHash: string;
        nftTokenId?: bigint;
        backendConfirmation?: {
            success: boolean;
            purchase?: Record<string, unknown>;
            courseAccess?: Record<string, unknown>;
            error?: string;
        };
    }) => {
        console.log("Blockchain purchase successful:", result);

        addToast({ type: "success", message: "Blockchain transaction confirmed." });

        if (result.backendConfirmation) {
            if (result.backendConfirmation.success) {
                console.log("✅ Backend confirmation successful:", result.backendConfirmation);
                addToast({
                    type: "success",
                    message: "Purchase confirmed. Course access activated.",
                });
            } else {
                console.warn("⚠️ Backend confirmation failed:", result.backendConfirmation.error);
                addToast({
                    type: "warning",
                    message: "Payment succeeded, but access activation failed. We will verify shortly.",
                });
            }
        }

        dispatch({ type: "PURCHASE_COMPLETE" });
        onSuccess?.();
    };

    const handlePurchaseError = (error: string) => {
        console.error("Blockchain purchase failed:", error);
        addToast({ type: "error", message: `Purchase failed: ${error}` });
        dispatch({ type: "FAIL", payload: error });
    };

    const handleStartPurchase = async () => {
        if (!course || !selectedToken || !connectedWalletAddress || !tokenValidation.valid || state.value !== "idle") {
            // Show toast for invalid states, but don't change reducer state
            if (!selectedToken) {
                addToast({
                    type: "warning",
                    message: "Please select a payment token.",
                });
            } else if (!tokenValidation.valid) {
                addToast({
                    type: "error",
                    message: "The selected token is not supported.",
                });
            }
            return;
        }

        if (affiliateAddress === "__SELF__") {
            addToast({
                type: "warning",
                message: "You cannot use your own wallet as a referral.",
            });
            return;
        }

        if (chainSwitchInfo.needsSwitch && chainSwitchInfo.requiredChainId) {
            dispatch({ type: "SWITCH_NETWORK" });
            try {
                addToast({
                    type: "info",
                    message: `Switching to ${chainSwitchInfo.requiredChainName}...`,
                });
                await switchChain({ chainId: chainSwitchInfo.requiredChainId });
                // The useEffect listening to useChainId will handle the success case
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Failed to switch network";
                addToast({ type: "error", message: msg });
                dispatch({ type: "FAIL", payload: "Network switch rejected or failed." });
            }
        } else {
            // If no switch is needed, go straight to metadata generation
            dispatch({ type: "START_PURCHASE" });
        }
    };

    const renderPurchaseButton = () => {
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
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => router.push(`/learn/${course.id}`)}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30 hover:border-green-500/50 transition-all duration-200 font-medium"
                        >
                            <Play size={20} />
                            <span>Access Course</span>
                        </button>
                    </div>

                    {courseAccess.progress !== undefined && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Progress</span>
                                <span className="text-white font-medium">{courseAccess.progress}%</span>
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
                    <div className="space-y-3">
                        <div className="p-4 rounded-lg bg-blue-600/20 border border-blue-600/30">
                            <p className="text-blue-400 text-sm mb-3">Connect your wallet to purchase this course</p>
                            <SiweAuthButton />
                        </div>
                    </div>
                );

            case "wallet":
                return (
                    <div className="space-y-3">
                        <div className="p-4 rounded-lg bg-blue-600/20 border border-blue-600/30">
                            <p className="text-blue-400 text-sm mb-3">Connect your wallet to complete the purchase</p>
                            <SiweAuthButton />
                        </div>
                    </div>
                );

            case "purchase":
                const isButtonDisabled = state.value !== "idle" || !selectedToken || !tokenValidation.valid;

                return (
                    <div className="space-y-4">
                        {tokenToPayWith.length > 0 && (
                            <TokenSelector
                                tokens={tokenToPayWith}
                                selectedToken={selectedToken}
                                onTokenSelect={token => {
                                    // Allow token change only when idle
                                    if (state.value === "idle" || state.value === "error") {
                                        setSelectedToken(token);
                                        if (state.value === "error") dispatch({ type: "CANCEL" });
                                    }
                                }}
                                disabled={state.value !== "idle" && state.value !== "error"}
                            />
                        )}

                        {/* --- Dynamic Content based on State --- */}

                        {/* IDLE State: Show Purchase Button */}
                        {state.value === "idle" && (
                            <button
                                onClick={handleStartPurchase}
                                disabled={isButtonDisabled}
                                className="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-3"
                                style={{
                                    background:
                                        "linear-gradient(107.31deg, #00C9FF -30.5%, #4648FF 54.41%, #0D01F6 100%)",
                                    color: "white",
                                }}
                            >
                                <ShoppingCart size={20} />
                                <span>Purchase Course with {selectedToken?.split("-")[0] || "..."}</span>
                            </button>
                        )}

                        {/* LOADING States: Show Progress Indicator */}
                        {(state.value === "switchingNetwork" || state.value === "generatingMetadata") && (
                            <div className="p-4 rounded-lg bg-blue-600/20 border border-blue-600/30">
                                <div className="flex items-center gap-3">
                                    <Loader2 size={20} className="text-blue-400 animate-spin" />
                                    <div>
                                        <h4 className="text-blue-400 font-medium">
                                            {state.value === "switchingNetwork"
                                                ? "Switching Network..."
                                                : "Preparing NFT Certificate..."}
                                        </h4>
                                        <p className="text-blue-300 text-sm">
                                            {state.value === "switchingNetwork"
                                                ? `Please confirm the switch to ${chainSwitchInfo.requiredChainName} in your wallet.`
                                                : "Generating secure metadata for your course certificate..."}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => dispatch({ type: "CANCEL" })}
                                    className="mt-3 text-sm text-blue-300 hover:text-white"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {/* AWAITING PURCHASE State: Show Smart Contract Component */}
                        {state.value === "awaitingPurchase" && state.nftResult?.success && selectedToken && (
                            <SmartContractPurchase
                                course={course}
                                selectedToken={selectedToken}
                                nftMetadataUri={state.nftResult.nftMetadataUri}
                                affiliateAddress={
                                    affiliateAddress && affiliateAddress !== "__SELF__"
                                        ? (affiliateAddress as `0x${string}`)
                                        : undefined
                                }
                                onPurchaseSuccess={handlePurchaseSuccess}
                                onPurchaseError={handlePurchaseError}
                                onCancel={() => dispatch({ type: "CANCEL" })}
                            />
                        )}

                        {/* ERROR State: Show Error and Retry */}
                        {state.value === "error" && (
                            <div className="p-4 rounded-lg bg-red-600/20 border border-red-600/30">
                                <div className="flex items-start gap-3">
                                    <XCircle size={20} className="text-red-400 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="text-red-400 font-medium mb-2">An Error Occurred</h4>
                                        <p className="text-red-300 text-sm mb-3">
                                            {state.error || "An unknown error occurred."}
                                        </p>
                                        <button
                                            onClick={() => dispatch({ type: "CANCEL" })}
                                            className="text-sm font-medium text-red-300 hover:text-white"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Validation Warnings (always visible if applicable) */}
                        {tokenToPayWith.length > 0 && !selectedToken && (
                            <div className="p-3 rounded-lg bg-yellow-600/20 border border-yellow-600/30 text-yellow-400">
                                <p className="text-sm">Please select a payment token to proceed.</p>
                            </div>
                        )}
                        {selectedToken && !tokenValidation.valid && (
                            <div className="p-3 rounded-lg bg-red-600/20 border border-red-600/30 text-red-400">
                                <p className="text-sm">Selected token is not supported for blockchain purchases.</p>
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

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-600/30">
                <Award size={20} />
                <span className="font-medium">NFT Certificate Included</span>
            </div>

            {/* NFT Result Display (shown when metadata is ready or if it failed) */}
            {state.nftResult && (
                <div className="space-y-3">
                    {state.nftResult.success ? (
                        <div className="p-4 rounded-lg bg-green-600/20 border border-green-600/30">
                            <div className="flex items-start gap-3">
                                <CheckCircle size={20} className="text-green-400 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="text-green-400 font-medium mb-2">NFT Certificate Ready!</h4>
                                    <p className="text-green-300 text-sm mb-3">
                                        Your NFT certificate metadata has been prepared. Proceed with the blockchain
                                        purchase to mint your NFT.
                                    </p>
                                    {state.nftResult.nftMetadataUri && (
                                        <a
                                            href={state.nftResult.nftMetadataUri.replace(
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
                        // This part is now handled by the main error state UI
                        // but can be kept if a specific NFT error format is desired
                        // even when the main state is not 'error'.
                        <div className="p-4 rounded-lg bg-red-600/20 border border-red-600/30">
                            <div className="flex items-start gap-3">
                                <XCircle size={20} className="text-red-400 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="text-red-400 font-medium mb-2">NFT Preparation Failed</h4>
                                    <p className="text-red-300 text-sm">
                                        {state.nftResult.error || "Failed to prepare NFT certificate."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-3">{renderPurchaseButton()}</div>
        </div>
    );
}

const BlockchainPurchaseSection: React.FC<BlockchainPurchaseSectionProps> = props => {
    return (
        <Suspense
            fallback={
                <div className={`space-y-4 ${props.className}`}>
                    <div className="text-white text-4xl font-bold">${props.price.toFixed(2)}</div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-600/30">
                        <Award size={20} />
                        <span className="font-medium">NFT Certificate Included</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-600/20 text-gray-400 border border-gray-600/30">
                        <Loader2 size={20} className="animate-spin" />
                        <span className="font-medium">Loading...</span>
                    </div>
                </div>
            }
        >
            <BlockchainPurchaseSectionContent {...props} />
        </Suspense>
    );
};

export default BlockchainPurchaseSection;
