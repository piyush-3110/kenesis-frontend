/**
 * Purchase Authorization Service
 * Handles the new simplified purchase flow with backend authorization
 */

import { http } from "@/lib/http/axios";

export interface PurchaseAuthorizationRequest {
  courseId: string;
  tokenToPayWith: string; // Format: TOKEN_SYMBOL-CHAIN_ID (e.g., "USDC-1", "USDT-137")
  courseURI?: string; // Optional IPFS or HTTP URL for course metadata
  affiliateAddress?: string; // Optional Ethereum address for affiliate commission
}

export interface ContractParams {
  seller: string;
  priceInUSD: number;
  courseId: string;
  courseURI: string;
  courseDuration: number;
  tokenToPayWith: string;
  affiliateAddress: string;
  affiliatePercentage: number;
  backendAuthHash: string;
}

export interface TokenDetails {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  chainId: number;
}

export interface CourseDetails {
  id: string;
  title: string;
  description: string;
  price: number;
  seller: string;
  tokenToPayWith: string[];
  thumbnail: string;
  accessDuration: number;
  affiliatePercentage: number;
}

export interface PurchaseAuthorizationResponse {
  contractParams: ContractParams;
  authorizationData: string;
  courseDetails: CourseDetails;
  tokenDetails: TokenDetails;
  metadata: {
    courseURI: string;
    affiliateAddress: string;
    courseDurationDays: number;
    courseDurationSeconds: number;
  };
  chainId: string;
  expiresAt: number;
}

export interface PurchaseStatusResponse {
  hasPurchased: boolean;
  hasAccess: boolean;
  purchase: {
    id: string;
    priceInUSD: number;
    paymentToken: string;
    transactionHash: string;
    nftId: string;
    purchaseDate: string;
    status: string;
    isVerified: boolean;
    accessGranted: boolean;
    remainingDays: number | null;
  } | null;
}

export interface BackendSignerResponse {
  signerAddress: string;
  message: string;
}

/**
 * Request purchase authorization from backend
 */
export const requestPurchaseAuthorization = async (
  request: PurchaseAuthorizationRequest
): Promise<{
  success: boolean;
  data?: PurchaseAuthorizationResponse;
  message?: string;
}> => {
  try {
    console.log("🔐 Requesting purchase authorization:", request);

    const response = await http.post(
      "/api/courses/purchase-authorization",
      request
    );

    console.log("✅ Authorization response:", response.data);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: unknown) {
    console.error("❌ Purchase authorization failed:", error);

    let errorMessage = "Failed to get purchase authorization";

    if (error && typeof error === "object") {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      errorMessage =
        err?.response?.data?.message || err?.message || errorMessage;
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
};

/**
 * Check purchase status for a course
 */
export const checkPurchaseStatus = async (
  courseId: string
): Promise<{
  success: boolean;
  data?: PurchaseStatusResponse;
  message?: string;
}> => {
  try {
    console.log("🔍 Checking purchase status for course:", courseId);

    const response = await http.get(
      `/api/courses/purchases/status/${courseId}`
    );

    console.log("✅ Purchase status response:", response.data);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: unknown) {
    console.error("❌ Purchase status check failed:", error);

    let errorMessage = "Failed to check purchase status";

    if (error && typeof error === "object") {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      errorMessage =
        err?.response?.data?.message || err?.message || errorMessage;
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
};

/**
 * Get backend signer address
 */
export const getBackendSignerAddress = async (): Promise<{
  success: boolean;
  data?: BackendSignerResponse;
  message?: string;
}> => {
  try {
    console.log("🔑 Getting backend signer address");

    const response = await http.get("/api/courses/backend-signer");

    console.log("✅ Backend signer response:", response.data);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error: unknown) {
    console.error("❌ Backend signer request failed:", error);

    let errorMessage = "Failed to get backend signer address";

    if (error && typeof error === "object") {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      errorMessage =
        err?.response?.data?.message || err?.message || errorMessage;
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
};
