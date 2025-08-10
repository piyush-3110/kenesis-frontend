/**
 * Chain Configuration for Kenesis Marketplace Smart Contracts
 * Defines supported chains, tokens, and contract addresses for each environment
 */

export interface TokenConfig {
  symbol: string;
  address: string;
  decimals: number;
  isNative?: boolean; // true for BNB, ETH, etc.
  priceFeedAddress?: string; // Chainlink price feed address
}

export interface ChainConfig {
  chainId: number;
  name: string;
  nativeSymbol: string;
  contractAddress: string; // Kenesis Marketplace contract address
  nftContractAddress: string; // Kenesis NFT contract address
  supportedTokens: TokenConfig[];
  blockExplorer: string;
}

export interface EnvironmentConfig {
  development: ChainConfig[];
  production: ChainConfig[];
}

// Native token configurations (BNB, ETH, etc.)
const createNativeToken = (symbol: string): TokenConfig => ({
  symbol,
  address: "0x0000000000000000000000000000000000000000", // address(0) for native tokens
  decimals: 18,
  isNative: true,
});

// Common token configurations across chains
const USDT_CONFIG = {
  symbol: "USDT",
  decimals: 6, // USDT typically has 6 decimals
};

const USDC_CONFIG = {
  symbol: "USDC",
  decimals: 6, // USDC typically has 6 decimals
};

