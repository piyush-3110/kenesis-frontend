import { AffiliatedProduct, AffiliationStats, AffiliationFilters } from '../types';

// Mock data for affiliated products
const MOCK_AFFILIATED_PRODUCTS: AffiliatedProduct[] = [
  {
    id: 'aff_001',
    title: 'First sale in 48H',
    productId: '36417',
    seller: 'Orbit Pages',
    price: 29.79,
    commission: 50,
    status: 'active',
    affiliateLink: 'https://kenesis.com/ref/36417?affiliate=user123',
    createdAt: '2025-01-15T10:30:00Z',
    lastPromoted: '2025-01-20T14:22:00Z',
    clicks: 156,
    conversions: 8,
    earnings: 119.16,
    thumbnail: '/images/landing/product.png',
    author: 'John Marketing',
    category: 'Digital Marketing',
    type: 'video',
    rating: 4.8,
    reviewCount: 245,
    description: 'Learn proven strategies to make your first sale within 48 hours using modern digital marketing techniques.',
    topics: [
      'Quick sales conversion strategies',
      'Digital marketing fundamentals',
      'Customer psychology and persuasion',
      'Sales funnel optimization',
      'Social media marketing tactics'
    ]
  },
  {
    id: 'aff_002',
    title: 'First sale in 48H',
    productId: '36418',
    seller: 'Orbit Pages',
    price: 29.79,
    commission: 50,
    status: 'inactive',
    affiliateLink: 'https://kenesis.com/ref/36418?affiliate=user123',
    createdAt: '2025-01-14T09:15:00Z',
    lastPromoted: '2025-01-18T11:45:00Z',
    clicks: 89,
    conversions: 3,
    earnings: 44.69,
    thumbnail: '/images/landing/product.png',
    author: 'Sarah Digital',
    category: 'E-commerce',
    type: 'document',
    rating: 4.6,
    reviewCount: 189,
    description: 'Complete guide to launching and scaling your e-commerce business from zero to profit.',
    topics: [
      'E-commerce platform setup',
      'Product sourcing strategies',
      'Marketing automation',
      'Customer retention tactics',
      'Profit optimization techniques'
    ]
  },
  {
    id: 'aff_003',
    title: 'First sale in 48H',
    productId: '36419',
    seller: 'Orbit Pages',
    price: 29.79,
    commission: 50,
    status: 'active',
    affiliateLink: 'https://kenesis.com/ref/36419?affiliate=user123',
    createdAt: '2025-01-13T16:20:00Z',
    lastPromoted: '2025-01-21T08:30:00Z',
    clicks: 203,
    conversions: 12,
    earnings: 178.74,
    thumbnail: '/images/landing/product.png',
    author: 'Mike Sales',
    category: 'Sales Training',
    type: 'video',
    rating: 4.9,
    reviewCount: 312,
    description: 'Master the art of high-converting sales conversations and close more deals faster.',
    topics: [
      'Sales psychology and mindset',
      'Objection handling techniques',
      'Closing strategies that work',
      'Building rapport with prospects',
      'Follow-up systems that convert'
    ]
  },
  {
    id: 'aff_004',
    title: 'First sale in 48H',
    productId: '36420',
    seller: 'Orbit Pages',
    price: 29.79,
    commission: 50,
    status: 'active',
    affiliateLink: 'https://kenesis.com/ref/36420?affiliate=user123',
    createdAt: '2025-01-12T11:45:00Z',
    lastPromoted: '2025-01-19T15:10:00Z',
    clicks: 134,
    conversions: 7,
    earnings: 104.23,
    thumbnail: '/images/landing/product.png',
    author: 'Lisa Growth',
    category: 'Business Growth',
    type: 'video',
    rating: 4.7,
    reviewCount: 278,
    description: 'Scale your business to 6-figures using proven growth hacking strategies and systems.',
    topics: [
      'Growth hacking fundamentals',
      'Customer acquisition strategies',
      'Revenue optimization',
      'Team building and delegation',
      'Systems and automation'
    ]
  },
  {
    id: 'aff_005',
    title: 'First sale in 48H',
    productId: '36421',
    seller: 'Orbit Pages',
    price: 29.79,
    commission: 50,
    status: 'inactive',
    affiliateLink: 'https://kenesis.com/ref/36421?affiliate=user123',
    createdAt: '2025-01-11T14:30:00Z',
    lastPromoted: '2025-01-16T12:20:00Z',
    clicks: 67,
    conversions: 2,
    earnings: 29.79,
    thumbnail: '/images/landing/product.png',
    author: 'David Tech',
    category: 'Technology',
    type: 'document',
    rating: 4.5,
    reviewCount: 156,
    description: 'Learn cutting-edge technology tools and strategies to automate your business processes.',
    topics: [
      'Business automation tools',
      'Workflow optimization',
      'Tech stack selection',
      'Integration strategies',
      'ROI measurement and analytics'
    ]
  }
];

