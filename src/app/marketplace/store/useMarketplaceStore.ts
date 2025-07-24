import { create } from 'zustand';
import { Product, MarketplaceFilters } from '../types';

interface MarketplaceState {
  // Products data
  products: Product[];
  filteredProducts: Product[];
  categories: Array<{ id: string; name: string; count: number }>;
  
  // UI state
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  
  // Filters
  filters: MarketplaceFilters;
  
  // Actions
  setProducts: (products: Product[]) => void;
  setFilteredProducts: (products: Product[]) => void;
  setCategories: (categories: Array<{ id: string; name: string; count: number }>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  
  // Filter actions
  updateFilters: (filters: Partial<MarketplaceFilters>) => void;
  resetFilters: () => void;
  setSearchQuery: (query: string) => void;
  
  // Reset state
  reset: () => void;
}

const initialFilters: MarketplaceFilters = {
  category: 'all',
  priceRange: undefined,
  sortBy: 'popularity',
  searchQuery: '',
};

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  // Initial state
  products: [],
  filteredProducts: [],
  categories: [],
  loading: false,
  error: null,
  hasMore: true,
  currentPage: 1,
  totalPages: 1,
  filters: initialFilters,

  // Product actions
  setProducts: (products) => set({ products }),
  setFilteredProducts: (filteredProducts) => set({ filteredProducts }),
  setCategories: (categories) => set({ categories }),

  // UI actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setHasMore: (hasMore) => set({ hasMore }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setTotalPages: (totalPages) => set({ totalPages }),

  // Filter actions
  updateFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1, // Reset pagination when filters change
    })),

  resetFilters: () =>
    set({
      filters: initialFilters,
      currentPage: 1,
    }),

  setSearchQuery: (searchQuery) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery },
      currentPage: 1,
    })),

  // Reset all state
  reset: () =>
    set({
      products: [],
      filteredProducts: [],
      categories: [],
      loading: false,
      error: null,
      hasMore: true,
      currentPage: 1,
      totalPages: 1,
      filters: initialFilters,
    }),
}));

// Selectors for optimal performance
export const useMarketplaceProducts = () => useMarketplaceStore((state) => state.filteredProducts);
export const useMarketplaceLoading = () => useMarketplaceStore((state) => state.loading);
export const useMarketplaceError = () => useMarketplaceStore((state) => state.error);
export const useMarketplaceFilters = () => useMarketplaceStore((state) => state.filters);
export const useMarketplacePagination = () => useMarketplaceStore((state) => ({
  currentPage: state.currentPage,
  totalPages: state.totalPages,
  hasMore: state.hasMore,
}));
