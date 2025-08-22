"use client";

import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useAffiliateShowcaseStore } from "../store/useAffiliateShowcaseStore";
import { AFFILIATE_COLORS } from "../constants";
import type { FilterState } from "../types";

/**
 * SortControls Component
 * Quick sorting controls for the affiliate showcase
 */
const SortControls: React.FC = () => {
  const { filters, setSorting } = useAffiliateShowcaseStore();

  const sortOptions: Array<{
    value: FilterState["sortBy"];
    label: string;
    description: string;
  }> = [
    {
      value: "createdAt",
      label: "Newest",
      description: "Recently added courses",
    },
    {
      value: "affiliatePercentage",
      label: "Commission",
      description: "Highest commission first",
    },
    { value: "price", label: "Price", description: "Course price" },
    {
      value: "averageRating",
      label: "Rating",
      description: "Highest rated first",
    },
    { value: "soldCount", label: "Sales", description: "Best selling courses" },
    {
      value: "reviewCount",
      label: "Reviews",
      description: "Most reviewed courses",
    },
  ];

  const handleSortChange = (sortBy: FilterState["sortBy"]) => {
    // If clicking the same sort field, toggle order
    if (filters.sortBy === sortBy) {
      const newOrder = filters.sortOrder === "desc" ? "asc" : "desc";
      setSorting(sortBy, newOrder);
    } else {
      // New sort field, default to desc for most fields, asc for price
      const defaultOrder = sortBy === "price" ? "asc" : "desc";
      setSorting(sortBy, defaultOrder);
    }
  };

  const getSortIcon = (sortBy: FilterState["sortBy"]) => {
    if (filters.sortBy !== sortBy) {
      return <ArrowUpDown className="w-4 h-4 text-gray-500" />;
    }

    return filters.sortOrder === "desc" ? (
      <ArrowDown className="w-4 h-4 text-blue-400" />
    ) : (
      <ArrowUp className="w-4 h-4 text-blue-400" />
    );
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className="text-sm font-medium mr-2"
        style={{
          color: AFFILIATE_COLORS.TEXT_SECONDARY,
          fontFamily: "CircularXX, Inter, sans-serif",
        }}
      >
        Sort by:
      </span>

      {sortOptions.map((option) => {
        const isActive = filters.sortBy === option.value;

        return (
          <button
            key={option.value}
            onClick={() => handleSortChange(option.value)}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
              transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50
              ${
                isActive
                  ? "text-white bg-blue-600/20 border border-blue-500/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/30"
              }
            `}
            style={{
              fontFamily: "CircularXX, Inter, sans-serif",
            }}
            title={option.description}
          >
            <span>{option.label}</span>
            {getSortIcon(option.value)}
          </button>
        );
      })}
    </div>
  );
};

export default SortControls;
