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
      createdAt: '2024-01-15',
      isPurchased: true,
      purchaseDate: '2024-01-20',
      accessLevel: 'full',
      topics: ['Digital Marketing Fundamentals', 'Social Media Strategy', 'Google Ads Mastery', 'Analytics & Conversion Optimization']
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
      createdAt: '2024-02-20',
      isPurchased: false,
      accessLevel: 'preview',
      topics: ['Instagram Post Templates', 'Story Design Layouts', 'Brand Kit Setup', 'Canva Pro Features']
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
      createdAt: '2024-03-10',
      isPurchased: true,
      purchaseDate: '2024-03-15',
      accessLevel: 'full',
      topics: ['Consultant Sales Strategy', 'Online Program Development', 'Customer Acquisition', 'Revenue Optimization']
    },
    {
      id: '4',
      title: 'Advanced Web Development with React & Next.js',
      description: 'Master modern web development with React, Next.js, and TypeScript. Build production-ready applications with advanced patterns and best practices.',
      author: 'Alex Rodriguez',
      price: 149.00,
      currency: 'USD',
      rating: 4.8,
      totalRatings: 203,
      image: '/images/landing/product.png',
      category: 'Programming and development',
      type: 'video',
      createdAt: '2024-01-05',
      isPurchased: false,
      accessLevel: 'preview',
      topics: ['React Hooks & Context', 'Next.js App Router', 'TypeScript Integration', 'Server Components', 'Performance Optimization']
    },
    {
      id: '5',
      title: 'Photography Masterclass: From Beginner to Pro',
      description: 'Learn professional photography techniques, lighting, composition, and post-processing. Includes hands-on projects and real-world assignments.',
      author: 'Emma Johnson',
      price: 89.00,
      currency: 'USD',
      rating: 4.7,
      totalRatings: 167,
      image: '/images/landing/product.png',
      category: 'Design and photography',
      type: 'video',
      createdAt: '2024-02-12',
      isPurchased: true,
      purchaseDate: '2024-02-18',
      accessLevel: 'full',
      topics: ['Camera Fundamentals', 'Composition Rules', 'Natural Light Photography', 'Portrait Techniques', 'Post-Processing Workflow']
    },
    {
      id: '6',
      title: 'UI/UX Design Complete Guide',
      description: 'Comprehensive guide to user interface and user experience design. Learn design principles, prototyping, and user research methodologies.',
      author: 'Michael Chen',
      price: 79.00,
      currency: 'USD',
      rating: 4.6,
      totalRatings: 89,
      image: '/images/landing/product.png',
      category: 'Design and photography',
      type: 'document',
      createdAt: '2024-01-28',
      isPurchased: false,
      accessLevel: 'none',
      topics: ['Design Thinking Process', 'User Research Methods', 'Wireframing & Prototyping', 'Usability Testing', 'Design Systems']
    },
    {
      id: '7',
      title: 'Cryptocurrency Trading Strategies',
      description: 'Learn proven cryptocurrency trading strategies, technical analysis, and risk management. Includes live trading examples and market analysis.',
      author: 'David Kim',
      price: 199.00,
      currency: 'USD',
      rating: 4.5,
      totalRatings: 124,
      image: '/images/landing/product.png',
      category: 'Finance and investment',
      type: 'video',
      createdAt: '2024-03-01',
      isPurchased: true,
      purchaseDate: '2024-03-05',
      accessLevel: 'full',
      topics: ['Technical Analysis', 'Risk Management', 'Trading Psychology', 'Market Indicators', 'Portfolio Strategies']
    },
    {
      id: '8',
      title: 'Mindfulness and Meditation Course',
      description: 'Discover inner peace through mindfulness and meditation practices. Includes guided meditations, stress reduction techniques, and daily routines.',
      author: 'Lisa Parker',
      price: 45.00,
      currency: 'USD',
      rating: 4.9,
      totalRatings: 312,
      image: '/images/landing/product.png',
      category: 'Health, wellness and beauty',
      type: 'video',
      createdAt: '2024-01-10',
      isPurchased: false,
      accessLevel: 'preview',
      topics: ['Mindfulness Fundamentals', 'Breathing Techniques', 'Body Scan Meditation', 'Stress Management', 'Daily Practice Routines']
    },
    {
      id: '9',
      title: 'Business Strategy and Leadership',
      description: 'Essential business strategy and leadership skills for modern entrepreneurs. Learn to build and lead successful teams and organizations.',
      author: 'Robert Wilson',
      price: 299.00,
      currency: 'USD',
      rating: 4.8,
      totalRatings: 156,
      image: '/images/landing/product.png',
      category: 'Business and entrepreneurship',
      type: 'document',
      createdAt: '2024-02-05',
      isPurchased: false,
      accessLevel: 'none',
      topics: ['Strategic Planning', 'Leadership Fundamentals', 'Team Building', 'Decision Making', 'Performance Management']
    },
    {
      id: '10',
      title: 'Social Media Marketing 2024',
      description: 'Up-to-date social media marketing strategies for Instagram, TikTok, YouTube, and LinkedIn. Includes content creation and audience growth tactics.',
      author: 'Rachel Adams',
      price: 67.00,
      currency: 'USD',
      rating: 4.7,
      totalRatings: 198,
      image: '/images/landing/product.png',
      category: 'Marketing and sales',
      type: 'video',
      createdAt: '2024-03-08',
      isPurchased: true,
      purchaseDate: '2024-03-12',
      accessLevel: 'full',
      topics: ['Social Media Strategy', 'Content Creation', 'Instagram Growth', 'LinkedIn Marketing', 'TikTok Trends']
    },
    {
      id: '11',
      title: 'Python Programming Fundamentals',
      description: 'Learn Python from scratch with hands-on projects. Covers variables, functions, data structures, and object-oriented programming concepts.',
      author: 'Dr. James Mitchell',
      price: 129.00,
      currency: 'USD',
      rating: 4.8,
      totalRatings: 278,
      image: '/images/landing/product.png',
      category: 'Programming and development',
      type: 'video',
      createdAt: '2024-01-25',
      isPurchased: false,
      accessLevel: 'none',
      topics: ['Python Syntax & Variables', 'Control Structures', 'Functions & Modules', 'Object-Oriented Programming', 'File Handling & APIs']
    },
    {
      id: '12',
      title: 'E-commerce Store Setup Guide',
      description: 'Complete guide to setting up and running a successful e-commerce store. Includes Shopify, WooCommerce, and payment gateway setup.',
      author: 'Jennifer Lee',
      price: 89.00,
      currency: 'USD',
      rating: 4.6,
      totalRatings: 142,
      image: '/images/landing/product.png',
      category: 'Business and entrepreneurship',
      type: 'document',
      createdAt: '2024-02-14',
      isPurchased: true,
      purchaseDate: '2024-02-20',
      accessLevel: 'full',
      topics: ['E-commerce Platforms', 'Payment Processing', 'Inventory Management', 'SEO for E-commerce', 'Customer Service']
    },
    {
      id: '13',
      title: 'Fitness and Nutrition Masterclass',
      description: 'Comprehensive fitness and nutrition program. Includes workout plans, meal prep guides, and sustainable lifestyle changes.',
      author: 'Marcus Williams',
      price: 79.00,
      currency: 'USD',
      rating: 4.9,
      totalRatings: 489,
      image: '/images/landing/product.png',
      category: 'Health, wellness and beauty',
      type: 'video',
      createdAt: '2024-03-02',
      isPurchased: false,
      accessLevel: 'preview',
      topics: ['Nutrition Science Basics', 'Meal Planning & Prep', 'Home Workout Routines', 'Supplement Guide', 'Lifestyle Transformation']
    },
    {
      id: '14',
      title: 'Stock Market Analysis & Trading',
      description: 'Learn fundamental and technical analysis for stock trading. Includes risk management strategies and portfolio optimization techniques.',
      author: 'Sarah Thompson',
      price: 249.00,
      currency: 'USD',
      rating: 4.7,
      totalRatings: 167,
      image: '/images/landing/product.png',
      category: 'Finance and investment',
      type: 'video',
      createdAt: '2024-01-18',
      isPurchased: true,
      purchaseDate: '2024-01-25',
      accessLevel: 'full',
      topics: ['Technical Analysis', 'Fundamental Analysis', 'Risk Management', 'Trading Strategies', 'Portfolio Optimization']
    },
    {
      id: '15',
      title: 'Graphic Design with Adobe Creative Suite',
      description: 'Master Photoshop, Illustrator, and InDesign. Create professional designs for print and digital media with advanced techniques.',
      author: 'Carlos Rodriguez',
      price: 159.00,
      currency: 'USD',
      rating: 4.8,
      totalRatings: 223,
      image: '/images/landing/product.png',
      category: 'Design and photography',
      type: 'video',
      createdAt: '2024-02-28',
      isPurchased: false,
      accessLevel: 'preview',
      topics: ['Photoshop Mastery', 'Illustrator Vector Design', 'InDesign Layout', 'Color Theory', 'Print vs Digital Design']
    }
  ];

  // Generate additional products for testing with mixed purchase states
  const additionalProducts: Product[] = Array.from({ length: 47 }, (_, i) => {
    // Use deterministic values for consistency
    const priceOptions = [49, 79, 99, 149, 199, 249, 299, 349, 399, 449];
    const ratingOptions = [3.0, 3.5, 4.0, 4.2, 4.5, 4.7, 4.8, 4.9, 5.0];
    
    // Create a mix of purchase states for testing
    const purchaseState = (() => {
      const stateIndex = i % 5;
      switch (stateIndex) {
        case 0: // Purchased with full access
          return {
            isPurchased: true,
            purchaseDate: new Date(2024, (i % 12), Math.min(28, (i % 28) + 1)).toISOString().split('T')[0],
            accessLevel: 'full' as const
          };
        case 1: // Not purchased, preview available
          return {
            isPurchased: false,
            accessLevel: 'preview' as const
          };
        case 2: // Not purchased, no access
          return {
            isPurchased: false,
            accessLevel: 'none' as const
          };
        case 3: // Purchased with full access (recent)
          return {
            isPurchased: true,
            purchaseDate: '2024-03-15',
            accessLevel: 'full' as const
          };
        default: // Not purchased, preview available
          return {
            isPurchased: false,
            accessLevel: 'preview' as const
          };
      }
    })();

    // Generate topic titles based on course type
    const generateTopics = (courseType: string, index: number) => {
      const topicSets = {
        'Digital Marketing': [
          'SEO Fundamentals', 'Content Marketing Strategy', 'Social Media Advertising', 'Email Marketing Automation', 'Analytics & ROI Tracking'
        ],
        'Web Design': [
          'HTML5 & CSS3 Mastery', 'Responsive Design Principles', 'JavaScript Frameworks', 'UX/UI Best Practices', 'Design Tools & Workflow'
        ],
        'Business Strategy': [
          'Market Analysis', 'Competitive Research', 'Financial Planning', 'Team Leadership', 'Growth Strategies'
        ],
        'Photography': [
          'Camera Settings & Controls', 'Composition Techniques', 'Lighting Fundamentals', 'Post-Processing', 'Portfolio Development'
        ]
      };
      
      const topics = topicSets[courseType as keyof typeof topicSets] || topicSets['Digital Marketing'];
      // Return 3-5 topics per course
      return topics.slice(0, 3 + (index % 3));
    };

    const courseType = i % 4 === 0 ? 'Digital Marketing' : i % 4 === 1 ? 'Web Design' : i % 4 === 2 ? 'Business Strategy' : 'Photography';
    
    return {
      id: `${i + 16}`, // Start from 16 since base products go up to 15
      title: `${i % 3 === 0 ? 'Advanced' : i % 3 === 1 ? 'Complete' : 'Professional'} ${courseType} Course ${i + 16}`,
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
      category: i % 6 === 0 ? 'Marketing and sales' : 
                i % 6 === 1 ? 'Design and photography' : 
                i % 6 === 2 ? 'Programming and development' :
                i % 6 === 3 ? 'Business and entrepreneurship' :
                i % 6 === 4 ? 'Health, wellness and beauty' : 'Finance and investment',
      type: i % 2 === 0 ? 'video' as const : 'document' as const,
      createdAt: new Date(2024, (i % 12), Math.min(28, (i % 28) + 1)).toISOString().split('T')[0],
      topics: generateTopics(courseType, i),
      ...purchaseState
    };
  });

  return [...baseProducts, ...additionalProducts];
};

const mockProducts = generateMockProducts();

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
  limit: number = 20 // Increased default to show more products
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
      const filterCategoryId = filters.category!.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '');
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
  
  // First, get all unique categories from products
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

  const validCategories = dynamicCategories.filter(category => category.count > 0);
  
  return validCategories;
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
