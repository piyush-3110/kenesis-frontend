'use client';

import { create } from 'zustand';
import { AffiliateShowcaseStore, FilterType } from '../types';
import { 
  getNonAffiliatedProducts, 
  createAffiliateLink,
  GetProductsParams 
} from '../api/affiliateApi';

export const useAffiliateShowcaseStore = create<AffiliateShowcaseStore>((set, get) => ({
  products: [],
  filteredProducts: [],
  activeFilter: 'all',
  searchQuery: '',
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

  loadProducts: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { activeFilter, searchQuery } = get();
      
      const params: GetProductsParams = {
        page: 1,
        limit: 50,
        search: searchQuery || undefined,
        type: activeFilter,
      };
      
      const response = await getNonAffiliatedProducts(params);
      
      if (response.success) {
        set({ 
          products: response.data,
          filteredProducts: response.data,
          isLoading: false,
          error: null
        });
      } else {
        const errorMsg = response.message || 'Failed to load products';
        set({ 
          isLoading: false,
          error: errorMsg
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while loading products';
      
      set({ 
        isLoading: false,
        error: errorMsg
      });
    }
  },

  promoteProduct: async (productId: string): Promise<boolean> => {
    try {
      // TODO: Get actual user ID from auth store when available
      const userId = 'mock-user-id';
      
      const response = await createAffiliateLink({
        productId,
        userId,
      });
      
      if (response.success) {
        // Remove the product from the list since it's now affiliated
        const { products, filteredProducts } = get();
        const updatedProducts = products.filter(p => p.id !== productId);
        const updatedFilteredProducts = filteredProducts.filter(p => p.id !== productId);
        
        set({ 
          products: updatedProducts,
          filteredProducts: updatedFilteredProducts 
        });
        
        return true;
      } else {
        set({ error: response.message || 'Failed to create affiliate link' });
        return false;
      }
    } catch (error) {
      const errorMsg = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while creating affiliate link';
      
      set({ error: errorMsg });
      return false;
    }
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
}));
