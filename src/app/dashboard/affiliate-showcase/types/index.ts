export interface AffiliateProduct {
  id: string;
  title: string;
  author: string;
  rating: number;
  reviewCount: number;
  price: number;
  commission: number;
  category: string;
  type: 'video' | 'document';
  thumbnail: string;
  description?: string;
}

export type FilterType = 'all' | 'video' | 'document';

export interface AffiliateShowcaseStore {
  products: AffiliateProduct[];
  filteredProducts: AffiliateProduct[];
  activeFilter: FilterType;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  searchTimeout: number | null;
  setActiveFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;
  loadProducts: () => Promise<void>;
  promoteProduct: (productId: string) => Promise<boolean>;
  clearError: () => void;
  applyFilters: () => void;
}
