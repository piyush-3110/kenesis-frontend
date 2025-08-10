import { TokenManager } from "@/features/auth/tokenManager";
import {
  Category,
  MarketplaceFilters,
  SortOptionItem,
  PriceRange,
  CourseForMarketplacePage,
} from "@/types/Product";

// Cache for reducing API calls
let categoriesCache: { data: Category[]; timestamp: number } | null = null;
let priceRangeCache: { data: PriceRange; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to check if cache is valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

// Backend API response types
interface BackendCourse {
  id: string;
  title: string;
  slug: string;
  type: "video" | "document";
  shortDescription: string;
  thumbnail: string;
  isPublished: boolean;
  instructor: {
    id: string;
    username: string;
    avatar: string;
  };
  price: number;
  stats: {
    rating: number;
    reviewCount: number;
    duration: number;
  };
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendApiResponse {
  success: boolean;
  message: string;
  data: {
    courses: BackendCourse[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCourses: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    };
    filters: {
      q: string | null;
      type: string | null;
      level: string | null;
      instructor: string | null;
      sortBy: string;
      sortOrder: string;
    };
  };
}

// Base API URL - this should be configured based on environment
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Helper function to get headers with optional authentication
const getHeaders = (includeAuth: boolean = false): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = TokenManager.getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper function to map backend course to frontend Product
const mapCourseToProduct = (
  course: BackendCourse
): CourseForMarketplacePage => {
  // Map course level to a category for now - you may want to implement proper categories later

  return {
    id: course.id,
    title: course.title,
    slug: course.slug, // Add slug from backend
    description: course.shortDescription,
    instructor: {
      id: course.instructor.id,
      username: course.instructor.username,
    },
    price: course.price,
    stats: {
      rating: course.stats.rating,
      reviewCount: course.stats.reviewCount,
      duration: course.stats.duration, // Duration in seconds
    },
    thumbnail: course.thumbnail || "/images/landing/product.png", // Fallback to default image
    type: course.type,
    createdAt: course.createdAt.split("T")[0], // Convert to YYYY-MM-DD format
  };
};

// Helper function to map frontend sort options to backend parameters
const mapSortToBackend = (sortBy: string) => {
  const sortMapping: Record<string, { sortBy: string; sortOrder: string }> = {
    "most-relevant": { sortBy: "createdAt", sortOrder: "desc" },
    "a-z": { sortBy: "title", sortOrder: "asc" },
    "z-a": { sortBy: "title", sortOrder: "desc" },
    "price-low-high": { sortBy: "price", sortOrder: "asc" },
    "price-high-low": { sortBy: "price", sortOrder: "desc" },
    "rating-high-low": { sortBy: "averageRating", sortOrder: "desc" },
    newest: { sortBy: "createdAt", sortOrder: "desc" },
    "video-first": { sortBy: "createdAt", sortOrder: "desc" }, // Will handle type filtering separately
    "document-first": { sortBy: "createdAt", sortOrder: "desc" }, // Will handle type filtering separately
  };

  return sortMapping[sortBy] || { sortBy: "createdAt", sortOrder: "desc" };
};

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

/**
 * Fetch products with pagination and filtering from the backend API
 */
export async function fetchProducts(
  filters: MarketplaceFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<CourseForMarketplacePage>> {
  try {
    // Build query parameters
    const params = new URLSearchParams();

    // Add pagination
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    // Add search query
    if (filters.searchQuery) {
      params.append("q", filters.searchQuery);
    }

    // Add type filter
    if (filters.type) {
      params.append("type", filters.type);
    }

    // Map level filtering (if we want to support category as level)
    if (
      filters.category &&
      filters.category !== "all" &&
      filters.category !== ""
    ) {
      // If category maps to level, add level filter
      const categoryToLevel: Record<string, string> = {
        "beginner-courses": "beginner",
        "intermediate-courses": "intermediate",
        "advanced-courses": "advanced",
      };

      const level =
        categoryToLevel[filters.category.toLowerCase().replace(/\s+/g, "-")];
      if (level) {
        params.append("level", level);
      }
    }

    // Add sorting
    if (filters.sortBy) {
      const { sortBy, sortOrder } = mapSortToBackend(filters.sortBy);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);
    }

    // Make API call
    const response = await fetch(
      `${API_BASE_URL}/api/courses?${params.toString()}`,
      {
        method: "GET",
        headers: getHeaders(), // Public endpoint, no auth required
      }
    );

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const apiResponse: BackendApiResponse = await response.json();

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || "API request failed");
    }

    // Map backend courses to frontend products
    const products = apiResponse.data.courses.map(mapCourseToProduct);

    console.log("Fetched Products:", products);

    // Apply client-side price filtering if needed (backend doesn't support price filtering yet)
    let filteredProducts = products;
    if (filters.priceRange) {
      filteredProducts = products.filter(
        (product) =>
          product.price >= filters.priceRange!.min &&
          product.price <= filters.priceRange!.max
      );
    }

    // Apply client-side type-first sorting if needed
    if (filters.sortBy === "video-first") {
      filteredProducts.sort((a, b) => {
        if (a.type === "video" && b.type === "document") return -1;
        if (a.type === "document" && b.type === "video") return 1;
        return 0;
      });
    } else if (filters.sortBy === "document-first") {
      filteredProducts.sort((a, b) => {
        if (a.type === "document" && b.type === "video") return -1;
        if (a.type === "video" && b.type === "document") return 1;
        return 0;
      });
    }

    // Return in the expected format
    return {
      data: filteredProducts,
      pagination: {
        page: apiResponse.data.pagination.currentPage,
        limit: apiResponse.data.pagination.limit,
        total: apiResponse.data.pagination.totalCourses,
        totalPages: apiResponse.data.pagination.totalPages,
        hasNextPage: apiResponse.data.pagination.hasNextPage,
        hasPrevPage: apiResponse.data.pagination.hasPrevPage,
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch products"
    );
  }
}

/**
 * Fetch categories from the backend API
 * Since the backend doesn't have categories yet, we'll use course levels as categories
 * Uses caching to reduce API calls and prevent rate limiting
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    // Check cache first
    if (categoriesCache && isCacheValid(categoriesCache.timestamp)) {
      return categoriesCache.data;
    }

    // For now, we'll return static categories based on course levels
    // This avoids the expensive API call that was causing rate limiting
    const categories: Category[] = [
      { id: "beginner-courses", name: "Beginner Courses", count: 0 },
      { id: "intermediate-courses", name: "Intermediate Courses", count: 0 },
      { id: "advanced-courses", name: "Advanced Courses", count: 0 },
    ];

    // Optionally get actual counts by making a much lighter API request
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/courses?limit=1&page=1`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (response.ok) {
        const apiResponse: BackendApiResponse = await response.json();
        if (apiResponse.success) {
          // Use total count from pagination to give a rough estimate
          const totalCourses = apiResponse.data.pagination.totalCourses;
          // Distribute courses roughly equally across levels for now
          const estimatePerLevel = Math.ceil(totalCourses / 3);

          categories.forEach((category) => {
            category.count = estimatePerLevel;
          });
        }
      }
    } catch (error) {
      console.warn("Failed to fetch course counts for categories:", error);
      // Set default counts to show categories
      categories.forEach((category) => {
        category.count = 10; // Default count to show the category
      });
    }

    // Cache the result
    categoriesCache = {
      data: categories,
      timestamp: Date.now(),
    };

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    // Return default categories if API fails
    return [
      { id: "beginner-courses", name: "Beginner Courses", count: 10 },
      { id: "intermediate-courses", name: "Intermediate Courses", count: 10 },
      { id: "advanced-courses", name: "Advanced Courses", count: 10 },
    ];
  }
}

/**
 * Fetch sort options
 * Returns available sort options for the marketplace
 */
export async function fetchSortOptions(): Promise<SortOptionItem[]> {
  // These are static sort options that work with the backend API
  return [
    { value: "most-relevant", label: "Most Relevant" },
    { value: "a-z", label: "A to Z" },
    { value: "z-a", label: "Z to A" },
    { value: "price-low-high", label: "Price: Low to High" },
    { value: "price-high-low", label: "Price: High to Low" },
    { value: "rating-high-low", label: "Rating: High to Low" },
    { value: "newest", label: "Newest" },
    { value: "video-first", label: "Video Courses First" },
    { value: "document-first", label: "Documents First" },
  ];
}

/**
 * Fetch price range from backend API
 * Gets the min/max price range from all courses
 * Uses caching to reduce API calls and prevent rate limiting
 */
export async function fetchPriceRange(): Promise<PriceRange> {
  try {
    // Check cache first
    if (priceRangeCache && isCacheValid(priceRangeCache.timestamp)) {
      return priceRangeCache.data;
    }

    // For now, return a reasonable default range to avoid expensive API calls
    // In production, this could be fetched from a dedicated analytics endpoint
    const defaultRange: PriceRange = {
      min: 0,
      max: 500,
      currency: "USD",
    };

    // Cache the result
    priceRangeCache = {
      data: defaultRange,
      timestamp: Date.now(),
    };

    return defaultRange;
  } catch (error) {
    console.error("Error fetching price range:", error);
    return {
      min: 0,
      max: 500,
      currency: "USD",
    };
  }
}

/**
 * Search suggestions (for autocomplete)
 * This could be implemented as a separate backend endpoint in the future
 */
export async function fetchSearchSuggestions(
  query: string
): Promise<{ text: string; type: string }[]> {
  if (!query.trim() || query.length < 2) return [];

  try {
    // Use the search functionality from the courses endpoint
    const response = await fetch(
      `${API_BASE_URL}/api/courses?q=${encodeURIComponent(query)}&limit=10`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    if (response.ok) {
      const apiResponse: BackendApiResponse = await response.json();
      if (apiResponse.success) {
        const suggestions = new Set<string>();

        // Extract suggestions from course titles and instructor names
        apiResponse.data.courses.forEach((course) => {
          if (course.title.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(course.title);
          }
          if (
            course.instructor.username
              .toLowerCase()
              .includes(query.toLowerCase())
          ) {
            suggestions.add(course.instructor.username);
          }
        });

        return Array.from(suggestions)
          .slice(0, 8)
          .map((text) => ({ text, type: "suggestion" }));
      }
    }

    return [];
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return [];
  }
}

/**
 * Search products (for autocomplete/suggestions)
 * Uses the courses API to search for products
 */
export async function searchProducts(
  query: string
): Promise<CourseForMarketplacePage[]> {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/courses?q=${encodeURIComponent(query)}&limit=10`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    if (response.ok) {
      const apiResponse: BackendApiResponse = await response.json();
      if (apiResponse.success) {
        return apiResponse.data.courses.map(mapCourseToProduct);
      }
    }

    return [];
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}

/**
 * Get type statistics
 * Returns the count of video vs document courses
 */
export async function fetchTypeStats(): Promise<{
  video: number;
  document: number;
}> {
  try {
    // Return default stats to avoid expensive API calls
    // In production, this could be fetched from a dedicated analytics endpoint
    return { video: 50, document: 30 }; // Default estimates
  } catch (error) {
    console.error("Error fetching type stats:", error);
    return { video: 0, document: 0 };
  }
}
