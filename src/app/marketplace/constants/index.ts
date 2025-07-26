export const MARKETPLACE_CONFIG = {
  PRODUCTS_PER_PAGE: 20, // Increased from 12 to show more products initially
  SEARCH_DEBOUNCE_MS: 300,
  PRICE_RANGE: {
    MIN: 0,
    MAX: 500,
    STEP: 10,
  },
  CATEGORY_ALL: 'all',
} as const;

export const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
] as const;

export const FILTER_CATEGORIES = [
  { id: 'all', name: 'All Categories' },
  { id: 'marketing-sales', name: 'Marketing and Sales' },
  { id: 'design-photography', name: 'Design and Photography' },
  { id: 'finance-business', name: 'Finance and Business' },
  { id: 'academic-teaching', name: 'Academic Teaching and Study' },
  { id: 'career-development', name: 'Career and Personal Development' },
  { id: 'music-arts', name: 'Music and Arts' },
  { id: 'cooking-gastronomy', name: 'Cooking and Gastronomy' },
  { id: 'uncategorized', name: 'Uncategorized' },
] as const;

export const API_ENDPOINTS = {
  PRODUCTS: '/api/marketplace/products',
  CATEGORIES: '/api/marketplace/categories',
  SEARCH: '/api/marketplace/search',
} as const;

export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;
