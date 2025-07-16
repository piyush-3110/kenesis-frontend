import { Product, Category, MarketplaceFilters, SortOptionItem, PriceRange } from '@/types/Product';

// Generate more mock products for infinite scroll testing
const generateMockProducts = (): Product[] => {
  const baseProducts: Product[] = [
    {
      id: '1',
      title: 'ADSPRO Mentoring: Your Complete Digital Marketing Course',
      description: 'ADSPRO MENTORING: MASTER DIGITAL MARKETING AND MULTIPLY YOUR TICKETS Tired of spending on advertising without results? ADSPRO Mentoring you...',
      author: 'Sara Gago',
      price: 397.00,
      currency: 'USD',
      rating: 4.9,
      totalRatings: 132,
      image: '/images/landing/product.png',
      category: 'Marketing and sales',
      type: 'video',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Canva Digital Marketing Package',
      description: 'The Canva Pack Digital Marketing is a complete package for those who are just starting on Instagram! It contains over 200 ready-made and editable post templates in Canva, as well',
      author: 'Sara Gago',
      price: 9.00,
      currency: 'USD',
      rating: 4.4,
      totalRatings: 54,
      image: '/images/landing/product.png',
      category: 'Design and photography',
      type: 'document',
      createdAt: '2024-02-20'
    },
    {
      id: '3',
      title: 'FR TEAM Digital Marketing Training',
      description: 'Course aimed at all consultants who want to start selling the Focus on Results Program by selling online and expanding their customer base. Training for...',
      author: 'Sara Gago',
      price: 20.00,
      currency: 'USD',
      rating: 5.0,
      totalRatings: 95,
      image: '/images/landing/product.png',
      category: 'Marketing and sales',
      type: 'video',
      createdAt: '2024-03-10'
    }
  ];

  // Generate additional products for testing
  const additionalProducts: Product[] = Array.from({ length: 47 }, (_, i) => {
    // Use deterministic values for consistency
    const priceOptions = [49, 79, 99, 149, 199, 249, 299, 349, 399, 449];
    const ratingOptions = [3.0, 3.5, 4.0, 4.2, 4.5, 4.7, 4.8, 4.9, 5.0];
    
    return {
      id: `${i + 4}`,
      title: `${i % 3 === 0 ? 'Advanced' : i % 3 === 1 ? 'Complete' : 'Professional'} ${
        i % 4 === 0 ? 'Digital Marketing' : i % 4 === 1 ? 'Web Design' : i % 4 === 2 ? 'Business Strategy' : 'Photography'
      } Course ${i + 4}`,
      description: `Comprehensive course covering ${i % 4 === 0 ? 'digital marketing strategies, SEO, and social media' : 
        i % 4 === 1 ? 'modern web design principles, UI/UX, and responsive layouts' : 
        i % 4 === 2 ? 'business development, entrepreneurship, and growth strategies' : 
        'professional photography techniques, lighting, and post-processing'}. Perfect for ${i % 3 === 0 ? 'beginners' : i % 3 === 1 ? 'intermediate learners' : 'advanced practitioners'}.`,
      author: i % 5 === 0 ? 'Sara Gago' : i % 5 === 1 ? 'John Smith' : i % 5 === 2 ? 'Maria Garcia' : i % 5 === 3 ? 'David Wilson' : 'Emily Johnson',
      price: priceOptions[i % priceOptions.length],
      currency: 'USD',
      rating: ratingOptions[i % ratingOptions.length],
      totalRatings: 20 + (i * 7) % 300, // Deterministic rating count
      image: '/images/landing/product.png',
      category: i % 4 === 0 || i % 4 === 2 ? 'Marketing and sales' : i % 4 === 1 ? 'Design and photography' : 'Finance and business',
      type: i % 2 === 0 ? 'video' as const : 'document' as const,
      createdAt: new Date(2024, (i % 12), Math.min(28, (i % 28) + 1)).toISOString().split('T')[0]
    };
  });

  return [...baseProducts, ...additionalProducts];
};

const mockProducts = generateMockProducts();

const mockCategories: Category[] = [
  {
    id: 'marketing-sales',
    name: 'Marketing and sales',
    count: 0 // Will be calculated dynamically
  },
  {
    id: 'design-photography',
    name: 'Design and photography', 
    count: 0 // Will be calculated dynamically
  },
  {
    id: 'finance-business',
    name: 'Finance and business',
    count: 0 // Will be calculated dynamically
  },
  {
    id: 'academic-teaching',
    name: 'Academic teaching and study',
    count: 0 // Will be calculated dynamically
  },
  {
    id: 'career-development',
    name: 'Career and personal development',
    count: 0 // Will be calculated dynamically
  },
  {
    id: 'music-arts',
    name: 'Music and arts',
    count: 0 // Will be calculated dynamically
  },
  {
    id: 'cooking-gastronomy',
    name: 'Cooking and gastronomy',
    count: 0 // Will be calculated dynamically
  },
  {
    id: 'uncategorized',
    name: 'Uncategorized',
    count: 0 // Will be calculated dynamically
  }
];

// Simulate network delay
const simulateDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

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
 * Fetch products with pagination and filtering
 * This simulates a backend API call that would include:
 * - Search query
 * - Category filtering
 * - Price range filtering
 * - Sorting
 * - Pagination
 */
