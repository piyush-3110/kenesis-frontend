"use client";

import { create } from "zustand";
import { AffiliateShowcaseStore, FilterType } from "../types";

export const useAffiliateShowcaseStore = create<AffiliateShowcaseStore>(
  (set, get) => ({
    products: [],
    filteredProducts: [],
    activeFilter: "all",
    searchQuery: "",
    isLoading: false,
    error: null,
    searchTimeout: null,

    setActiveFilter: (filter: FilterType) => {
      set({ activeFilter: filter, error: null });
      get().loadProducts();
    },

    setSearchQuery: (query: string) => {
      set({ searchQuery: query });

      // Clear previous timeout
      const currentTimeout = get().searchTimeout;
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }

      // Debounce the API call
      const timeoutId = setTimeout(() => {
        get().loadProducts();
      }, 300) as unknown as number;

      set({ searchTimeout: timeoutId });
    },

    // Note: data fetching moved to react-query hooks in features/affiliate/hooks.ts
    loadProducts: async () => {
      // Keep for compatibility; UI should use hooks for data
      set({ isLoading: false });
    },

    promoteProduct: async (): Promise<boolean> => {
      // Deprecated here; use useJoinAffiliate(courseId) from features/affiliate/hooks
      set({ error: "Deprecated: useJoinAffiliate hook in components" });
      return false;
    },

    clearError: () => {
      set({ error: null });
    },

    // Legacy method for backward compatibility
    applyFilters: () => {
      // Filtering is now handled by the API
      const { products } = get();
      set({ filteredProducts: products });
    },
  })
);
