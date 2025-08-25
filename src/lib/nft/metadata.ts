/**
 * NFT Metadata Creation for Course Purchase NFTs
 * Creates ERC-721 compliant metadata for course NFTs minted at purchase time
 */

import type { CourseResponse } from "@/lib/api/courseApi";

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: "number" | "date" | "boost_number" | "boost_percentage";
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: NFTAttribute[];
  // Additional properties for better marketplace support
  animation_url?: string;
  youtube_url?: string;
  background_color?: string;
}

export interface ChainInfo {
  chainId: number;
  chainName: string;
  tokenSymbol: string;
}

export interface PurchaseContext {
  selectedToken: string; // e.g., "USDC-1", "USDT-137"
  walletAddress: string;
  purchaseTimestamp: number;
}

/**
 * Create NFT metadata for a course purchase
 */
export const createCourseNFTMetadata = (
  course: CourseResponse,
  purchaseContext: PurchaseContext,
  thumbnailIpfsHash: string
): NFTMetadata => {
  const { chainInfo, tokenSymbol } = parseTokenString(
    purchaseContext.selectedToken
  );

  const metadata: NFTMetadata = {
    name: `${course.title} - Course Access NFT`,
    description: `Course Access NFT for "${course.title}" on Kenesis platform. This NFT grants access to the course content and serves as proof of purchase. ${course.shortDescription}`,
    image: `ipfs://${thumbnailIpfsHash}`,
    external_url: `https://kenesis.com/product/${course.slug || course.id}`,

    attributes: [
      // Basic Course Information
      {
        trait_type: "Course Title",
        value: course.title,
      },
      {
        trait_type: "Course ID",
        value: course.id,
      },
      {
        trait_type: "Course Type",
        value: course.type === "video" ? "Video Course" : "Document Course",
      },
      {
        trait_type: "Course Level",
        value: capitalizeFirst(course.level),
      },
      {
        trait_type: "Language",
        value: course.language,
      },
      {
        trait_type: "Price (USD)",
        display_type: "number",
        value: course.price,
      },

      // Instructor Information
      {
        trait_type: "Instructor",
        value: course.instructor.username,
      },
      {
        trait_type: "Instructor ID",
        value: course.instructor.id,
      },

      // Course Stats (at time of purchase)
      {
        trait_type: "Course Rating",
        display_type: "number",
        value: Math.round(course.stats.rating * 10) / 10, // Round to 1 decimal
      },
      {
        trait_type: "Review Count",
        display_type: "number",
        value: course.stats.reviewCount,
      },
      {
        trait_type: "Duration (Minutes)",
        display_type: "number",
        value: Math.floor(course.stats.duration / 60),
      },
      {
        trait_type: "Chapter Count",
        display_type: "number",
        value: course.chapters.length,
      },

      // Blockchain & Payment Info
      {
        trait_type: "Payment Token",
        value: tokenSymbol,
      },
      {
        trait_type: "Blockchain",
        value: chainInfo.chainName,
      },
      {
        trait_type: "Chain ID",
        display_type: "number",
        value: chainInfo.chainId,
      },
      {
        trait_type: "Purchase Date",
        display_type: "date",
        value: purchaseContext.purchaseTimestamp,
      },

      // Platform Information
      {
        trait_type: "Platform",
        value: "Kenesis",
      },
      {
        trait_type: "NFT Type",
        value: "Course Access",
      },
      {
        trait_type: "Access Duration",
        value:
          course.accessDuration === -1
            ? "Lifetime"
            : `${Math.floor(course.accessDuration / 86400)} Days`,
      },
    ],
  };

  // Add optional attributes based on available data
  addOptionalAttributes(metadata, course);

  return metadata;
};

/**
 * Add optional attributes based on course data
 */
