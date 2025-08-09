import { useEffect, useCallback, useRef, useState } from "react";
import { useMarketplaceStore } from "@/app/marketplace/store/useMarketplaceStore";
import {
  Product,
  ApiPaginatedResponse,
  MarketplaceFilters,
} from "@/app/marketplace/types";
import { MARKETPLACE_CONFIG, SORT_OPTIONS } from "@/app/marketplace/constants";
import { useDebounce } from "@/hooks/useDebounce";

// Real API service - connects to Kenesis backend
const marketplaceApi = {
  async getProducts(
    filters: MarketplaceFilters,
    page: number,
    limit: number = MARKETPLACE_CONFIG.PRODUCTS_PER_PAGE
  ): Promise<ApiPaginatedResponse<Product>> {
    // Import existing marketplace API for now
    const { fetchProducts } = await import("@/lib/marketplaceApi");
    const result = await fetchProducts(filters, page, limit);

    return result;
  },

  async getCategories() {
    const { fetchCategories } = await import("@/lib/marketplaceApi");
    return fetchCategories();
  },
};

export function useMarketplace() {
  const {
    filteredProducts,
    categories,
    loading,
    error,
    filters,
    currentPage,
    totalPages,
    hasMore,
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

  // Infinite scroll setup
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0); // Add state for total count
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Use ref to track current products for appending without causing re-renders
  const currentProductsRef = useRef<Product[]>([]);

  // Use ref to prevent duplicate API calls and handle cancellation
  const isLoadingRef = useRef(false);
  const lastRequestRef = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Update ref when filteredProducts changes
  useEffect(() => {
    currentProductsRef.current = filteredProducts;
  }, [filteredProducts]);

  const debouncedSearchQuery = useDebounce(
    filters.searchQuery,
    MARKETPLACE_CONFIG.SEARCH_DEBOUNCE_MS
  );

  // Create a unique key for the current request to prevent duplicates
  const createRequestKey = useCallback(
    (
      filters: MarketplaceFilters,
      searchQuery: string | undefined,
      page: number
    ) => {
      return JSON.stringify({ filters, searchQuery: searchQuery || "", page });
    },
    []
  );

  // Load products with current filters and pagination
  const loadProducts = useCallback(
    async (page: number = 1, append: boolean = false) => {
      // Create request key to prevent duplicate calls
      const requestKey = createRequestKey(filters, debouncedSearchQuery, page);

      // Prevent duplicate requests
      if (isLoadingRef.current && lastRequestRef.current === requestKey) {
        console.log("Preventing duplicate API call for:", requestKey);
        return;
      }

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        isLoadingRef.current = true;
        lastRequestRef.current = requestKey;

        if (append) {
          setIsFetchingNextPage(true);
        } else {
          setLoading(true);
        }
        setError(null);

        console.log("Making API call for:", requestKey);
        const response = await marketplaceApi.getProducts(
          {
            ...filters,
            searchQuery: debouncedSearchQuery,
          },
          page
        );

        // Check if request was cancelled
        if (abortControllerRef.current?.signal.aborted) {
          console.log("Request was cancelled:", requestKey);
          return;
        }

        if (append && page > 1) {
          // Append for infinite scroll/load more - use ref to get current products
          setFilteredProducts([
            ...currentProductsRef.current,
            ...response.data,
          ]);
        } else {
          // Replace for new search/filter
          setFilteredProducts(response.data);
        }

        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.totalPages);
        setHasMore(response.pagination.hasNextPage);
        setTotalCount(response.pagination.total); // Set total count from API response
      } catch (err) {
        // Don't show error if request was cancelled
        if (abortControllerRef.current?.signal.aborted) {
          console.log("Request cancelled, ignoring error");
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : "Failed to load products";
        setError(errorMessage);
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
        setIsFetchingNextPage(false);
        isLoadingRef.current = false;
      }
    },
    [
      filters,
      debouncedSearchQuery,
      createRequestKey,
      setLoading,
      setError,
      setFilteredProducts,
      setCurrentPage,
      setTotalPages,
      setHasMore,
    ]
  );

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await marketplaceApi.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  }, [setCategories]);

  // Load more products (infinite scroll)
  const loadMore = useCallback(() => {
    if (!loading && hasMore && !isFetchingNextPage) {
      loadProducts(currentPage + 1, true);
    }
  }, [loading, hasMore, currentPage, loadProducts, isFetchingNextPage]);

  // Intersection observer for infinite scroll
  const lastProductElementCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || isFetchingNextPage) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMore();
          }
        },
        {
          threshold: 0.1,
          rootMargin: "100px",
        }
      );

      if (node) observerRef.current.observe(node);
    },
    [loading, isFetchingNextPage, hasMore, loadMore]
  );

  // Update filters and reload
  const handleFiltersChange = useCallback(
    (newFilters: Partial<MarketplaceFilters>) => {
      updateFilters(newFilters);
    },
    [updateFilters]
  );

  // Search functionality
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    [setSearchQuery]
  );

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  // Load initial data
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Reload products when filters change - use a more stable dependency pattern
  useEffect(() => {
    // Reset to page 1 when filters change
    loadProducts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, debouncedSearchQuery]); // Intentionally excluding loadProducts to prevent loops

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any ongoing requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Data
    products: filteredProducts,
    categories,

    // State
    loading,
    loadingMore: isFetchingNextPage, // Proper loading state for pagination
    error,
    currentPage,
    totalPages,
    hasMore,
    hasNextPage: hasMore, // Alias for compatibility
    totalCount: totalCount, // Use actual total count from API

    // Filters
    filters,
    sortOptions: SORT_OPTIONS, // From constants

    // Actions
    loadProducts,
    loadMore,
    updateFilters: handleFiltersChange,
    resetFilters: handleResetFilters,
    setSearchQuery: handleSearch,

    // Infinite scroll
    lastProductElementCallback,
  };
}
