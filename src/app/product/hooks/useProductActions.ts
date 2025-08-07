import {
  submitReview,
  toggleReviewLike,
  markContentComplete,
} from "@/lib/productApi";

export interface UseProductActionsReturn {
  handleSubmitReview: (
    productId: string,
    rating: number,
    comment: string
  ) => Promise<void>;
  handleLikeReview: (reviewId: string) => Promise<void>;
  handleMarkComplete: (productId: string, contentId: string) => Promise<void>;
}

export const useProductActions = (
  onSuccess?: () => void
): UseProductActionsReturn => {
  const handleSubmitReview = async (
    productId: string,
    rating: number,
    comment: string
  ) => {
    try {
      await submitReview(productId, rating, comment);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  const handleLikeReview = async (reviewId: string) => {
    try {
      const result = await toggleReviewLike(reviewId);
      console.log("Review like toggled:", result);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to like review:", error);
    }
  };

  const handleMarkComplete = async (productId: string, contentId: string) => {
    try {
      await markContentComplete(productId, contentId);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to mark content complete:", error);
    }
  };

  return {
    handleSubmitReview,
    handleLikeReview,
    handleMarkComplete,
  };
};
