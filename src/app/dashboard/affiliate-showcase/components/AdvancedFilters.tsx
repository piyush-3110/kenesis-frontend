"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAffiliateShowcaseStore } from "../store/useAffiliateShowcaseStore";
import { useAffiliateCategories } from "../hooks/useAffiliateCourses";
import BasicModal from "@/components/ui/basic-modal";
import type { FilterState } from "../types";

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    filters,
    setType,
    setLevel,
    setPriceRange,
    setRatingRange,
    setCommissionRange,
    setCategories,
    setSorting,
    resetFilters,
  } = useAffiliateShowcaseStore();

  // Get categories from React Query
  const { data: categories } = useAffiliateCategories();

  // Local state for range sliders to prevent constant updates
  const [localPriceRange, setLocalPriceRange] = useState([
    filters.minPrice,
    filters.maxPrice,
  ]);
  const [localRatingRange, setLocalRatingRange] = useState([
    filters.minRating,
    filters.maxRating,
  ]);
  const [localCommissionRange, setLocalCommissionRange] = useState([
    filters.minCommission,
    filters.maxCommission,
  ]);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    level: true,
    price: true,
    rating: true,
    commission: true,
    categories: true,
    sorting: true,
  });

  // Update local ranges when filters change
  useEffect(() => {
    setLocalPriceRange([filters.minPrice, filters.maxPrice]);
    setLocalRatingRange([filters.minRating, filters.maxRating]);
    setLocalCommissionRange([filters.minCommission, filters.maxCommission]);
  }, [filters]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = filters.selectedCategories;
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId];
    setCategories(newCategories);
  };

  const handleApplyPriceRange = () => {
    setPriceRange(localPriceRange[0], localPriceRange[1]);
  };

  const handleApplyRatingRange = () => {
    setRatingRange(localRatingRange[0], localRatingRange[1]);
  };

  const handleApplyCommissionRange = () => {
    setCommissionRange(localCommissionRange[0], localCommissionRange[1]);
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  // Filter Section Component
  const FilterSection: React.FC<{
    title: string;
    section: keyof typeof expandedSections;
    children: React.ReactNode;
  }> = ({ title, section, children }) => (
    <div className="border border-gray-700/50 rounded-lg">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-3 sm:p-4 text-left hover:bg-gray-700/30 transition-colors"
      >
        <h3 className="text-base sm:text-lg font-medium text-white">{title}</h3>
        {expandedSections[section] ? (
          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        )}
      </button>
      {expandedSections[section] && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-700/50">{children}</div>
      )}
    </div>
  );

  return (
    <BasicModal
      isOpen={isOpen}
      onClose={onClose}
      title="Advanced Filters"
      size="full"
    >
      <div className="space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Course Type */}
            <FilterSection title="Course Type" section="type">
              <div className="space-y-3">
                {[
                  { value: "", label: "All Types" },
                  { value: "video", label: "Video Courses" },
                  { value: "document", label: "Document Courses" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="type"
                      value={option.value}
                      checked={filters.type === option.value}
                      onChange={() =>
                        setType(option.value as FilterState["type"])
                      }
                      className="w-4 h-4 text-blue-600 border-gray-600 bg-gray-700 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Difficulty Level */}
            <FilterSection title="Difficulty Level" section="level">
              <div className="space-y-3">
                {[
                  { value: "", label: "All Levels" },
                  { value: "beginner", label: "Beginner" },
                  { value: "intermediate", label: "Intermediate" },
                  { value: "advanced", label: "Advanced" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="level"
                      value={option.value}
                      checked={filters.level === option.value}
                      onChange={() =>
                        setLevel(option.value as FilterState["level"])
                      }
                      className="w-4 h-4 text-blue-600 border-gray-600 bg-gray-700 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection title="Price Range" section="price">
              <div className="space-y-4">
                <div className="text-sm text-blue-400 font-medium">
                  ${localPriceRange[0]} - ${localPriceRange[1]}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Min Price: ${localPriceRange[0]}
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={1000}
                      step={10}
                      value={localPriceRange[0]}
                      onChange={(e) =>
                        setLocalPriceRange([
                          parseInt(e.target.value),
                          localPriceRange[1],
                        ])
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Max Price: ${localPriceRange[1]}
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={1000}
                      step={10}
                      value={localPriceRange[1]}
                      onChange={(e) =>
                        setLocalPriceRange([
                          localPriceRange[0],
                          parseInt(e.target.value),
                        ])
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleApplyPriceRange()}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Apply Range
                </button>
              </div>
            </FilterSection>

            {/* Rating Range */}
            <FilterSection title="Rating Range" section="rating">
              <div className="space-y-4">
                <div className="text-sm text-blue-400 font-medium">
                  {localRatingRange[0]}★ - {localRatingRange[1]}★
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Min Rating: {localRatingRange[0]}★
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.5}
                      value={localRatingRange[0]}
                      onChange={(e) =>
                        setLocalRatingRange([
                          parseFloat(e.target.value),
                          localRatingRange[1],
                        ])
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Max Rating: {localRatingRange[1]}★
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.5}
                      value={localRatingRange[1]}
                      onChange={(e) =>
                        setLocalRatingRange([
                          localRatingRange[0],
                          parseFloat(e.target.value),
                        ])
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleApplyRatingRange()}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Apply Range
                </button>
              </div>
            </FilterSection>
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Commission Range */}
            <FilterSection title="Commission Range" section="commission">
              <div className="space-y-4">
                <div className="text-sm text-blue-400 font-medium">
                  {localCommissionRange[0]}% - {localCommissionRange[1]}%
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Min Commission: {localCommissionRange[0]}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      step={1}
                      value={localCommissionRange[0]}
                      onChange={(e) =>
                        setLocalCommissionRange([
                          parseInt(e.target.value),
                          localCommissionRange[1],
                        ])
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Max Commission: {localCommissionRange[1]}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      step={1}
                      value={localCommissionRange[1]}
                      onChange={(e) =>
                        setLocalCommissionRange([
                          localCommissionRange[0],
                          parseInt(e.target.value),
                        ])
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleApplyCommissionRange()}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Apply Range
                </button>
              </div>
            </FilterSection>

            {/* Categories */}
            <FilterSection title="Categories" section="categories">
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {categories?.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center space-x-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={filters.selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="w-4 h-4 text-blue-600 border-gray-600 bg-gray-700 focus:ring-blue-500 focus:ring-2 rounded"
                    />
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      {category.name}
                    </span>
                  </label>
                ))}
                {(!categories || categories.length === 0) && (
                  <p className="text-gray-500 text-sm">
                    No categories available
                  </p>
                )}
              </div>
            </FilterSection>

            {/* Sort By */}
            <FilterSection title="Sort By" section="sorting">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Sort Field
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      setSorting(
                        e.target.value as FilterState["sortBy"],
                        filters.sortOrder
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="createdAt">Creation Date</option>
                    <option value="price">Price</option>
                    <option value="rating">Rating</option>
                    <option value="commissionRate">Commission Rate</option>
                    <option value="popularity">Popularity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Sort Order
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="sortOrder"
                        value="desc"
                        checked={filters.sortOrder === "desc"}
                        onChange={() => setSorting(filters.sortBy, "desc")}
                        className="w-4 h-4 text-blue-600 border-gray-600 bg-gray-700 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-gray-300 group-hover:text-white transition-colors">
                        Descending (High to Low)
                      </span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="sortOrder"
                        value="asc"
                        checked={filters.sortOrder === "asc"}
                        onChange={() => setSorting(filters.sortBy, "asc")}
                        className="w-4 h-4 text-blue-600 border-gray-600 bg-gray-700 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-gray-300 group-hover:text-white transition-colors">
                        Ascending (Low to High)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </FilterSection>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-4 mt-8 pt-6 border-t border-gray-700/50">
          <button
            onClick={handleResetFilters}
            className="px-4 sm:px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors text-sm sm:text-base"
          >
            Reset All Filters
          </button>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </BasicModal>
  );
};

export default AdvancedFilters;
