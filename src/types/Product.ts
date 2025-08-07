export interface Course {
  id: string;
  title: string;
  type: "video" | "document";
  description: string;
  shortDescription: string;
  thumbnail: string;
  previewVideo: string;
  isPublished: boolean;
  instructor: {
    id: string;
    username: string;
  };
  price: number;
  slug?: string; // URL-friendly identifier for the product
  level: "beginner" | "intermediate" | "advanced";
  affiliatePercentage: number;
  tokenToPayWith: string[]; // ["USDT-1", [USDC-1]], Basically ["TOKEN_SYMBOL-CHAIN_ID"]
  accessDuration: number; // in seconds, -1 if infinite access
  availableQuantity: number; // total number of times that the course can be sold -1 for unlimited
  soldCount: number; // Total number of products sold
  stats: {
    rating: number; // Average rating
    reviewCount: number; // Total number of reviews
    duration: number; // Total duration in seconds (for video courses)
  };
  language: string; // en, es, fr, etc.
  chapters: [
    {
      id: string;
      title: string;
      description?: string;
      order: number;
      moduleCount: number;
    }
  ];
  metadata: {
    requirements: string[];
    learningOutcomes: string[];
    targetAudience: string[];
    level: string; // beginner, intermediate, advanced
    tags: string[]; // e.g., ["web development", "javascript"]
  };
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string, optional for products that are not updated
  // Course access information (fetched separately)
  courseAccess?: {
    hasAccess: boolean;
    progress?: number; // 0-100 percentage
  };
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
  type?: "video" | "document"; // Optional type filter
}

export type SortOption =
  | "a-z"
  | "z-a"
  | "price-low-high"
  | "price-high-low"
  | "most-relevant"
  | "rating-high-low"
  | "newest";

export interface MarketplaceResponse {
  products: Omit<
    Course[],
    | "chapters"
    | "description"
    | "previewVideo"
    | "tokenToPayWith"
    | "accessDuration"
    | "availableQuantity"
    | "soldCount"
    | "metadata"
    | "affiliatePercentage"
  >;
}

export interface CourseForMarketplacePage {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructor: {
    id: string;
    username: string;
  };
  price: number;
  stats: {
    rating: number;
    reviewCount: number;
    duration: number;
  };
  thumbnail: string;
  category: string;
  type: "video" | "document";
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCourses: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}
