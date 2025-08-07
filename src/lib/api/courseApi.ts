/**
 * Course API
 * Handles course-related API calls
 */

import { apiClient } from "./client";
import type { ApiResponse } from "./types";

// Course response types based on backend API
export interface CourseStats {
  rating: number;
  reviewCount: number;
  duration: number;
}

export interface CourseInstructor {
  id: string;
  username: string;
  avatar: string;
}

export interface CourseChapter {
  id: string;
  title: string;
  description: string;
  order: number;
  moduleCount: number;
  modules?: CourseModule[];
}

export interface CourseModule {
  id: string;
  title: string;
  type: "video" | "document" | "quiz" | "assignment";
  duration: number; // in seconds (backend format)
  order: number;
  isPreview: boolean;
  isCompleted?: boolean; // This would come from user progress, not backend module data
}

export interface CourseMetadata {
  requirements: string[];
  learningOutcomes: string[];
  targetAudience: string[];
  level: string;
  tags: string[];
}

export interface CourseResponse {
  id: string;
  title: string;
  type: "video" | "document";
  description: string;
  shortDescription: string;
  thumbnail: string;
  isPublished: boolean;
  instructor: CourseInstructor;
  price: number;
  slug: string;
  level: string;
  affiliatePercentage: number;
  tokenToPayWith: string[];
  accessDuration: number;
  availableQuantity: number;
  soldCount: number;
  stats: CourseStats;
  chapters: CourseChapter[];
  metadata: CourseMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface CourseApiResponse {
  course: CourseResponse;
}

/**
 * Fetch a single course by ID or slug
 */
export const getCourse = async (
  idOrSlug: string
): Promise<ApiResponse<CourseApiResponse>> => {
  return apiClient.get<CourseApiResponse>(`/api/courses/${idOrSlug}`);
};

/**
 * Transform backend course data to frontend ExtendedProduct format
 */
export const transformCourseToExtendedProduct = (
  courseData: CourseResponse
): any => {
  // Mock data for required ExtendedProduct fields until we have proper APIs
  const mockReviews: any[] = [];
  const mockContent: any[] = [];
  const mockPurchasedBy: string[] = [];

  return {
    // Basic product info
    id: courseData.id,
    title: courseData.title,
    description: courseData.description,
    author: courseData.instructor.username,
    price: courseData.price,
    currency: "USD",
    rating: courseData.stats.rating,
    totalRatings: courseData.stats.reviewCount,
    image: courseData.thumbnail,
    category: courseData.metadata.level,
    type: courseData.type,
    createdAt: courseData.createdAt,
    slug: courseData.slug,

    // Extended product fields - populated with mock data for now
    reviews: mockReviews,
    reviewSummary: {
      averageRating: courseData.stats.rating,
      totalReviews: courseData.stats.reviewCount,
      ratingDistribution: {
        5: Math.floor(courseData.stats.reviewCount * 0.6),
        4: Math.floor(courseData.stats.reviewCount * 0.2),
        3: Math.floor(courseData.stats.reviewCount * 0.1),
        2: Math.floor(courseData.stats.reviewCount * 0.05),
        1: Math.floor(courseData.stats.reviewCount * 0.05),
      },
    },

    // Course access - TODO: implement proper access control based on user auth
    courseAccess: {
      hasAccess: false, // Will be determined by user's purchase status
      progress: undefined,
      lastWatched: undefined,
    },

    // Course content - TODO: implement when content API is ready
    content: mockContent,

    // Additional fields
    purchasedBy: mockPurchasedBy,
    topics: courseData.metadata.learningOutcomes,

    // Course-specific fields
    chapters: courseData.chapters.map((chapter) => ({
      ...chapter,
      modules: [
        // Mock modules based on real backend structure
        {
          id: `${chapter.id}-module-1`,
          title: "Introduction to React Hook",
          type: "video" as const,
          duration: 1800, // 30 minutes in seconds
          order: 1,
          isPreview: false,
          isCompleted: false, // This would come from user progress
        },
        {
          id: `${chapter.id}-module-2`,
          title: "Introduction to React Components",
          type: "video" as const,
          duration: 1800, // 30 minutes in seconds
          order: 2,
          isPreview: false,
          isCompleted: false,
        },
      ].slice(0, chapter.moduleCount), // Only include up to the actual module count
    })),
    availableQuantity: courseData.availableQuantity,
    accessDuration: courseData.accessDuration,
    metadata: {
      requirements: courseData.metadata.requirements,
      learningOutcomes: courseData.metadata.learningOutcomes,
      targetAudience: courseData.metadata.targetAudience,
      level: courseData.metadata.level,
      tags: courseData.metadata.tags,
    },

    // Backend specific fields for potential future use
    instructor: courseData.instructor,
    isPublished: courseData.isPublished,
    affiliatePercentage: courseData.affiliatePercentage,
    tokenToPayWith: courseData.tokenToPayWith,
    soldCount: courseData.soldCount,
  };
};
