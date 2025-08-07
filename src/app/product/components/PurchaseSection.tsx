import React from "react";
import { useRouter } from "next/navigation";
import { Award, CheckCircle, ShoppingCart, LogIn } from "lucide-react";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { UsePurchaseFlowReturn } from "../hooks/usePurchaseFlow";

interface CourseAccess {
  hasAccess: boolean;
  progress?: number;
}

interface PurchaseSectionProps {
  price: number;
  courseAccess: CourseAccess;
  productId: string;
  purchaseFlow: UsePurchaseFlowReturn;
  className?: string;
}

const PurchaseSection: React.FC<PurchaseSectionProps> = ({
  price,
  courseAccess,
  productId,
  purchaseFlow,
  className = "",
}) => {
  const router = useRouter();

  const {
    purchasing,
    handlePurchase,
    handleWalletConnected,
    purchaseButtonState,
  } = purchaseFlow;

  const renderPurchaseButton = () => {
    if (courseAccess.hasAccess) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-600/20 text-green-400 border border-green-600/30">
            <CheckCircle size={20} />
            <span className="font-medium">You own this course</span>
          </div>

          {courseAccess.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-white font-medium">
                  {courseAccess.progress}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-700"
                  style={{ width: `${courseAccess.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    switch (purchaseButtonState) {
      case "login":
        return (
          <button
            onClick={() => router.push("/auth")}
            className="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-3"
            style={{
              background:
                "linear-gradient(107.31deg, #10B981 -30.5%, #059669 54.41%, #047857 100%)",
              color: "white",
            }}
          >
            <LogIn size={20} />
            Log in to Purchase
          </button>
        );

      case "wallet":
        return (
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-blue-600/20 border border-blue-600/30">
              <p className="text-blue-400 text-sm mb-3">
                Connect your wallet to complete the purchase
              </p>
              <WalletConnectButton
                variant="default"
                onConnected={handleWalletConnected}
                className="w-full"
              />
            </div>
          </div>
        );

      case "purchase":
        return (
          <button
            onClick={() => handlePurchase(productId)}
            disabled={purchasing}
            className="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            style={{
              background: purchasing
                ? "#4a5568"
                : "linear-gradient(107.31deg, #00C9FF -30.5%, #4648FF 54.41%, #0D01F6 100%)",
              color: "white",
            }}
          >
            <ShoppingCart size={20} />
            {purchasing ? "Processing..." : "Purchase Course"}
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-white text-4xl font-bold">${price.toFixed(2)}</div>

      {/* Certificate Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-600/30">
        <Award size={20} />
        <span className="font-medium">Certificate Included</span>
      </div>

      {/* Purchase Status */}
      <div className="space-y-3">{renderPurchaseButton()}</div>
    </div>
  );
};

export default PurchaseSection;
