import { useEffect, useCallback } from 'react';
import { useMarketplaceStore } from '@/app/marketplace/store/useMarketplaceStore';
import { Product, PaginatedResponse } from '@/app/marketplace/types';
import { MARKETPLACE_CONFIG, SORT_OPTIONS } from '@/app/marketplace/constants';
import { useDebounce } from '@/hooks/useDebounce';

// Mock API service - in production this would be a real API
const marketplaceApi = {
  async getProducts(filters: any, page: number): Promise<PaginatedResponse<Product>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Import existing marketplace API for now
    const { fetchProducts } = await import('@/lib/marketplaceApi');
    return fetchProducts(filters, page);
  },

  async getCategories() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { fetchCategories } = await import('@/lib/marketplaceApi');
    return fetchCategories();
  },
};

export function useMarketplace() {
  const {
    products,
    filteredProducts,
    categories,
    loading,
    error,
    filters,
    currentPage,
    totalPages,
    hasMore,
    setProducts,
    setFilteredProducts,
    setCategories,
    setLoading,
    setError,
    setCurrentPage,
    setTotalPages,
    setHasMore,
    updateFilters,
    resetFilters,
    setSearchQuery,
  } = useMarketplaceStore();

  const debouncedSearchQuery = useDebounce(filters.searchQuery, MARKETPLACE_CONFIG.SEARCH_DEBOUNCE_MS);

  // Load products with current filters and pagination
  const loadProducts = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await marketplaceApi.getProducts({
        ...filters,
        searchQuery: debouncedSearchQuery,
      }, page);

      if (append && page > 1) {
        // Append for infinite scroll/load more
        setFilteredProducts([...filteredProducts, ...response.data]);
      } else {
        // Replace for new search/filter
        setFilteredProducts(response.data);
      }

      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
      setHasMore(response.pagination.hasMore);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearchQuery, filteredProducts, setLoading, setError, setFilteredProducts, setCurrentPage, setTotalPages, setHasMore]);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await marketplaceApi.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }, [setCategories]);

  // Load more products (infinite scroll)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadProducts(currentPage + 1, true);
    }
  }, [loading, hasMore, currentPage, loadProducts]);

  // Update filters and reload
  const handleFiltersChange = useCallback((newFilters: any) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  // Search functionality
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  // Load initial data
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Reload products when filters change
  useEffect(() => {
    loadProducts(1, false);
  }, [filters, debouncedSearchQuery]);

  return {
    // Data
    products: filteredProducts,
    categories,
    
    // State
    loading,
    loadingMore: loading && currentPage > 1, // Additional loading state for pagination
    error,
    currentPage,
    totalPages,
    hasMore,
    hasNextPage: hasMore, // Alias for compatibility
    totalCount: filteredProducts.length, // Approximate count
    
    // Filters
    filters,
    sortOptions: SORT_OPTIONS, // From constants
    
    // Actions
    loadProducts,
    loadMore,
    updateFilters: handleFiltersChange,
    resetFilters: handleResetFilters,
    setSearchQuery: handleSearch,
    
    // Compatibility
    lastProductElementCallback: () => {}, // Placeholder for now
  };
}
