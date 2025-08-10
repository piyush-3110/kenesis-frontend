/**
 * Course Approvals Hooks
 * React Query hooks for course approval operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUIStore } from "@/store/useUIStore";
import {
  getPendingReviews,
  getCourseReview,
  approveCourse,
  rejectCourse,
  updateReviewNotes,
  getReviewStats,
  type PendingReviewsFilters,
  type CourseApprovalData,
  type CourseRejectionData,
  type CourseNotesData,
} from "../api/approvalsApi";

/**
 * Hook to get pending course reviews
 */
export function usePendingReviews(filters: PendingReviewsFilters = {}, enabled: boolean = true) {
  return useQuery({
    queryKey: ["approvals", "pending", filters],
    queryFn: () => getPendingReviews(filters),
    enabled: enabled,
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to get course review details
 */
export function useCourseReview(courseId: string) {
  return useQuery({
    queryKey: ["approvals", "course", courseId],
    queryFn: () => getCourseReview(courseId),
    enabled: !!courseId,
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Hook to get review statistics
 */
export function useReviewStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ["approvals", "stats"],
    queryFn: getReviewStats,
    enabled: enabled,
    staleTime: 60_000, // 1 minute
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to approve a course
 */
export function useApproveCourse() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: CourseApprovalData }) =>
      approveCourse(courseId, data),
    onSuccess: (data, { courseId }) => {
      console.log('✅ Course approved successfully:', courseId);
      
      addToast({
        type: "success",
        message: "Course approved successfully! Instructor has been notified.",
      });

      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["approvals", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["approvals", "course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["approvals", "stats"] });
    },
    onError: (error) => {
      console.error('❌ Failed to approve course:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to approve course";
      addToast({
        type: "error",
        message: errorMessage,
      });
    },
  });
}

/**
 * Hook to reject a course
 */
export function useRejectCourse() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: CourseRejectionData }) =>
      rejectCourse(courseId, data),
    onSuccess: (data, { courseId }) => {
      console.log('✅ Course rejected successfully:', courseId);
      
      addToast({
        type: "success",
        message: "Course rejected. Instructor has been notified with feedback.",
      });

      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["approvals", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["approvals", "course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["approvals", "stats"] });
    },
    onError: (error) => {
      console.error('❌ Failed to reject course:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to reject course";
      addToast({
        type: "error",
        message: errorMessage,
      });
    },
  });
}

/**
 * Hook to update review notes
 */
export function useUpdateReviewNotes() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: CourseNotesData }) =>
      updateReviewNotes(courseId, data),
    onSuccess: (data, { courseId }) => {
      console.log('✅ Review notes updated successfully:', courseId);
      
      addToast({
        type: "success",
        message: "Review notes updated successfully.",
      });

      // Invalidate and refetch course details
      queryClient.invalidateQueries({ queryKey: ["approvals", "course", courseId] });
    },
    onError: (error) => {
      console.error('❌ Failed to update review notes:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to update review notes";
      addToast({
        type: "error",
        message: errorMessage,
      });
    },
  });
}