// Chain configurations for different environments
export const CHAIN_CONFIGS: EnvironmentConfig = {
  // Development - using Sepolia testnet only
  development: [
    {
      chainId: 11155111, // Sepolia
      name: "Sepolia Testnet",
      nativeSymbol: "ETH",
      contractAddress: "0xe72fdF3fF7cF6966af81d986092A123a14eA24fd", // Deployed Sepolia contract
      nftContractAddress:
        process.env.NEXT_PUBLIC_SEPOLIA_NFT_CONTRACT ||
        "0x2E5019f4903BB824EdcEb7a8cf5337fceeb77199", // Deployed Sepolia NFT contract
      supportedTokens: [
        createNativeToken("ETH"),
        {
          symbol: "USDT",
          decimals: 18,
          address: "0xF685446B8d20e45D837320B8258d5Fd1AfC8F594", // Sepolia USDT
        },
        {
          symbol: "USDC",
          decimals: 6,
          address: "0xc509C8cFeB4478009CcC2e7eC5Eb4F0eb57C8b7e", // Sepolia USDC
        },
      ],
      blockExplorer: "https://sepolia.etherscan.io",
    },
  ],

  // Production - mainnet configurations
  production: [
    {
      chainId: 1, // Ethereum Mainnet
      name: "Ethereum",
      nativeSymbol: "ETH",
      contractAddress:
        process.env.NEXT_PUBLIC_ETHEREUM_MARKETPLACE_CONTRACT ||
        "0x0000000000000000000000000000000000000000", // TODO: Deploy contract
      nftContractAddress:
        process.env.NEXT_PUBLIC_ETHEREUM_NFT_CONTRACT ||
        "0x0000000000000000000000000000000000000000", // TODO: Deploy NFT contract
      supportedTokens: [
        createNativeToken("ETH"),
        {
          symbol: "WETH",
          address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          decimals: 18,
        },
        {
          ...USDT_CONFIG,
          address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT on Ethereum
        },
        {
          ...USDC_CONFIG,
          address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on Ethereum
        },
        {
          symbol: "LINK",
          address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
          decimals: 18,
        },
        {
          symbol: "MATIC",
          address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
          decimals: 18,
        },
      ],
      blockExplorer: "https://etherscan.io",
    },
    {
      chainId: 137, // Polygon
      name: "Polygon",
      nativeSymbol: "MATIC",
      contractAddress:
        process.env.NEXT_PUBLIC_POLYGON_MARKETPLACE_CONTRACT ||
        "0x0000000000000000000000000000000000000000", // TODO: Deploy contract
      nftContractAddress:
        process.env.NEXT_PUBLIC_POLYGON_NFT_CONTRACT ||
        "0x0000000000000000000000000000000000000000", // TODO: Deploy NFT contract
      supportedTokens: [
        createNativeToken("MATIC"),
        {
          symbol: "WETH",
          address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
          decimals: 18,
        },
        {
          ...USDT_CONFIG,
          address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // USDT on Polygon
        },
        {
          ...USDC_CONFIG,
          address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC on Polygon
        },
      ],
      blockExplorer: "https://polygonscan.com",
    },
    {
      chainId: 56, // BSC
      name: "Binance Smart Chain",
      nativeSymbol: "BNB",
      contractAddress:
        process.env.NEXT_PUBLIC_BSC_MARKETPLACE_CONTRACT ||
        "0x0000000000000000000000000000000000000000", // TODO: Deploy contract
      nftContractAddress:
        process.env.NEXT_PUBLIC_BSC_NFT_CONTRACT ||
        "0x0000000000000000000000000000000000000000", // TODO: Deploy NFT contract
      supportedTokens: [
        createNativeToken("BNB"),
        {
          symbol: "WBNB",
          address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
          decimals: 18,
        },
        {
          symbol: "WETH",
          address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
          decimals: 18,
        },
        {
          ...USDT_CONFIG,
          address: "0x55d398326f99059fF775485246999027B3197955", // USDT on BSC
        },
        {
          ...USDC_CONFIG,
          address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC on BSC
        },
        {
          symbol: "LINK",
          address: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
          decimals: 18,
        },
        {
          symbol: "MATIC",
          address: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
          decimals: 18,
        },
        {
          symbol: "XRP",
          address: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
          decimals: 6,
        },
      ],
      blockExplorer: "https://bscscan.com",
    },
    {
      chainId: 10, // Optimism
      name: "Optimism",
      nativeSymbol: "ETH",
      contractAddress:
        process.env.NEXT_PUBLIC_OPTIMISM_MARKETPLACE_CONTRACT ||
        "0x0000000000000000000000000000000000000000", // TODO: Deploy contract
      nftContractAddress:
        process.env.NEXT_PUBLIC_OPTIMISM_NFT_CONTRACT ||
        "0x0000000000000000000000000000000000000000", // TODO: Deploy NFT contract
      supportedTokens: [
        createNativeToken("ETH"),
        {
          symbol: "WETH",
          address: "0x4200000000000000000000000000000000000006",
          decimals: 18,
        },
        {
          ...USDT_CONFIG,
          address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", // USDT on Optimism
        },
        {
          ...USDC_CONFIG,
          address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDC on Optimism
        },
      ],
      blockExplorer: "https://optimistic.etherscan.io",
    },
    {
      chainId: 42161, // Arbitrum
      name: "Arbitrum",
      nativeSymbol: "ETH",
      contractAddress:
        process.env.NEXT_PUBLIC_ARBITRUM_MARKETPLACE_CONTRACT ||
        "0x0000000000000000000000000000000000000000", // TODO: Deploy contract
      nftContractAddress:
        process.env.NEXT_PUBLIC_ARBITRUM_NFT_CONTRACT ||
        "0x0000000000000000000000000000000000000000", // TODO: Deploy NFT contract
      supportedTokens: [
        createNativeToken("ETH"),
        {
          symbol: "WETH",
          address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
          decimals: 18,
        },
        {
          ...USDT_CONFIG,
          address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT on Arbitrum
        },
        {
          ...USDC_CONFIG,
          address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC on Arbitrum
        },
      ],
      blockExplorer: "https://arbiscan.io",
    },
    {
      chainId: 8453, // Base
      name: "Base",
      nativeSymbol: "ETH",
      contractAddress:
        process.env.NEXT_PUBLIC_BASE_MARKETPLACE_CONTRACT ||
        "0x0000000000000000000000000000000000000000", // TODO: Deploy contract
      nftContractAddress:
        process.env.NEXT_PUBLIC_BASE_NFT_CONTRACT ||
        "0x0000000000000000000000000000000000000000", // TODO: Deploy NFT contract
      supportedTokens: [
        createNativeToken("ETH"),
        {
          symbol: "WETH",
          address: "0x4200000000000000000000000000000000000006",
          decimals: 18,
        },
        {
          ...USDT_CONFIG,
          address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", // USDT on Base
        },
        {
          ...USDC_CONFIG,
          address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
        },
      ],
      blockExplorer: "https://basescan.org",
    },
  ],
};

