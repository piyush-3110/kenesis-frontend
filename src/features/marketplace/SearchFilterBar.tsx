'use client';

import { useState } from 'react';
import { Search, ChevronDown, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { SortOptionItem } from '@/types/Product';

interface SearchFilterBarProps {
  searchQuery?: string;
  sortBy?: string;
  selectedCategory?: string;
  resultCount: number;
  sortOptions?: SortOptionItem[];
  onSearchChange: (query: string) => void;
  onSortChange: (sortBy: string) => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery = '',
  sortBy = 'most-relevant',
  selectedCategory,
  resultCount,
  sortOptions = [],
  onSearchChange,
  onSortChange,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Default sort options (fallback if not provided)
  const defaultSortOptions = [
    { value: 'most-relevant', label: 'Most relevant' },
    { value: 'a-z', label: 'A to Z' },
    { value: 'z-a', label: 'Z to A' },
    { value: 'price-low-high', label: 'Price low to high' },
    { value: 'price-high-low', label: 'Price high to low' },
    { value: 'rating-high-low', label: 'Highest rated' },
    { value: 'newest', label: 'Newest first' },
    { value: 'video-first', label: 'Video courses first' },
    { value: 'document-first', label: 'Documents first' },
  ];

  const getCurrentSortLabel = () => {
    return sortOptions.find(option => option.value === sortBy)?.label || 'Most relevant';
  };

  const formatCategoryName = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="bg-[#0A071A] border-b border-gray-800">
      {/* Top Row: Navigation and Controls */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="flex items-center gap-4 md:gap-6 mb-6">
          {/* Back Button */}
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
            <ArrowLeft size={20} className="group-hover:transform group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </Link>

          {/* Search Bar with Gradient Border */}
          <div className="flex-1 max-w-2xl">
            <div className="p-[1px] rounded-lg" style={{
              background: 'linear-gradient(180deg, #0680FF 0%, #022ED2 88.45%)'
            }}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isSearchFocused 
                  ? 'bg-gray-900 shadow-lg shadow-blue-500/20' 
                  : 'bg-black hover:bg-gray-900'
              }`}>
                <Search size={20} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search for courses, instructors, topics..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-base"
                />
              </div>
            </div>
          </div>

          {/* Sort Dropdown with Gradient Border */}
          <div className="relative">
            <div className="p-[1px] rounded-lg" style={{
              background: 'linear-gradient(180deg, #0680FF 0%, #022ED2 88.45%)'
            }}>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-3 px-4 py-3 bg-black hover:bg-gray-900 text-white rounded-lg transition-all duration-300 min-w-[180px] justify-between font-medium"
              >
                <span className="truncate">
                  Sort: {getCurrentSortLabel()}
                </span>
                <ChevronDown size={16} className={`transition-transform duration-300 flex-shrink-0 ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {isSortOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 bg-black/50 z-40"
                  onClick={() => setIsSortOpen(false)}
                />
                
                <div className="absolute top-full mt-2 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 min-w-[220px] max-h-80 overflow-y-auto">
                  {sortOptions.map((option, index) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSortChange(option.value);
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors font-medium ${
                        sortBy === option.value ? 'text-blue-400 bg-gray-800' : 'text-white'
                      } ${index === 0 ? 'rounded-t-lg' : ''} ${
                        index === sortOptions.length - 1 ? 'rounded-b-lg' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Home Button */}
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
            <Home size={20} className="group-hover:transform group-hover:scale-110 transition-transform" />
            <span className="font-medium hidden md:inline">Home</span>
          </Link>
        </div>

        {/* Bottom Row: Category and Results Info */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4 border-t border-gray-800">
          {/* Left: Category Info */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Showing results for:</span>
            <span className="text-white font-semibold bg-gray-800 px-3 py-1 rounded-full text-sm">
              {selectedCategory ? formatCategoryName(selectedCategory) : 'All Categories'}
            </span>
          </div>

          {/* Right: Results Count */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Found</span>
            <span className="text-white font-bold text-lg">
              {resultCount.toLocaleString()}
            </span>
            <span className="text-gray-400 text-sm">results</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div 
        className="mt-4 md:mt-6 h-px"
        style={{
          borderWidth: '1px 0px 1px 0px',
          borderStyle: 'solid',
          borderImageSource: 'linear-gradient(90deg, #0A071A 0%, #0036F6 48%, #0A071A 100%)',
          borderImageSlice: 1
        }}
      />
    </div>
  );
};

export default SearchFilterBar;
