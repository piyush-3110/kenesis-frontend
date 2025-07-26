import { AffiliateProduct, FilterType } from '../types';

// Base API configuration
// Note: These will be used when integrating with real backend
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const API_ENDPOINTS = {
  AFFILIATE_PRODUCTS: '/affiliate/products',
  AFFILIATE_PRODUCTS_BY_TYPE: '/affiliate/products/type',
  NON_AFFILIATED_PRODUCTS: '/affiliate/products/non-affiliated',
  CREATE_AFFILIATE_LINK: '/affiliate/links',
} as const;

// API request headers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getHeaders = () => ({
  'Content-Type': 'application/json',
  // Add authentication headers here when available
  // 'Authorization': `Bearer ${getAuthToken()}`,
});

// Types for API responses
export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: FilterType;
  category?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAffiliateLinkRequest {
  productId: string;
  userId: string;
}

export interface CreateAffiliateLinkResponse {
  affiliateLink: string;
  affiliateId: string;
  commission: number;
}

// Mock data for development
const MOCK_PRODUCTS: AffiliateProduct[] = [
  {
    id: '1',
    title: 'Complete Digital Marketing Mastery',
    author: 'Alex Vargas',
    rating: 4.6,
    reviewCount: 11254,
    price: 52.00,
    commission: 30,
    category: 'Health, Wellness and Beauty',
    type: 'video',
    thumbnail: '/images/landing/product.png',
    description: 'Master digital marketing strategies that convert'
  },
  {
    id: '2',
    title: 'Advanced UI/UX Design Course',
    author: 'Sarah Chen',
    rating: 4.8,
    reviewCount: 8932,
    price: 89.00,
    commission: 35,
    category: 'Design & Technology',
    type: 'video',
    thumbnail: '/images/landing/product.png',
    description: 'Learn modern UI/UX design principles'
  },
  {
    id: '3',
    title: 'Cryptocurrency Investment Guide',
    author: 'Mike Rodriguez',
    rating: 4.7,
    reviewCount: 15643,
    price: 127.00,
    commission: 25,
    category: 'Finance & Investment',
    type: 'document',
    thumbnail: '/images/landing/product.png',
    description: 'Complete guide to crypto investment strategies'
  },
  {
    id: '4',
    title: 'Personal Fitness & Nutrition Plan',
    author: 'Emma Johnson',
    rating: 4.9,
    reviewCount: 7234,
    price: 67.00,
    commission: 40,
    category: 'Health, Wellness and Beauty',
    type: 'document',
    thumbnail: '/images/landing/product.png',
    description: 'Comprehensive fitness and nutrition program'
  },
  {
    id: '5',
    title: 'E-commerce Business Blueprint',
    author: 'David Kim',
    rating: 4.5,
    reviewCount: 9876,
    price: 199.00,
    commission: 45,
    category: 'Business & Entrepreneurship',
    type: 'video',
    thumbnail: '/images/landing/product.png',
    description: 'Build a successful e-commerce business from scratch'
  },
  {
    id: '6',
    title: 'Mindfulness & Meditation Mastery',
    author: 'Lisa Parker',
    rating: 4.8,
    reviewCount: 5432,
    price: 45.00,
    commission: 35,
    category: 'Health, Wellness and Beauty',
    type: 'video',
    thumbnail: '/images/landing/product.png',
    description: 'Transform your life through mindfulness practices'
  },
];

// Simulate API delay
const simulateDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions - replace these with actual API calls later

/**
 * Get all non-affiliated products (products user hasn't created affiliate links for)
 * This is the main endpoint you'll use for the affiliate showcase
 */
export const getNonAffiliatedProducts = async (
  params: GetProductsParams = {}
): Promise<ApiResponse<AffiliateProduct[]>> => {
  await simulateDelay();
  
  const { page = 1, limit = 20, search = '', type = 'all', category } = params;
  
  let filtered = [...MOCK_PRODUCTS];
  
  // Filter by type
  if (type !== 'all') {
    filtered = filtered.filter(product => product.type === type);
  }
  
  // Filter by category
  if (category) {
    filtered = filtered.filter(product => 
      product.category.toLowerCase().includes(category.toLowerCase())
    );
  }
  
  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(product =>
      product.title.toLowerCase().includes(searchLower) ||
      product.author.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower)
    );
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = filtered.slice(startIndex, endIndex);
  
  return {
    success: true,
    data: paginatedProducts,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
};

/**
 * Get products by type (video or document)
 */
export const getProductsByType = async (
  type: 'video' | 'document',
  params: Omit<GetProductsParams, 'type'> = {}
): Promise<ApiResponse<AffiliateProduct[]>> => {
  return getNonAffiliatedProducts({ ...params, type });
};

/**
 * Search products
 */
export const searchProducts = async (
  query: string,
  params: Omit<GetProductsParams, 'search'> = {}
): Promise<ApiResponse<AffiliateProduct[]>> => {
  return getNonAffiliatedProducts({ ...params, search: query });
};

/**
 * Create affiliate link for a product
 * This will be called when user clicks "Promote this product"
 */
export const createAffiliateLink = async (
  request: CreateAffiliateLinkRequest
): Promise<ApiResponse<CreateAffiliateLinkResponse>> => {
  await simulateDelay(1000);
  
  // Mock successful affiliate link creation
  const mockResponse: CreateAffiliateLinkResponse = {
    affiliateLink: `https://affiliate.kenesis.com/link/${request.productId}?ref=${request.userId}`,
    affiliateId: `AFF_${request.productId}_${request.userId}`,
    commission: MOCK_PRODUCTS.find(p => p.id === request.productId)?.commission || 30,
  };
  
  return {
    success: true,
    data: mockResponse,
    message: 'Affiliate link created successfully',
  };
};

/**
 * Get product categories
 */
export const getProductCategories = async (): Promise<ApiResponse<string[]>> => {
  await simulateDelay(200);
  
  const categories = Array.from(
    new Set(MOCK_PRODUCTS.map(product => product.category))
  );
  
  return {
    success: true,
    data: categories,
  };
};

// Real API functions - uncomment and modify these when integrating with backend

/*
export const getNonAffiliatedProducts = async (
  params: GetProductsParams = {}
): Promise<ApiResponse<AffiliateProduct[]>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });
  
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.NON_AFFILIATED_PRODUCTS}?${queryParams}`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

export const getProductsByType = async (
  type: 'video' | 'document',
  params: Omit<GetProductsParams, 'type'> = {}
): Promise<ApiResponse<AffiliateProduct[]>> => {
  const queryParams = new URLSearchParams();
  queryParams.append('type', type);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });
  
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.AFFILIATE_PRODUCTS_BY_TYPE}?${queryParams}`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

export const createAffiliateLink = async (
  request: CreateAffiliateLinkRequest
): Promise<ApiResponse<CreateAffiliateLinkResponse>> => {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.CREATE_AFFILIATE_LINK}`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request),
    }
  );
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};
*/
