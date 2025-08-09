import { TokenManager } from "@/features/auth/tokenManager";
import { ApiResponse } from "../api";

/**
 * Review and Rating API functions
 * Integrates with the course review system following the API documentation
 */

// API base URL and headers setup
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://kenesis-backend.onrender.com";

/**
 * Helper function to get auth headers
 */
const getAuthHeaders = (): { [key: string]: string } => {
  const token = TokenManager.getAccessToken();
  console.log(
    "🔑 [REVIEW API] Getting auth token:",
    token ? "Token found" : "No token found"
  );
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * API request helper
 */
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const authHeaders = getAuthHeaders();
  const headers: { [key: string]: string } = {
    "Content-Type": "application/json",
    ...authHeaders,
    ...((options.headers as { [key: string]: string }) || {}),
  };

  console.log(
    "🌐 [REVIEW API] Making request to:",
    `${API_BASE_URL}/api${url}`
  );
  console.log("🔑 [REVIEW API] Request headers:", {
    ...headers,
    Authorization: headers.Authorization
      ? "Bearer [TOKEN]"
      : "No Authorization header",
  });
  console.log("📦 [REVIEW API] Request options:", {
    method: options.method || "GET",
    body: options.body ? "Present" : "None",
  });

  const response = await fetch(`${API_BASE_URL}/api${url}`, {
    ...options,
    headers,
  });

  console.log(
    "📡 [REVIEW API] Response status:",
    response.status,
    response.statusText
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(
      "❌ [REVIEW API] Request failed with status:",
      response.status
    );
    console.error("❌ [REVIEW API] Error response body:", errorData);
    throw { response: { status: response.status, data: errorData } };
  }

  const responseData = await response.json();
  console.log("✅ [REVIEW API] Response data:", responseData);
  return responseData;
};

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  totalVotes: number;
  replies: any[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  summary: ReviewSummary;
}

export interface CreateReviewRequest {
  rating: number;
  title: string;
  comment: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  comment?: string;
}

export interface VoteRequest {
  isHelpful: boolean;
}

export interface ReplyRequest {
  comment: string;
}

