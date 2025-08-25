'use client';

import React from 'react';
import { Search, SortAsc, SortDesc } from 'lucide-react';
import { AffiliationFilters } from '../types';

interface FilterControlsProps {
  filters: AffiliationFilters;
  availableSellers: string[];
  availableCategories: string[];
  onFiltersChange: (filters: Partial<AffiliationFilters>) => void;
  onSearch?: (query: string) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  availableSellers,
  availableCategories,
  onFiltersChange,
  onSearch
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 rounded-xl border border-gray-700/50 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search affiliations..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="min-w-[140px]">
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFiltersChange({ status: e.target.value as 'all' | 'active' | 'inactive' })}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Seller Filter */}
        <div className="min-w-[160px]">
          <select
            value={filters.seller || ''}
            onChange={(e) => onFiltersChange({ seller: e.target.value || undefined })}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          >
            <option value="">All Sellers</option>
            {availableSellers.map((seller) => (
              <option key={seller} value={seller}>
                {seller}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="min-w-[160px]">
          <select
            value={filters.category || ''}
            onChange={(e) => onFiltersChange({ category: e.target.value || undefined })}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          >
            <option value="">All Categories</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="min-w-[140px]">
          <select
            value={filters.sortBy || 'created'}
            onChange={(e) => onFiltersChange({ sortBy: e.target.value as 'created' | 'earnings' | 'clicks' | 'conversions' })}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          >
            <option value="created">Date Created</option>
            <option value="earnings">Earnings</option>
            <option value="clicks">Clicks</option>
            <option value="conversions">Conversions</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="min-w-[50px]">
          <button
            onClick={() => onFiltersChange({ 
              sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
            })}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors flex items-center justify-center"
            title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {filters.sortOrder === 'asc' ? (
              <SortAsc size={16} />
            ) : (
              <SortDesc size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
