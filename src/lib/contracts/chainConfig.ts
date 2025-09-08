/**
 * Chain Configuration for Kenesis Marketplace Smart Contracts
 * Defines supported chains, tokens, and contract addresses for each environment
 */

import { arbitrum, base, bsc, bscTestnet, optimism, polygon, sepolia } from "viem/chains";

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
            chainId: sepolia.id, // Sepolia
            name: sepolia.name,
            nativeSymbol: sepolia.nativeCurrency.symbol,
            contractAddress: "0xec1b9345B25df1661CD2336128355a33F8c62936", // Deployed Sepolia contract
            nftContractAddress:
                process.env.NEXT_PUBLIC_SEPOLIA_NFT_CONTRACT || "0x2E5019f4903BB824EdcEb7a8cf5337fceeb77199", // Deployed Sepolia NFT contract
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
        {
            chainId: bscTestnet.id, // BSC Testnet
            name: bscTestnet.name,
            nativeSymbol: bscTestnet.nativeCurrency.symbol,
            contractAddress:
                process.env.NEXT_PUBLIC_BSC_MARKETPLACE_CONTRACT || "0x3110faB13A44C694Cd2EB3a8f1cD129C4Ae620E1",
            nftContractAddress:
                process.env.NEXT_PUBLIC_BSC_NFT_CONTRACT || "0x6C501bc510F026a20945d810A95ACb6e82567df3",
            supportedTokens: [
                createNativeToken("BNB"),
                {
                    symbol: "USDT",
                    address: "0xf09D0b4171bF7b72d15BC4dbb7109Ca121924fc1",
                    decimals: 18,
                },
            ],
            blockExplorer: "https://testnet.bscscan.com",
        },
    ],

    // Production - mainnet configurations
    production: [
        {
            chainId: bsc.id, // BSC Mainnet
            name: bsc.name,
            nativeSymbol: bsc.nativeCurrency.symbol,
            contractAddress:
                process.env.NEXT_PUBLIC_BSC_MARKETPLACE_CONTRACT || "0x0000000000000000000000000000000000000000",
            nftContractAddress:
                process.env.NEXT_PUBLIC_BSC_NFT_CONTRACT || "0x0000000000000000000000000000000000000000",
            supportedTokens: [
                createNativeToken(bsc.nativeCurrency.symbol),
                {
                    symbol: "WETH",
                    address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
                    decimals: 18,
                },
                {
                    symbol: "USDT",
                    decimals: 18,
                    address: "0x55d398326f99059ff775485246999027b3197955",
                },
                {
                    symbol: "USDC",
                    decimals: 18,
                    address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
                },
                {
                    symbol: "USD1",
                    address: "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d",
                    decimals: 18,
                },
            ],
            blockExplorer: "https://bscscan.com",
        },
        {
            chainId: polygon.id, // Polygon
            name: polygon.name,
            nativeSymbol: polygon.nativeCurrency.symbol,
            contractAddress:
                process.env.NEXT_PUBLIC_POLYGON_MARKETPLACE_CONTRACT || "0x0000000000000000000000000000000000000000", // TODO: Deploy contract
            nftContractAddress:
                process.env.NEXT_PUBLIC_POLYGON_NFT_CONTRACT || "0x0000000000000000000000000000000000000000", // TODO: Deploy NFT contract
            supportedTokens: [
                createNativeToken(polygon.nativeCurrency.symbol),
                {
                    ...USDT_CONFIG,
                    address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // USDT on Polygon
                },
                {
                    ...USDC_CONFIG,
                    address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC on Polygon
                },
            ],
            blockExplorer: "https://polygonscan.com",
        },
        {
            chainId: optimism.id, // Optimism
            name: optimism.name,
            nativeSymbol: optimism.nativeCurrency.symbol,
            contractAddress:
                process.env.NEXT_PUBLIC_OPTIMISM_MARKETPLACE_CONTRACT || "0x0000000000000000000000000000000000000000", // TODO: Deploy contract
            nftContractAddress:
                process.env.NEXT_PUBLIC_OPTIMISM_NFT_CONTRACT || "0x0000000000000000000000000000000000000000", // TODO: Deploy NFT contract
            supportedTokens: [
                createNativeToken(optimism.nativeCurrency.symbol),
                {
                    ...USDT_CONFIG,
                    address: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58", // USDT on Optimism
                },
                {
                    ...USDC_CONFIG,
                    address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDC on Optimism
                },
            ],
            blockExplorer: "https://optimistic.etherscan.io",
        },
        {
            chainId: arbitrum.id, // Arbitrum
            name: arbitrum.name,
            nativeSymbol: arbitrum.nativeCurrency.symbol,
            contractAddress:
                process.env.NEXT_PUBLIC_ARBITRUM_MARKETPLACE_CONTRACT || "0x0000000000000000000000000000000000000000", // TODO: Deploy contract
            nftContractAddress:
                process.env.NEXT_PUBLIC_ARBITRUM_NFT_CONTRACT || "0x0000000000000000000000000000000000000000", // TODO: Deploy NFT contract
            supportedTokens: [
                createNativeToken(arbitrum.nativeCurrency.symbol),
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
            chainId: base.id, // Base
            name: base.name,
            nativeSymbol: base.nativeCurrency.symbol,
            contractAddress:
                process.env.NEXT_PUBLIC_BASE_MARKETPLACE_CONTRACT || "0x0000000000000000000000000000000000000000", // TODO: Deploy contract
            nftContractAddress:
                process.env.NEXT_PUBLIC_BASE_NFT_CONTRACT || "0x0000000000000000000000000000000000000000", // TODO: Deploy NFT contract
            supportedTokens: [
                createNativeToken(base.nativeCurrency.symbol),
                {
                    ...USDT_CONFIG,
                    address: "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2", // USDT on Base
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
        return process.env.NEXT_PUBLIC_NODE_ENV === "development" ? "development" : "production";
    }

    const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV === "development";

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
    return configs.find(config => config.chainId === chainId);
};

// Check if a chain is supported in current environment
export const isSupportedChain = (chainId: number): boolean => {
    return !!getChainConfig(chainId);
};

// Get all supported chain IDs for current environment
export const getSupportedChainIds = (): number[] => {
    return getCurrentChainConfigs().map(config => config.chainId);
};

// Parse token string (e.g., "USDT-137" -> { symbol: "USDT", chainId: 137 })
export const parseTokenString = (tokenString: string): { symbol: string; chainId: number } => {
    const [symbol, chainIdStr] = tokenString.split("-");
    const chainId = parseInt(chainIdStr, 10);

    if (!symbol || !chainId || isNaN(chainId)) {
        throw new Error(`Invalid token string format: ${tokenString}. Expected format: "SYMBOL-CHAINID"`);
    }

    return { symbol, chainId };
};

// Get token config from token string
export const getTokenConfig = (tokenString: string): TokenConfig | undefined => {
    try {
        const { symbol, chainId } = parseTokenString(tokenString);
        const chainConfig = getChainConfig(chainId);

        if (!chainConfig) {
            return undefined;
        }

        return chainConfig.supportedTokens.find(token => token.symbol === symbol);
    } catch {
        return undefined;
    }
};

// Check if a token is supported on a specific chain
export const isTokenSupported = (tokenString: string): boolean => {
    return !!getTokenConfig(tokenString);
};

// Get the chain ID from a token string
export const getChainIdFromToken = (tokenString: string): number | undefined => {
    try {
        const { chainId } = parseTokenString(tokenString);
        return isSupportedChain(chainId) ? chainId : undefined;
    } catch {
        return undefined;
    }
};

// Helper to convert our token format to contract-compatible format
export const getContractTokenAddress = (tokenString: string): string | undefined => {
    const tokenConfig = getTokenConfig(tokenString);
    return tokenConfig?.address;
};

// Helper to get native token for a chain
export const getNativeToken = (chainId: number): TokenConfig | undefined => {
    const chainConfig = getChainConfig(chainId);
    return chainConfig?.supportedTokens.find(token => token.isNative);
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
