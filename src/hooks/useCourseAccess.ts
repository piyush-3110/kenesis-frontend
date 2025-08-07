/**
 * Course Access Hook
 * Custom hook for checking if a user has access to a course
 */

import { useQuery } from "@tanstack/react-query";
import { checkCourseAccess } from "@/lib/api/courseApi";

/**
 * Query keys for course access queries
 */
export const courseAccessKeys = {
  all: ["courseAccess"] as const,
  access: (courseId: string) =>
    [...courseAccessKeys.all, "access", courseId] as const,
};

/**
 * Hook to check if user has access to a course
 *
 * @param courseId - The ID of the course to check access for
 * @param enabled - Whether the query should be enabled (default: true)
 * @returns Query result with hasAccess boolean and loading/error states
 */
export const useCourseAccess = (
  courseId: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: courseAccessKeys.access(courseId || ""),
    queryFn: () => checkCourseAccess(courseId!),
    enabled: enabled && !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes - access status doesn't change frequently
    retry: 2,
    refetchOnWindowFocus: false,
    select: (data) => ({
      hasAccess: data.data?.hasAccess || false,
      success: data.data?.success || false,
    }),
  });
};
