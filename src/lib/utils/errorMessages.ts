/**
 * Utility functions to convert technical blockchain and API errors
 * into user-friendly messages
 */

interface ErrorMapping {
  pattern: RegExp | string;
  message: string;
}

// Common blockchain error patterns and their user-friendly messages
const BLOCKCHAIN_ERROR_MAPPINGS: ErrorMapping[] = [
  // Insufficient funds errors
  {
    pattern: /insufficient funds|insufficient balance/i,
    message:
      "You don't have enough tokens to complete this purchase. Please check your wallet balance.",
  },

  // Gas estimation errors
  {
    pattern: /gas required exceeds allowance|out of gas|gas limit/i,
    message:
      "Transaction failed due to insufficient gas. Please try again with a higher gas limit.",
  },

  // User rejection
  {
    pattern: /user rejected|user denied|user cancelled/i,
    message:
      "Transaction was cancelled. Please try again to complete your purchase.",
  },

  // Network errors
  {
    pattern: /network error|failed to fetch|connection failed/i,
    message:
      "Network connection issue. Please check your internet connection and try again.",
  },

  // Token approval errors
  {
    pattern: /allowance|approve/i,
    message:
      "Token approval failed. Please approve the token spending and try again.",
  },

  // Contract execution errors
  {
    pattern: /execution reverted|revert|invalid|contract call failed/i,
    message:
      "Transaction failed due to a smart contract issue. Please ensure all requirements are met and try again.",
  },

  // RPC errors
  {
    pattern: /rpc|provider|infura|alchemy/i,
    message:
      "Blockchain network is currently unavailable. Please try again in a moment.",
  },

  // Wallet connection errors
  {
    pattern: /wallet|metamask|connector/i,
    message:
      "Wallet connection issue. Please ensure your wallet is connected and try again.",
  },

  // Timeout errors
  {
    pattern: /timeout|timed out/i,
    message: "Transaction timed out. Please check your wallet and try again.",
  },

  // Nonce errors
  {
    pattern: /nonce|replacement transaction underpriced/i,
    message:
      "Transaction conflict detected. Please wait a moment and try again.",
  },
];

// Backend API error mappings
const API_ERROR_MAPPINGS: ErrorMapping[] = [
  // Authorization errors
  {
    pattern: /authorization|auth|unauthorized|forbidden/i,
    message: "Authorization failed. Please log in again and try your purchase.",
  },

  // Course access errors
  {
    pattern: /course not found|invalid course/i,
    message:
      "The course you're trying to purchase is not available. Please try a different course.",
  },

  // Payment processing errors
  {
    pattern: /payment|billing|invoice/i,
    message:
      "Payment processing failed. Please check your payment method and try again.",
  },

  // Server errors
  {
    pattern: /server error|internal error|500/i,
    message:
      "Our servers are experiencing issues. Please try again in a few moments.",
  },

  // Rate limiting
  {
    pattern: /rate limit|too many requests/i,
    message: "Too many requests. Please wait a moment before trying again.",
  },
];

/**
 * Convert a raw error message to a user-friendly message
 */
export function getErrorMessage(
  error: unknown,
  context: "blockchain" | "api" | "general" = "general"
): string {
  if (!error) {
    return "An unexpected error occurred. Please try again.";
  }

  let errorMessage = "";

  // Extract error message from various error types
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (typeof error === "object" && error !== null) {
    // Handle error objects with different structures
    const errorObj = error as Record<string, unknown>;
    errorMessage =
      String(errorObj.message || errorObj.error || errorObj.reason) ||
      JSON.stringify(error);
  } else {
    errorMessage = String(error);
  }

  // Choose the appropriate error mappings based on context
  let mappings: ErrorMapping[] = [];
  if (context === "blockchain") {
    mappings = BLOCKCHAIN_ERROR_MAPPINGS;
  } else if (context === "api") {
    mappings = API_ERROR_MAPPINGS;
  } else {
    mappings = [...BLOCKCHAIN_ERROR_MAPPINGS, ...API_ERROR_MAPPINGS];
  }

  // Find matching error pattern
  for (const mapping of mappings) {
    const isMatch =
      mapping.pattern instanceof RegExp
        ? mapping.pattern.test(errorMessage)
        : errorMessage.toLowerCase().includes(mapping.pattern.toLowerCase());

    if (isMatch) {
      return mapping.message;
    }
  }

  // If no pattern matches, return a generic friendly message
  // but include some of the original error for debugging if it's short
  if (errorMessage.length < 100) {
    return `Purchase failed: ${errorMessage}. Please try again or contact support if the problem persists.`;
  }

  return "Purchase failed due to an unexpected error. Please try again or contact support if the problem persists.";
}

/**
 * Specific error handler for purchase flows
 */
export function getPurchaseErrorMessage(error: unknown): string {
  return getErrorMessage(error, "blockchain");
}

/**
 * Specific error handler for API calls
 */
export function getApiErrorMessage(error: unknown): string {
  return getErrorMessage(error, "api");
}
