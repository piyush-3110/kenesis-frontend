"use client";

import React from "react";
import { MessageSquare, Star, BarChart3, Calendar } from "lucide-react";
import {
  SellerReviews as SellerReviewsType,
  RatingDistribution,
} from "@/types/seller";

interface SellerReviewsProps {
  reviews: SellerReviewsType;
}

/**
 * SellerReviews Component
 * Reviews overview with rating distribution and recent reviews
 */
const SellerReviews: React.FC<SellerReviewsProps> = ({ reviews }) => {
  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getMaxRatingCount = (distribution: RatingDistribution) => {
    return Math.max(...Object.values(distribution));
  };

  const getRatingPercentage = (count: number, total: number) => {
    return total > 0 ? (count / total) * 100 : 0;
  };

  const StarRating: React.FC<{ rating: number; size?: "sm" | "md" | "lg" }> = ({
    rating,
    size = "sm",
  }) => {
    const sizeClass = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    }[size];

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-400"
            }`}
          />
        ))}
      </div>
    );
  };

  const maxCount = getMaxRatingCount(reviews.overall.ratingDistribution);

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-8 backdrop-blur-sm border border-gray-600/20">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Student Reviews</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rating Overview */}
          <div>
            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {formatRating(reviews.overall.averageRating)}
                </div>
                <StarRating rating={reviews.overall.averageRating} size="md" />
                <div className="text-gray-400 text-sm mt-2">
                  {reviews.overall.totalReviews} reviews
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 font-medium">
                  Rating Distribution
                </span>
              </div>

              {[5, 4, 3, 2, 1].map((rating) => {
                const count =
                  reviews.overall.ratingDistribution[
                    rating as keyof RatingDistribution
                  ];
                const percentage = getRatingPercentage(
                  count,
                  reviews.overall.totalReviews
                );
                const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-gray-300 text-sm">{rating}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </div>

                    <div className="flex-1 bg-gray-600/30 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>

                    <div className="text-gray-400 text-sm w-12 text-right">
                      {count}
                    </div>

                    <div className="text-gray-400 text-sm w-12 text-right">
                      {percentage.toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Reviews */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Recent Reviews
            </h3>

            {reviews.recent.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {reviews.recent.map((review, index) => (
                  <div
                    key={index}
                    className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/20"
                  >
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-white">
                            {review.reviewerName}
                          </span>
                          <StarRating rating={review.rating} />
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-md px-2 py-1 inline-block">
                          <p className="text-blue-400 text-sm font-medium">
                            Course: {review.courseTitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-gray-400 text-xs flex-shrink-0 ml-4">
                        <Calendar className="w-3 h-3" />
                        {formatDate(review.reviewDate)}
                      </div>
                    </div>

                    {/* Review Comment */}
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No reviews yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Review Insights */}
        {reviews.overall.totalReviews > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-600/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  {getRatingPercentage(
                    reviews.overall.ratingDistribution[5] +
                      reviews.overall.ratingDistribution[4],
                    reviews.overall.totalReviews
                  ).toFixed(0)}
                  %
                </p>
                <p className="text-gray-400 text-sm">Positive Reviews (4-5★)</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {reviews.recent.length > 0
                    ? formatRating(
                        reviews.recent.reduce(
                          (sum, review) => sum + review.rating,
                          0
                        ) / reviews.recent.length
                      )
                    : "N/A"}
                </p>
                <p className="text-gray-400 text-sm">Recent Average</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">
                  {reviews.overall.totalReviews}
                </p>
                <p className="text-gray-400 text-sm">Total Reviews</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerReviews;
