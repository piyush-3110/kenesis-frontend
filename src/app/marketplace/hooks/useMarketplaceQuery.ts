import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
// import { MarketplaceFilters, Product, Category } from "@/app/marketplace/types";
import {
  fetchProducts,
  fetchCategories,
  fetchSearchSuggestions,
} from "@/lib/marketplaceApi";
import { useMarketplaceStore } from "@/app/marketplace/store/useMarketplaceStore";
import { useDebounce } from "@/hooks/useDebounce";
import { MARKETPLACE_CONFIG } from "@/app/marketplace/constants";

export function useMarketplaceQuery() {
  const { filters, updateFilters, resetFilters, setSearchQuery } =
    useMarketplaceStore();

  const debouncedSearchQuery = useDebounce(
    filters.searchQuery,
    MARKETPLACE_CONFIG.SEARCH_DEBOUNCE_MS
  );

  // Create stable query key
  const queryKey = useMemo(
    () => [
      "marketplace-products",
      {
        ...filters,
        categoryIds: filters.categoryIds || [],
        searchQuery: debouncedSearchQuery,
      },
    ],
    [filters, debouncedSearchQuery]
  );

  // Infinite query for products with pagination
  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    // isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      console.log("React Query: Fetching products page", pageParam);
      return fetchProducts(
        {
          ...filters,
          searchQuery: debouncedSearchQuery,
        },
        pageParam,
        MARKETPLACE_CONFIG.PRODUCTS_PER_PAGE
      );
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined;
    },
    initialPageParam: 1,
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep in cache for 10 minutes when not in use
    gcTime: 10 * 60 * 1000,
    // Refetch on window focus for fresh data
    refetchOnWindowFocus: false,
    // Retry failed requests
    retry: 2,
  });

  // Categories query
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["marketplace-categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });

  // Search suggestions query (only when search query exists)
  const { data: searchSuggestions = [], isLoading: suggestionsLoading } =
    useQuery({
      queryKey: ["search-suggestions", debouncedSearchQuery],
      queryFn: () => fetchSearchSuggestions(debouncedSearchQuery || ""),
      enabled: !!debouncedSearchQuery && debouncedSearchQuery.length >= 2,
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: false,
    });

  // Flatten all products from all pages
  const products = useMemo(() => {
    return productsData?.pages.flatMap((page) => page.data) || [];
  }, [productsData]);

  // Total count from the first page
  const totalCount = productsData?.pages[0]?.pagination.total || 0;

  // Current page info
  const currentPage =
    productsData?.pages[productsData.pages.length - 1]?.pagination.page || 1;
  const totalPages = productsData?.pages[0]?.pagination.totalPages || 1;

  // Load more function for infinite scroll
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Filter update handlers
  const handleCategoryChange = useCallback(
    (categoryId?: string) => {
      if (!categoryId) {
        updateFilters({ category: "all", categoryIds: [] });
      } else {
        updateFilters({ category: categoryId }); // store will handle toggle & categoryIds array
      }
    },
    [updateFilters]
  );

  const handlePriceRangeChange = useCallback(
    (priceRange: { min: number; max: number; currency: string }) => {
      updateFilters({
        priceRange: {
          min: priceRange.min,
          max: priceRange.max,
          currency: priceRange.currency,
        },
      });
    },
    [updateFilters]
  );

  const handleSearchChange = useCallback(
    (searchQuery: string) => {
      setSearchQuery(searchQuery);
    },
    [setSearchQuery]
  );

  const handleSortChange = useCallback(
    (sortBy: string) => {
      updateFilters({ sortBy });
    },
    [updateFilters]
  );

  // Intersection observer callback for infinite scroll
  const lastProductElementCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return;

      // Simple intersection observer setup
      if (node && hasNextPage) {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              loadMore();
            }
          },
          { threshold: 0.1, rootMargin: "100px" }
        );

        observer.observe(node);

        // Cleanup function
        return () => observer.disconnect();
      }
    },
    [isLoading, isFetchingNextPage, hasNextPage, loadMore]
  );

  return {
    // Data
    products,
    categories,
    searchSuggestions,

    // State
    loading: isLoading,
    loadingMore: isFetchingNextPage,
    categoriesLoading,
    suggestionsLoading,
    error: error?.message || null,
    currentPage,
    totalPages,
    hasNextPage: !!hasNextPage,
    totalCount,

    // Filters
    filters,

    // Actions
    loadMore,
    refetch,
    updateFilters,
    resetFilters,
    handleCategoryChange,
    handlePriceRangeChange,
    handleSearchChange,
    handleSortChange,

    // Infinite scroll
    lastProductElementCallback,
  };
}
