/**
 * Course Query Hooks
 * TanStack Query hooks for course data fetching
 */

import { useQuery } from "@tanstack/react-query";
import { CourseResponse, getCourse } from "@/lib/api/courseApi";

/**
 * Query keys for course-related queries
 */
export const courseKeys = {
  all: ["courses"] as const,
  detail: (id: string) => [...courseKeys.all, "detail", id] as const,
  reviews: (id: string) => [...courseKeys.all, "reviews", id] as const,
  content: (id: string) => [...courseKeys.all, "content", id] as const,
};

/**
 * Hook to fetch course details by ID or slug
 */
export function useCourse(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: courseKeys.detail(idOrSlug || ""),
    queryFn: async (): Promise<CourseResponse> => {
      if (!idOrSlug) {
        throw new Error("Course ID or slug is required");
      }

      const response = await getCourse(idOrSlug);

      if (!response.success || !response.data) {
        // Check if this is an authentication error
        if (
          response.message?.toLowerCase().includes("session expired") ||
          response.message?.toLowerCase().includes("please log in again")
        ) {
          throw new Error("AUTHENTICATION_REQUIRED");
        }

        throw new Error(response.message || "Failed to fetch course");
      }

      // Transform backend data to frontend format
      return response.data.course as CourseResponse;
    },
    enabled: !!idOrSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message === "AUTHENTICATION_REQUIRED") {
        return false;
      }

      // Don't retry on 404 errors
      if (
        error.message.includes("404") ||
        error.message.includes("not found")
      ) {
        return false;
      }

      return failureCount < 2;
    },
  });
}

/**
 * Hook to fetch course reviews (placeholder for future implementation)
 */
export function useCourseReviews(courseId: string | undefined) {
  return useQuery({
    queryKey: courseKeys.reviews(courseId || ""),
    queryFn: async () => {
      if (!courseId) {
        throw new Error("Course ID is required");
      }

      // TODO: Implement when backend API is ready
      // return getCourseReviews(courseId);
      return [];
    },
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch course content/modules (placeholder for future implementation)
 */
export function useCourseContent(courseId: string | undefined) {
  return useQuery({
    queryKey: courseKeys.content(courseId || ""),
    queryFn: async () => {
      if (!courseId) {
        throw new Error("Course ID is required");
      }

      // TODO: Implement when backend API is ready
      // return getCourseContent(courseId);
      return [];
    },
    enabled: !!courseId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
