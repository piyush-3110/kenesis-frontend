/**
 * Kenesis Marketplace Contract ABI and Types
 */

export const KENESIS_MARKETPLACE_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_nftContractAddress", type: "address" },
      { internalType: "address", name: "_treasuryWallet", type: "address" },
      {
        internalType: "uint256",
        name: "_marketplaceFeePercent",
        type: "uint256",
      },
      { internalType: "address", name: "_backendSigner", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "AuthorizationAlreadyUsed", type: "error" },
  { inputs: [], name: "AuthorizationExpired", type: "error" },
  { inputs: [], name: "BNBTransferFailed", type: "error" },
  { inputs: [], name: "ECDSAInvalidSignature", type: "error" },
  {
    inputs: [{ internalType: "uint256", name: "length", type: "uint256" }],
    name: "ECDSAInvalidSignatureLength",
    type: "error",
  },
  {
    inputs: [{ internalType: "bytes32", name: "s", type: "bytes32" }],
    name: "ECDSAInvalidSignatureS",
    type: "error",
  },
  { inputs: [], name: "EnforcedPause", type: "error" },
  { inputs: [], name: "ExpectedPause", type: "error" },
  { inputs: [], name: "FeeTooHigh", type: "error" },
  { inputs: [], name: "InsufficientBNB", type: "error" },
  { inputs: [], name: "InvalidAuthorizationHash", type: "error" },
  { inputs: [], name: "InvalidBackendSigner", type: "error" },
  { inputs: [], name: "InvalidPriceFeed", type: "error" },
  { inputs: [], name: "InvalidPriceFeedData", type: "error" },
  { inputs: [], name: "InvalidPriceFromOracle", type: "error" },
  { inputs: [], name: "InvalidPurchaseParams", type: "error" },
  { inputs: [], name: "InvalidTokenOrDecimals", type: "error" },
  { inputs: [], name: "InvalidTreasuryWallet", type: "error" },
  { inputs: [], name: "NoPriceFeedForToken", type: "error" },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  { inputs: [], name: "ParameterMismatch_Amount", type: "error" },
  { inputs: [], name: "ParameterMismatch_Seller", type: "error" },
  { inputs: [], name: "ParameterMismatch_buyer", type: "error" },
  { inputs: [], name: "ParameterMismatch_courseID", type: "error" },
  { inputs: [], name: "PriceFeedStale", type: "error" },
  { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  { inputs: [], name: "TokenAlreadySupported", type: "error" },
  { inputs: [], name: "TokenAmountTooSmall", type: "error" },
  { inputs: [], name: "TokenDecimalsNotSet", type: "error" },
  { inputs: [], name: "TokenNotSupported", type: "error" },
  { inputs: [], name: "USDAmountZero", type: "error" },
  { inputs: [], name: "UnsupportedToken", type: "error" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newSigner",
        type: "address",
      },
    ],
    name: "BackendSignerUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "seller",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "nftId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "courseId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "priceInUSD",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "paymentToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "affiliateAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "affiliateCommission",
        type: "uint256",
      },
    ],
    name: "CoursePurchasedWithNFT",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "SupportedTokenAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "SupportedTokenRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "priceFeed",
        type: "address",
      },
    ],
    name: "TokenPriceFeedUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address", name: "priceFeed", type: "address" },
      { internalType: "uint8", name: "decimals", type: "uint8" },
    ],
    name: "addSupportedToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "authorizationUsed",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "backendSigner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "string", name: "", type: "string" },
    ],
    name: "coursePurchased",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "uint256", name: "priceInUSD", type: "uint256" },
      { internalType: "string", name: "courseId", type: "string" },
      { internalType: "address", name: "buyer", type: "address" },
      { internalType: "uint256", name: "nonce", type: "uint256" },
      { internalType: "uint256", name: "expiryTime", type: "uint256" },
    ],
    name: "generateAuthorizationHash",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "tokenToPayWith", type: "address" },
      { internalType: "uint256", name: "priceInUSD", type: "uint256" },
    ],
    name: "getPaymentAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSupportedTokensCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSupportedTokensList",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "usdAmount", type: "uint256" },
    ],
    name: "getTokenAmountForUSD",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "string", name: "courseId", type: "string" },
    ],
    name: "getUserCourseNFT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "string", name: "courseId", type: "string" },
    ],
    name: "hasPurchasedCourse",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "authHash", type: "bytes32" }],
    name: "isAuthorizationUsed",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "marketplaceFeePercent",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "percent", type: "uint256" }],
    name: "modifyMarketplaceFeePercent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "nftContractAddress",
    outputs: [
      { internalType: "contract IKenesisNFT", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "productSold",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "uint256", name: "priceInUSD", type: "uint256" },
      { internalType: "string", name: "courseId", type: "string" },
      { internalType: "string", name: "courseURI", type: "string" },
      { internalType: "uint256", name: "courseDuration", type: "uint256" },
      { internalType: "address", name: "tokenToPayWith", type: "address" },
      { internalType: "address", name: "affiliateAddress", type: "address" },
      { internalType: "uint256", name: "affiliatePercentage", type: "uint256" },
      { internalType: "bytes", name: "backendAuthHash", type: "bytes" },
    ],
    name: "purchaseCourse",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "removeSupportedToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_treasuryWallet",
        type: "address",
      },
    ],
    name: "setTreasuryWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "supportedTokens",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "supportedTokensList",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "tokenDecimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "tokenPriceFeeds",
    outputs: [
      {
        internalType: "contract AggregatorV3Interface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "treasuryWallet",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_newSigner", type: "address" }],
    name: "updateBackendSigner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "string", name: "", type: "string" },
    ],
    name: "userCourseNFT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ERC20 ABI for token approvals
