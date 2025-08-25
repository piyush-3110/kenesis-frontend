"use client";

import React from "react";
import { Zap, TrendingUp, Star, DollarSign, Award } from "lucide-react";
import { useAffiliateShowcaseStore } from "../store/useAffiliateShowcaseStore";
import { AFFILIATE_COLORS } from "../constants";

/**
 * QuickFilters Component
 * Quick filter buttons for common filter combinations
 */
const QuickFilters: React.FC = () => {
  const {
    filters,
    setPriceRange,
    setCommissionRange,
    setRatingRange,
    setSorting,
    resetFilters,
  } = useAffiliateShowcaseStore();

  const quickFilters = [
    {
      id: "high-commission",
      label: "High Commission",
      icon: TrendingUp,
      description: "40%+ commission",
      action: () => {
        setCommissionRange(40, 50);
        setSorting("affiliatePercentage", "desc");
      },
      isActive: filters.minCommission >= 40,
    },
    {
      id: "top-rated",
      label: "Top Rated",
      icon: Star,
      description: "4.5+ stars",
      action: () => {
        setRatingRange(4.5, 5);
        setSorting("averageRating", "desc");
      },
      isActive: filters.minRating >= 4.5,
    },
    {
      id: "best-sellers",
      label: "Best Sellers",
      icon: Award,
      description: "Most sold courses",
      action: () => {
        setSorting("soldCount", "desc");
      },
      isActive: filters.sortBy === "soldCount" && filters.sortOrder === "desc",
    },
    {
      id: "affordable",
      label: "Affordable",
      icon: DollarSign,
      description: "Under $50",
      action: () => {
        setPriceRange(0, 50);
        setSorting("price", "asc");
      },
      isActive: filters.maxPrice <= 50 && filters.minPrice === 0,
    },
    {
      id: "newest",
      label: "Newest",
      icon: Zap,
      description: "Recently added",
      action: () => {
        setSorting("createdAt", "desc");
      },
      isActive: filters.sortBy === "createdAt" && filters.sortOrder === "desc",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {quickFilters.map((filter) => {
        const Icon = filter.icon;

        return (
          <button
            key={filter.id}
            onClick={filter.action}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
              transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50
              ${
                filter.isActive
                  ? "text-white border"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/30"
              }
            `}
            style={
              filter.isActive
                ? {
                    background: AFFILIATE_COLORS.PRIMARY_BG,
                    borderColor: AFFILIATE_COLORS.PRIMARY_BORDER,
                  }
                : {}
            }
            title={filter.description}
          >
            <Icon className="w-4 h-4" />
            <span
              style={{
                fontFamily: "CircularXX, Inter, sans-serif",
              }}
            >
              {filter.label}
            </span>
          </button>
        );
      })}

      {/* Clear all filters button */}
      <button
        onClick={resetFilters}
        className="px-3 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        style={{
          fontFamily: "CircularXX, Inter, sans-serif",
        }}
      >
        Clear All
      </button>
    </div>
  );
};

export default QuickFilters;