// Environment detection
const getEnvironment = (): keyof EnvironmentConfig => {
  if (typeof window === "undefined") {
    // SSR fallback
    return process.env.NODE_ENV === "development"
      ? "development"
      : "production";
  }

  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) return "development";
  return "production";
};

// Get current environment's chain configs
export const getCurrentChainConfigs = (): ChainConfig[] => {
  const environment = getEnvironment();
  return CHAIN_CONFIGS[environment];
};

// Get chain config by chain ID
export const getChainConfig = (chainId: number): ChainConfig | undefined => {
  const configs = getCurrentChainConfigs();
  return configs.find((config) => config.chainId === chainId);
};

// Check if a chain is supported in current environment
export const isSupportedChain = (chainId: number): boolean => {
  return !!getChainConfig(chainId);
};

// Get all supported chain IDs for current environment
export const getSupportedChainIds = (): number[] => {
  return getCurrentChainConfigs().map((config) => config.chainId);
};

// Parse token string (e.g., "USDT-137" -> { symbol: "USDT", chainId: 137 })
export const parseTokenString = (
  tokenString: string
): { symbol: string; chainId: number } => {
  const [symbol, chainIdStr] = tokenString.split("-");
  const chainId = parseInt(chainIdStr, 10);

  if (!symbol || !chainId || isNaN(chainId)) {
    throw new Error(
      `Invalid token string format: ${tokenString}. Expected format: "SYMBOL-CHAINID"`
    );
  }

  return { symbol, chainId };
};

// Get token config from token string
export const getTokenConfig = (
  tokenString: string
): TokenConfig | undefined => {
  try {
    const { symbol, chainId } = parseTokenString(tokenString);
    const chainConfig = getChainConfig(chainId);

    if (!chainConfig) {
      return undefined;
    }

    return chainConfig.supportedTokens.find((token) => token.symbol === symbol);
  } catch {
    return undefined;
  }
};

// Check if a token is supported on a specific chain
export const isTokenSupported = (tokenString: string): boolean => {
  return !!getTokenConfig(tokenString);
};

// Get the chain ID from a token string
export const getChainIdFromToken = (
  tokenString: string
): number | undefined => {
  try {
    const { chainId } = parseTokenString(tokenString);
    return isSupportedChain(chainId) ? chainId : undefined;
  } catch {
    return undefined;
  }
};

// Helper to convert our token format to contract-compatible format
export const getContractTokenAddress = (
  tokenString: string
): string | undefined => {
  const tokenConfig = getTokenConfig(tokenString);
  return tokenConfig?.address;
};

// Helper to get native token for a chain
export const getNativeToken = (chainId: number): TokenConfig | undefined => {
  const chainConfig = getChainConfig(chainId);
  return chainConfig?.supportedTokens.find((token) => token.isNative);
};

// Helper to validate if a token list is valid for purchase
export const validateTokensForPurchase = (
  tokensToPayWith: string[]
): {
  valid: boolean;
  invalidTokens: string[];
  supportedChains: number[];
} => {
  const invalidTokens: string[] = [];
  const supportedChains = new Set<number>();

  for (const tokenString of tokensToPayWith) {
    if (!isTokenSupported(tokenString)) {
      invalidTokens.push(tokenString);
    } else {
      const chainId = getChainIdFromToken(tokenString);
      if (chainId) {
        supportedChains.add(chainId);
      }
    }
  }

  return {
    valid: invalidTokens.length === 0,
    invalidTokens,
    supportedChains: Array.from(supportedChains),
  };
};
