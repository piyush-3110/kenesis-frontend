/**
 * NFT Service - Main interface for creating course NFTs
 * Orchestrates the entire NFT creation process for course purchases
 */

import type { CourseResponse } from "@/lib/api/courseApi";
import {
  uploadThumbnailFromUrl,
  uploadMetadataToPinata,
  validatePinataConfig,
} from "./pinata";
import {
  createCourseNFTMetadata,
  validateNFTMetadata,
  type PurchaseContext,
  type NFTMetadata,
} from "./metadata";

export interface NFTCreationResult {
  success: boolean;
  metadataUri?: string;
  thumbnailHash?: string;
  error?: string;
}

export interface NFTCreationInput {
  course: CourseResponse;
  selectedToken: string; // e.g., "USDC-1"
  walletAddress: string;
}

/**
 * Complete NFT creation process for course purchase
 */
export const createCourseNFT = async (
  input: NFTCreationInput
): Promise<NFTCreationResult> => {
  try {
    // Validate Pinata configuration
    if (!validatePinataConfig()) {
      return {
        success: false,
        error:
          "Pinata configuration is missing. Please check NEXT_PUBLIC_PINATA_JWT environment variable.",
      };
    }

    console.log(`🎨 Creating NFT for course: ${input.course.title}`);

    // Step 1: Upload course thumbnail to IPFS
    console.log("📤 Uploading thumbnail to IPFS...");
    const thumbnailHash = await uploadThumbnailFromUrl(
      input.course.thumbnail,
      input.course.id
    );
    console.log(`✅ Thumbnail uploaded: ${thumbnailHash}`);

    // Step 2: Create NFT metadata
    console.log("📝 Creating NFT metadata...");
    const purchaseContext: PurchaseContext = {
      selectedToken: input.selectedToken,
      walletAddress: input.walletAddress,
      purchaseTimestamp: Date.now(),
    };

    const metadata = createCourseNFTMetadata(
      input.course,
      purchaseContext,
      thumbnailHash
    );

    // Step 3: Validate metadata
    if (!validateNFTMetadata(metadata)) {
      return {
        success: false,
        error: "Generated NFT metadata is invalid",
      };
    }

    // Step 4: Upload metadata to IPFS
    console.log("📤 Uploading metadata to IPFS...");
    const metadataHash = await uploadMetadataToPinata(
      metadata as unknown as Record<string, unknown>,
      input.course.id
    );
    const metadataUri = `ipfs://${metadataHash}`;

    console.log(`✅ NFT created successfully!`);
    console.log(`📍 Metadata URI: ${metadataUri}`);

    return {
      success: true,
      metadataUri,
      thumbnailHash,
    };
  } catch (error) {
    console.error("❌ NFT creation failed:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Preview NFT metadata without uploading to IPFS
 */
export const previewNFTMetadata = (
  course: CourseResponse,
  selectedToken: string,
  walletAddress: string
): NFTMetadata => {
  const purchaseContext: PurchaseContext = {
    selectedToken,
    walletAddress,
    purchaseTimestamp: Date.now(),
  };

  return createCourseNFTMetadata(
    course,
    purchaseContext,
    "preview-thumbnail-hash"
  );
};

/**
 * Get estimated costs for NFT creation
 */
export const getNFTCreationCosts = () => {
  return {
    pinataUpload: "Free tier: 1GB storage, 100 requests/month",
    gasEstimate: "Varies by network (Ethereum: ~$20-100, Polygon: ~$0.01-1)",
    recommendation: "Use Polygon or other L2 for lower costs",
  };
};

/**
 * Validate course data for NFT creation
 */
export const validateCourseForNFT = (
  course: CourseResponse
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!course.id) errors.push("Course ID is required");
  if (!course.title) errors.push("Course title is required");
  if (!course.thumbnail) errors.push("Course thumbnail is required");
  if (!course.instructor?.username)
    errors.push("Instructor information is required");
  if (course.price <= 0) errors.push("Course price must be greater than 0");

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Check if NFT can be created for the given token/chain
 */
export const canCreateNFTForToken = (tokenString: string): boolean => {
  const supportedChains = [
    1, 137, 10, 42161, 8453, 56, 11155111, 80002, 11155420,
  ];

  try {
    const [, chainIdStr] = tokenString.split("-");
    const chainId = parseInt(chainIdStr, 10);
    return supportedChains.includes(chainId);
  } catch {
    return false;
  }
};
