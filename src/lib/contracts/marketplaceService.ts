/**
 * Kenesis Marketplace Contract Service
 * Main service for interacting with the Kenesis marketplace smart contract
 */

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { parseEther, formatUnits } from "viem";
import { useMemo } from "react";
import { KENESIS_MARKETPLACE_ABI, ERC20_ABI, type PaymentAmount } from "./abi";
import {
  getChainConfig,
  getTokenConfig,
  parseTokenString,
  getContractTokenAddress,
  isSupportedChain,
} from "./chainConfig";
import type { CourseResponse } from "@/lib/api/courseApi";
import {
  requestPurchaseAuthorization,
  checkPurchaseStatus,
  type PurchaseAuthorizationRequest,
  type PurchaseStatusResponse,
} from "@/lib/purchase/purchaseAuthService";
import { createCourseNFT, type NFTCreationInput } from "@/lib/nft/nftService";
import { getPurchaseErrorMessage } from "@/lib/utils/errorMessages";

export interface ContractPurchaseParams {
  course: CourseResponse;
  tokenString: string; // e.g., "USDT-137"
  nftMetadataUri?: string; // IPFS URI for the NFT metadata - will be auto-generated if not provided
  affiliateAddress?: string;
  affiliatePercentage?: number; // 0-50 (percentage)
}

export interface PurchaseAuthorizationData {
  contractParams: {
    seller: string;
    priceInUSD: number;
    courseId: string;
    courseURI: string;
    courseDuration: number;
    tokenToPayWith: string;
    affiliateAddress: string;
    affiliatePercentage: number;
    backendAuthHash: string;
  };
  chainId: string;
  expiresAt: number;
}

export interface PurchaseQuote {
  tokenAmount: bigint;
  tokenSymbol: string;
  tokenDecimals: number;
  usdAmount: bigint;
  marketplaceFeePercent: number;
  estimatedGas?: bigint;
  requiresApproval: boolean;
  isNativeToken: boolean;
}

export interface PurchaseResult {
  success: boolean;
  transactionHash?: string;
  nftTokenId?: bigint;
  error?: string;
  // Backend confirmation results
  backendConfirmation?: {
    success: boolean;
    purchase?: Record<string, unknown>;
    courseAccess?: Record<string, unknown>;
    error?: string;
  };
}

/**
 * Hook to get marketplace contract configuration for current chain
 */
export const useMarketplaceContract = () => {
  const chainId = useChainId();
  const chainConfig = getChainConfig(chainId);

  return {
    address: chainConfig?.contractAddress as `0x${string}` | undefined,
    abi: KENESIS_MARKETPLACE_ABI,
    chainId,
    isSupported: !!chainConfig,
    chainConfig,
  };
};

/**
 * Hook to check if marketplace contract is paused
 */
export const useMarketplacePaused = () => {
  const { address, abi } = useMarketplaceContract();

  return useReadContract({
    address,
    abi,
    functionName: "paused",
    query: {
      enabled: !!address,
    },
  });
};

/**
 * Hook to get marketplace fee percentage
 */
export const useMarketplaceFee = () => {
  const { address, abi } = useMarketplaceContract();

  return useReadContract({
    address,
    abi,
    functionName: "marketplaceFeePercent",
    query: {
      enabled: !!address,
    },
  });
};

/**
 * Hook to get payment amount for a purchase
 */
export const usePaymentAmount = (tokenString: string, priceInUSD: number) => {
  const { address, abi } = useMarketplaceContract();
  const tokenConfig = getTokenConfig(tokenString);
  const tokenAddress = getContractTokenAddress(tokenString);
  const priceInWei = parseEther(priceInUSD.toString());

  return useReadContract({
    address,
    abi,
    functionName: "getPaymentAmount",
    args:
      tokenAddress && priceInWei
        ? [tokenAddress as `0x${string}`, priceInWei]
        : undefined,
    query: {
      enabled: !!address && !!tokenAddress && !!tokenConfig,
    },
  });
};

/**
 * Hook to get purchase quote with all necessary information
 */