export interface Reply {
  id: string;
  reviewId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetReviewsParams {
  page?: number;
  limit?: number;
  sortBy?: "newest" | "oldest" | "rating_high" | "rating_low" | "helpful";
  rating?: number;
}

export const ReviewAPI = {
  /**
   * Create a new review for a course
   * POST /api/courses/{courseId}/reviews
   */
  createReview: async (
    courseId: string,
    reviewData: CreateReviewRequest
  ): Promise<ApiResponse<{ review: Review }>> => {
    console.log("🌟 [REVIEW API] Creating review for course:", courseId);
    console.log(
      "📝 [REVIEW API] Review data:",
      JSON.stringify(reviewData, null, 2)
    );

    try {
      const response = await apiRequest(`/courses/${courseId}/reviews`, {
        method: "POST",
        body: JSON.stringify(reviewData),
      });

      console.log(
        "✅ [REVIEW API] Create review response:",
        JSON.stringify(response, null, 2)
      );

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error: any) {
      console.error("❌ [REVIEW API] Create review error:", error);
      console.error("❌ [REVIEW API] Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message || "Failed to create review";
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Get all reviews for a course
   * GET /api/courses/{courseId}/reviews
   */
  getReviews: async (
    courseId: string,
    params?: GetReviewsParams
  ): Promise<ApiResponse<ReviewsResponse>> => {
    console.log("📋 [REVIEW API] Getting reviews for course:", courseId);
    console.log(
      "🔍 [REVIEW API] Query params:",
      JSON.stringify(params, null, 2)
    );

    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.rating)
        queryParams.append("rating", params.rating.toString());

      const url = `/courses/${courseId}/reviews${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      console.log("🌐 [REVIEW API] Request URL:", url);

      const response = await apiRequest(url);

      console.log(
        "✅ [REVIEW API] Get reviews response:",
        JSON.stringify(response, null, 2)
      );

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error: any) {
      console.error("❌ [REVIEW API] Get reviews error:", error);
      console.error("❌ [REVIEW API] Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message || "Failed to fetch reviews";
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Get review summary for a course
   * GET /api/courses/{courseId}/reviews/summary
   */
  getReviewSummary: async (
    courseId: string
  ): Promise<ApiResponse<{ summary: ReviewSummary }>> => {
    console.log("📊 [REVIEW API] Getting review summary for course:", courseId);

    try {
      const response = await apiRequest(`/courses/${courseId}/reviews/summary`);

      console.log(
        "✅ [REVIEW API] Get review summary response:",
        JSON.stringify(response, null, 2)
      );

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error: any) {
      console.error("❌ [REVIEW API] Get review summary error:", error);
      console.error("❌ [REVIEW API] Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message || "Failed to fetch review summary";
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Get a specific review
   * GET /api/courses/{courseId}/reviews/{reviewId}
   */
  getReview: async (
    courseId: string,
    reviewId: string
  ): Promise<ApiResponse<{ review: Review }>> => {
    console.log("🔍 [REVIEW API] Getting specific review:", {
      courseId,
      reviewId,
    });

    try {
      const response = await apiRequest(
        `/courses/${courseId}/reviews/${reviewId}`
      );

      console.log(
        "✅ [REVIEW API] Get review response:",
        JSON.stringify(response, null, 2)
      );

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error: any) {
      console.error("❌ [REVIEW API] Get review error:", error);
      console.error("❌ [REVIEW API] Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message || "Failed to fetch review";
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Update an existing review
   * PUT /api/courses/{courseId}/reviews/{reviewId}
   */
  updateReview: async (
    courseId: string,
    reviewId: string,
    reviewData: UpdateReviewRequest
  ): Promise<ApiResponse<{ review: Review }>> => {
    console.log("✏️ [REVIEW API] Updating review:", { courseId, reviewId });
    console.log(
      "📝 [REVIEW API] Update data:",
      JSON.stringify(reviewData, null, 2)
    );

    try {
      const response = await apiRequest(
        `/courses/${courseId}/reviews/${reviewId}`,
        {
          method: "PUT",
          body: JSON.stringify(reviewData),
        }
      );

      console.log(
        "✅ [REVIEW API] Update review response:",
        JSON.stringify(response, null, 2)
      );

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error: any) {
      console.error("❌ [REVIEW API] Update review error:", error);
      console.error("❌ [REVIEW API] Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message || "Failed to update review";
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Delete a review
   * DELETE /api/courses/{courseId}/reviews/{reviewId}
   */
  deleteReview: async (
    courseId: string,
    reviewId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    console.log("🗑️ [REVIEW API] Deleting review:", { courseId, reviewId });

    try {
      const response = await apiRequest(
        `/courses/${courseId}/reviews/${reviewId}`,
        {
          method: "DELETE",
        }
      );

      console.log(
        "✅ [REVIEW API] Delete review response:",
        JSON.stringify(response, null, 2)
      );

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error: any) {
      console.error("❌ [REVIEW API] Delete review error:", error);
      console.error("❌ [REVIEW API] Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message || "Failed to delete review";
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Vote on a review (helpful/not helpful)
   * POST /api/courses/{courseId}/reviews/{reviewId}/vote
   */
  voteOnReview: async (
    courseId: string,
    reviewId: string,
    voteData: VoteRequest
  ): Promise<ApiResponse<{ review: Review }>> => {
    console.log("👍 [REVIEW API] Voting on review:", {
      courseId,
      reviewId,
      voteData,
    });

    try {
      const response = await apiRequest(
        `/courses/${courseId}/reviews/${reviewId}/vote`,
        {
          method: "POST",
          body: JSON.stringify(voteData),
        }
      );

      console.log(
        "✅ [REVIEW API] Vote on review response:",
        JSON.stringify(response, null, 2)
      );

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error: any) {
      console.error("❌ [REVIEW API] Vote on review error:", error);
      console.error("❌ [REVIEW API] Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message || "Failed to vote on review";
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Reply to a review
   * POST /api/courses/{courseId}/reviews/{reviewId}/reply
   */
  replyToReview: async (
    courseId: string,
    reviewId: string,
    replyData: ReplyRequest
  ): Promise<ApiResponse<{ reply: Reply }>> => {
    console.log("💬 [REVIEW API] Replying to review:", {
      courseId,
      reviewId,
      replyData,
    });

    try {
      const response = await apiRequest(
        `/courses/${courseId}/reviews/${reviewId}/reply`,
        {
          method: "POST",
          body: JSON.stringify(replyData),
        }
      );

      console.log(
        "✅ [REVIEW API] Reply to review response:",
        JSON.stringify(response, null, 2)
      );

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error: any) {
      console.error("❌ [REVIEW API] Reply to review error:", error);
      console.error("❌ [REVIEW API] Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message || "Failed to reply to review";
      return {
        success: false,
        message: errorMessage,
      };
    }
  },
};
