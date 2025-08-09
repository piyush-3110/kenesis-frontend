export const MARKETPLACE_CONFIG = {
  PRODUCTS_PER_PAGE: 20, // Increased from 12 to show more products initially
  SEARCH_DEBOUNCE_MS: 300,
  PRICE_RANGE: {
    MIN: 0,
    MAX: 500,
    STEP: 10,
  },
  CATEGORY_ALL: "all",
} as const;

export const SORT_OPTIONS = [
  { value: "most-relevant", label: "Most Relevant" },
  { value: "newest", label: "Newest First" },
  { value: "a-z", label: "A to Z" },
  { value: "z-a", label: "Z to A" },
  { value: "price-low-high", label: "Price: Low to High" },
  { value: "price-high-low", label: "Price: High to Low" },
  { value: "rating-high-low", label: "Rating: High to Low" },
] as const;

// Legacy filter categories - these will be replaced by dynamic categories from the API
export const FILTER_CATEGORIES = [
  { id: "all", name: "All Categories" },
  { id: "beginner-courses", name: "Beginner Courses" },
  { id: "intermediate-courses", name: "Intermediate Courses" },
  { id: "advanced-courses", name: "Advanced Courses" },
] as const;

export const API_ENDPOINTS = {
  PRODUCTS: "/api/courses", // Updated to match backend endpoint
  CATEGORIES: "/api/categories", // This might be implemented later
  SEARCH: "/api/courses", // Uses same endpoint with search query
} as const;

export const LOADING_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const;
