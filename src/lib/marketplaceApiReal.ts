/**
 * Consolidated Marketplace API
 * Single source of truth for all marketplace-related API calls
 * Connects to the Kenesis Backend with proper error handling and caching
 */

import {
  Category,
  MarketplaceFilters,
  SortOptionItem,
  PriceRange,
  CourseForMarketplacePage,
} from "@/types/Product";
import { CourseAPI } from "./api";
import { MarketplaceAPI } from "@/features/marketplace/api";

// Cache for reducing API calls
let priceRangeCache: { data: PriceRange; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to check if cache is valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

// Backend course type definitions for safe transformation
interface RawCourseInstructor {
  id?: string;
  _id?: string;
  username?: string;
  name?: string;
  avatar?: string;
}
interface RawCourseCategory {
  id?: string;
  _id?: string;
  name: string;
}
interface RawCourseStats {
  rating?: number;
  reviewCount?: number;
  duration?: number;
}
interface RawCourse {
  id?: string;
  _id?: string;
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  instructor?: RawCourseInstructor;
  price?: number;
  pricing?: { amount?: number };
  stats?: RawCourseStats;
  rating?: number;
  thumbnail?: string;
  type?: string;
  level?: "beginner" | "intermediate" | "advanced";
  language?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
  categories?: RawCourseCategory[];
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

/**
 * Transform backend course data to frontend Product format
 */
function transformCourseToProduct(course: RawCourse): CourseForMarketplacePage {
  try {
    return {
      id: course.id || course._id || "unknown",
      title: course.title || "Untitled Course",
      slug: course.slug || "untitled-course",
      description: course.shortDescription || course.description || "",
      shortDescription: course.shortDescription,
      instructor: {
        id: course.instructor?.id || course.instructor?._id || "unknown",
        username:
          course.instructor?.username ||
          course.instructor?.name ||
          "Unknown Author",
        avatar: course.instructor?.avatar,
      },
      price: course.price ?? course.pricing?.amount ?? 0,
      stats: {
        rating: course.stats?.rating ?? course.rating ?? 0,
        reviewCount: course.stats?.reviewCount ?? 0,
        duration: course.stats?.duration ?? 0,
      },
      thumbnail: course.thumbnail || "/images/landing/product.png",
      type: course.type === "document" ? "document" : "video",
      level: course.level,
      language: course.language,
      isPublished: course.isPublished ?? true,
      createdAt: course.createdAt || new Date().toISOString(),
      updatedAt: course.updatedAt,
      categories: course.categories?.map((c: RawCourseCategory) => ({
        id: c.id || c._id || "unknown",
        name: c.name,
      })),
    };
  } catch (error) {
    console.error("Error transforming course to product:", error, course);
    // Return a fallback object to prevent crashes
    return {
      id: course?.id || course?._id || "unknown",
      title: course?.title || "Untitled Course",
      slug: course?.slug || "untitled-course",
      description: "",
      instructor: {
        id: course?.instructor?.id || "unknown",
        username: course?.instructor?.username || "Unknown Author",
      },
      price: 0,
      stats: {
        duration: 0,
        rating: 0,
        reviewCount: 0,
      },
      thumbnail: "/images/landing/product.png",
      type: "video",
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Fetch products with pagination and filtering
 * Makes API call to backend /api/courses endpoint via CourseAPI
 */
export async function fetchProducts(
  filters: MarketplaceFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<CourseForMarketplacePage>> {
  try {
    console.log("🔍 Fetching products from backend with filters:", filters);

    // Prepare API parameters
    const apiParams: { [key: string]: string | number } = {
      page,
      limit,
    };

    // Map frontend filters to backend parameters
    if (filters.searchQuery) {
      apiParams.q = filters.searchQuery; // Backend uses 'q' parameter for search
    }

    // Single legacy category (map to categoryIds)
    if (
      filters.category &&
      filters.category !== "all" &&
      filters.category !== ""
    ) {
      apiParams.categoryIds = filters.category;
    }
    // Multi-select categories
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      apiParams.categoryIds = filters.categoryIds.join(",");
    }

    if (filters.type) {
      apiParams.type = filters.type;
    }

    if (filters.sortBy) {
      // Map frontend sort options to backend format
      const sortMapping: Record<string, { sortBy: string; sortOrder: string }> =
        {
          "most-relevant": { sortBy: "averageRating", sortOrder: "desc" },
          "a-z": { sortBy: "title", sortOrder: "asc" },
          "z-a": { sortBy: "title", sortOrder: "desc" },
          "price-low-high": { sortBy: "price", sortOrder: "asc" },
          "price-high-low": { sortBy: "price", sortOrder: "desc" },
          "rating-high-low": { sortBy: "averageRating", sortOrder: "desc" },
          newest: { sortBy: "createdAt", sortOrder: "desc" },
          "video-first": { sortBy: "createdAt", sortOrder: "desc" },
          "document-first": { sortBy: "createdAt", sortOrder: "desc" },
        };
      const mapping = sortMapping[filters.sortBy];
      if (mapping) {
        apiParams.sortBy = mapping.sortBy;
        apiParams.sortOrder = mapping.sortOrder;
      }
    }

    if (filters.priceRange) {
      apiParams.minPrice = filters.priceRange.min;
      apiParams.maxPrice = filters.priceRange.max;
    }

    // Make API call to backend via CourseAPI
    const response = await CourseAPI.getPublishedCourses(apiParams);

    if (!response.success) {
      console.error(
        "❌ Failed to fetch products from backend:",
        response.message
      );
      // Return empty result instead of throwing error to prevent app crash
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    // Transform backend courses to frontend products
    const products =
      response.data?.courses?.map(transformCourseToProduct) || [];

    console.log(
      `✅ Successfully fetched ${products.length} products from backend`
    );

    return {
      data: products,
      pagination: response.data?.pagination
        ? {
            page: response.data.pagination.currentPage,
            limit: response.data.pagination.limit,
            total: response.data.pagination.totalCourses,
            totalPages: response.data.pagination.totalPages,
            hasNextPage: response.data.pagination.hasNextPage,
            hasPrevPage: response.data.pagination.hasPrevPage,
          }
        : {
            page,
            limit,
            total: products.length,
            totalPages: Math.ceil(products.length / limit),
            hasNextPage: false,
            hasPrevPage: false,
          },
    };
  } catch (error) {
    console.error("💥 Error fetching products from backend:", error);

    // Return empty result instead of throwing error to prevent app crash
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
}

/**
 * Fetch categories from backend
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    console.log("🏷️ Fetching categories from backend");

    const response = await MarketplaceAPI.listCategories();

    console.log(response);

    if (!response.data.success) {
      console.error(
        "❌ Failed to fetch categories from backend:",
        response.data.message
      );
      return [];
    }

    console.log("categories apni: ", response.data);

    // Transform backend categories to include count for marketplace display
    const categories = response.data.data || [];

    return categories;
  } catch (error) {
    console.error("💥 Error fetching categories from backend:", error);
    return [];
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
 * Fetch price range from backend
 * This could be enhanced to be a backend endpoint in the future
 */
export async function fetchPriceRange(): Promise<PriceRange> {
  try {
    console.log("💰 Fetching price range from backend");

    // Check cache first
    if (priceRangeCache && isCacheValid(priceRangeCache.timestamp)) {
      return priceRangeCache.data;
    }

    // For now, we fetch a sample of products and calculate the range
    // In the future, this could be a dedicated backend endpoint
    const response = await CourseAPI.getPublishedCourses({ limit: 1000 }); // Get many to calculate range

    if (!response.success || !response.data?.courses) {
      console.error(
        "❌ Failed to fetch price range from backend:",
        response.message
      );
      return { min: 0, max: 1000, currency: "USD" };
    }

    const prices = response.data.courses.map(
      (course: RawCourse) => course.price || 0
    );

    if (prices.length === 0) {
      return { min: 0, max: 1000, currency: "USD" };
    }

    const priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices),
      currency: "USD",
    };

    // Cache the result
    priceRangeCache = {
      data: priceRange,
      timestamp: Date.now(),
    };

    console.log(
      "✅ Successfully calculated price range from backend:",
      priceRange
    );
    return priceRange;
  } catch (error) {
    console.error("💥 Error fetching price range from backend:", error);
    return { min: 0, max: 1000, currency: "USD" };
  }
}

/**
 * Search suggestions (for autocomplete)
 */
export async function fetchSearchSuggestions(
  query: string
): Promise<{ text: string; type: string }[]> {
  if (!query.trim() || query.length < 2) return [];

  try {
    console.log("🔍 Fetching search suggestions from backend for:", query);

    const response = await CourseAPI.getPublishedCourses({
      q: query,
      limit: 8, // Limit for suggestions
    });

    if (!response.success || !response.data?.courses) {
      console.error(
        "❌ Failed to fetch search suggestions from backend:",
        response.message
      );
      return [];
    }

    const suggestions = new Set<string>();

    // Extract suggestions from course titles and authors
    response.data.courses.forEach((course: RawCourse) => {
      if (course.title) suggestions.add(course.title);
      if (course.instructor?.username)
        suggestions.add(course.instructor.username);
    });

    const result = Array.from(suggestions)
      .slice(0, 8)
      .map((text) => ({ text, type: "suggestion" }));

    console.log(
      `✅ Successfully fetched ${result.length} search suggestions from backend`
    );
    return result;
  } catch (error) {
    console.error("💥 Error fetching search suggestions from backend:", error);
    return [];
  }
}

/**
 * Search products (for autocomplete/suggestions)
 */
export async function searchProducts(
  query: string
): Promise<CourseForMarketplacePage[]> {
  if (!query.trim()) return [];

  try {
    console.log("🔍 Searching products from backend for:", query);

    const response = await CourseAPI.getPublishedCourses({
      q: query,
      limit: 10, // Limit search results for performance
    });

    if (!response.success || !response.data?.courses) {
      console.error(
        "❌ Failed to search products from backend:",
        response.message
      );
      return [];
    }

    const products = response.data.courses.map(transformCourseToProduct);
    console.log(
      `✅ Successfully found ${products.length} products from backend search`
    );

    return products;
  } catch (error) {
    console.error("💥 Error searching products from backend:", error);
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
    console.log("📊 Fetching type statistics from backend");

    // Fetch video and document counts separately
    const [videoResponse, documentResponse] = await Promise.all([
      CourseAPI.getPublishedCourses({ type: "video", limit: 1 }),
      CourseAPI.getPublishedCourses({ type: "document", limit: 1 }),
    ]);

    const videoCount = videoResponse.success
      ? videoResponse.data?.pagination?.totalCourses || 0
      : 0;
    const documentCount = documentResponse.success
      ? documentResponse.data?.pagination?.totalCourses || 0
      : 0;

    const stats = {
      video: videoCount,
      document: documentCount,
    };

    console.log("✅ Successfully fetched type statistics from backend:", stats);
    return stats;
  } catch (error) {
    console.error("💥 Error fetching type statistics from backend:", error);
    return { video: 0, document: 0 };
  }
}

/**
 * Get a single product by ID
 */
export async function fetchProduct(
  id: string
): Promise<CourseForMarketplacePage | null> {
  try {
    console.log("📄 Fetching single product from backend:", id);

    const response = await CourseAPI.getCourse(id);

    if (!response.success) {
      console.error(
        "❌ Failed to fetch product from backend:",
        response.message
      );
      return null;
    }

    const product = transformCourseToProduct(response.data);
    console.log("✅ Successfully fetched product from backend:", product.title);

    return product;
  } catch (error) {
    console.error("💥 Error fetching product from backend:", error);
    return null;
  }
}
