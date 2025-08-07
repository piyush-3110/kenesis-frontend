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
import {
  KENESIS_MARKETPLACE_ABI,
  ERC20_ABI,
  type CoursePurchaseParams,
  type PaymentAmount,
} from "./abi";
import {
  getChainConfig,
  getTokenConfig,
  parseTokenString,
  getContractTokenAddress,
  isSupportedChain,
} from "./chainConfig";
import type { CourseResponse } from "@/lib/api/courseApi";

export interface ContractPurchaseParams {
  course: CourseResponse;
  tokenString: string; // e.g., "USDT-137"
  nftMetadataUri?: string; // IPFS URI for the NFT metadata
  affiliateAddress?: string;
  affiliatePercentage?: number; // 0-50 (percentage)
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
 * Hook for purchasing a course through the smart contract
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
      console.log("Starting purchase with params:", params);

      if (!marketplaceAddress) {
        throw new Error("Marketplace contract not available for current chain");
      }

      // Parse token string and get required chain
      const { chainId: requiredChainId } = parseTokenString(params.tokenString);
      console.log(
        "Required chain ID:",
        requiredChainId,
        "Current chain ID:",
        currentChainId
      );

      // Check if we need to switch chains
      if (currentChainId !== requiredChainId) {
        if (!isSupportedChain(requiredChainId)) {
          throw new Error(`Chain ${requiredChainId} is not supported`);
        }

        console.log("Switching to chain:", requiredChainId);
        await switchChain({ chainId: requiredChainId });
        // Wait a bit for the chain switch to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Get token configuration
      const tokenConfig = getTokenConfig(params.tokenString);
      if (!tokenConfig) {
        throw new Error(`Token ${params.tokenString} is not supported`);
      }

      const tokenAddress = getContractTokenAddress(
        params.tokenString
      ) as `0x${string}`;
      const priceInWei = parseEther(params.course.price.toString());

      console.log("Token config:", tokenConfig);
      console.log("Token address:", tokenAddress);
      console.log("Price in wei:", priceInWei);
      console.log("NFT Metadata URI:", params.nftMetadataUri);
      console.log(
        "Course access duration (days):",
        params.course.accessDuration
      );
      console.log(
        "Course affiliate percentage:",
        params.course.affiliatePercentage
      );
      console.log(
        "Instructor wallet address:",
        params.course.instructor.walletAddress
      );
      console.log("Instructor ID (fallback):", params.course.instructor.id);

      // Validate seller address
      const sellerAddress =
        params.course.instructor.walletAddress || params.course.instructor.id;
      if (!sellerAddress) {
        throw new Error("No seller address or instructor ID available");
      }

      if (!sellerAddress.startsWith("0x") || sellerAddress.length !== 42) {
        console.warn("Invalid seller address format:", sellerAddress);
        console.warn(
          "This may cause the transaction to fail. Expected a valid Ethereum address."
        );
        // Still proceed but warn the user
      }

      // Validate NFT metadata URI
      if (!params.nftMetadataUri || params.nftMetadataUri.trim() === "") {
        throw new Error("NFT metadata URI is required for course purchase");
      }

      // Convert access duration to seconds for contract
      let courseDurationInSeconds = BigInt(0);
      if (params.course.accessDuration && params.course.accessDuration > 0) {
        // accessDuration is in days, convert to seconds
        courseDurationInSeconds = BigInt(
          params.course.accessDuration * 24 * 60 * 60
        );
      } else if (params.course.accessDuration === -1) {
        // -1 means lifetime access, use max uint256 for contract (unlimited)
        courseDurationInSeconds = BigInt("3155692600"); // Grant access for 100 years
      }

      console.log(
        "Course access duration (seconds):",
        courseDurationInSeconds.toString()
      );

      // Prepare contract parameters
      const contractParams: CoursePurchaseParams = {
        seller: sellerAddress as `0x${string}`, // Use wallet address if available, fallback to ID
        priceInUSD: priceInWei,
        courseURI: params.nftMetadataUri, // Use the actual generated NFT metadata URI
        courseDuration: courseDurationInSeconds, // Use actual course duration in seconds
        tokenToPayWith: tokenAddress,
        affiliateAddress: (params.affiliateAddress ||
          "0x0000000000000000000000000000000000000000") as `0x${string}`,
        affiliatePercentage: BigInt(
          (params.affiliatePercentage ||
            params.course.affiliatePercentage ||
            0) * 100
        ), // Use provided or course affiliate percentage
      };

      console.log("Contract params:", contractParams);
      console.log("Contract params details:");
      console.log("- Seller:", contractParams.seller);
      console.log(
        "- Price in USD (wei):",
        contractParams.priceInUSD.toString()
      );
      console.log("- Course URI:", contractParams.courseURI);
      console.log(
        "- Course Duration (seconds):",
        contractParams.courseDuration.toString()
      );
      console.log("- Token to pay with:", contractParams.tokenToPayWith);
      console.log("- Affiliate address:", contractParams.affiliateAddress);
      console.log(
        "- Affiliate percentage (basis points):",
        contractParams.affiliatePercentage.toString()
      );

      // For native tokens, we need to send value with the transaction
      const options = tokenConfig.isNative
        ? {
            value: priceInWei, // This should be the actual payment amount from getPaymentAmount
          }
        : {};

      console.log("Transaction options:", options);

      // Execute the purchase
      console.log(
        "Calling writeContract with marketplace address:",
        marketplaceAddress
      );
      writeContract({
        address: marketplaceAddress,
        abi: KENESIS_MARKETPLACE_ABI,
        functionName: "purchaseCourse",
        args: [
          contractParams.seller,
          contractParams.priceInUSD,
          contractParams.courseURI,
          contractParams.courseDuration,
          contractParams.tokenToPayWith,
          contractParams.affiliateAddress,
          contractParams.affiliatePercentage,
        ],
        ...options,
      });

      console.log("Purchase transaction initiated");
      return { success: true };
    } catch (error) {
      console.error("Purchase failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  };

  // Extract NFT token ID from transaction receipt
  const nftTokenId = receipt?.logs?.find((log) => {
    // Look for CoursePurchased event
    try {
      // This is a simplified version - you'd want to properly decode the event
      return log.topics[0] === "0x..."; // CoursePurchased event signature
    } catch {
      return false;
    }
  });

  return {
    purchaseCourse,
    isLoading: isPending || isWaitingReceipt,
    isSuccess,
    transactionHash,
    nftTokenId: nftTokenId ? BigInt(0) : undefined, // Extract from logs
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

  if (chainId !== requiredChainId) {
    validationErrors.push(
      `Switch to ${tokenConfig?.symbol} chain to complete purchase`
    );
  }

  if (!tokenConfig) {
    validationErrors.push("Selected token is not supported");
  }

  if (params.course.price <= 0) {
    validationErrors.push("Invalid course price");
  }

  if (!params.nftMetadataUri || params.nftMetadataUri.trim() === "") {
    validationErrors.push("NFT metadata is required for purchase");
  }

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
