import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useIsAuthenticated, useAuthUser } from "@/store/auth";
import { purchaseCourse } from "@/lib/productApi";
import { purchaseCourseWithNFT } from "@/lib/nft/purchaseFlow";
import type { CourseResponse } from "@/lib/api/courseApi";
import type { PurchaseWithNFTResult } from "@/lib/nft/purchaseFlow";

export interface UsePurchaseFlowReturn {
  purchasing: boolean;
  isAuthenticated: boolean;
  isWalletConnected: boolean;
  handlePurchase: (
    productId: string,
    selectedToken?: string | null,
    course?: CourseResponse
  ) => Promise<void>;
  handleWalletConnected: () => void;
  canPurchase: boolean;
  purchaseButtonState: "login" | "wallet" | "purchase";
  nftResult?: PurchaseWithNFTResult | null;
}

export const usePurchaseFlow = (
  onSuccess?: () => void
): UsePurchaseFlowReturn => {
  const [purchasing, setPurchasing] = useState(false);
  const [nftResult, setNftResult] = useState<PurchaseWithNFTResult | null>(
    null
  );
  const router = useRouter();

  // Authentication and wallet state
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser();
  const { address: connectedWalletAddress } = useAccount();

  const isWalletConnected = Boolean(
    user?.walletAddress && user?.isWalletConnected && connectedWalletAddress
  );

  const handlePurchase = async (
    productId: string,
    selectedToken?: string | null,
    course?: CourseResponse
  ) => {
    if (purchasing) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    // Check if wallet is connected
    if (!isWalletConnected || !connectedWalletAddress) {
      console.warn("Wallet not connected, but purchase attempted");
      return;
    }

    setPurchasing(true);
    setNftResult(null);

    try {
      // If we have course data and a selected token, create NFT metadata
      if (course && selectedToken) {
        console.log("Creating NFT metadata for course purchase...");

        const nftPurchaseResult = await purchaseCourseWithNFT({
          course,
          selectedToken,
          walletAddress: connectedWalletAddress,
        });

        setNftResult(nftPurchaseResult);

        if (nftPurchaseResult.success) {
          console.log(
            "NFT metadata created successfully:",
            nftPurchaseResult.nftMetadataUri
          );
        } else {
          console.error(
            "NFT metadata creation failed:",
            nftPurchaseResult.error
          );
        }
      }

      // TODO: Continue with traditional purchase flow
      // For now, we'll log the selected token and proceed with the current API
      console.log("Purchasing course with token:", selectedToken);
      const result = await purchaseCourse(productId);

      if (result.success) {
        onSuccess?.();
      }
    } catch (error) {
      console.error("Failed to purchase course:", error);
    } finally {
      setPurchasing(false);
    }
  };

  const handleWalletConnected = () => {
    // This will be called after wallet connection is successful
    // The purchase button will be enabled automatically
  };

  // Determine what state the purchase button should be in
  const getPurchaseButtonState = (): "login" | "wallet" | "purchase" => {
    if (!isAuthenticated) return "login";
    if (!isWalletConnected) return "wallet";
    return "purchase";
  };

  return {
    purchasing,
    isAuthenticated,
    isWalletConnected,
    handlePurchase,
    handleWalletConnected,
    canPurchase: isAuthenticated && isWalletConnected,
    purchaseButtonState: getPurchaseButtonState(),
    nftResult,
  };
};
