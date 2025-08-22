"use client";

import React from "react";
import { useAffiliateShowcaseStore } from "../store/useAffiliateShowcaseStore";
import ProductCard from "./ProductCard";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import Pagination from "./Pagination";
import SortControls from "./SortControls";
import { AFFILIATE_COLORS } from "../constants";
import type { Course, PaginationData } from "../types";

interface ProductGridProps {
  courses: Course[];
  pagination: PaginationData;
  isLoading: boolean;
  error: string | null;
}

/**
 * ProductGrid Component
 * Grid layout for displaying affiliate products with error handling
 */
const ProductGrid: React.FC<ProductGridProps> = ({
  courses,
  pagination,
  isLoading,
  error,
}) => {
  const { filters } = useAffiliateShowcaseStore();

  const handleRetry = () => {
    // Since we're using React Query, we can just trigger a refetch by resetting filters
    window.location.reload();
  };

  // Show error state if there's an error
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Show message when no products match filters
  if (courses.length === 0) {
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
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
            No courses found
          </h3>
          <p
            style={{
              color: AFFILIATE_COLORS.TEXT_SECONDARY,
              fontFamily: "CircularXX, Inter, sans-serif",
              fontSize: "16px",
              fontWeight: 450,
            }}
          >
            {filters.search
              ? `No courses match your search "${filters.search}"`
              : "No courses available with the current filters"}
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
            Try adjusting your search or filters to find more courses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results header with count and sort controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p
            style={{
              color: AFFILIATE_COLORS.TEXT_SECONDARY,
              fontFamily: "CircularXX, Inter, sans-serif",
              fontSize: "16px",
              fontWeight: 450,
            }}
          >
            Showing {courses.length} of {pagination.total} course
            {pagination.total !== 1 ? "s" : ""}
            {filters.search && (
              <span className="ml-1">for &quot;{filters.search}&quot;</span>
            )}
          </p>
          {/* Active filters summary */}
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.type && (
              <span className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded-full">
                Type: {filters.type}
              </span>
            )}
            {filters.level && (
              <span className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded-full">
                Level: {filters.level}
              </span>
            )}
            {filters.selectedCategories.length > 0 && (
              <span className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded-full">
                {filters.selectedCategories.length} categories selected
              </span>
            )}
            {filters.minPrice > 0 && (
              <span className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded-full">
                Min price: ${filters.minPrice}
              </span>
            )}
            {filters.maxPrice < 1000 && (
              <span className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded-full">
                Max price: ${filters.maxPrice}
              </span>
            )}
            {filters.minCommission > 0 && (
              <span className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded-full">
                Min commission: {filters.minCommission}%
              </span>
            )}
            {filters.minRating > 0 && (
              <span className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded-full">
                Min rating: {filters.minRating}★
              </span>
            )}
          </div>
        </div>

        {/* Sort controls */}
        <SortControls />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <ProductCard key={course.id} product={course} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        pageSize={filters.limit}
      />
    </div>
  );
};

export default ProductGrid;
