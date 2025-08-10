import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  bsc,
  sepolia,
  polygonAmoy,
  optimismSepolia,
  arbitrumSepolia,
  baseSepolia,
  bscTestnet,
} from "wagmi/chains";

const isDevelopment = process.env.NODE_ENV === "development";

const getChains = () => {
  if (isDevelopment) {
    return [
      sepolia,
      polygonAmoy,
      optimismSepolia,
      arbitrumSepolia,
      baseSepolia,
      bscTestnet,
    ] as const;
  }
  return [mainnet, polygon, optimism, arbitrum, base, bsc] as const;
};

export const walletConfig = getDefaultConfig({
  appName: "Kenesis",
  projectId:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "fallback-project-id",
  chains: getChains(),
  ssr: true,
});

export const isSupportedChainId = (chainId: number) =>
  [
    1,
    137,
    10,
    42161,
    8453,
    56, // mainnets
    11155111,
    80002,
    11155420,
    421614,
    84532,
    97, // testnets
  ].includes(chainId);
