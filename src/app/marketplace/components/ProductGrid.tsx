"use client";

import type { MarketplaceProduct } from "@/types/Product";
import ProductCard from "./ProductCard";
import { Loader2 } from "lucide-react";

interface ProductGridProps {
  products: MarketplaceProduct[];
  loading: boolean;
  loadingMore: boolean;
  hasNextPage: boolean;
  lastProductElementCallback: (node: HTMLDivElement | null) => void;
  totalCount: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  loadingMore,
  hasNextPage,
  lastProductElementCallback,
  totalCount,
}) => {
  // Loading skeleton for initial load
  if (loading && products.length === 0) {
    return (
      <div className="flex-1 p-3 md:p-6">
        <div className="space-y-3 md:space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg p-3 md:p-4 animate-pulse"
              style={{
                border: "0.73px solid rgba(6, 128, 255, 0.3)",
                background:
                  "linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0) 100%)",
              }}
            >
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <div className="w-full sm:w-24 md:w-32 h-24 md:h-32 bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between h-full">
                    <div className="flex-1">
                      <div className="h-4 md:h-6 bg-gray-700 rounded mb-2 w-3/4"></div>
                      <div className="h-3 md:h-4 bg-gray-700 rounded mb-2 w-1/3"></div>
                      <div className="h-3 md:h-4 bg-gray-700 rounded mb-2 w-1/4"></div>
                      <div className="h-3 md:h-4 bg-gray-700 rounded w-3/4 hidden sm:block"></div>
                    </div>
                    <div className="w-20 md:w-24">
                      <div className="h-6 md:h-8 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No products found
  if (!loading && products.length === 0) {
    return (
      <div className="flex-1 p-3 md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-400 text-4xl md:text-6xl mb-4">📚</div>
          <h3 className="text-white text-lg md:text-xl font-semibold mb-2">
            No products found
          </h3>
          <p className="text-gray-400 text-sm md:text-base max-w-md">
            Try adjusting your search criteria or browse different categories to
            find what you&apos;re looking for.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 sm:p-4 md:p-6 w-full overflow-hidden">
      {/* Results count */}
      <div className="mb-4 md:mb-6">
        <p className="text-gray-400 text-sm md:text-base">
          Showing {products.length} of {totalCount} products
        </p>
      </div>

      {/* Products grid with better spacing */}
      <div className="space-y-3 md:space-y-4 lg:space-y-6 w-full">
        {products.map((product, index) => {
          // Add ref to last product for infinite scroll
          const isLast = index === products.length - 1;

          return (
            <div
              key={product.id}
              ref={isLast ? lastProductElementCallback : null}
              className="animate-fade-in w-full"
              style={{
                animationDelay: `${(index % 10) * 0.1}s`,
              }}
            >
              <ProductCard product={product} />
            </div>
          );
        })}
      </div>

      {/* Loading more indicator */}
      {loadingMore && (
        <div className="flex justify-center items-center py-6 md:py-8">
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm md:text-base">
              Loading more products...
            </span>
          </div>
        </div>
      )}

      {/* End of products indicator */}
      {!hasNextPage && products.length > 0 && (
        <div className="flex justify-center items-center py-6 md:py-8">
          <div className="text-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-4"></div>
            <p className="text-gray-400 text-sm md:text-base">
              You&apos;ve seen all {totalCount} products
            </p>
          </div>
        </div>
      )}

      {/* Separator line for scroll indication */}
      {hasNextPage && products.length > 0 && (
        <div className="mt-6 md:mt-8 opacity-20">
          <div
            className="w-full h-px"
            style={{
              background:
                "linear-gradient(90deg, #0A071A 0%, #0036F6 48%, #0A071A 100%)",
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
