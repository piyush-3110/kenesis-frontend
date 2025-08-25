"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { useAffiliateShowcaseStore } from "../store/useAffiliateShowcaseStore";
import { AFFILIATE_COLORS } from "../constants";
import AdvancedFilters from "./AdvancedFilters";

/**
 * SearchBar Component
 * Search input with advanced search functionality
 */
const SearchBar: React.FC = () => {
  const { filters, setSearch } = useAffiliateShowcaseStore();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Update local search when filters change (for external updates)
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    // The debounced update to store happens in the store's setSearch method
    setSearch(value);
  };

  const handleAdvancedSearch = () => {
    setShowAdvancedFilters(true);
  };

  // Count active filters (excluding defaults)
  const activeFiltersCount = [
    filters.type !== "",
    filters.level !== "",
    filters.minPrice > 0,
    filters.maxPrice < 1000,
    filters.minRating > 0,
    filters.maxRating < 5,
    filters.minCommission > 0,
    filters.maxCommission < 50,
    filters.selectedCategories.length > 0,
    filters.sortBy !== "createdAt" || filters.sortOrder !== "desc",
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      {/* Search Input */}
      <div className="flex-1 relative">
        <label
          htmlFor="product-search"
          className="block text-sm mb-2"
          style={{
            color: AFFILIATE_COLORS.TEXT_SECONDARY,
            fontFamily: "CircularXX, Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 450,
          }}
        >
          Enter product name here
        </label>

        {/* Search input with gradient border */}
        <div
          className="relative rounded-lg p-[1px]"
          style={{
            background: AFFILIATE_COLORS.PRIMARY_BORDER,
          }}
        >
          <div className="relative">
            <input
              id="product-search"
              type="text"
              value={localSearch}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="w-full h-10 sm:h-12 px-3 sm:px-4 pl-9 sm:pl-10 rounded-lg bg-transparent border-0 outline-none text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base"
              style={{
                background: AFFILIATE_COLORS.PRIMARY_BG,
                fontFamily: "CircularXX, Inter, sans-serif",
              }}
            />

            {/* Search icon */}
            <Search
              className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>
        </div>
      </div>

      {/* Advanced Search Button */}
      <div className="flex-shrink-0 mt-0 sm:mt-7">
        <button
          onClick={handleAdvancedSearch}
          className="relative flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full sm:w-auto text-sm sm:text-base"
          style={{
            background: AFFILIATE_COLORS.BUTTON_BG,
            fontFamily: "CircularXX, Inter, sans-serif",
            fontWeight: 500,
          }}
        >
          <Filter size={16} />
          <span className="sm:inline">Advanced Search</span>
          {/* Active filters badge */}
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-blue-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters Modal */}
      <AdvancedFilters
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
      />
    </div>
  );
};

export default SearchBar;
