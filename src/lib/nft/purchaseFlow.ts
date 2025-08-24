/**
 * Complete Purchase Flow with NFT URI Generation (Updated for new auth flow)
 * Handles course purchase with backend authorization and NFT metadata creation via Pinata
 */

import {
  createCourseNFT,
  validateCourseForNFT,
  type NFTCreationInput,
} from "./nftService";
import {
  requestPurchaseAuthorization,
  type PurchaseAuthorizationRequest,
} from "@/lib/purchase/purchaseAuthService";
import type { CourseResponse } from "@/lib/api/courseApi";

export interface PurchaseWithNFTParams {
  course: CourseResponse;
  selectedToken: string; // e.g., "USDC-1" (token-chainId)
  walletAddress: string;
}

export interface PurchaseStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  error?: string;
}

export interface PurchaseWithNFTResult {
  success: boolean;
  steps: PurchaseStep[];
  nftMetadataUri?: string;
  nftThumbnailHash?: string;
  authorizationData?: Record<string, unknown>;
  error?: string;
}

/**
 * Complete course purchase preparation with NFT URI generation and backend authorization
 * This prepares everything needed for the smart contract call but doesn't execute it
 */
export const purchaseCourseWithNFT = async (
  params: PurchaseWithNFTParams
): Promise<PurchaseWithNFTResult> => {
  const steps: PurchaseStep[] = [
    {
      id: "validate",
      name: "Validation",
      description: "Validating course and wallet data",
      status: "pending",
    },
    {
      id: "nft-metadata",
      name: "NFT Metadata",
      description: "Creating and uploading NFT metadata to IPFS",
      status: "pending",
    },
    {
      id: "authorization",
      name: "Authorization",
      description: "Getting purchase authorization from backend",
      status: "pending",
    },
  ];

  try {
    // Step 1: Validation
    steps[0].status = "in-progress";

    // Validate course data
    const courseValidation = validateCourseForNFT(params.course);
    if (!courseValidation.valid) {
      steps[0].status = "failed";
      steps[0].error = courseValidation.errors.join(", ");
      return {
        success: false,
        steps,
        error: `Course validation failed: ${courseValidation.errors.join(
          ", "
        )}`,
      };
    }

    // Basic token format validation
    const [, chainIdStr] = params.selectedToken.split("-");
    const chainId = parseInt(chainIdStr, 10);

    if (!chainId || isNaN(chainId)) {
      steps[0].status = "failed";
      steps[0].error = `Invalid token format: ${params.selectedToken}`;
      return {
        success: false,
        steps,
        error: `Invalid token format: ${params.selectedToken}`,
      };
    }

    steps[0].status = "completed";

    // Step 2: Create NFT Metadata and Upload to IPFS
    steps[1].status = "in-progress";

    const nftInput: NFTCreationInput = {
      course: params.course,
      selectedToken: params.selectedToken,
      walletAddress: params.walletAddress,
    };

    const nftResult = await createCourseNFT(nftInput);

    if (!nftResult.success || !nftResult.metadataUri) {
      steps[1].status = "failed";
      steps[1].error = nftResult.error || "Failed to create NFT metadata";
      return {
        success: false,
        steps,
        error: `NFT metadata creation failed: ${nftResult.error}`,
      };
    }

    steps[1].status = "completed";

    // Step 3: Get backend authorization
    steps[2].status = "in-progress";

    try {
      const authRequest: PurchaseAuthorizationRequest = {
        courseId: params.course.id,
        tokenToPayWith: params.selectedToken,
        courseURI: nftResult.metadataUri,
        affiliateAddress: undefined, // Can be extended later
      };

      const authResponse = await requestPurchaseAuthorization(authRequest);

      if (!authResponse.success || !authResponse.data) {
        steps[2].status = "failed";
        steps[2].error = authResponse.message || "Failed to get authorization";
        return {
          success: false,
          steps,
          error: `Authorization failed: ${authResponse.message}`,
        };
      }

      steps[2].status = "completed";

      return {
        success: true,
        steps,
        nftMetadataUri: nftResult.metadataUri,
        nftThumbnailHash: nftResult.thumbnailHash,
        authorizationData: authResponse.data as unknown as Record<
          string,
          unknown
        >,
      };
    } catch (error) {
      steps[2].status = "failed";
      steps[2].error = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        steps,
        error: error instanceof Error ? error.message : "Authorization failed",
      };
    }
  } catch (error) {
    // Mark current step as failed
    const currentStep = steps.find((step) => step.status === "in-progress");
    if (currentStep) {
      currentStep.status = "failed";
      currentStep.error =
        error instanceof Error ? error.message : "Unknown error";
    }

    return {
      success: false,
      steps,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Get purchase preview with requirements
 */
export const getPurchasePreview = async (params: PurchaseWithNFTParams) => {
  const [, chainIdStr] = params.selectedToken.split("-");
  const chainId = parseInt(chainIdStr, 10);

  if (!chainId || isNaN(chainId)) {
    return {
      supported: false,
      error: `Invalid token format: ${params.selectedToken}`,
    };
  }

  return {
    supported: true,
    chainId: chainId,
    steps: [
      "Validate course and wallet data",
      "Create and upload NFT metadata to IPFS",
      "Grant course access",
    ],
    estimatedTime: "1-2 minutes",
    requirements: [
      "Connected wallet",
      "Valid course data",
      "Network connection for IPFS upload",
    ],
  };
};

/**
 * Check if purchase is possible for the given parameters
 */
export const canPurchaseCourse = (
  params: PurchaseWithNFTParams
): {
  canPurchase: boolean;
  reasons: string[];
} => {
  const reasons: string[] = [];

  // Validate course
  const courseValidation = validateCourseForNFT(params.course);
  if (!courseValidation.valid) {
    reasons.push(...courseValidation.errors);
  }

  // Validate token format
  const [, chainIdStr] = params.selectedToken.split("-");
  const chainId = parseInt(chainIdStr, 10);

  if (!chainId || isNaN(chainId)) {
    reasons.push(`Invalid token format: ${params.selectedToken}`);
  }

  // Validate wallet
  if (!params.walletAddress || !params.walletAddress.startsWith("0x")) {
    reasons.push("Invalid wallet address");
  }

  return {
    canPurchase: reasons.length === 0,
    reasons,
  };
};
