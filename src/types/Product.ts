export interface Product {
  id: string;
  title: string;
  description: string;
  author: string;
  price: number;
  currency: string; // Always "USD"
  rating: number;
  totalRatings: number;
  image: string;
  category: string;
  type: 'video' | 'document';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string; // Always "USD"
}

export interface SortOptionItem {
  value: string;
  label: string;
}

export interface MarketplaceFilters {
  category?: string;
  priceRange?: PriceRange;
  searchQuery?: string;
  sortBy?: string;
  type?: 'video' | 'document'; // Optional type filter
}

export type SortOption = 'a-z' | 'z-a' | 'price-low-high' | 'price-high-low' | 'most-relevant' | 'rating-high-low' | 'newest';

export interface MarketplaceResponse {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
