import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIsAuthenticated, useAuthUser } from "@/store/useAuthStore";
import { purchaseCourse } from "@/lib/productApi";

export interface UsePurchaseFlowReturn {
  purchasing: boolean;
  isAuthenticated: boolean;
  isWalletConnected: boolean;
  handlePurchase: (productId: string) => Promise<void>;
  handleWalletConnected: () => void;
  canPurchase: boolean;
  purchaseButtonState: "login" | "wallet" | "purchase";
}

export const usePurchaseFlow = (
  onSuccess?: () => void
): UsePurchaseFlowReturn => {
  const [purchasing, setPurchasing] = useState(false);
  const router = useRouter();

  // Authentication and wallet state
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser();
  const isWalletConnected = Boolean(
    user?.walletAddress && user?.isWalletConnected
  );

  const handlePurchase = async (productId: string) => {
    if (purchasing) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    // Check if wallet is connected
    if (!isWalletConnected) {
      console.warn("Wallet not connected, but purchase attempted");
      return;
    }

    // Both authenticated and wallet connected - proceed with purchase
    setPurchasing(true);
    try {
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
  };
};
