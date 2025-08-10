export type SortBy = "createdAt" | "affiliatePercentage" | "price";
export type SortOrder = "asc" | "desc";

export type AvailableCourse = {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  price: number;
  affiliatePercentage: number; // 0–50
  // New fields from backend
  shortDescription?: string;
  type?: "video" | "document";
  level?: string;
  language?: string;
  averageRating?: number;
  reviewCount?: number;
  totalDuration?: number; // seconds for videos
  totalPages?: number; // for documents
  tokenToPayWith?: string; // e.g., USDT
  availableQuantity?: number;
  soldCount?: number;
  publishedAt?: string; // ISO
  isAvailable?: boolean;
  instructor?: { id: string; username?: string; avatar?: string };
};

export type AvailableCoursesQuery = {
  page?: number;
  limit?: number; // 1..50
  q?: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  minPrice?: number;
  maxPrice?: number;
  // Optional: UI parity
  type?: "video" | "document";
};

export type AvailableCoursesData = {
  courses: AvailableCourse[];
  total: number;
  page: number;
  totalPages: number;
};

export type AvailableCourseDetail = AvailableCourse & {
  commissionPreview: {
    commissionRate: number;
    commissionAmount: number;
  };
  stats?: {
    averageRating?: number;
    reviewCount?: number;
    recentAffiliateSales: number; // last 30 days
    recentAffiliateEarnings: number;
    activeAffiliates: number;
  };
};

export type AffiliateJoinData = {
  success: boolean;
  message: string;
  affiliate: {
    id: string;
    courseId: string;
    affiliateUserId: string;
    instructorId: string;
    affiliateCode: string; // lowercased wallet address
    isActive: boolean;
    joinedAt: string;
    totalEarnings: number;
    totalReferrals: number;
    lastReferralAt?: string;
    createdAt: string;
    updatedAt: string;
  };
};
