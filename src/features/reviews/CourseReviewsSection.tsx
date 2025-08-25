"use client";
import React from "react";
import { MessageCircle } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useAuth } from "@/features/auth/AuthProvider";
import { useCurrentUser } from "@/features/auth/useCurrentUser";
import {
  useReviews,
  useReviewSummary,
  useCreateReview,
  useVoteReview,
} from "./hooks";
import { ReviewSummaryCard } from "./components/ReviewSummaryCard";
import { ReviewForm } from "./components/ReviewForm";
import { ReviewsList } from "./components/ReviewsList";

interface Props {
  courseId: string;
  courseTitle: string;
  hasAccess?: boolean;
}
interface ReviewItem {
  id: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  helpfulCount: number;
}

interface ReviewsQueryData {
  reviews: ReviewItem[];
  pagination?: { totalPages: number; hasNextPage: boolean };
}

interface ApiError {
  response?: {
    status: number;
    data: {
      success: boolean;
      message?: string;
      errors?: Array<{
        field: string;
        message: string;
      }>;
    };
  };
  message?: string;
}
const CourseReviewsSection: React.FC<Props> = ({ courseId, hasAccess }) => {
  const { addToast } = useUIStore();
  const { isAuthenticated } = useAuth();
  const { data: user } = useCurrentUser();
  const [page, setPage] = React.useState(1);
  const [sortBy, setSortBy] = React.useState<
    "newest" | "oldest" | "rating_high" | "rating_low" | "helpful"
  >("newest");
  const [filterRating, setFilterRating] = React.useState<number | undefined>();
  const params = { page, limit: 10, sortBy, rating: filterRating } as const;
  const reviewsQuery = useReviews(courseId, params) as {
    data?: ReviewsQueryData;
    isLoading: boolean;
  };
  const summaryQuery = useReviewSummary(courseId);
  const createReview = useCreateReview(courseId, params);
  const voteReview = useVoteReview(courseId, params);
  const [showForm, setShowForm] = React.useState(false);
  const canEdit = (r: ReviewItem) => isAuthenticated && user?.id === r.userId;
  const onSubmit = (data: {
    rating: number;
    title: string;
    comment: string;
  }) => {
    if (!isAuthenticated) {
      addToast({ type: "warning", message: "Please login to write a review" });
      return;
    }
    createReview.mutate(
      data as unknown as { rating: number; title: string; comment: string },
      {
        onSuccess: (res: { success: boolean; message?: string }) => {
          if (res.success) {
            addToast({
              type: "success",
              message: "Review created successfully",
            });
            setShowForm(false);
          } else {
            addToast({
              type: "error",
              message: res.message || "Failed to create review",
            });
          }
        },
        onError: (error: ApiError) => {
          // Handle different error types based on the API documentation
          if (error.response) {
            const { status, data } = error.response;

            switch (status) {
              case 400:
                // Validation errors - show specific field errors
                if (data.errors && Array.isArray(data.errors)) {
                  const errorMessages = data.errors
                    .map(
                      (err: { field: string; message: string }) => err.message
                    )
                    .join(", ");
                  addToast({
                    type: "error",
                    message: errorMessages,
                  });
                } else {
                  addToast({
                    type: "error",
                    message: data.message || "Please check your review details",
                  });
                }
                break;

              case 401:
                // Authentication error
                addToast({
                  type: "error",
                  message: "Your session has expired. Please login again",
                });
                break;

              case 403:
                // Purchase verification error
                addToast({
                  type: "warning",
                  message: "You must purchase the course before reviewing",
                });
                break;

              case 404:
                // Course or user not found
                if (data.message === "User not found") {
                  addToast({
                    type: "error",
                    message: "User account not found. Please login again",
                  });
                } else {
                  addToast({
                    type: "error",
                    message: "Course not found or is no longer available",
                  });
                }
                break;

              case 409:
                // Duplicate review
                addToast({
                  type: "warning",
                  message:
                    "You have already reviewed this course. You can edit your existing review instead",
                });
                break;

              case 429:
                // Rate limiting
                addToast({
                  type: "warning",
                  message: "Too many requests. Please try again later",
                });
                break;

              case 500:
              default:
                // Server error or unknown error
                addToast({
                  type: "error",
                  message:
                    data.message || "Failed to create review. Please try again",
                });
                break;
            }
          } else if (error.message) {
            // Network or other errors
            addToast({
              type: "error",
              message:
                "Network error. Please check your connection and try again",
            });
          } else {
            // Fallback error message
            addToast({
              type: "error",
              message: "An unexpected error occurred. Please try again",
            });
          }
        },
      }
    );
  };
  return (
    <div className="w-full rounded-xl p-6 sm:p-8 backdrop-blur-sm border border-gray-700/30 space-y-8 bg-black/40">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
          <MessageCircle size={24} className="text-blue-400" />
          Student Reviews
        </h2>
        {isAuthenticated && (
          <button
            onClick={() => {
              if (!hasAccess) {
                addToast({
                  type: "warning",
                  message: "You must purchase the course before reviewing",
                });
                return;
              }
              setShowForm(!showForm);
            }}
            className={`px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              hasAccess
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-gray-700 text-gray-300"
            }`}
            disabled={!hasAccess}
          >
            {showForm ? "Close" : "Write a Review"}
          </button>
        )}
      </div>
      {summaryQuery.isLoading ? (
        <div className="text-center py-8 text-gray-400">Loading summary...</div>
      ) : (
        <ReviewSummaryCard summary={summaryQuery.data} />
      )}
      {showForm && hasAccess && (
        <ReviewForm
          onSubmit={onSubmit}
          loading={createReview.isPending}
          onCancel={() => setShowForm(false)}
        />
      )}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-gray-700/50 border border-gray-600/50 rounded px-2 py-1"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="rating_high">Highest</option>
            <option value="rating_low">Lowest</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Rating:</span>
          <select
            value={filterRating || ""}
            onChange={(e) =>
              setFilterRating(
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            className="bg-gray-700/50 border border-gray-600/50 rounded px-2 py-1"
          >
            <option value="">All</option>
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
          </select>
        </div>
      </div>
      {reviewsQuery.isLoading ? (
        <div className="text-center py-12 text-gray-400">
          Loading reviews...
        </div>
      ) : (
        <ReviewsList
          reviews={reviewsQuery.data?.reviews || []}
          canEdit={canEdit}
          onEdit={() => null}
          onDelete={() => null}
          onVote={(id, helpful) =>
            voteReview.mutate({ reviewId: id, isHelpful: helpful })
          }
          votingId={
            (voteReview.variables as unknown as { reviewId?: string })
              ?.reviewId || null
          }
        />
      )}
      {!!reviewsQuery.data?.pagination &&
        reviewsQuery.data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 bg-gray-700/50 rounded disabled:opacity-50 text-white"
            >
              Prev
            </button>
            <span className="text-gray-400">Page {page}</span>
            <button
              disabled={!reviewsQuery.data.pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-700/50 rounded disabled:opacity-50 text-white"
            >
              Next
            </button>
          </div>
        )}
    </div>
  );
};

export default CourseReviewsSection;
