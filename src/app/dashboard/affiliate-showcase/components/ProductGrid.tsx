"use client";

import React from "react";
import { useAffiliateShowcaseStore } from "../store/useAffiliateShowcaseStore";
import ProductCard from "./ProductCard";
import ErrorState from "./ErrorState";
import { AFFILIATE_COLORS } from "../constants";
import { useAvailableAffiliateCourses } from "@/features/affiliate/hooks";

/**
 * ProductGrid Component
 * Grid layout for displaying affiliate products with error handling
 */
const ProductGrid: React.FC = () => {
  const { searchQuery, activeFilter, error, clearError } =
    useAffiliateShowcaseStore();
  const { data, isLoading, isError, refetch } = useAvailableAffiliateCourses({
    q: searchQuery || undefined,
    // Backend supports sortBy, sortOrder; here we default to createdAt desc
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 50,
  });

  type MaybeTyped = { type?: "video" | "document" };
  const filteredProducts = (data?.courses || []).filter((c: MaybeTyped) => {
    if (activeFilter === "all") return true;
    // Honor backend type when present; otherwise allow all
    return c.type ? c.type === activeFilter : true;
  });

  const handleRetry = () => {
    clearError();
    refetch();
  };

  // Show error state if there's an error
  if (error || isError) {
    return (
      <ErrorState
        error={error || "Failed to load affiliate courses"}
        onRetry={handleRetry}
      />
    );
  }

  if (isLoading) {
    return (
      <div
        className="py-12 text-center"
        style={{ color: AFFILIATE_COLORS.TEXT_SECONDARY }}
      >
        Loading courses...
      </div>
    );
  }

  // Show message when no products match filters
  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-8v8m0 0V4m0 8a4 4 0 100 8 4 4 0 000-8z"
              />
            </svg>
          </div>
          <h3
            className="mb-2"
            style={{
              color: AFFILIATE_COLORS.TEXT_PRIMARY,
              fontFamily: "CircularXX, Inter, sans-serif",
              fontSize: "18px",
              fontWeight: 500,
            }}
          >
            No products found
          </h3>
          <p
            style={{
              color: AFFILIATE_COLORS.TEXT_SECONDARY,
              fontFamily: "CircularXX, Inter, sans-serif",
              fontSize: "16px",
              fontWeight: 450,
            }}
          >
            {searchQuery
              ? `No products match "${searchQuery}" in the ${
                  activeFilter === "all" ? "all categories" : activeFilter
                } section.`
              : `No ${
                  activeFilter === "all" ? "" : activeFilter + " "
                }products available at the moment.`}
          </p>
          <p
            className="mt-2"
            style={{
              color: AFFILIATE_COLORS.TEXT_SECONDARY,
              fontFamily: "CircularXX, Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 450,
            }}
          >
            Try adjusting your search or filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p
          style={{
            color: AFFILIATE_COLORS.TEXT_SECONDARY,
            fontFamily: "CircularXX, Inter, sans-serif",
            fontSize: "16px",
            fontWeight: 450,
          }}
        >
          Showing {filteredProducts.length} product
          {filteredProducts.length !== 1 ? "s" : ""}
          {searchQuery && (
            <span className="ml-1">for &quot;{searchQuery}&quot;</span>
          )}
          {activeFilter !== "all" && (
            <span className="ml-1">in {activeFilter} category</span>
          )}
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            // Adapt ProductCard props by mapping AvailableCourse to expected shape
            product={{
              id: product.id,
              title: product.title,
              author: product.instructor?.username || "Unknown",
              rating: product.averageRating ?? 0,
              reviewCount: product.reviewCount ?? 0,
              price: product.price,
              commission: product.affiliatePercentage,
              category: "",
              type: (product as unknown as MaybeTyped).type ?? "video",
              thumbnail: product.thumbnail || "/images/landing/product.png",
              description: undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
