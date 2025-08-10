// Backend-aligned types for "My Affiliate Programs"
export type AffiliateStatus = "active" | "paused";

export interface MyAffiliateCourse {
  programId: string; // CourseAffiliate._id
  courseId: string;
  courseSlug: string;
  title: string;
  imageUrl: string;
  commissionPercent: number;
  status: AffiliateStatus; // active | paused
  joinedAt: string; // ISO
  // Optional stats
  sales?: number; // totalReferrals
  earnings?: number; // totalEarnings (assumed in USD unless specified)
  tokenToPayWith?: string[]; // e.g., ["USDT-11155111", "ETH-11155111"]
  // Optional fields that may appear in API
  affiliateCode?: string; // wallet address
  lastReferralAt?: string;
  isActive?: boolean; // raw flag, we still rely on status
}

// Minimal filters placeholder to keep store shape stable
export interface AffiliationFilters {
  // UI accepts an "inactive" alias alongside backend's "paused"
  status?: "all" | AffiliateStatus | "inactive";
  // Support additional sort keys used by UI controls
  sortBy?:
    | "joinedAt"
    | "earnings"
    | "sales"
    | "created"
    | "clicks"
    | "conversions";
  sortOrder?: "asc" | "desc";
  // Optional extra filters present in UI controls
  seller?: string;
  category?: string;
}

// Aggregate stats (optional, can be computed client-side)
export interface AffiliationStats {
  totalAffiliations: number;
  activeAffiliations: number;
  pausedAffiliations: number;
  totalEarnings: number;
  totalSales: number;
  // Optional extended metrics used by some dashboards
  totalClicks?: number;
  totalConversions?: number;
  conversionRate?: number; // 0..1
}

// Detail payload for a single affiliate course
export interface MyAffiliateCourseDetail {
  programId: string;
  status: AffiliateStatus;
  joinedAt: string;
  lastUpdatedAt?: string;
  affiliateCode?: string; // wallet address
  commissionPercent: number;
  course: {
    id: string;
    slug: string;
    title: string;
    thumbnail?: string;
    type?: "video" | "document";
    level?: string;
    language?: string;
    price: number;
    tokenToPayWith?: string[];
    publishedAt?: string;
    isAvailable: boolean;
    availableQuantity: number;
    soldCount: number;
  };
  seller?: {
    id: string;
    username?: string;
    avatar?: string;
  };
  stats?: {
    last30d: { conversions: number; earnings: number };
    lifetime: { conversions: number; earnings: number };
    lastSaleAt?: string | null;
  };
}
