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
 * @returns Query result with hasAccess boolean, loading/error states, and refetch function
 */
export const useCourseAccess = (
  courseId: string | null,
  enabled: boolean = true
) => {
  const query = useQuery({
    queryKey: courseAccessKeys.access(courseId || ""),
    queryFn: () => checkCourseAccess(courseId!),
    enabled: enabled && !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes - access status doesn't change frequently
    retry: (failureCount, error) => {
      // Don't retry if user is not authenticated (401/403 errors)
      if (error instanceof Error) {
        const isAuthError =
          error.message.toLowerCase().includes("unauthorized") ||
          error.message.toLowerCase().includes("please log in") ||
          error.message.toLowerCase().includes("authentication failed");
        if (isAuthError) {
          return false; // Don't retry auth errors
        }
      }
      return failureCount < 2; // Retry up to 2 times for other errors
    },
    refetchOnWindowFocus: false,
    select: (data) => ({
      hasAccess: data.data?.hasAccess || false,
      success: data.data?.success || false,
    }),
  });

  return {
    ...query,
    // Enhanced refetch function that invalidates cache and refetches
    refetchAccess: async () => {
      console.log("🔄 Refetching course access for courseId:", courseId);
      return query.refetch();
    },
  };
};
