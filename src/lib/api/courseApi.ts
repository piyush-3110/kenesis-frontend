/**
 * Course API
 * Handles course-related API calls
 */

import { apiClient } from "./client";
import type { ApiResponse } from "./apiTypes";

// Course response types based on backend API
export interface CourseStats {
  rating: number;
  reviewCount: number;
  duration: number;
}

export interface CourseInstructor {
  id: string;
  username: string;
  walletAddress?: string; // Instructor's wallet address for receiving payments
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
  type: "video" | "document";
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
  previewVideo: string; // URL to the course preview video
  isPublished: boolean;
  instructor: CourseInstructor;
  price: number;
  slug: string;
  level: string;
  affiliatePercentage: number;
  tokenToPayWith: string[]; // ["USDT-1", [USDC-1]], Basically ["TOKEN_SYMBOL-CHAIN_ID"]
  accessDuration: number; // in seconds, -1 if infinite access
  availableQuantity: number; // total number of times that the course can be sold -1 for unlimited
  soldCount: number; // Total number of products sold
  language: string; // en, es, fr, etc.
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
 * Course access check response
 */
export interface CourseAccessResponse {
  success: boolean;
  hasAccess: boolean;
}

export interface CourseAccessApiResponse {
  success: boolean;
  message: string;
  data: CourseAccessResponse;
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
 * Check if user has access to a course
 */
export const checkCourseAccess = async (
  courseId: string
): Promise<ApiResponse<CourseAccessResponse>> => {
  const response = await apiClient.get<CourseAccessResponse>(
    `/api/courses/purchases/access/${courseId}`
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to check course access");
  }

  console.log("Course access response:", response);

  // Return the response data directly since the API client already unwraps it
  return {
    success: response.success,
    message: response.message,
    data: response.data!, // response.data is already CourseAccessResponse
  };
};
