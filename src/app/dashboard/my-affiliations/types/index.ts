export interface AffiliatedProduct {
  id: string;
  title: string;
  productId: string; // Reference to the original product
  seller: string;
  price: number;
  commission: number; // Commission percentage
  status: 'active' | 'inactive';
  affiliateLink: string;
  createdAt: string;
  lastPromoted?: string;
  clicks: number;
  conversions: number;
  earnings: number;
  // Product details for display
  thumbnail: string;
  author: string;
  category: string;
  type: 'video' | 'document';
  rating: number;
  reviewCount: number;
  description?: string;
  topics?: string[];
}

export interface AffiliationStats {
  totalAffiliations: number;
  activeAffiliations: number;
  inactiveAffiliations: number;
  totalEarnings: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
}

export interface AffiliationFilters {
  status?: 'all' | 'active' | 'inactive';
  seller?: string;
  category?: string;
  sortBy?: 'created' | 'earnings' | 'clicks' | 'conversions';
  sortOrder?: 'asc' | 'desc';
}
