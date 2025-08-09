"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { Category, SortOptionItem, PriceRange } from "@/types/Product";
import type { ExtendedProduct } from "@/types/Review";
import { useDebounce } from "@/hooks/useDebounce";
import { MarketplaceAPI } from "./api";
import { mapCourseToExtendedProduct } from "./hooks";
import type { CoursesQuery } from "./types";
import type { ApiEnvelope } from "../auth/types";
import type { CoursesListData } from "./types";

export type MarketplaceFilters = {
  category?: string;
  priceRange?: PriceRange;
  searchQuery?: string;
  sortBy?:
    | "most-relevant"
    | "a-z"
    | "z-a"
    | "price-low-high"
    | "price-high-low"
    | "rating-high-low"
    | "newest"
    | "video-first"
    | "document-first";
  type?: "video" | "document";
};

export function useMarketplace() {
  // State management
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sortOptions, setSortOptions] = useState<SortOptionItem[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange>({
    min: 0,
    max: 1000,
    currency: "USD",
  });
  const [filters, setFilters] = useState<MarketplaceFilters>({
    category: "",
    priceRange: { min: 0, max: 1000, currency: "USD" },
    searchQuery: "",
    sortBy: "most-relevant",
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
  const debouncedSearchQuery = useDebounce(filters.searchQuery || "", 350);

  // Map UI filters to backend query
  const backendParams = useMemo<CoursesQuery>(() => {
    const params: CoursesQuery = {
      q: debouncedSearchQuery || undefined,
      page: currentPage,
      limit: 20,
    };

    if (filters.type) params.type = filters.type;
    if (filters.priceRange) {
      // If UI price range was changed from defaults, pass it
      const { min, max } = filters.priceRange;
      if (typeof min === "number" && min >= 0) params.minPrice = min;
      if (typeof max === "number" && max >= 0) params.maxPrice = max;
    }

    // Map sort options
    const sortMapping: Record<
      NonNullable<MarketplaceFilters["sortBy"]>,
      {
        sortBy: CoursesQuery["sortBy"];
        sortOrder: CoursesQuery["sortOrder"];
        enforceType?: "video" | "document";
      }
    > = {
      "most-relevant": { sortBy: "averageRating", sortOrder: "desc" },
      "a-z": { sortBy: "title", sortOrder: "asc" },
      "z-a": { sortBy: "title", sortOrder: "desc" },
      // Backend now supports price sorting
      "price-low-high": { sortBy: "price", sortOrder: "asc" },
      "price-high-low": { sortBy: "price", sortOrder: "desc" },
      "rating-high-low": { sortBy: "averageRating", sortOrder: "desc" },
      newest: { sortBy: "createdAt", sortOrder: "desc" },
      "video-first": {
        sortBy: "createdAt",
        sortOrder: "desc",
        enforceType: "video",
      },
      "document-first": {
        sortBy: "createdAt",
        sortOrder: "desc",
        enforceType: "document",
      },
    };

    const mapping = sortMapping[filters.sortBy || "most-relevant"];
    if (mapping) {
      params.sortBy = mapping.sortBy;
      params.sortOrder = mapping.sortOrder;
      if (mapping.enforceType) params.type = mapping.enforceType;
    }

    return params;
  }, [
    debouncedSearchQuery,
    filters.sortBy,
    filters.type,
    filters.priceRange,
    currentPage,
  ]);

  // Reset pagination when filters change
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setProducts([]);
    setHasNextPage(false);
  }, []);

  // Load products with current filters and pagination
  const loadProducts = useCallback(
    async (page: number = 1, isLoadMore: boolean = false) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = { ...backendParams, page };
        const res = await MarketplaceAPI.listCourses(params);
        const envelope = res.data as ApiEnvelope<CoursesListData>;
        if (!envelope?.success)
          throw new Error(envelope?.message || "Failed to load products");

        const data = envelope.data!;
        const mapped = (data.courses || []).map(mapCourseToExtendedProduct);

        if (isLoadMore) {
          // Append new products for infinite scroll
          setProducts((prevProducts) => [...prevProducts, ...mapped]);
        } else {
          // Replace products for new search/filter
          setProducts(mapped);
        }
        setHasNextPage(data.pagination?.hasNextPage ?? false);
        setTotalCount(data.pagination?.totalCourses ?? mapped.length);
        setCurrentPage(page);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load products"
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setIsFetchingNextPage(false);
      }
    },
    [backendParams]
  );

  // Load more products for infinite scroll
  const loadMoreProducts = useCallback(async () => {
    if (hasNextPage && !loadingMore && !isFetchingNextPage) {
      setIsFetchingNextPage(true);
      await loadProducts(currentPage + 1, true);
    }
  }, [currentPage, hasNextPage, loadingMore, isFetchingNextPage, loadProducts]);

  // Intersection observer for infinite scroll
  const lastProductElementCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingMore || isFetchingNextPage) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage) {
            loadMoreProducts();
          }
        },
        {
          threshold: 0.1,
          rootMargin: "100px",
        }
      );

      if (node) observerRef.current.observe(node);
    },
    [loadingMore, isFetchingNextPage, hasNextPage, loadMoreProducts]
  );

  // Load categories on mount
  const loadCategories = useCallback(async () => {
    try {
      const res = await MarketplaceAPI.listCategories();
      const env = res.data as ApiEnvelope<unknown[]>;
      if (!env?.success)
        throw new Error(env?.message || "Failed to load categories");
      const normalized: Category[] = (env.data || []).map((raw) => {
        const c = raw as Record<string, unknown>;
        const id = (c["id"] ??
          c["_id"] ??
          c["value"] ??
          String(c["name"] || "unknown")) as string;
        const name = (c["name"] ?? c["label"] ?? "Unknown") as string;
        const countRaw = (c["count"] ??
          c["total"] ??
          c["totalCourses"] ??
          c["courseCount"] ??
          0) as number;
        const count = Number(countRaw) || 0;
        return { id, name, count };
      });
      setCategories(normalized);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories"
      );
    }
  }, []);

  // Load sort options on mount
  const loadSortOptions = useCallback(async () => {
    try {
      // Static sort options aligned with UI
      setSortOptions([
        { value: "most-relevant", label: "Most Relevant" },
        { value: "a-z", label: "A to Z" },
        { value: "z-a", label: "Z to A" },
        { value: "price-low-high", label: "Price: Low to High" },
        { value: "price-high-low", label: "Price: High to Low" },
        { value: "rating-high-low", label: "Rating: High to Low" },
        { value: "newest", label: "Newest" },
        { value: "video-first", label: "Video Courses First" },
        { value: "document-first", label: "Documents First" },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load sort options"
      );
    }
  }, []);

  // Load price range on mount
  const loadPriceRange = useCallback(async () => {
    try {
      // Backend doesn't provide price range; keep sensible defaults
      const pr = { min: 0, max: 1000, currency: "USD" } as PriceRange;
      setPriceRange(pr);
      setFilters((prev) => ({ ...prev, priceRange: pr }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load price range"
      );
    }
  }, []);

  // Load products when filters change
  useEffect(() => {
    resetPagination();
    loadProducts(1, false);
  }, [
    backendParams.sortBy,
    backendParams.sortOrder,
    debouncedSearchQuery,
    resetPagination,
    loadProducts,
  ]);

  // Load categories and initial data on mount
  useEffect(() => {
    loadCategories();
    loadSortOptions();
    loadPriceRange();
  }, [loadCategories, loadSortOptions, loadPriceRange]);

  // Filter update functions
  const updateFilters = useCallback(
    (newFilters: Partial<MarketplaceFilters>) => {
      setFilters((prev) => {
        const updated = { ...prev, ...newFilters };
        return updated;
      });
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({
      category: "",
      priceRange: priceRange, // Use the actual price range from backend
      searchQuery: "",
      sortBy: "most-relevant",
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
    refetch: () => loadProducts(1, false),
  };
}
