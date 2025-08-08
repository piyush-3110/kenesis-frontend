/**
 * Purchase Confirmation API
 * Handles backend purchase confirmation after successful blockchain transactions
 */

// Environment configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://kenesis-backend.onrender.com";

/**
 * Token Management for API requests
 */
import { TokenManager } from "../tokenManager";

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (): Promise<boolean> => {
  try {
  const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      console.warn("No refresh token available");
      return false;
    }

    console.log("🔄 Refreshing access token...");

    const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      console.error(
        "Failed to refresh token:",
        response.status,
        response.statusText
      );
      return false;
    }

    const data = await response.json();

    if (data.success && (data.data || (data.accessToken && data.refreshToken))) {
      const newAccess = data.data?.accessToken ?? data.accessToken;
      const newRefresh = data.data?.refreshToken ?? data.refreshToken;
      TokenManager.setTokens({ accessToken: newAccess, refreshToken: newRefresh });
      console.log("✅ Access token refreshed successfully");
      return true;
    } else {
      console.error("Token refresh response invalid:", data);
      return false;
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    return false;
  }
};

/**
 * API client with automatic token refresh
 */
const makeApiRequest = async <T>(
  endpoint: string,
  payload: PurchaseConfirmationRequest,
  retryOnAuth = true
): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add Authorization header if access token is available
  const accessToken = TokenManager.getAccessToken();
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  // Handle auth errors - try token refresh
  if (retryOnAuth && (response.status === 401 || response.status === 403)) {
    console.log("🔄 Access token expired, attempting refresh...");

    const refreshSuccess = await refreshAccessToken();
    if (refreshSuccess) {
      // Retry the request with new token
      return makeApiRequest<T>(endpoint, payload, false); // Don't retry again
    } else {
      throw new Error("Authentication failed. Please log in again.");
    }
  }

  // Also handle body-level forbidden errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg: string = errorData?.message ?? response.statusText;
    if (
      retryOnAuth &&
      TokenManager.getRefreshToken() &&
      typeof msg === "string" &&
      ["forbidden", "unauthorized", "jwt expired", "token expired"].some((p) =>
        msg.toLowerCase().includes(p)
      )
    ) {
      console.log("🔄 Detected auth error in response body, attempting refresh...");
      const refreshSuccess = await refreshAccessToken();
      if (refreshSuccess) {
        return makeApiRequest<T>(endpoint, payload, false);
      } else {
        throw new Error("Session expired. Please log in again.");
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
};

export interface PurchaseConfirmationRequest {
  courseId: string; // MongoDB ObjectId of the course
  tokenUsed: string; // Payment token in SYMBOL-CHAINID format (e.g., "USDC-1", "USDT-137")
  purchasePrice: number; // Amount paid for the course
  transactionHash?: string; // Blockchain transaction hash (hex only, no 0x prefix)
  nftId?: string; // NFT ID if purchase includes an NFT
  affiliateCode?: string; // Ethereum wallet address of affiliate
}

export interface PurchaseRecord {
  id: string; // Purchase record ID
  courseId: string; // Course ID
  purchasePrice: number; // Amount paid
  tokenUsed: string; // Payment token used
  purchasedAt: Date; // Purchase timestamp
  expiresAt?: Date; // Access expiration (if course has time limit)
  hasAccess: true; // Always true for successful purchase
  nftId?: string; // NFT ID if applicable
}

export interface CourseAccess {
  hasAccess: true; // Access status
  expiresAt?: Date; // When access expires (if applicable)
  remainingDays: number | null; // Days remaining or null for lifetime access
}

export interface PurchaseConfirmationResponse {
  success: true;
  message: string;
  data: {
    purchase: PurchaseRecord;
    courseAccess: CourseAccess;
  };
}

export interface PurchaseConfirmationError {
  success: false;
  message: string;
  data: null;
}

/**
 * Confirm a purchase with the backend after successful blockchain transaction
 */
export const confirmPurchase = async (
  request: PurchaseConfirmationRequest
): Promise<PurchaseConfirmationResponse> => {
  try {
    console.log("🔄 Confirming purchase with backend...");
    console.log("📋 Request payload:", JSON.stringify(request, null, 2));

    const response = await makeApiRequest<PurchaseConfirmationResponse>(
      "/api/courses/purchases/confirm",
      request
    );

    console.log("✅ Purchase confirmed successfully:", response);
    return response;
  } catch (error: unknown) {
    console.error("❌ Purchase confirmation failed:", error);

    // Handle errors properly
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    // Handle unexpected error types
    throw new Error("Failed to confirm purchase with backend");
  }
};

/**
 * Helper to create purchase confirmation request from blockchain transaction data
 */
export const createPurchaseConfirmationRequest = (params: {
  courseId: string;
  tokenString: string; // e.g., "USDT-137"
  purchasePrice: number;
  transactionHash: string;
  nftTokenId?: bigint;
  affiliateAddress?: string;
}): PurchaseConfirmationRequest => {
  // Keep the full token string format (SYMBOL-CHAINID) as required by backend
  const tokenUsed = params.tokenString;

  // Remove "0x" prefix from transaction hash as backend expects hex-only
  const cleanTransactionHash = params.transactionHash.startsWith("0x")
    ? params.transactionHash.slice(2)
    : params.transactionHash;

  console.log("🔧 Creating purchase confirmation request:");
  console.log("  - Course ID:", params.courseId);
  console.log("  - Token String (input):", params.tokenString);
  console.log("  - Token Used (output):", tokenUsed);
  console.log("  - Purchase Price:", params.purchasePrice);
  console.log("  - Transaction Hash (input):", params.transactionHash);
  console.log("  - Transaction Hash (output):", cleanTransactionHash);
  console.log("  - NFT Token ID:", params.nftTokenId?.toString());
  console.log("  - Affiliate Address:", params.affiliateAddress);

  const request = {
    courseId: params.courseId,
    tokenUsed: tokenUsed, // Use full format: "USDT-137"
    purchasePrice: params.purchasePrice,
    transactionHash: cleanTransactionHash, // Remove 0x prefix
    nftId: params.nftTokenId?.toString(),
    affiliateCode: params.affiliateAddress,
  };

  console.log("📦 Final request object:", JSON.stringify(request, null, 2));

  return request;
};

/**
 * Complete purchase flow: blockchain transaction + backend confirmation
 */
export const completePurchaseFlow = async (params: {
  courseId: string;
  tokenString: string;
  purchasePrice: number;
  transactionHash: string;
  nftTokenId?: bigint;
  affiliateAddress?: string;
}): Promise<{
  success: boolean;
  purchase?: PurchaseRecord;
  courseAccess?: CourseAccess;
  error?: string;
}> => {
  try {
    const confirmationRequest = createPurchaseConfirmationRequest(params);
    const result = await confirmPurchase(confirmationRequest);

    return {
      success: true,
      purchase: result.data.purchase,
      courseAccess: result.data.courseAccess,
    };
  } catch (error) {
    console.error("Complete purchase flow failed:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Purchase completion failed",
    };
  }
};
