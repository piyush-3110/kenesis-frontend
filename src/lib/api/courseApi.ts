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
  videoPreview: string;
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
 * Fetch a single course by ID or slug
 */
export const getCourse = async (
  idOrSlug: string
): Promise<ApiResponse<CourseApiResponse>> => {
  return apiClient.get<CourseApiResponse>(`/api/courses/${idOrSlug}`);
};
