"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  User,
  MessageCircle,
  ThumbsUp,
  Calendar,
  CheckCircle,
  Send,
  ChevronDown,
  BarChart3,
  MoreVertical,
  Edit2,
  Trash2,
  Reply,
  ChevronUp,
  ThumbsDown,
} from "lucide-react";
import {
  ReviewAPI,
  Review,
  ReviewSummary,
  GetReviewsParams,
  UpdateReviewRequest,
} from "@/lib/api/reviewApi";
import { useUIStore } from "@/store/useUIStore";
import { useAuth } from "@/features/auth/AuthProvider";
import { useCurrentUser } from "@/features/auth/useCurrentUser";
import Image from "next/image";

interface CourseReviewsSectionProps {
  courseId: string;
  courseTitle: string;
}

interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
}

interface FormErrors {
  rating?: string;
  title?: string;
  comment?: string;
}

/**
 * Course Reviews Section Component
 * Displays reviews, rating summary, and allows users to create new reviews
 * Follows the bluish gradient theme and modern design
 */
const CourseReviewsSection: React.FC<CourseReviewsSectionProps> = ({
  courseId,
}) => {
  const { addToast } = useUIStore();

  const { isAuthenticated } = useAuth();
  const { data: user } = useCurrentUser();

  // State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<GetReviewsParams["sortBy"]>("newest");
  const [filterRating, setFilterRating] = useState<number | undefined>();

  // Edit/Delete/Reply state
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [deletingReview, setDeletingReview] = useState<string | null>(null);
  const [replyingToReview, setReplyingToReview] = useState<string | null>(null);
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());
  const [votingOnReview, setVotingOnReview] = useState<string | null>(null);

  // Edit form state
  const [editFormData, setEditFormData] = useState<UpdateReviewRequest>({});

  // Reply form state
  const [replyContent, setReplyContent] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 5,
    title: "",
    comment: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Load data on mount
  useEffect(() => {
    loadReviewData();
  }, [courseId, currentPage, sortBy, filterRating]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadReviewData = async () => {
    try {
      setLoading(true);

      // Load reviews and summary in parallel
      const [reviewsResponse, summaryResponse] = await Promise.all([
        ReviewAPI.getReviews(courseId, {
          page: currentPage,
          limit: 10,
          sortBy,
          rating: filterRating,
        }),
        ReviewAPI.getReviewSummary(courseId),
      ]);

      if (reviewsResponse.success) {
        setReviews(reviewsResponse.data?.reviews || []);
      } else {
        addToast({
          type: "error",
          message: reviewsResponse.message || "Failed to load reviews",
        });
      }

      if (summaryResponse.success) {
        setReviewSummary(summaryResponse.data?.summary || null);
      } else {
        console.error(
          "Failed to load review summary:",
          summaryResponse.message
        );
      }
    } catch (error) {
      console.error("Error loading review data:", error);
      addToast({
        type: "error",
        message: "Failed to load reviews. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    // No frontend validation - let the backend handle all validation
    return true;
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🌟 [REVIEW FORM] Starting review submission...");
    console.log("👤 [REVIEW FORM] Auth status:", isAuthenticated);
    console.log(
      "👤 [REVIEW FORM] User data:",
      user ? { id: user.id, email: user.email } : "No user"
    );

    if (!isAuthenticated) {
      console.warn("⚠️ [REVIEW FORM] User not authenticated");
      addToast({
        type: "warning",
        message: "Please log in to leave a review",
      });
      return;
    }

    if (!validateForm()) {
      console.warn("⚠️ [REVIEW FORM] Form validation failed");
      return;
    }

    console.log("📝 [REVIEW FORM] Form data:", {
      courseId,
      rating: formData.rating,
      title: formData.title.trim(),
      comment: formData.comment.trim(),
    });

    try {
      setSubmitting(true);

      const response = await ReviewAPI.createReview(courseId, {
        rating: formData.rating,
        title: formData.title.trim(),
        comment: formData.comment.trim(),
      });

      console.log("📨 [REVIEW FORM] API response:", response);

      if (response.success) {
        console.log("✅ [REVIEW FORM] Review submitted successfully");
        addToast({
          type: "success",
          message: "Review submitted successfully!",
        });

        // Reset form and reload data
        setFormData({ rating: 5, title: "", comment: "" });
        setShowReviewForm(false);
        await loadReviewData();
      } else {
        console.error(
          "❌ [REVIEW FORM] Review submission failed:",
          response.message
        );
        addToast({
          type: "error",
          message: response.message || "Failed to submit review",
        });
      }
    } catch (error) {
      console.error(
        "💥 [REVIEW FORM] Exception during review submission:",
        error
      );
      addToast({
        type: "error",
        message: "Failed to submit review. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    };

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!reviewSummary) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count =
            reviewSummary.ratingDistribution[
              rating as keyof typeof reviewSummary.ratingDistribution
            ];
          const percentage =
            reviewSummary.totalReviews > 0
              ? (count / reviewSummary.totalReviews) * 100
              : 0;

          return (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm text-gray-300 w-6">{rating}</span>
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleUpdateReview = async (reviewId: string) => {
    if (!editFormData.rating && !editFormData.title && !editFormData.comment) {
      addToast({
        type: "warning",
        message: "Please make some changes to update the review",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await ReviewAPI.updateReview(
        courseId,
        reviewId,
        editFormData
      );

      if (response.success) {
        addToast({
          type: "success",
          message: "Review updated successfully!",
        });
        setEditingReview(null);
        setEditFormData({});
        await loadReviewData();
      } else {
        addToast({
          type: "error",
          message: response.message || "Failed to update review",
        });
      }
    } catch (error) {
      console.error("Error updating review:", error);
      addToast({
        type: "error",
        message: "Failed to update review. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this review? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingReview(reviewId);
      const response = await ReviewAPI.deleteReview(courseId, reviewId);

      if (response.success) {
        addToast({
          type: "success",
          message: "Review deleted successfully!",
        });
        await loadReviewData();
      } else {
        addToast({
          type: "error",
          message: response.message || "Failed to delete review",
        });
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      addToast({
        type: "error",
        message: "Failed to delete review. Please try again.",
      });
    } finally {
      setDeletingReview(null);
    }
  };

  const handleVoteOnReview = async (reviewId: string, isHelpful: boolean) => {
    if (!isAuthenticated) {
      addToast({
        type: "warning",
        message: "Please log in to vote on reviews",
      });
      return;
    }

    try {
      setVotingOnReview(reviewId);
      const response = await ReviewAPI.voteOnReview(courseId, reviewId, {
        isHelpful,
      });

      if (response.success) {
        addToast({
          type: "success",
          message: `Marked as ${isHelpful ? "helpful" : "not helpful"}`,
        });
        await loadReviewData(); // Reload to get updated vote counts
      } else {
        addToast({
          type: "error",
          message: response.message || "Failed to vote on review",
        });
      }
    } catch (error) {
      console.error("Error voting on review:", error);
      addToast({
        type: "error",
        message: "Failed to vote on review. Please try again.",
      });
    } finally {
      setVotingOnReview(null);
    }
  };

  const handleReplyToReview = async (reviewId: string) => {
    if (!replyContent.trim()) {
      addToast({
        type: "warning",
        message: "Please enter a reply",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await ReviewAPI.replyToReview(courseId, reviewId, {
        comment: replyContent.trim(),
      });

      if (response.success) {
        addToast({
          type: "success",
          message: "Reply posted successfully!",
        });
        setReplyingToReview(null);
        setReplyContent("");
        await loadReviewData();
      } else {
        addToast({
          type: "error",
          message: response.message || "Failed to post reply",
        });
      }
    } catch (error: any) {
      console.error("Error posting reply:", error);

      // Handle 501 Not Implemented error specifically
      if (error.response?.status === 501) {
        addToast({
          type: "info",
          message:
            "Reply functionality is coming soon! This feature is currently under development.",
        });
      } else {
        addToast({
          type: "error",
          message: "Failed to post reply. Please try again.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const startEditingReview = (review: Review) => {
    setEditingReview(review.id);
    setEditFormData({
      rating: review.rating,
      title: review.title,
      comment: review.comment,
    });
  };

  const cancelEditingReview = () => {
    setEditingReview(null);
    setEditFormData({});
  };

  const toggleReplies = (reviewId: string) => {
    const newShowReplies = new Set(showReplies);
    if (newShowReplies.has(reviewId)) {
      newShowReplies.delete(reviewId);
    } else {
      newShowReplies.add(reviewId);
    }
    setShowReplies(newShowReplies);
  };

  const canEditReview = (review: Review): boolean => {
    return isAuthenticated && user?.id === review.userId;
  };

  const canReplyToReview = (): boolean => {
    // Reply functionality is not yet implemented in the backend (501 error)
    // Disable until backend implementation is complete
    return false;

    // TODO: Re-enable when backend implements reply functionality
    // return isAuthenticated;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400 text-sm">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-xl p-6 sm:p-8 backdrop-blur-sm border border-gray-700/30 space-y-8"
      style={{
        background:
          "linear-gradient(152.97deg, rgba(6,128,255,0.05) 18.75%, rgba(0,0,0,0.2) 100%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
          <MessageCircle size={24} className="text-blue-400" />
          Student Reviews
        </h2>

        {isAuthenticated && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium text-sm border border-blue-500/30"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Summary */}
      {reviewSummary && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Overall Rating */}
          <div
            className="p-6 rounded-xl backdrop-blur-sm border border-gray-700/30"
            style={{
              background:
                "linear-gradient(152.97deg, rgba(6,128,255,0.08) 18.75%, rgba(0,0,0,0.3) 100%)",
            }}
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {reviewSummary.averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(reviewSummary.averageRating), "lg")}
              <p className="text-gray-400 text-sm mt-2">
                Based on {reviewSummary.totalReviews} review
                {reviewSummary.totalReviews !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div
            className="lg:col-span-2 p-6 rounded-xl backdrop-blur-sm border border-gray-700/30"
            style={{
              background:
                "linear-gradient(152.97deg, rgba(6,128,255,0.08) 18.75%, rgba(0,0,0,0.3) 100%)",
            }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-400" />
              Rating Distribution
            </h3>
            {renderRatingDistribution()}
          </div>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div
          className="p-6 sm:p-8 rounded-xl backdrop-blur-sm border border-blue-500/30"
          style={{
            background:
              "linear-gradient(152.97deg, rgba(6,128,255,0.1) 18.75%, rgba(0,0,0,0.3) 100%)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              Write Your Review
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <CheckCircle size={12} className="text-green-400" />
              <span>Verified Course Access</span>
            </div>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Rating *
              </label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= formData.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-600 hover:text-yellow-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-sm text-gray-400">
                  {formData.rating} star{formData.rating !== 1 ? "s" : ""}
                </span>
              </div>
              {formErrors.rating && (
                <p className="text-red-400 text-xs mt-1">{formErrors.rating}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Review Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Summarize your experience..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                {formErrors.title && (
                  <p className="text-red-400 text-xs mt-1">
                    {formErrors.title}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Your Review *
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  placeholder="Share your thoughts about this course..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                />
                {formErrors.comment && (
                  <p className="text-red-400 text-xs mt-1">
                    {formErrors.comment}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/30"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send size={16} />
                )}
                {submitting ? "Submitting..." : "Submit Review"}
              </button>

              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Sorting */}
      {reviews.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as GetReviewsParams["sortBy"])
              }
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="rating_high">Highest Rating</option>
              <option value="rating_low">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Filter by rating:</span>
            <select
              value={filterRating || ""}
              onChange={(e) =>
                setFilterRating(
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
            >
              <option value="">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-white mb-2">
              No Reviews Yet
            </h3>
            <p className="text-gray-400 mb-6">
              Be the first to share your experience with this course!
            </p>
            {isAuthenticated && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium text-sm border border-blue-500/30"
              >
                Write the First Review
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-6 sm:p-8 rounded-xl backdrop-blur-sm border border-gray-700/30"
                style={{
                  background:
                    "linear-gradient(152.97deg, rgba(6,128,255,0.03) 18.75%, rgba(0,0,0,0.2) 100%)",
                }}
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      {review.userAvatar ? (
                        <Image
                          src={review.userAvatar}
                          alt={review.username}
                          className="w-full h-full rounded-full object-cover"
                          width={240}
                          height={240}
                        />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>

                    {/* User Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">
                          {review.username}
                        </h4>
                        {review.isVerifiedPurchase && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                            <CheckCircle size={12} />
                            Verified Purchase
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(review.createdAt)}
                        </div>
                        {editingReview === review.id ? (
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() =>
                                  setEditFormData({
                                    ...editFormData,
                                    rating: star,
                                  })
                                }
                                className="hover:scale-110 transition-transform"
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    star <=
                                    (editFormData.rating || review.rating)
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-600 hover:text-yellow-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        ) : (
                          renderStars(review.rating, "sm")
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Menu */}
                  <div className="flex items-center gap-2">
                    {/* Helpful Votes */}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <ThumbsUp size={12} />
                      <span>{review.helpfulVotes} helpful</span>
                    </div>

                    {/* Edit/Delete Menu for Own Reviews */}
                    {canEditReview(review) && (
                      <div className="relative">
                        <button
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                          onClick={() => {
                            if (editingReview === review.id) {
                              cancelEditingReview();
                            } else {
                              startEditingReview(review);
                            }
                          }}
                        >
                          {editingReview === review.id ? (
                            <ChevronUp size={16} />
                          ) : (
                            <MoreVertical size={16} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Content - Edit Mode */}
                {editingReview === review.id ? (
                  <div className="space-y-4 mb-4">
                    <div>
                      <input
                        type="text"
                        value={editFormData.title || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            title: e.target.value,
                          })
                        }
                        placeholder="Review title..."
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors"
                      />
                    </div>
                    <div>
                      <textarea
                        value={editFormData.comment || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            comment: e.target.value,
                          })
                        }
                        placeholder="Update your review..."
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateReview(review.id)}
                        disabled={submitting}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors text-sm disabled:opacity-50"
                      >
                        {submitting ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <Edit2 size={14} />
                        )}
                        {submitting ? "Updating..." : "Update"}
                      </button>
                      <button
                        onClick={cancelEditingReview}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={deletingReview === review.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm disabled:opacity-50 border border-red-500/30"
                      >
                        {deletingReview === review.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-400"></div>
                        ) : (
                          <Trash2 size={14} />
                        )}
                        {deletingReview === review.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Review Content - Display Mode */
                  <div>
                    <h5 className="font-semibold text-white mb-2">
                      {review.title}
                    </h5>
                    <p className="text-gray-300 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                )}

                {/* Review Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/30">
                  <div className="flex items-center gap-4">
                    {/* Vote Buttons */}
                    <button
                      onClick={() => handleVoteOnReview(review.id, true)}
                      disabled={
                        votingOnReview === review.id || !isAuthenticated
                      }
                      className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors text-sm disabled:opacity-50"
                    >
                      <ThumbsUp size={14} />
                      Helpful ({review.helpfulVotes})
                    </button>

                    <button
                      onClick={() => handleVoteOnReview(review.id, false)}
                      disabled={
                        votingOnReview === review.id || !isAuthenticated
                      }
                      className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm disabled:opacity-50"
                    >
                      <ThumbsDown size={14} />
                      Not Helpful
                    </button>

                    {/* Reply Button */}
                    {canReplyToReview() && (
                      <button
                        onClick={() =>
                          setReplyingToReview(
                            replyingToReview === review.id ? null : review.id
                          )
                        }
                        className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors text-sm"
                      >
                        <Reply size={14} />
                        Reply
                      </button>
                    )}

                    {/* Show Replies Toggle */}
                    {review.replies.length > 0 && (
                      <button
                        onClick={() => toggleReplies(review.id)}
                        className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors text-sm"
                      >
                        <MessageCircle size={14} />
                        {showReplies.has(review.id) ? "Hide" : "Show"}{" "}
                        {review.replies.length}{" "}
                        {review.replies.length === 1 ? "Reply" : "Replies"}
                        {showReplies.has(review.id) ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                    )}
                  </div>

                  {votingOnReview === review.id && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  )}
                </div>

                {/* Reply Form */}
                {replyingToReview === review.id && (
                  <div className="mt-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write your reply..."
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                    />
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => handleReplyToReview(review.id)}
                        disabled={submitting || !replyContent.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors text-sm disabled:opacity-50"
                      >
                        {submitting ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <Send size={14} />
                        )}
                        {submitting ? "Posting..." : "Post Reply"}
                      </button>
                      <button
                        onClick={() => {
                          setReplyingToReview(null);
                          setReplyContent("");
                        }}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies List */}
                {showReplies.has(review.id) && review.replies.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {review.replies.map((reply: any) => (
                      <div
                        key={reply.id}
                        className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 ml-6"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                            {reply.userAvatar ? (
                              <Image
                                src={reply.userAvatar}
                                alt={reply.username}
                                className="w-full h-full rounded-full object-cover"
                                width={40}
                                height={40}
                              />
                            ) : (
                              <User className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h6 className="font-medium text-white text-sm">
                                {reply.username}
                              </h6>
                              <span className="text-xs text-gray-400">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                              {reply.comment}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm border border-gray-600/30"
          >
            Previous
          </button>

          <span className="text-gray-400 text-sm">Page {currentPage}</span>

          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={reviews.length < 10} // Assuming 10 per page
            className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm border border-gray-600/30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseReviewsSection;