export async function fetchProducts(
  filters: MarketplaceFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Product>> {
  await simulateDelay();

  let filteredProducts = [...mockProducts];

  // Apply search filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(product => 
      product.title.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.author.toLowerCase().includes(query)
    );
  }

  // Apply category filter
  if (filters.category && filters.category !== 'all' && filters.category !== '') {
    filteredProducts = filteredProducts.filter(product => {
      // Convert product category to ID format for comparison
      const productCategoryId = product.category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '');
      const filterCategoryId = filters.category!.toLowerCase();
      return productCategoryId === filterCategoryId;
    });
  }

  // Apply price range filter
  if (filters.priceRange) {
    filteredProducts = filteredProducts.filter(product => 
      product.price >= filters.priceRange!.min && product.price <= filters.priceRange!.max
    );
  }

  // Apply type filter (optional)
  if (filters.type) {
    filteredProducts = filteredProducts.filter(product => product.type === filters.type);
  }

  // Apply sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'a-z':
        filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'z-a':
        filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'price-low-high':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating-high-low':
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'video-first':
        filteredProducts.sort((a, b) => {
          if (a.type === 'video' && b.type === 'document') return -1;
          if (a.type === 'document' && b.type === 'video') return 1;
          return 0;
        });
        break;
      case 'document-first':
        filteredProducts.sort((a, b) => {
          if (a.type === 'document' && b.type === 'video') return -1;
          if (a.type === 'video' && b.type === 'document') return 1;
          return 0;
        });
        break;
      case 'most-relevant':
      default:
        // Keep original order for most relevant
        break;
    }
  }

  // Calculate pagination
  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedProducts = filteredProducts.slice(offset, offset + limit);

  return {
    data: paginatedProducts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
}

/**
 * Fetch categories
 * This simulates a backend API call to get all available categories with product counts
 */
export async function fetchCategories(): Promise<Category[]> {
  await simulateDelay(200);
  
  // First, let's get all unique categories from products
  const productCategories = [...new Set(mockProducts.map(product => product.category))];
  
  // Create categories based on actual product data
  const dynamicCategories: Category[] = productCategories.map(categoryName => {
    const id = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '');
    const count = mockProducts.filter(product => product.category === categoryName).length;
    
    return {
      id,
      name: categoryName,
      count
    };
  });

  return dynamicCategories.filter(category => category.count > 0);
}

/**
 * Fetch sort options
 * This simulates a backend API call to get available sort options
 */
export async function fetchSortOptions(): Promise<SortOptionItem[]> {
  await simulateDelay(100);
  return [
    { value: 'most-relevant', label: 'Most Relevant' },
    { value: 'a-z', label: 'A to Z' },
    { value: 'z-a', label: 'Z to A' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'rating-high-low', label: 'Rating: High to Low' },
    { value: 'newest', label: 'Newest' },
    { value: 'video-first', label: 'Video Courses First' },
    { value: 'document-first', label: 'Documents First' }
  ];
}

/**
 * Fetch price range
 * This simulates a backend API call to get min/max price range
 */
export async function fetchPriceRange(): Promise<PriceRange> {
  await simulateDelay(100);
  
  const prices = mockProducts.map(product => product.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    currency: 'USD'
  };
}

/**
 * Search suggestions (for autocomplete)
 * This simulates a backend API call for search suggestions
 */
export async function fetchSearchSuggestions(query: string): Promise<{ text: string; type: string }[]> {
  await simulateDelay(150);
  
  if (!query.trim() || query.length < 2) return [];
  
  const lowercaseQuery = query.toLowerCase();
  const suggestions = new Set<string>();
  
  // Get suggestions from product titles and authors
  mockProducts.forEach(product => {
    if (product.title.toLowerCase().includes(lowercaseQuery)) {
      suggestions.add(product.title);
    }
    if (product.author.toLowerCase().includes(lowercaseQuery)) {
      suggestions.add(product.author);
    }
  });
  
  return Array.from(suggestions)
    .slice(0, 8)
    .map(text => ({ text, type: 'suggestion' }));
}

/**
 * Search products (for autocomplete/suggestions)
 * This would typically be a lightweight search endpoint
 */
export async function searchProducts(query: string): Promise<Product[]> {
  await simulateDelay(300);
  
  if (!query.trim()) return [];
  
  const lowercaseQuery = query.toLowerCase();
  return mockProducts
    .filter(product => 
      product.title.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.author.toLowerCase().includes(lowercaseQuery)
    )
    .slice(0, 10); // Limit search results for performance
}

/**
 * Get a single product by ID
 */
export async function fetchProduct(id: string): Promise<Product | null> {
  await simulateDelay(300);
  return mockProducts.find(product => product.id === id) || null;
}

/**
 * Get type statistics
 * This simulates a backend API call to get type distribution
 */
export async function fetchTypeStats(): Promise<{ video: number; document: number }> {
  await simulateDelay(100);
  
  const videoCount = mockProducts.filter(product => product.type === 'video').length;
  const documentCount = mockProducts.filter(product => product.type === 'document').length;
  
  return {
    video: videoCount,
    document: documentCount
  };
}
