import { Category as ProductCategory } from "@/types/Product";

// Course Interface as per backend API
export interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  price: number;
  affiliatePercentage: number;
  averageRating: number;
  reviewCount: number;
  type: "video" | "document";
  level: "beginner" | "intermediate" | "advanced";
  soldCount: number;
  instructor?: Instructor;
  categories: Category[];
}

export interface Instructor {
  id: string;
  username?: string;
  avatar?: string;
}

// Use the main Product Category interface to maintain consistency
export type Category = ProductCategory;

export interface PaginationData {
  total: number;
  page: number;
  totalPages: number;
}

export interface AvailableCoursesResponse {
  courses: Course[];
  total: number;
  page: number;
  totalPages: number;
}

// Request Parameters Interface
export interface CourseFilters {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?:
    | "createdAt"
    | "affiliatePercentage"
    | "price"
    | "averageRating"
    | "soldCount"
    | "reviewCount";
  sortOrder?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
  minCommission?: number;
  maxCommission?: number;
  categoryIds?: string; // Comma-separated IDs
  type?: "video" | "document";
  level?: "beginner" | "intermediate" | "advanced";
}

// Legacy support - keeping for backward compatibility
export interface AffiliateProduct extends Course {
  author: string;
  rating: number;
  commission: number;
  category: string;
  description?: string;
}

export type FilterType = "all" | "video" | "document";

// Enhanced filter state for advanced filtering
export interface FilterState {
  search: string;
  type: "video" | "document" | "";
  level: "beginner" | "intermediate" | "advanced" | "";
  minPrice: number;
  maxPrice: number;
  minRating: number;
  maxRating: number;
  minCommission: number;
  maxCommission: number;
  selectedCategories: string[];
  sortBy: CourseFilters["sortBy"];
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

export interface AffiliateShowcaseStore {
  // Data
  courses: Course[];
  categories: Category[];

  // Filter state
  filters: FilterState;

  // UI state
  isLoading: boolean;
  error: string | null;
  searchTimeout: number | null;

  // Pagination
  pagination: PaginationData;

  // Actions
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

  // Data fetching
  loadCourses: () => Promise<void>;
  loadCategories: () => Promise<void>;

  // Legacy methods (deprecated)
  setActiveFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;
  loadProducts: () => Promise<void>;
  promoteProduct: (productId: string) => Promise<boolean>;
  clearError: () => void;
  applyFilters: () => void;
}
