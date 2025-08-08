// Re-export existing types for consistency
export type { 
  Category, 
  PriceRange, 
  SortOptionItem,
  MarketplaceFilters,
  PaginatedResponse,
  CourseForMarketplacePage as Product
} from '@/types/Product';

// Use the existing PaginatedResponse from lib/marketplaceApi
export type { PaginatedResponse as ApiPaginatedResponse } from '@/lib/marketplaceApi';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
