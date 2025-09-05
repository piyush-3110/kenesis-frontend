"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Filter } from "lucide-react";
import { useMarketplaceQuery } from "@/app/marketplace/hooks/useMarketplaceQuery";
import Sidebar from "@/app/marketplace/components/Sidebar";
import SearchFilterBar from "@/app/marketplace/components/SearchFilterBar";
import ProductGrid from "@/app/marketplace/components/ProductGrid";
import { SORT_OPTIONS } from "@/app/marketplace/constants";
import { MarketplaceGuard } from "@/components/wallet";

const MarketplacePage: React.FC = () => {
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const {
    products,
    categories,
    loading,
    loadingMore,
    error,
    filters,
    totalCount,
    hasNextPage,
    lastProductElementCallback,
    handleCategoryChange,
    handlePriceRangeChange,
    handleSearchChange,
    handleSortChange,
  } = useMarketplaceQuery();

  // Build a user-friendly label for selected categories (show names, not ids)
  const selectedCategoryLabel = (() => {
    const ids = filters.categoryIds;
    if (ids && ids.length > 0 && categories && categories.length > 0) {
      const names = ids
        .map(
          (id) =>
            categories.find((c: { id: string; name: string }) => c.id === id)
              ?.name || id
        )
        .filter(Boolean);
      return names.join(", ");
    }
    return filters.category || "All Categories";
  })();

  if (error) {
    return (
      <MarketplaceGuard>
        <div className="min-h-screen bg-[#0A071A]">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-red-400 text-4xl mb-4">⚠️</div>
              <h2 className="text-white text-xl font-semibold mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => router.refresh()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </MarketplaceGuard>
    );
  }

  return (
    <MarketplaceGuard>
      <div className="min-h-screen bg-[#0A071A] mt-8">
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
        <div className="pt-16 lg:pt-20">
          {" "}
          {/* Account for fixed navbar */}
          {/* Search and Filter Bar */}
          <SearchFilterBar
            searchQuery={filters.searchQuery}
            sortBy={filters.sortBy}
            selectedCategory={selectedCategoryLabel}
            resultCount={totalCount}
            sortOptions={SORT_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
          />
          {/* Content Area */}
          <div className="flex flex-col lg:flex-row min-h-screen">
            {/* Sidebar */}
            <Sidebar
              categories={categories}
              selectedCategoryIds={filters.categoryIds}
              priceRange={
                filters.priceRange
                  ? {
                      min: filters.priceRange.min,
                      max: filters.priceRange.max,
                      currency: "USD",
                    }
                  : undefined
              }
              onCategoryChange={handleCategoryChange}
              onPriceRangeChange={handlePriceRangeChange}
              isMobileOpen={isMobileSidebarOpen}
              onMobileClose={() => setIsMobileSidebarOpen(false)}
            />

            {/* Product Grid */}
            <div className="flex-1 w-full overflow-hidden">
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
      </div>
    </MarketplaceGuard>
  );
};

export default MarketplacePage;