export const usePurchaseQuote = (tokenString: string, priceInUSD: number) => {
  const tokenConfig = getTokenConfig(tokenString);
  const paymentAmountQuery = usePaymentAmount(tokenString, priceInUSD);
  const marketplaceFeeQuery = useMarketplaceFee();

  const quote: PurchaseQuote | undefined =
    tokenConfig && paymentAmountQuery.data
      ? {
          tokenAmount: paymentAmountQuery.data,
          tokenSymbol: tokenConfig.symbol,
          tokenDecimals: tokenConfig.decimals,
          usdAmount: parseEther(priceInUSD.toString()),
          marketplaceFeePercent: marketplaceFeeQuery.data
            ? Number(marketplaceFeeQuery.data) / 100
            : 0,
          requiresApproval: !tokenConfig.isNative,
          isNativeToken: !!tokenConfig.isNative,
        }
      : undefined;

  return {
    quote,
    isLoading: paymentAmountQuery.isLoading || marketplaceFeeQuery.isLoading,
    error: paymentAmountQuery.error || marketplaceFeeQuery.error,
    refetch: () => {
      paymentAmountQuery.refetch();
      marketplaceFeeQuery.refetch();
    },
  };
};

/**
 * Hook to estimate gas for purchase on current network (rough hint for user)
 */
export const useGasEstimate = (tokenString: string) => {
  const { address: marketplaceAddress } = useMarketplaceContract();
  const { address: userAddress } = useAccount();
  const tokenAddress = getContractTokenAddress(tokenString);
  // const tokenConfig = getTokenConfig(tokenString);

  // We can't estimate precisely without full simulate; provide minimal availability and symbol
  const canEstimate = !!marketplaceAddress && !!userAddress && !!tokenAddress;

  // We piggyback on viem via wagmi readContract's client is not directly exposed here;
  // in this context, we provide a placeholder computed description only.
  // Real estimation would require a public client; keeping API simple for UI hint.
  const gasSymbol = useMemo(() => {
    const { chainId } = parseTokenString(tokenString);
    const cfg = getChainConfig(chainId);
    return cfg?.nativeSymbol || "ETH";
  }, [tokenString]);

  return {
    canEstimate,
    // just return the symbol so UI can show "Network fee in <symbol> applies"; extend when public client is wired.
    gasSymbol,
  };
};

/**
 * Hook to check and handle token approval for ERC20 tokens
 */
export const useTokenApproval = (
  tokenString: string,
  spenderAmount: bigint
) => {
  const { address: userAddress } = useAccount();
  const { address: marketplaceAddress } = useMarketplaceContract();
  const tokenConfig = getTokenConfig(tokenString);
  const tokenAddress = getContractTokenAddress(tokenString);

  // Get current allowance
  const allowanceQuery = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args:
      userAddress && marketplaceAddress
        ? [userAddress, marketplaceAddress]
        : undefined,
    query: {
      enabled:
        !!userAddress &&
        !!marketplaceAddress &&
        !!tokenAddress &&
        !tokenConfig?.isNative,
    },
  });

  // Approve tokens
  const {
    writeContract: approve,
    data: approveHash,
    isPending: isApproving,
  } = useWriteContract();

  // Wait for approval transaction
  const { isSuccess: isApproved, isLoading: isWaitingApproval } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  const needsApproval =
    tokenConfig &&
    !tokenConfig.isNative &&
    allowanceQuery.data !== undefined &&
    allowanceQuery.data < spenderAmount;

  const handleApprove = () => {
    if (!tokenAddress || !marketplaceAddress || tokenConfig?.isNative) return;

    approve({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [marketplaceAddress, spenderAmount],
    });
  };

  return {
    needsApproval: !!needsApproval,
    currentAllowance: allowanceQuery.data,
    isApproving,
    isWaitingApproval,
    isApproved,
    approve: handleApprove,
    error: allowanceQuery.error,
  };
};

/**
 * Hook for purchasing a course through the smart contract with new authorization flow
 */
