/**
 * Purchase Confirmation API
 * Handles backend purchase confirmation after successful blockchain transactions
 */

import { parseTokenString } from '@/lib/contracts/chainConfig';

// Environment configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://kenesis-backend.onrender.com";

/**
 * Token Management for API requests
 */
const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kenesis_access_token");
};

/**
 * Simple API client for purchase confirmation
 */
const makeApiRequest = async <T>(endpoint: string, payload: PurchaseConfirmationRequest): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add Authorization header if access token is available
  const accessToken = getAccessToken();
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

export interface PurchaseConfirmationRequest {
  courseId: string;              // MongoDB ObjectId of the course
  tokenUsed: string;             // Payment token address (e.g., "USDC", "ETH")
  purchasePrice: number;         // Amount paid for the course
  transactionHash?: string;      // Blockchain transaction hash
  nftId?: string;               // NFT ID if purchase includes an NFT
  affiliateCode?: string;        // Ethereum wallet address of affiliate
}

export interface PurchaseRecord {
  id: string;                    // Purchase record ID
  courseId: string;              // Course ID
  purchasePrice: number;         // Amount paid
  tokenUsed: string;             // Payment token used
  purchasedAt: Date;             // Purchase timestamp
  expiresAt?: Date;              // Access expiration (if course has time limit)
  hasAccess: true;               // Always true for successful purchase
  nftId?: string;                // NFT ID if applicable
}

export interface CourseAccess {
  hasAccess: true;               // Access status
  expiresAt?: Date;              // When access expires (if applicable)
  remainingDays: number | null;  // Days remaining or null for lifetime access
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
    console.log('🔄 Confirming purchase with backend:', request);

    const response = await makeApiRequest<PurchaseConfirmationResponse>(
      '/api/courses/purchases/confirm',
      request
    );

    console.log('✅ Purchase confirmed successfully:', response);
    return response;
  } catch (error: unknown) {
    console.error('❌ Purchase confirmation failed:', error);

    // Handle errors properly
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    // Handle unexpected error types
    throw new Error('Failed to confirm purchase with backend');
  }
};

/**
 * Helper to create purchase confirmation request from blockchain transaction data
 */
export const createPurchaseConfirmationRequest = (params: {
  courseId: string;
  tokenString: string;           // e.g., "USDT-137"
  purchasePrice: number;
  transactionHash: string;
  nftTokenId?: bigint;
  affiliateAddress?: string;
}): PurchaseConfirmationRequest => {
  const { symbol } = parseTokenString(params.tokenString);
  
  return {
    courseId: params.courseId,
    tokenUsed: symbol,
    purchasePrice: params.purchasePrice,
    transactionHash: params.transactionHash,
    nftId: params.nftTokenId?.toString(),
    affiliateCode: params.affiliateAddress,
  };
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
    console.error('Complete purchase flow failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Purchase completion failed',
    };
  }
};