const addOptionalAttributes = (
  metadata: NFTMetadata,
  course: CourseResponse
): void => {
  // Add category if available from metadata
  if (course.metadata?.tags && course.metadata.tags.length > 0) {
    metadata.attributes.push({
      trait_type: "Primary Tag",
      value: course.metadata.tags[0],
    });
  }

  // Add rarity based on sales
  const rarity = calculateCourseRarity(course.soldCount);
  if (rarity) {
    metadata.attributes.push({
      trait_type: "Course Popularity",
      value: rarity,
    });
  }

  // Add limited edition info
  if (course.availableQuantity !== -1) {
    metadata.attributes.push({
      trait_type: "Limited Edition",
      value: "Yes",
    });

    metadata.attributes.push({
      trait_type: "Total Supply",
      display_type: "number",
      value: course.availableQuantity,
    });

    metadata.attributes.push({
      trait_type: "Edition Number",
      display_type: "number",
      value: course.soldCount + 1, // Current purchase
    });
  }

  // Add affiliate percentage
  if (course.affiliatePercentage > 0) {
    metadata.attributes.push({
      trait_type: "Affiliate Percentage",
      display_type: "number",
      value: course.affiliatePercentage,
    });
  }
};

/**
 * Calculate course rarity based on sales volume
 */
const calculateCourseRarity = (soldCount: number): string | null => {
  if (soldCount >= 10000) return "Bestseller";
  if (soldCount >= 5000) return "Popular";
  if (soldCount >= 1000) return "Well-Known";
  if (soldCount >= 100) return "Established";
  if (soldCount >= 10) return "Emerging";
  if (soldCount === 0) return "Launch Edition";
  return "New";
};

/**
 * Parse token string to extract chain and token info
 */
const parseTokenString = (
  tokenString: string
): { chainInfo: ChainInfo; tokenSymbol: string } => {
  const [tokenSymbol, chainIdStr] = tokenString.split("-");
  const chainId = parseInt(chainIdStr, 10);

  const chainInfo = getChainInfo(chainId);

  return {
    chainInfo,
    tokenSymbol: tokenSymbol.toUpperCase(),
  };
};

/**
 * Get chain information from chain ID
 */
const getChainInfo = (chainId: number): ChainInfo => {
  const chainMap: Record<number, ChainInfo> = {
    1: { chainId: 1, chainName: "Ethereum", tokenSymbol: "ETH" },
    137: { chainId: 137, chainName: "Polygon", tokenSymbol: "MATIC" },
    10: { chainId: 10, chainName: "Optimism", tokenSymbol: "ETH" },
    42161: { chainId: 42161, chainName: "Arbitrum", tokenSymbol: "ETH" },
    8453: { chainId: 8453, chainName: "Base", tokenSymbol: "ETH" },
    56: { chainId: 56, chainName: "BSC", tokenSymbol: "BNB" },

    // Testnets
    11155111: { chainId: 11155111, chainName: "Sepolia", tokenSymbol: "ETH" },
    80002: { chainId: 80002, chainName: "Polygon Amoy", tokenSymbol: "MATIC" },
    11155420: {
      chainId: 11155420,
      chainName: "OP Sepolia",
      tokenSymbol: "ETH",
    },
  };

  return (
    chainMap[chainId] || {
      chainId,
      chainName: "Unknown",
      tokenSymbol: "UNKNOWN",
    }
  );
};

/**
 * Capitalize first letter of string
 */
const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Validate NFT metadata before upload
 */
export const validateNFTMetadata = (metadata: NFTMetadata): boolean => {
  if (!metadata.name || !metadata.description || !metadata.image) {
    return false;
  }

  if (!metadata.attributes || metadata.attributes.length === 0) {
    return false;
  }

  // Validate required attributes
  const requiredTraits = [
    "Course Title",
    "Course Type",
    "Instructor",
    "Payment Token",
    "Blockchain",
  ];
  const traitTypes = metadata.attributes.map((attr) => attr.trait_type);

  return requiredTraits.every((trait) => traitTypes.includes(trait));
};

/**
 * Create a simplified metadata for testing
 */
export const createTestNFTMetadata = (
  courseTitle: string,
  thumbnailHash: string
): NFTMetadata => {
  return {
    name: `${courseTitle} - Course Access NFT`,
    description: `Test NFT for course: ${courseTitle}`,
    image: `ipfs://${thumbnailHash}`,
    external_url: "https://kenesis.com",
    attributes: [
      {
        trait_type: "Course Title",
        value: courseTitle,
      },
      {
        trait_type: "Platform",
        value: "Kenesis",
      },
      {
        trait_type: "NFT Type",
        value: "Course Access",
      },
    ],
  };
};
