/**
 * Types for My Products section
 * Updated to match "My Courses" backend API structure
 */

// Using the MyCourse structure from backend API
export interface Product {
  id: string;
  title: string;
  slug: string;
  type: 'video' | 'document';
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'published';
  shortDescription?: string;
  thumbnail?: string;
  stats: {
    rating?: number;
    reviewCount: number;
    duration?: number; // for video courses (in seconds)
    totalPages?: number; // for document courses
  };
  price: number;
  tokenToPayWith: string[]; // Array of accepted payment tokens
  affiliatePercentage: number;
  accessDuration: number; // -1 for unlimited
  availableQuantity: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  publishedAt?: string;
  
  // UI-specific computed properties for display
  studentCount: number; // Computed from enrollment or other metrics
  duration: string; // Formatted duration string (e.g., "24h 30m") - different from stats.duration
  category: string; // Computed from type or other fields
  tags: string[]; // Computed from tokenToPayWith or other fields
  isPublished: boolean; // Based on status === 'published'
  description: string; // Using shortDescription
}

export interface ProductStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  totalStudents: number;
  totalEarnings: number;
  averageRating: number;
}

export interface MyProductsStore {
  // State
  products: Product[];
  stats: ProductStats | null;
  loading: boolean;
  error: string | null;
  
  // Filters
  searchQuery: string;
  statusFilter: 'all' | 'published' | 'draft';
  typeFilter: 'all' | 'video' | 'document';
  categoryFilter: string;

  // Actions
  loadProducts: () => Promise<void>;
  loadStats: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: 'all' | 'published' | 'draft') => void;
  setTypeFilter: (type: 'all' | 'video' | 'document') => void;
  setCategoryFilter: (category: string) => void;
  resetFilters: () => void;
  resetError: () => void;
}

export interface ProductFilters {
  search: string;
  status: 'all' | 'published' | 'draft';
  type: 'all' | 'video' | 'document';
  category: string;
}