// Simulate API delay
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get user's affiliated products
 */
export const getMyAffiliations = async (
  filters: AffiliationFilters = {}
): Promise<AffiliatedProduct[]> => {
  await simulateDelay(500);
  
  let filtered = [...MOCK_AFFILIATED_PRODUCTS];
  
  // Filter by status
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(product => product.status === filters.status);
  }
  
  // Filter by seller
  if (filters.seller) {
    filtered = filtered.filter(product => 
      product.seller.toLowerCase().includes(filters.seller!.toLowerCase())
    );
  }
  
  // Filter by category
  if (filters.category) {
    filtered = filtered.filter(product => 
      product.category.toLowerCase().includes(filters.category!.toLowerCase())
    );
  }
  
  // Sort
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      let aValue: number;
      let bValue: number;
      
      switch (filters.sortBy) {
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'earnings':
          aValue = a.earnings;
          bValue = b.earnings;
          break;
        case 'clicks':
          aValue = a.clicks;
          bValue = b.clicks;
          break;
        case 'conversions':
          aValue = a.conversions;
          bValue = b.conversions;
          break;
        default:
          return 0;
      }
      
      return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }
  
  return filtered;
};

/**
 * Get single affiliated product by product ID
 */
export const getAffiliatedProductByProductId = async (productId: string): Promise<AffiliatedProduct | null> => {
  await simulateDelay(300);
  return MOCK_AFFILIATED_PRODUCTS.find(product => product.productId === productId) || null;
};

/**
 * Get single affiliated product by affiliation ID
 */
export const getAffiliatedProduct = async (id: string): Promise<AffiliatedProduct | null> => {
  await simulateDelay(300);
  return MOCK_AFFILIATED_PRODUCTS.find(product => product.id === id) || null;
};

/**
 * Get affiliation statistics
 */
export const getAffiliationStats = async (): Promise<AffiliationStats> => {
  await simulateDelay(400);
  
  const products = MOCK_AFFILIATED_PRODUCTS;
  const activeProducts = products.filter(p => p.status === 'active');
  const inactiveProducts = products.filter(p => p.status === 'inactive');
  
  const totalClicks = products.reduce((sum, p) => sum + p.clicks, 0);
  const totalConversions = products.reduce((sum, p) => sum + p.conversions, 0);
  const totalEarnings = products.reduce((sum, p) => sum + p.earnings, 0);
  
  return {
    totalAffiliations: products.length,
    activeAffiliations: activeProducts.length,
    inactiveAffiliations: inactiveProducts.length,
    totalEarnings,
    totalClicks,
    totalConversions,
    conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
  };
};

/**
 * Update affiliation status
 */
export const updateAffiliationStatus = async (
  id: string, 
  status: 'active' | 'inactive'
): Promise<boolean> => {
  await simulateDelay(800);
  
  const productIndex = MOCK_AFFILIATED_PRODUCTS.findIndex(p => p.id === id);
  if (productIndex !== -1) {
    MOCK_AFFILIATED_PRODUCTS[productIndex].status = status;
    return true;
  }
  
  return false;
};

/**
 * Get available sellers for filtering
 */
export const getAffiliateSellers = async (): Promise<string[]> => {
  await simulateDelay(200);
  return Array.from(new Set(MOCK_AFFILIATED_PRODUCTS.map(p => p.seller)));
};

/**
 * Get available categories for filtering
 */
export const getAffiliateCategories = async (): Promise<string[]> => {
  await simulateDelay(200);
  return Array.from(new Set(MOCK_AFFILIATED_PRODUCTS.map(p => p.category)));
};
