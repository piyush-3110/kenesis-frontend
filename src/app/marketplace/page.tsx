'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import { useMarketplace } from '@/features/marketplace/useMarketplace';
import Sidebar from '@/features/marketplace/Sidebar';
import SearchFilterBar from '@/features/marketplace/SearchFilterBar';
import ProductGrid from '@/features/marketplace/ProductGrid';
import Navbar from '@/components/Landing/Navbar';

const MarketplacePage: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const {
    products,
    categories,
    sortOptions,
    loading,
    loadingMore,
    error,
    filters,
    totalCount,
    hasNextPage,
    lastProductElementCallback,
    updateFilters,
  } = useMarketplace();

  const handleCategoryChange = (categoryId?: string) => {
    updateFilters({ category: categoryId });
  };

  const handlePriceRangeChange = (priceRange: { min: number; max: number; currency: string }) => {
    updateFilters({ priceRange });
  };

  const handleSearchChange = (searchQuery: string) => {
    updateFilters({ searchQuery });
  };

  const handleSortChange = (sortBy: string) => {
    updateFilters({ sortBy });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A071A]">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h2 className="text-white text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A071A]">
      <Navbar />
      
      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105"
        >
          <Filter size={20} />
          <span className="font-medium">Filters</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="pt-16 lg:pt-20"> {/* Account for fixed navbar */}
        {/* Search and Filter Bar */}
        <SearchFilterBar
          searchQuery={filters.searchQuery}
          sortBy={filters.sortBy}
          selectedCategory={filters.category}
          resultCount={totalCount}
          sortOptions={sortOptions}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
        />

        {/* Content Area */}
        <div className="flex">
          {/* Sidebar */}
          <Sidebar
            categories={categories}
            selectedCategory={filters.category}
            priceRange={filters.priceRange}
            onCategoryChange={handleCategoryChange}
            onPriceRangeChange={handlePriceRangeChange}
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
          />

          {/* Product Grid */}
          <ProductGrid 
            products={products} 
            loading={loading}
            loadingMore={loadingMore}
            hasNextPage={hasNextPage}
            lastProductElementCallback={lastProductElementCallback}
            totalCount={totalCount}
          />
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
