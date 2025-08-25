"use client";

import React, { useMemo } from "react";
import { useAffiliateShowcaseStore } from "../store/useAffiliateShowcaseStore";
import { useAffiliateCourses } from "../hooks/useAffiliateCourses";
import FilterTabs from "./FilterTabs";
import SearchBar from "./SearchBar";
import QuickFilters from "./QuickFilters";
import ProductGrid from "./ProductGrid";
import ToastContainer from "./ToastContainer";
import { useToastStore } from "../store/useToastStore";
import { AFFILIATE_COLORS } from "../constants";
import type { CourseFilters } from "../types";

/**
 * AffiliateShowcaseContainer Component
 * Main container for the affiliate showcase section
 */
const AffiliateShowcaseContainer: React.FC = () => {
  const { filters } = useAffiliateShowcaseStore();
  const { toasts } = useToastStore();

  // Convert filters to API format for React Query
  const apiFilters: CourseFilters = useMemo(
    () => ({
      page: filters.page,
      limit: filters.limit,
      q: filters.search || undefined,
      type: filters.type || undefined,
      level: filters.level || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
      maxPrice: filters.maxPrice < 1000 ? filters.maxPrice : undefined,
      minRating: filters.minRating > 0 ? filters.minRating : undefined,
      maxRating: filters.maxRating < 5 ? filters.maxRating : undefined,
      minCommission:
        filters.minCommission > 0 ? filters.minCommission : undefined,
      maxCommission:
        filters.maxCommission < 50 ? filters.maxCommission : undefined,
      categoryIds:
        filters.selectedCategories.length > 0
          ? filters.selectedCategories.join(",")
          : undefined,
    }),
    [filters]
  );

  // Use React Query for data fetching
  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
  } = useAffiliateCourses(apiFilters);

  // Don't show loading for the entire container, let ProductGrid handle its own loading

  return (
    <div className="min-h-screen w-full p-4 sm:p-6">
      {/* Main Content Container */}
      <div
        className="w-full rounded-xl p-6 relative overflow-hidden"
        style={{
          background: AFFILIATE_COLORS.PRIMARY_BG,
        }}
      >
        {/* Border with gradient - using a wrapper to avoid border spreading */}
        <div
          className="absolute inset-0 rounded-xl p-[1px]"
          style={{
            background: AFFILIATE_COLORS.PRIMARY_BORDER,
          }}
        >
          <div
            className="w-full h-full rounded-xl"
            style={{
              background: AFFILIATE_COLORS.PRIMARY_BG,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-6">
          {/* Header Section */}
          <div className="space-y-4">
            {/* Filter tabs and search */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <FilterTabs />
              <div className="lg:max-w-md lg:flex-1">
                <SearchBar />
              </div>
            </div>

            {/* Quick filters */}
            <QuickFilters />
          </div>

          {/* Product Grid */}
          <ProductGrid
            courses={coursesData?.courses || []}
            pagination={
              coursesData
                ? {
                    total: coursesData.total,
                    page: coursesData.page,
                    totalPages: coursesData.totalPages,
                  }
                : { total: 0, page: 1, totalPages: 0 }
            }
            isLoading={coursesLoading}
            error={coursesError ? String(coursesError) : null}
          />
        </div>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} />
    </div>
  );
};

export default AffiliateShowcaseContainer;
