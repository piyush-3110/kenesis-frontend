// Re-export existing types for consistency
export type { 
  Product, 
  Category, 
  PriceRange, 
  SortOptionItem,
  MarketplaceFilters as ExistingMarketplaceFilters,
  PaginatedResponse
} from '@/types/Product';

// Extended marketplace-specific types
export interface MarketplaceFilters {
  category: string;
  priceRange: {
    min: number;
    max: number;
  } | null;
  sortBy: 'popularity' | 'price-low' | 'price-high' | 'newest';
  searchQuery: string;
  type?: 'video' | 'document' | 'all';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
