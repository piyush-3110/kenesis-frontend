"use client";

import type { ExtendedProduct } from "@/types/Review";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  PlayCircle,
  FileText,
  CheckCircle,
  ShoppingCart,
  Lock,
} from "lucide-react";
import { forwardRef } from "react";

interface ProductCardProps {
  product: ExtendedProduct;
}

const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product }, ref) => {
    const isPurchased = Boolean(
      product.isPurchased || product.courseAccess?.hasAccess
    );

    const getAccessBadge = () => {
      if (isPurchased) {
        return (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-green-600/90 backdrop-blur-sm">
            <CheckCircle size={12} className="text-white" />
            <span className="text-white text-xs font-medium">Owned</span>
          </div>
        );
      }

      switch (isPurchased ? "owned" : "none") {
        case "none":
        default:
          return (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-red-600/90 backdrop-blur-sm">
              <Lock size={12} className="text-white" />
              <span className="text-white text-xs font-medium">Locked</span>
            </div>
          );
      }
    };

    const getPurchaseButton = () => {
      if (isPurchased) {
        return (
          <div className="mt-2 sm:mt-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-600/20 border border-green-500/50 rounded-lg">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-green-400 text-sm font-medium">
                Access Content
              </span>
            </div>
            {product.purchaseDate && (
              <p className="text-gray-500 text-xs mt-1">
                Purchased {new Date(product.purchaseDate).toLocaleDateString()}
              </p>
            )}
          </div>
        );
      }

      return (
        <div className="mt-2 sm:mt-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 border border-blue-500/50 rounded-lg hover:bg-blue-600/30 transition-colors">
            <ShoppingCart size={16} className="text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Buy Now</span>
          </div>
          {/* Preview state not implemented in current data model */}
        </div>
      );
    };

    return (
      <Link href={`/product/${product.id}`} className="block group">
        <div
          ref={ref}
          className="w-full p-[0.73px] rounded-lg transition-all duration-300 hover:scale-[1.01] lg:hover:scale-[1.02] hover:shadow-lg group-hover:shadow-blue-500/20 relative"
          style={{
            background: isPurchased
              ? "linear-gradient(180deg, #10B981 0%, #059669 88.45%)" // Green gradient for purchased
              : "linear-gradient(180deg, #0680FF 0%, #022ED2 88.45%)", // Blue gradient for unpurchased
            borderRadius: "12px",
          }}
        >
          <div
            className={`w-full h-full rounded-lg p-3 sm:p-4 ${
              isPurchased
                ? "bg-gradient-to-br from-green-900/20 to-black"
                : "bg-gradient-to-br from-gray-900 to-black"
            }`}
            style={{
              background: isPurchased
                ? "linear-gradient(152.97deg, #064e3b 18.75%, rgba(0, 0, 0, 0.95) 100%)" // Darker green for purchased
                : "linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0.95) 100%)", // Original for unpurchased
              borderRadius: "calc(12px - 0.73px)",
            }}
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Product Image */}
              <div className="relative w-full sm:w-24 md:w-32 h-40 sm:h-24 md:h-32 flex-shrink-0">
                <Image
                  src={
                    product.image ||
                    product.thumbnail ||
                    "/images/landing/product.png"
                  }
                  alt={product.title}
                  fill
                  className={`object-cover rounded-lg transition-transform duration-300 group-hover:scale-105 ${
                    !isPurchased ? "grayscale opacity-60" : ""
                  }`}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 96px, 128px"
                />

                {/* Type Badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm">
                  {product.type === "video" ? (
                    <>
                      <PlayCircle size={10} className="text-blue-400" />
                      <span className="text-white text-xs font-medium">
                        Video
                      </span>
                    </>
                  ) : (
                    <>
                      <FileText size={10} className="text-green-400" />
                      <span className="text-white text-xs font-medium">
                        Doc
                      </span>
                    </>
                  )}
                </div>

                {/* Access Badge */}
                {getAccessBadge()}
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  {/* Title */}
                  <h3
                    className={`font-semibold text-base sm:text-lg line-clamp-2 mb-2 group-hover:text-blue-300 transition-colors ${
                      isPurchased ? "text-white" : "text-gray-300"
                    }`}
                  >
                    {product.title}
                  </h3>

                  {/* Author */}
                  <p className="text-gray-400 text-sm mb-2 sm:mb-3">
                    {product.author}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <div className="flex items-center gap-1">
                      <Star
                        size={14}
                        className="text-yellow-400 fill-current"
                      />
                      <span className="text-white text-sm font-medium">
                        {product.rating}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm">
                      (
                      {product.reviewSummary?.totalReviews ??
                        product.reviewCount}
                      )
                    </span>
                  </div>

                  {/* Description - Hidden on mobile */}
                  {product.description && (
                    <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed hidden sm:block">
                      {product.description}
                    </p>
                  )}

                  {/* Course Topics Preview - Only for unpurchased courses */}
                  {!isPurchased &&
                    product.topics &&
                    product.topics.length > 0 && (
                      <div className="mt-3 hidden sm:block">
                        <h4 className="text-gray-300 text-xs font-medium mb-2 uppercase tracking-wide">
                          Course Content:
                        </h4>
                        <div className="space-y-1">
                          {product.topics
                            .slice(0, 3)
                            .map((topic: string, index: number) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 text-gray-400 text-xs"
                              >
                                <span className="text-gray-500 font-mono text-[10px] w-5">
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                                <span className="line-clamp-1 flex-1">
                                  {topic}
                                </span>
                              </div>
                            ))}
                          {product.topics.length > 3 && (
                            <div className="text-gray-500 text-xs italic ml-7">
                              +{product.topics.length - 3} more lessons
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Price and Action Section */}
              <div className="flex flex-col justify-between items-end text-right min-w-[120px]">
                {/* Price */}
                <div
                  className={`font-bold text-lg sm:text-xl lg:text-2xl ${
                    isPurchased ? "text-green-400" : "text-white"
                  }`}
                >
                  {isPurchased ? "Owned" : `$${product.price.toFixed(2)}`}
                </div>

                {/* Mobile description preview */}
                {product.description && (
                  <p className="text-gray-400 text-xs line-clamp-1 sm:hidden max-w-[150px] mb-2">
                    {product.description}
                  </p>
                )}

                {/* Purchase/Access Button */}
                <div className="w-full">{getPurchaseButton()}</div>
              </div>
            </div>

            {/* Mobile Topics Preview - Only for unpurchased courses */}
            {!isPurchased && product.topics && product.topics.length > 0 && (
              <div className="mt-3 px-3 sm:hidden">
                <h4 className="text-gray-300 text-xs font-medium mb-2 uppercase tracking-wide">
                  Course Content:
                </h4>
                <div className="space-y-1">
                  {product.topics
                    .slice(0, 4)
                    .map((topic: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-gray-400 text-xs"
                      >
                        <span className="text-gray-500 font-mono text-[10px] w-5">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="line-clamp-1 flex-1">{topic}</span>
                      </div>
                    ))}
                  {product.topics.length > 4 && (
                    <div className="text-gray-500 text-xs italic ml-7">
                      +{product.topics.length - 4} more lessons
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
