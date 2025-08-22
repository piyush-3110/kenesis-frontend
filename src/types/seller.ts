// Seller Profile Types - Based on API Documentation

export interface SellerSocialMedia {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
}

export interface SellerLevel {
  current: "Beginner" | "Intermediate" | "Expert" | "Master";
  badge: string;
  nextLevel?: string;
  progress?: number; // 0-100
}

export interface TrustScoreFactors {
  walletVerified: number;
  courseQuality: number;
  studentSatisfaction: number;
  consistency: number;
  transparency: number;
}

export interface TrustScore {
  score: number; // 0-100
  factors: TrustScoreFactors;
}

export interface Seller {
  id: string;
  username?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  walletAddress?: string;
  socialMedia?: SellerSocialMedia;
  joinedDate: Date;
  isVerified: boolean;
  level: SellerLevel;
  trustScore: TrustScore;
}

export interface SellerStatsSummary {
  formattedEarnings: string;
  coursesPerMonth: number;
  studentsPerCourse: number;
  averageEarningsPerStudent: number;
}

export interface SellerStats {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  totalSales: number;
  averageOrderValue: number;
  summary: SellerStatsSummary;
}

export interface CoursePreview {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  type: string;
  level: string;
  thumbnail?: string;
  averageRating: number;
  reviewCount: number;
  totalDuration?: number;
  totalPages?: number;
  price: number;
  tokenToPayWith?: string;
  publishedAt?: Date;
}

export interface CourseCategory {
  id: string;
  name: string;
}

export interface SellerCourses {
  featured: CoursePreview[];
  all: CoursePreview[];
  byCategory: Array<{
    category: CourseCategory;
    courses: CoursePreview[];
  }>;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface SellerReviewsOverall {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
}

export interface SellerRecentReview {
  courseTitle: string;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewDate: Date;
}

export interface SellerReviews {
  overall: SellerReviewsOverall;
  recent: SellerRecentReview[];
}

export interface SellerAchievement {
  type: string;
  name: string;
  description: string;
  earnedDate: Date;
  criteria: string;
}

export interface AchievementSummary {
  milestone: number;
  quality: number;
  sales: number;
  rating: number;
  [key: string]: number; // Allow for additional achievement types
}

export interface SellerProfileResponse {
  seller: Seller;
  stats: SellerStats;
  courses: SellerCourses;
  reviews: SellerReviews;
  achievements: SellerAchievement[];
  achievementSummary?: AchievementSummary; // Optional, from backend
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export type SellerProfileApiResponse = ApiResponse<SellerProfileResponse>;
