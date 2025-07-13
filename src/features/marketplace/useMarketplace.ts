'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Category, MarketplaceFilters, PaginatedResponse, SortOptionItem, PriceRange } from '@/types/Product';
import { fetchProducts, fetchCategories, fetchSortOptions, fetchPriceRange } from '@/lib/marketplaceApi';
import { useDebounce } from '@/hooks/useDebounce';

export function useMarketplace() {
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sortOptions, setSortOptions] = useState<SortOptionItem[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 1000, currency: 'USD' });
  const [filters, setFilters] = useState<MarketplaceFilters>({
    category: '',
    priceRange: { min: 0, max: 1000, currency: 'USD' },
    searchQuery: '',
    sortBy: 'most-relevant'
  });
  
  // Pagination and loading states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Infinite scroll
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(filters.searchQuery || '', 500);
  
  // Reset pagination when filters change
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setProducts([]);
    setHasNextPage(false);
  }, []);

  // Load products with current filters and pagination
  const loadProducts = useCallback(async (page: number = 1, isLoadMore: boolean = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const filtersWithSearch = {
        ...filters,
        searchQuery: debouncedSearchQuery
      };
      
      const response: PaginatedResponse<Product> = await fetchProducts(filtersWithSearch, page, 10);
      
      if (isLoadMore) {
        // Append new products for infinite scroll
        setProducts(prevProducts => [...prevProducts, ...response.data]);
      } else {
        // Replace products for new search/filter
        setProducts(response.data);
      }
      
      setHasNextPage(response.pagination.hasNextPage);
      setTotalCount(response.pagination.total);
      setCurrentPage(page);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setIsFetchingNextPage(false);
    }
  }, [filters, debouncedSearchQuery]);

  // Load more products for infinite scroll
  const loadMoreProducts = useCallback(async () => {
    if (hasNextPage && !loadingMore && !isFetchingNextPage) {
      setIsFetchingNextPage(true);
      await loadProducts(currentPage + 1, true);
    }
  }, [currentPage, hasNextPage, loadingMore, isFetchingNextPage, loadProducts]);

  // Intersection observer for infinite scroll
  const lastProductElementCallback = useCallback((node: HTMLDivElement | null) => {
    if (loadingMore || isFetchingNextPage) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        loadMoreProducts();
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    });
    
    if (node) observerRef.current.observe(node);
  }, [loadingMore, isFetchingNextPage, hasNextPage, loadMoreProducts]);

  // Load categories on mount
  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    }
  }, []);

  // Load sort options on mount
  const loadSortOptions = useCallback(async () => {
    try {
      const sortOptionsData = await fetchSortOptions();
      setSortOptions(sortOptionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sort options');
    }
  }, []);

  // Load price range on mount
  const loadPriceRange = useCallback(async () => {
    try {
      const priceRangeData = await fetchPriceRange();
      setPriceRange(priceRangeData);
      // Update initial filter state with actual price range
      setFilters(prev => ({
        ...prev,
        priceRange: priceRangeData
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load price range');
    }
  }, []);

  // Load products when filters change
  useEffect(() => {
    resetPagination();
    loadProducts(1, false);
  }, [filters.category, filters.priceRange, filters.sortBy, debouncedSearchQuery, loadProducts, resetPagination]);

  // Load categories and initial data on mount
  useEffect(() => {
    loadCategories();
    loadSortOptions();
    loadPriceRange();
  }, [loadCategories, loadSortOptions, loadPriceRange]);

  // Filter update functions
  const updateFilters = useCallback((newFilters: Partial<MarketplaceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      priceRange: priceRange, // Use the actual price range from backend
      searchQuery: '',
      sortBy: 'most-relevant'
    });
  }, [priceRange]);

  return {
    // Data
    products,
    categories,
    sortOptions,
    priceRange,
    filters,
    
    // Loading states
    loading,
    loadingMore,
    error,
    hasNextPage,
    totalCount,
    currentPage,
    
    // Infinite scroll
    lastProductElementCallback,
    isFetchingNextPage,
    
    // Actions
    updateFilters,
    clearFilters,
    loadMoreProducts,
    refetch: () => loadProducts(1, false)
  };
}
