"use client";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { ReviewAPI, type GetReviewsParams, type CreateReviewRequest, type UpdateReviewRequest } from "@/lib/api/reviewApi";

export const reviewKeys = {
  list: (courseId: string, params: GetReviewsParams) => ["reviews", courseId, params] as const,
  summary: (courseId: string) => ["reviews","summary",courseId] as const,
};

export const useReviews = (courseId: string, params: GetReviewsParams) => useQuery({
  queryKey: reviewKeys.list(courseId, params),
  queryFn: async () => {
    const res = await ReviewAPI.getReviews(courseId, params);
    if(!res.success) throw new Error(res.message || 'Failed to load reviews');
    return res.data!;
  },
  placeholderData: keepPreviousData,
});

export const useReviewSummary = (courseId: string) => useQuery({
  queryKey: reviewKeys.summary(courseId),
  queryFn: async () => {
    const res = await ReviewAPI.getReviewSummary(courseId);
    if(!res.success) throw new Error(res.message || 'Failed to load review summary');
    return res.data!.summary;
  },
});

export const useCreateReview = (courseId:string, params:GetReviewsParams) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d:CreateReviewRequest) => ReviewAPI.createReview(courseId,d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.list(courseId, params)});
      qc.invalidateQueries({ queryKey: reviewKeys.summary(courseId)});
    }
  });
};

export const useUpdateReview = (courseId:string, params:GetReviewsParams) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v:{reviewId:string; data:UpdateReviewRequest}) => ReviewAPI.updateReview(courseId,v.reviewId,v.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.list(courseId, params)});
      qc.invalidateQueries({ queryKey: reviewKeys.summary(courseId)});
    }
  });
};

export const useDeleteReview = (courseId:string, params:GetReviewsParams) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id:string) => ReviewAPI.deleteReview(courseId,id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.list(courseId, params)});
      qc.invalidateQueries({ queryKey: reviewKeys.summary(courseId)});
    }
  });
};

export const useVoteReview = (courseId:string, params:GetReviewsParams) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v:{reviewId:string; isHelpful:boolean}) => ReviewAPI.voteOnReview(courseId,v.reviewId,{ isHelpful: v.isHelpful }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.list(courseId, params)});
    }
  });
};