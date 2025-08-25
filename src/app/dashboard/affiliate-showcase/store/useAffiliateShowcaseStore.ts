"use client";

import { create } from "zustand";
import { FilterType, FilterState } from "../types";

// Default filter state
const defaultFilters: FilterState = {
  search: "",
  type: "",
  level: "",
  minPrice: 0,
  maxPrice: 1000,
  minRating: 0,
  maxRating: 5,
  minCommission: 0,
  maxCommission: 50,
  selectedCategories: [],
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: 10,
};

interface AffiliateFiltersStore {
  // Filter state only (no data or loading states)
  filters: FilterState;
  searchTimeout: number | null;

  // Filter actions
  setSearch: (query: string) => void;
  setType: (type: FilterState["type"]) => void;
  setLevel: (level: FilterState["level"]) => void;
  setPriceRange: (min: number, max: number) => void;
  setRatingRange: (min: number, max: number) => void;
  setCommissionRange: (min: number, max: number) => void;
  setCategories: (categoryIds: string[]) => void;
  setSorting: (
    sortBy: FilterState["sortBy"],
    sortOrder: FilterState["sortOrder"]
  ) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;

  // Legacy methods for backward compatibility
  setActiveFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;
}

export const useAffiliateShowcaseStore = create<AffiliateFiltersStore>(
  (set, get) => ({
    // Filter state
    filters: defaultFilters,
    searchTimeout: null,

    // Filter actions
    setSearch: (query: string) => {
      // Clear previous timeout
      const currentTimeout = get().searchTimeout;
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }

      // Set a new timeout for debouncing
      const timeoutId = setTimeout(() => {
        set((state) => ({
          filters: { ...state.filters, search: query, page: 1 },
        }));
      }, 500) as unknown as number; // Increased debounce time to 500ms

      set({ searchTimeout: timeoutId });
    },

    setType: (type: FilterState["type"]) => {
      set((state) => ({
        filters: { ...state.filters, type, page: 1 },
      }));
    },

    setLevel: (level: FilterState["level"]) => {
      set((state) => ({
        filters: { ...state.filters, level, page: 1 },
      }));
    },

    setPriceRange: (min: number, max: number) => {
      set((state) => ({
        filters: { ...state.filters, minPrice: min, maxPrice: max, page: 1 },
      }));
    },

    setRatingRange: (min: number, max: number) => {
      set((state) => ({
        filters: { ...state.filters, minRating: min, maxRating: max, page: 1 },
      }));
    },

    setCommissionRange: (min: number, max: number) => {
      set((state) => ({
        filters: {
          ...state.filters,
          minCommission: min,
          maxCommission: max,
          page: 1,
        },
      }));
    },

    setCategories: (categoryIds: string[]) => {
      set((state) => ({
        filters: { ...state.filters, selectedCategories: categoryIds, page: 1 },
      }));
    },

    setSorting: (
      sortBy: FilterState["sortBy"],
      sortOrder: FilterState["sortOrder"]
    ) => {
      set((state) => ({
        filters: { ...state.filters, sortBy, sortOrder, page: 1 },
      }));
    },

    setPage: (page: number) => {
      set((state) => ({
        filters: { ...state.filters, page },
      }));
    },

    resetFilters: () => {
      set({ filters: defaultFilters });
    },

    // Legacy methods for backward compatibility
    setActiveFilter: (filter: FilterType) => {
      const type = filter === "all" ? "" : filter;
      get().setType(type as FilterState["type"]);
    },

    setSearchQuery: (query: string) => {
      get().setSearch(query);
    },
  })
);