export const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// TypeScript types for contract interactions
export interface CoursePurchaseParams {
  seller: `0x${string}`;
  priceInUSD: bigint;
  courseURI: string;
  courseDuration: bigint;
  tokenToPayWith: `0x${string}`;
  affiliateAddress: `0x${string}`;
  affiliatePercentage: bigint;
}

export interface CoursePurchasedEvent {
  buyer: `0x${string}`;
  seller: `0x${string}`;
  tokenId: bigint;
  courseURI: string;
  priceInUSD: bigint;
  paymentToken: `0x${string}`;
  affiliateAddress: `0x${string}`;
  affiliateCommission: bigint;
}

export interface PaymentAmount {
  total: bigint;
  marketplaceFee: bigint;
  affiliateCommission: bigint;
  sellerReceives: bigint;
}

export interface ContractError {
  name: string;
  message: string;
  cause?: Error;
}

// Contract error types for better error handling
export const CONTRACT_ERRORS = {
  BNBTransferFailed: "BNBTransferFailed",
  EnforcedPause: "EnforcedPause",
  ExpectedPause: "ExpectedPause",
  FeeTooHigh: "FeeTooHigh",
  InsufficientBNB: "InsufficientBNB",
  InvalidPriceFeed: "InvalidPriceFeed",
  InvalidPriceFeedData: "InvalidPriceFeedData",
  InvalidPriceFromOracle: "InvalidPriceFromOracle",
  InvalidPurchaseParams: "InvalidPurchaseParams",
  InvalidTokenOrDecimals: "InvalidTokenOrDecimals",
  InvalidTreasuryWallet: "InvalidTreasuryWallet",
  NoPriceFeedForToken: "NoPriceFeedForToken",
  PriceFeedStale: "PriceFeedStale",
  TokenAlreadySupported: "TokenAlreadySupported",
  TokenAmountTooSmall: "TokenAmountTooSmall",
  TokenDecimalsNotSet: "TokenDecimalsNotSet",
  TokenNotSupported: "TokenNotSupported",
  USDAmountZero: "USDAmountZero",
  UnsupportedToken: "UnsupportedToken",
} as const;

export type ContractErrorType =
  (typeof CONTRACT_ERRORS)[keyof typeof CONTRACT_ERRORS];