export const usePurchaseCourse = () => {
  const { address: marketplaceAddress } = useMarketplaceContract();
  const {
    writeContract,
    data: transactionHash,
    isPending,
    error: writeError,
  } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const currentChainId = useChainId();
  const { address: userAddress } = useAccount();

  // Wait for transaction receipt
  const {
    data: receipt,
    isSuccess,
    isLoading: isWaitingReceipt,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  const purchaseCourse = async (
    params: ContractPurchaseParams
  ): Promise<PurchaseResult> => {
    try {
      if (!marketplaceAddress) {
        throw new Error("Marketplace contract not available for current chain");
      }

      if (!userAddress) {
        throw new Error("Wallet not connected");
      }

      // Parse token string and get required chain
      const { chainId: requiredChainId } = parseTokenString(params.tokenString);

      // Check if we need to switch chains
      if (currentChainId !== requiredChainId) {
        console.log(`Switching to chain ${requiredChainId}`);
        if (!isSupportedChain(requiredChainId)) {
          throw new Error(`Chain ${requiredChainId} is not supported`);
        }
        await switchChain({ chainId: requiredChainId });
        // Wait a bit for the chain switch to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Step 1: Generate NFT metadata URI if not provided
      let nftMetadataUri = params.nftMetadataUri;
      if (!nftMetadataUri) {
        console.log("🎨 Generating NFT metadata...");
        const nftInput: NFTCreationInput = {
          course: params.course,
          selectedToken: params.tokenString,
          walletAddress: userAddress,
        };

        const nftResult = await createCourseNFT(nftInput);
        if (!nftResult.success || !nftResult.metadataUri) {
          throw new Error(
            `Failed to generate NFT metadata: ${nftResult.error}`
          );
        }
        nftMetadataUri = nftResult.metadataUri;
        console.log("✅ NFT metadata generated:", nftMetadataUri);
      }

      // Step 2: Request purchase authorization from backend
      console.log("🔐 Requesting purchase authorization...");
      const authRequest: PurchaseAuthorizationRequest = {
        courseId: params.course.id,
        tokenToPayWith: params.tokenString,
        courseURI: nftMetadataUri,
        affiliateAddress: params.affiliateAddress,
      };

      const authResponse = await requestPurchaseAuthorization(authRequest);
      if (!authResponse.success || !authResponse.data) {
        throw new Error(
          `Failed to get purchase authorization: ${authResponse.message}`
        );
      }

      const authData = authResponse.data;
      console.log("✅ Purchase authorization received");

      // Step 3: Execute the purchase with authorization
      const contractParams = authData.contractParams;

      // Convert parameters to the correct types for the smart contract
      const seller = contractParams.seller as `0x${string}`;
      const priceInUSD = parseEther(contractParams.priceInUSD.toString()); // Convert to cents/wei
      const courseId = contractParams.courseId;
      const courseURI = contractParams.courseURI;
      const courseDuration = BigInt(contractParams.courseDuration);
      const tokenToPayWith = contractParams.tokenToPayWith as `0x${string}`;
      const affiliateAddress = contractParams.affiliateAddress as `0x${string}`;
      const affiliatePercentage = BigInt(
        contractParams.affiliatePercentage * 100
      ); // Convert to basis points
      // Convert the auth hash to a hex string if it's not already
      const backendAuthHash = contractParams.backendAuthHash.startsWith("0x")
        ? (contractParams.backendAuthHash as `0x${string}`)
        : (`0x${contractParams.backendAuthHash}` as `0x${string}`);

      // Get token configuration for native token check
      const tokenConfig = getTokenConfig(params.tokenString);
      if (!tokenConfig) {
        throw new Error("Token configuration not found");
      }

      // For native tokens, we need to calculate the payment amount
      let value: bigint | undefined;
      if (tokenConfig.isNative) {
        // We should use getPaymentAmount from the contract but we'll need to use the payment amount from backend
        // For now, use the priceInUSD as value (this might need adjustment based on oracle prices)
        value = priceInUSD;
      }

      // Execute the purchase
      console.log("💳 Executing purchase transaction...");
      const contractArgs = [
        seller,
        priceInUSD,
        courseId,
        courseURI,
        courseDuration,
        tokenToPayWith,
        affiliateAddress,
        affiliatePercentage,
        backendAuthHash,
      ] as const;

      writeContract({
        address: marketplaceAddress,
        abi: KENESIS_MARKETPLACE_ABI,
        functionName: "purchaseCourse",
        args: contractArgs,
        value,
      });

      return { success: true };
    } catch (error) {
      console.error("Purchase failed:", error);
      const friendlyErrorMessage = getPurchaseErrorMessage(error);
      return {
        success: false,
        error: friendlyErrorMessage,
      };
    }
  };

  // Backend status check handler
  const handleBackendStatusCheck = async (
    courseId: string
  ): Promise<{
    success: boolean;
    data?: PurchaseStatusResponse;
    error?: string;
  }> => {
    try {
      console.log("� Checking purchase status...");
      const statusResponse = await checkPurchaseStatus(courseId);

      if (statusResponse.success) {
        console.log("✅ Purchase status retrieved:", statusResponse.data);
      } else {
        console.warn(
          "⚠️ Purchase status check failed:",
          statusResponse.message
        );
      }

      return statusResponse;
    } catch (error) {
      console.error("❌ Purchase status check error:", error);
      const friendlyErrorMessage = getPurchaseErrorMessage(error);
      return {
        success: false,
        error: friendlyErrorMessage,
      };
    }
  };

  // Extract NFT token ID from transaction receipt
  const nftTokenId = useMemo(() => {
    if (!receipt?.logs) return undefined;

    try {
      // Look for CoursePurchasedWithNFT event
      const purchaseEvent = receipt.logs.find((log) => {
        // Check if this is our marketplace contract and has the right topic
        return (
          log.address.toLowerCase() === marketplaceAddress?.toLowerCase() &&
          log.topics[0] === "0x..." // TODO: Add actual event signature hash
        );
      });

      if (purchaseEvent && purchaseEvent.topics[3]) {
        return BigInt(purchaseEvent.topics[3]);
      }
    } catch (error) {
      console.warn("Failed to extract NFT token ID from receipt:", error);
    }

    return undefined;
  }, [receipt, marketplaceAddress]);

  return {
    purchaseCourse,
    handleBackendStatusCheck,
    isLoading: isPending || isWaitingReceipt,
    isSuccess,
    transactionHash,
    nftTokenId,
    error: writeError || receiptError,
  };
};

/**
 * Hook to validate if a purchase is possible
 */
export const usePurchaseValidation = (params: ContractPurchaseParams) => {
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const { isSupported } = useMarketplaceContract();
  const isPausedQuery = useMarketplacePaused();

  const { chainId: requiredChainId } = parseTokenString(params.tokenString);
  const tokenConfig = getTokenConfig(params.tokenString);

  const validationErrors: string[] = [];

  if (!userAddress) {
    validationErrors.push("Wallet not connected");
  }

  if (!isSupported) {
    validationErrors.push("Current chain is not supported");
  }

  if (isPausedQuery.data) {
    validationErrors.push("Marketplace is currently paused");
  }

  // Note: We no longer add a validation error for chain mismatch.
  // The UI will auto-switch chains on purchase; we surface the requirement via needsChainSwitch only.

  if (!tokenConfig) {
    validationErrors.push("Selected token is not supported");
  }

  if (params.course.price <= 0) {
    validationErrors.push("Invalid course price");
  }

  // No longer require NFT metadata URI since we generate it automatically

  if (
    params.affiliatePercentage &&
    (params.affiliatePercentage < 0 || params.affiliatePercentage > 50)
  ) {
    validationErrors.push("Affiliate percentage must be between 0 and 50");
  }

  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors,
    needsChainSwitch: chainId !== requiredChainId,
    requiredChainId,
    isLoading: isPausedQuery.isLoading,
  };
};

/**
 * Utility function to format payment amounts for display
 */
export const formatPaymentAmount = (
  amount: bigint,
  decimals: number,
  symbol: string
): string => {
  const formatted = formatUnits(amount, decimals);
  return `${formatted} ${symbol}`;
};

/**
 * Utility function to calculate cost breakdown
 */
export const calculateCostBreakdown = (
  paymentAmount: bigint,
  marketplaceFeePercent: number,
  affiliatePercentage: number
): PaymentAmount => {
  const marketplaceFee =
    (paymentAmount * BigInt(Math.floor(marketplaceFeePercent * 100))) /
    BigInt(10000);
  const affiliateCommission =
    (paymentAmount * BigInt(Math.floor(affiliatePercentage * 100))) /
    BigInt(10000);
  const sellerReceives = paymentAmount - marketplaceFee - affiliateCommission;

  return {
    total: paymentAmount,
    marketplaceFee,
    affiliateCommission,
    sellerReceives,
  };
};
