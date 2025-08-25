import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  bsc,
  // Testnets
  sepolia,
  bscTestnet,
} from "wagmi/chains";

// Get environment
const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV === "development";

// Chain configuration based on environment
const getChains = () => {
  if (isDevelopment) {
    return [sepolia, bscTestnet] as const; // Local development with hardhat + sepolia for testing
  }

  // Production
  return [
    mainnet, // Ethereum
    polygon, // Polygon
    optimism, // Optimism
    arbitrum, // Arbitrum
    base, // Base
    bsc, // Binance Smart Chain
  ] as const;
};

export const walletConfig = getDefaultConfig({
  appName: "Kenesis",
  projectId:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "fallback-project-id",
  chains: getChains(),
  ssr: true,
});

// Developer warning for missing WalletConnect Project ID
if (
  typeof window !== "undefined" &&
  (!process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID === "fallback-project-id")
) {
  console.warn(
    "[WalletConfig] NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is missing or using fallback. This can cause connection/signature issues in some wallets."
  );
}

// Helper function to get current chain ID for API calls
export const getCurrentChainId = (): number => {
  if (typeof window === "undefined") {
    // SSR fallback - return default based on environment
    if (isDevelopment) return 11155111; // Sepolia for development
    return 1; // Mainnet for production
  }

  // Get from localStorage or default based on environment
  const storedChainId = localStorage.getItem("kenesis-selected-chain");
  if (storedChainId) {
    const chainId = parseInt(storedChainId, 10);
    // Validate that the stored chain ID is supported
    if (CHAIN_METADATA[chainId as SupportedChainId]) {
      return chainId;
    }
  }

  // Default chain IDs based on environment
  if (isDevelopment) return 11155111; // Sepolia for development (matches getChains config)
  return 1; // Mainnet for production
};

// Helper to store selected chain
export const setCurrentChainId = (chainId: number): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("kenesis-selected-chain", chainId.toString());
  }
};

// Chain metadata for display purposes
export const CHAIN_METADATA = {
  // Mainnets
  1: { name: "Ethereum", symbol: "ETH", isTestnet: false },
  137: { name: "Polygon", symbol: "MATIC", isTestnet: false },
  10: { name: "Optimism", symbol: "ETH", isTestnet: false },
  42161: { name: "Arbitrum", symbol: "ETH", isTestnet: false },
  8453: { name: "Base", symbol: "ETH", isTestnet: false },
  56: { name: "BSC", symbol: "BNB", isTestnet: false },

  // Testnets
  11155111: { name: "Sepolia", symbol: "SepoliaETH", isTestnet: true },
  80002: { name: "Polygon Amoy", symbol: "MATIC", isTestnet: true },
  11155420: { name: "OP Sepolia", symbol: "ETH", isTestnet: true },
  421614: { name: "Arbitrum Sepolia", symbol: "ETH", isTestnet: true },
  84532: { name: "Base Sepolia", symbol: "ETH", isTestnet: true },
  97: { name: "BSC Testnet", symbol: "BNB", isTestnet: true },

  // Local
  // Sepolia
};

export type SupportedChainId = keyof typeof CHAIN_METADATA;

// Helper function to check if a chain ID is supported
export const isSupportedChainId = (
  chainId: number
): chainId is SupportedChainId => {
  return chainId in CHAIN_METADATA;
};

// Helper function to get a fallback supported chain ID if current one is not supported
export const getSupportedChainId = (chainId: number): SupportedChainId => {
  if (isSupportedChainId(chainId)) {
    return chainId;
  }
  // Return default based on environment
  if (isDevelopment) return 11155111; // Sepolia
  return 1; // Mainnet
};
