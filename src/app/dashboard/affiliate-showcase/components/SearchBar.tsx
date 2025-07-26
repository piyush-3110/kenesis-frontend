'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';
import { useAffiliateShowcaseStore } from '../store/useAffiliateShowcaseStore';
import { AFFILIATE_COLORS } from '../constants';

/**
 * SearchBar Component
 * Search input with advanced search functionality
 */
const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useAffiliateShowcaseStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAdvancedSearch = () => {
    console.log('Advanced search clicked');
    // Here you would implement advanced search modal/popup
  };

  return (
    <div className="flex items-center gap-4">
      {/* Search Input */}
      <div className="flex-1 max-w-md relative">
        <label 
          htmlFor="product-search"
          className="block text-sm mb-2"
          style={{
            color: AFFILIATE_COLORS.TEXT_SECONDARY,
            fontFamily: 'CircularXX, Inter, sans-serif',
            fontSize: '14px',
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
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="w-full h-12 px-4 pl-10 rounded-lg bg-transparent border-0 outline-none text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50"
              style={{
                background: AFFILIATE_COLORS.PRIMARY_BG,
                fontFamily: 'CircularXX, Inter, sans-serif',
                fontSize: '16px',
              }}
            />
            
            {/* Search icon */}
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              size={18}
            />
          </div>
        </div>
      </div>

      {/* Advanced Search Button */}
      <div className="flex-shrink-0 mt-7">
        <button
          onClick={handleAdvancedSearch}
          className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          style={{
            background: AFFILIATE_COLORS.BUTTON_BG,
            fontFamily: 'CircularXX, Inter, sans-serif',
            fontSize: '16px',
            fontWeight: 500,
          }}
        >
          <Filter size={18} />
          Advanced Search
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
