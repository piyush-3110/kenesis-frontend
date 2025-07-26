'use client';

import { create } from 'zustand';
import { AffiliatedProduct, AffiliationStats, AffiliationFilters } from '../types';
import { 
  getMyAffiliations, 
  getAffiliationStats, 
  updateAffiliationStatus,
  getAffiliateSellers,
  getAffiliateCategories
} from '../api/affiliationsApi';

interface MyAffiliationsStore {
  // State
  affiliations: AffiliatedProduct[];
  stats: AffiliationStats | null;
  availableSellers: string[];
  availableCategories: string[];
  filters: AffiliationFilters;
  loading: boolean;
  error: string | null;

  // Actions
  loadAffiliations: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadFilters: () => Promise<void>;
  setFilters: (filters: Partial<AffiliationFilters>) => void;
  updateStatus: (id: string, status: 'active' | 'inactive') => Promise<boolean>;
  resetError: () => void;
}

export const useMyAffiliationsStore = create<MyAffiliationsStore>((set, get) => ({
  // Initial state
  affiliations: [],
  stats: null,
  availableSellers: [],
  availableCategories: [],
  filters: {
    status: 'all',
    sortBy: 'created',
    sortOrder: 'desc'
  },
  loading: false,
  error: null,

  // Load affiliations with current filters
  loadAffiliations: async () => {
    set({ loading: true, error: null });
    
    try {
      const affiliations = await getMyAffiliations(get().filters);
      set({ affiliations, loading: false });
    } catch (error) {
      console.error('Failed to load affiliations:', error);
      set({ 
        error: 'Failed to load affiliations. Please try again.', 
        loading: false 
      });
    }
  },

  // Load statistics
  loadStats: async () => {
    try {
      const stats = await getAffiliationStats();
      set({ stats });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  },

  // Load filter options
  loadFilters: async () => {
    try {
      const [sellers, categories] = await Promise.all([
        getAffiliateSellers(),
        getAffiliateCategories()
      ]);
      set({ availableSellers: sellers, availableCategories: categories });
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  },

  // Update filters and reload data
  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
    
    // Reload data with new filters
    get().loadAffiliations();
  },

  // Update affiliation status
  updateStatus: async (id, status) => {
    try {
      const success = await updateAffiliationStatus(id, status);
      
      if (success) {
        set(state => ({
          affiliations: state.affiliations.map(affiliation =>
            affiliation.id === id ? { ...affiliation, status } : affiliation
          )
        }));
        
        // Reload stats to reflect changes
        get().loadStats();
      }
      
      return success;
    } catch (error) {
      console.error('Failed to update status:', error);
      set({ error: 'Failed to update status. Please try again.' });
      return false;
    }
  },

  // Reset error state
  resetError: () => {
    set({ error: null });
  }
}));
