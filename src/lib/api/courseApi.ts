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
  console.log("🔐 [COURSE-API] ============= CHECKING COURSE ACCESS =============");
  console.log("🔐 [COURSE-API] Course ID:", courseId);
  console.log("🔐 [COURSE-API] Endpoint:", `/api/courses/purchases/access/${courseId}`);
  console.log("🔐 [COURSE-API] Timestamp:", new Date().toISOString());
  
  try {
    const response = await apiClient.get<CourseAccessResponse>(
      `/api/courses/purchases/access/${courseId}`
    );

    console.log("🔐 [COURSE-API] ============= API CLIENT RESPONSE =============");
    console.log("🔐 [COURSE-API] Response received:", response);
    console.log("🔐 [COURSE-API] Response type:", typeof response);
    console.log("🔐 [COURSE-API] Response keys:", Object.keys(response || {}));
    console.log("🔐 [COURSE-API] Success:", response?.success);
    console.log("🔐 [COURSE-API] Message:", response?.message);
    console.log("🔐 [COURSE-API] Data:", response?.data);
    console.log("🔐 [COURSE-API] Has Access:", response?.data?.hasAccess);
    console.log("🔐 [COURSE-API] Raw JSON:", JSON.stringify(response, null, 2));

    if (!response.success) {
      console.error("🔐 [COURSE-API] API call failed:", response.message);
      throw new Error(response.message || "Failed to check course access");
    }

    console.log("🔐 [COURSE-API] ============= RETURNING RESPONSE =============");
    const returnValue = {
      success: response.success,
      message: response.message,
      data: response.data!, // response.data is already CourseAccessResponse
    };
    console.log("🔐 [COURSE-API] Return value:", returnValue);
    console.log("🔐 [COURSE-API] Return value JSON:", JSON.stringify(returnValue, null, 2));

    return returnValue;
  } catch (error: any) {
    console.error("🔐 [COURSE-API] ============= API ERROR =============");
    console.error("🔐 [COURSE-API] Error occurred:", error);
    console.error("🔐 [COURSE-API] Error type:", typeof error);
    console.error("🔐 [COURSE-API] Error message:", error?.message);
    console.error("🔐 [COURSE-API] Error response:", error?.response);
    console.error("🔐 [COURSE-API] Error response data:", error?.response?.data);
    console.error("🔐 [COURSE-API] Error response status:", error?.response?.status);
    console.error("🔐 [COURSE-API] Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    throw error;
  }
};
