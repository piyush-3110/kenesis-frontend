'use client';

import { useState, useEffect } from 'react';
import { X, Filter, DollarSign } from 'lucide-react';
import { Category, PriceRange } from '@/types/Product';

interface SidebarProps {
  categories: Category[];
  selectedCategory?: string;
  priceRange?: PriceRange;
  onCategoryChange: (categoryId?: string) => void;
  onPriceRangeChange: (range: PriceRange) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  categories,
  selectedCategory,
  priceRange,
  onCategoryChange,
  onPriceRangeChange,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const [minPrice, setMinPrice] = useState(priceRange?.min || 0);
  const [maxPrice, setMaxPrice] = useState(priceRange?.max || 1000);

  // Update price inputs when priceRange prop changes
  useEffect(() => {
    setMinPrice(priceRange?.min || 0);
    setMaxPrice(priceRange?.max || 1000);
  }, [priceRange]);

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      onCategoryChange(undefined);
    } else {
      onCategoryChange(categoryId);
    }
    // Close mobile sidebar on category selection
    if (onMobileClose) onMobileClose();
  };

  const handlePriceChange = () => {
    onPriceRangeChange({ min: minPrice, max: maxPrice, currency: 'USD' });
    // Close mobile sidebar on price filter apply
    if (onMobileClose) onMobileClose();
  };

  const clearPriceFilter = () => {
    setMinPrice(0);
    setMaxPrice(1000);
    onPriceRangeChange({ min: 0, max: 1000, currency: 'USD' });
  };

  // Format category name for display
  const formatCategoryName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const sidebarContent = (
    <div className="h-full bg-gray-900/90 backdrop-blur-xl bg-opacity-95 overflow-y-auto">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-700">
        <h1 className="text-white text-lg font-semibold flex items-center gap-2">
          <Filter size={20} className="text-blue-400" />
          <span>Filters</span>
        </h1>
        <button 
          onClick={onMobileClose}
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          <X size={24} />
        </button>
      </div>

      <div className="p-4 lg:p-6 space-y-6 lg:space-y-8">
        {/* Categories Section */}
        <div>
          <h2 className="text-white text-lg lg:text-xl font-semibold mb-4 lg:mb-6 flex items-center gap-2">
            <span className="hidden lg:inline">Categories</span>
            <span className="lg:hidden">Filter by Category</span>
          </h2>
          
          <div className="space-y-1 lg:space-y-2">
            {categories.map((category, index) => (
              <div 
                key={category.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Main Category */}
                <div className="flex items-center justify-between py-2 lg:py-2">
                  <button
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex items-center gap-2 text-left flex-1 transition-all duration-300 hover:scale-105 ${
                      selectedCategory === category.id 
                        ? 'text-blue-400 font-medium' 
                        : 'text-white hover:text-blue-300'
                    }`}
                  >
                    <span className="text-sm lg:text-base truncate">
                      {formatCategoryName(category.name)}
                    </span>
                    <span className="text-gray-400 text-xs lg:text-sm flex-shrink-0">
                      ({category.count.toLocaleString()})
                    </span>
                  </button>
                </div>

                {/* Category separator */}
                {index < categories.length - 1 && (
                  <div 
                    className="my-2 h-px opacity-30"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, #0036F6 50%, transparent 100%)'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Price Range Section */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-blue-400" />
            <span>Price Range</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-3 lg:gap-4">
              <div className="flex-1">
                <label className="text-gray-400 text-sm mb-2 block">Min Price</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-300 text-sm lg:text-base"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="flex-1">
                <label className="text-gray-400 text-sm mb-2 block">Max Price</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-300 text-sm lg:text-base"
                  placeholder="1000"
                  min="0"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handlePriceChange}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm lg:text-base"
              >
                Apply Filter
              </button>
              <button
                onClick={clearPriceFilter}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition-all duration-300 hover:scale-105 text-sm lg:text-base"
              >
                Clear
              </button>
            </div>

            {/* Price range indicator */}
            {(minPrice > 0 || maxPrice < 1000) && (
              <div className="text-xs text-gray-400 text-center animate-fade-in">
                Filtering: US$ {minPrice} - US$ {maxPrice}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 w-80 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:w-80 lg:flex-shrink-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
