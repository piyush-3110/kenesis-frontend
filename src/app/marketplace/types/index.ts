// Re-export existing types for consistency
export type { 
  Product, 
  Category, 
  PriceRange, 
  SortOptionItem,
  MarketplaceFilters,
  PaginatedResponse
} from '@/types/Product';

// Use the existing PaginatedResponse from lib/marketplaceApi
export type { PaginatedResponse as ApiPaginatedResponse } from '@/lib/marketplaceApiReal';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
