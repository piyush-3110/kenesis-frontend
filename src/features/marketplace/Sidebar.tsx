'use client';

import { useState, useEffect } from 'react';
import { X, Filter, DollarSign, ChevronUp } from 'lucide-react';
import { Category, PriceRange } from '@/types/Product';
import PriceRangeSlider from '@/components/ui/PriceRangeSlider';

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
  const [sliderValues, setSliderValues] = useState<[number, number]>([priceRange?.min || 0, priceRange?.max || 1000]);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Show only first 6 categories initially
  const visibleCategories = showAllCategories ? categories : categories.slice(0, 6);

  // Update price inputs when priceRange prop changes
  useEffect(() => {
    if (priceRange) {
      setSliderValues([priceRange.min, priceRange.max]);
    }
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
    onPriceRangeChange({ min: sliderValues[0], max: sliderValues[1], currency: 'USD' });
    // Close mobile sidebar on price filter apply
    if (onMobileClose) onMobileClose();
  };

  const handleSliderChange = (values: [number, number]) => {
    setSliderValues(values);
  };

  const clearPriceFilter = () => {
    const resetMin = priceRange?.min || 0;
    const resetMax = priceRange?.max || 1000;
    setSliderValues([resetMin, resetMax]);
    onPriceRangeChange({ min: resetMin, max: resetMax, currency: 'USD' });
  };

  // Format category name for display
  const formatCategoryName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const sidebarContent = (
    <div className="h-full  backdrop-blur-xl bg-opacity-95 overflow-y-auto">
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
        <div 
          className="pt-6"
          style={{
            borderTop: '1px solid',
            borderImageSource: 'linear-gradient(90deg, #0A071A 0%, #0036F6 48%, #0A071A 100%)',
            borderImageSlice: 1
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-semibold">Categories</h2>
            <ChevronUp size={20} className="text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {visibleCategories.map((category) => (
              <div 
                key={category.id}
                className="flex items-center gap-3 group cursor-pointer"
                onClick={() => handleCategoryClick(category.id)}
              >
                {/* Custom Checkbox */}
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedCategory === category.id}
                    onChange={() => {}} // Handled by parent onClick
                    className="w-4 h-4 rounded border-2 border-gray-600 bg-transparent checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
                  />
                  {selectedCategory === category.id && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Category Info */}
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-gray-300 group-hover:text-white transition-colors font-medium">
                    {formatCategoryName(category.name)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({category.count.toLocaleString()})
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* See More/See Less Button */}
          {categories.length > 6 && (
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors border border-gray-600 rounded-full px-4 py-2 hover:border-blue-500"
            >
              {showAllCategories ? 'See less' : 'See more'}
            </button>
          )}
        </div>

        {/* Price Range Section */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-6 flex items-center gap-2">
            <DollarSign size={18} className="text-blue-400" />
            <span>Price Range</span>
          </h3>
          
          <div className="space-y-6">
            {/* Modern Slider */}
            <PriceRangeSlider
              min={priceRange?.min || 0}
              max={priceRange?.max || 1000}
              value={sliderValues}
              onChange={handleSliderChange}
              step={1}
            />
            
            <div className="flex gap-2">
              <button
                onClick={handlePriceChange}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 text-sm lg:text-base"
              >
                Apply Filter
              </button>
              <button
                onClick={clearPriceFilter}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 text-sm lg:text-base"
              >
                Reset
              </button>
            </div>
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
