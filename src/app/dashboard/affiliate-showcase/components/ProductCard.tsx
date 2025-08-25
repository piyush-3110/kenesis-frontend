"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Star,
  TrendingUp,
  Loader2,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";
import { Course } from "../types";
import { useAffiliateShowcaseStore } from "../store/useAffiliateShowcaseStore";
import { useToastStore } from "../store/useToastStore";
import { AFFILIATE_COLORS } from "../constants";
import Image from "next/image";
import { useJoinAffiliate } from "@/features/affiliate/hooks";
import { useCurrentUser } from "@/features/auth/useCurrentUser";

interface ProductCardProps {
  product: Course;
}

/**
 * ProductCard Component
 * Individual product card with promotion functionality
 */
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  useAffiliateShowcaseStore();
  const { addToast } = useToastStore();
  const [isPromoting, setIsPromoting] = useState(false);
  const [isPromoted, setIsPromoted] = useState(false);
  const { data: user } = useCurrentUser();
  const joinMutation = useJoinAffiliate(product.id);

  const handlePromote = async () => {
    setIsPromoting(true);

    try {
      if (!user?.walletAddress) {
        addToast({
          type: "error",
          title: "Wallet Required",
          message:
            "Connect your wallet in Settings to join affiliate programs.",
        });
        return;
      }

      const res = await joinMutation.mutateAsync();

      setIsPromoted(true);
      addToast({
        type: "success",
        title: res.message.includes("rejoined")
          ? "Rejoined Affiliate Program"
          : "Joined Affiliate Program",
        message: `Commission: ${product.affiliatePercentage}% • Ready to promote "${product.title}"`,
        duration: 4000,
      });

      setTimeout(() => setIsPromoted(false), 2000);
    } catch (error: unknown) {
      const err = error as { message?: string };
      const msg =
        typeof err?.message === "string"
          ? err.message
          : "Failed to join affiliate program";
      addToast({ type: "error", title: "Join Failed", message: msg });
    } finally {
      setIsPromoting(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="group relative">
      {/* Card container with gradient border */}
      <div
        className="rounded-xl p-[1px] transition-all duration-300 hover:scale-105"
        style={{
          background: AFFILIATE_COLORS.PRIMARY_BORDER,
        }}
      >
        <div
          className="rounded-xl p-4 h-full flex flex-col"
          style={{
            background: AFFILIATE_COLORS.CARD_BG,
          }}
        >
          {/* Product Image - Clickable */}
          <Link href={`/dashboard/affiliate-showcase/product/${product.id}`}>
            <div className="relative mb-4 cursor-pointer">
              <Image
                src={product.thumbnail || "/images/landing/product.png"}
                alt={product.title}
                className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
                width={500}
                height={200}
              />

              {/* Type indicator */}
              <div className="absolute top-2 right-2">
                <span
                  className="px-2 py-1 text-xs rounded-full"
                  style={{
                    background: AFFILIATE_COLORS.BUTTON_BG,
                    color: AFFILIATE_COLORS.TEXT_PRIMARY,
                    fontFamily: "CircularXX, Inter, sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {product.type.toUpperCase()}
                </span>
              </div>

              {/* Level indicator */}
              <div className="absolute top-2 left-2">
                <span
                  className="px-2 py-1 text-xs rounded-full capitalize"
                  style={{
                    background:
                      product.level === "beginner"
                        ? "rgba(34, 197, 94, 0.2)"
                        : product.level === "intermediate"
                        ? "rgba(251, 191, 36, 0.2)"
                        : "rgba(239, 68, 68, 0.2)",
                    color:
                      product.level === "beginner"
                        ? "#22c55e"
                        : product.level === "intermediate"
                        ? "#fbbf24"
                        : "#ef4444",
                    fontFamily: "CircularXX, Inter, sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {product.level}
                </span>
              </div>
            </div>
          </Link>

          {/* Product Info - Clickable */}
          <Link href={`/dashboard/affiliate-showcase/product/${product.id}`}>
            <div className="flex-1 space-y-3 cursor-pointer hover:opacity-90 transition-opacity">
              {/* Rating, Review Count, and Sales */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400 fill-current" />
                    <span
                      style={{
                        color: AFFILIATE_COLORS.TEXT_PRIMARY,
                        fontFamily: "CircularXX, Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 450,
                      }}
                    >
                      {product.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span
                    style={{
                      color: AFFILIATE_COLORS.TEXT_SECONDARY,
                      fontFamily: "CircularXX, Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 450,
                    }}
                  >
                    ({formatNumber(product.reviewCount)})
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <ShoppingCart size={14} className="text-green-400" />
                  <span
                    style={{
                      color: AFFILIATE_COLORS.TEXT_SECONDARY,
                      fontFamily: "CircularXX, Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 450,
                    }}
                  >
                    {formatNumber(product.soldCount)} sold
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3
                className="line-clamp-2"
                style={{
                  color: AFFILIATE_COLORS.TEXT_PRIMARY,
                  fontFamily: "CircularXX, Inter, sans-serif",
                  fontSize: "18px",
                  fontWeight: 500,
                  lineHeight: "140%",
                }}
              >
                {product.title}
              </h3>

              {/* Instructor */}
              {product.instructor && (
                <p
                  style={{
                    color: AFFILIATE_COLORS.TEXT_MUTED,
                    fontFamily: "CircularXX, Inter, sans-serif",
                    fontSize: "16.4px",
                    fontWeight: 450,
                    lineHeight: "140%",
                  }}
                >
                  by {product.instructor.username || "Unknown Instructor"}
                </p>
              )}

              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {product.categories.slice(0, 2).map((category) => (
                    <span
                      key={category.id}
                      className="px-2 py-1 text-xs rounded-full"
                      style={{
                        background: "rgba(59, 130, 246, 0.1)",
                        color: "#60a5fa",
                        fontFamily: "CircularXX, Inter, sans-serif",
                        fontWeight: 450,
                      }}
                    >
                      {category.name}
                    </span>
                  ))}
                  {product.categories.length > 2 && (
                    <span
                      className="px-2 py-1 text-xs rounded-full"
                      style={{
                        background: "rgba(107, 114, 128, 0.1)",
                        color: "#9ca3af",
                        fontFamily: "CircularXX, Inter, sans-serif",
                        fontWeight: 450,
                      }}
                    >
                      +{product.categories.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Price and Commission */}
              <div className="space-y-1">
                <p
                  style={{
                    color: AFFILIATE_COLORS.TEXT_PRIMARY,
                    fontFamily: "CircularXX, Inter, sans-serif",
                    fontSize: "16.4px",
                    fontWeight: 450,
                    lineHeight: "140%",
                  }}
                >
                  ${product.price.toFixed(2)}
                </p>
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} className="text-green-400" />
                  <span
                    style={{
                      color: AFFILIATE_COLORS.TEXT_SECONDARY,
                      fontFamily: "CircularXX, Inter, sans-serif",
                      fontSize: "16.4px",
                      fontWeight: 450,
                      lineHeight: "140%",
                    }}
                  >
                    Commission: {product.affiliatePercentage}%
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* CTA Button */}
          <button
            onClick={handlePromote}
            disabled={isPromoting || isPromoted || joinMutation.isPending}
            className="w-full mt-4 py-3 rounded-lg font-medium text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: isPromoted
                ? "linear-gradient(90deg, #10B981 0%, #059669 100%)"
                : AFFILIATE_COLORS.BUTTON_BG,
              fontFamily: "CircularXX, Inter, sans-serif",
              fontSize: "16px",
              fontWeight: 500,
            }}
          >
            <div className="flex items-center justify-center gap-2">
              {(isPromoting || joinMutation.isPending) && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {isPromoted && <CheckCircle size={16} />}
              <span>
                {isPromoting || joinMutation.isPending
                  ? "Joining..."
                  : isPromoted
                  ? "Joined!"
                  : "Join affiliate program"}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
