'use client';

import { useState } from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { Review, ReviewSummary } from '@/types/Review';

interface ReviewsRatingsProps {
  productId: string;
  reviews: Review[];
  reviewSummary: ReviewSummary;
  userCanReview: boolean;
  onSubmitReview?: (rating: number, comment: string) => void;
  onLikeReview?: (reviewId: string) => void;
}

const ReviewsRatings: React.FC<ReviewsRatingsProps> = ({
  reviews,
  reviewSummary,
  userCanReview,
  onSubmitReview,
  onLikeReview,
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmitReview && reviewComment.trim()) {
      onSubmitReview(reviewRating, reviewComment.trim());
      setReviewComment('');
      setReviewRating(5);
      setShowReviewForm(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const RatingBar = ({ stars, count, total }: { stars: number; count: number; total: number }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <div className="flex items-center gap-3 group hover:bg-gray-800/50 p-2 rounded-lg transition-colors">
        <div className="flex items-center gap-1 min-w-[60px]">
          <span className="text-white text-sm font-medium">{stars}</span>
          <Star size={14} className="text-yellow-400 fill-current" />
        </div>
        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-gray-400 text-sm min-w-[30px] text-right">{count}</span>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h2 className="text-white text-2xl font-bold mb-6">Reviews & Ratings</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="text-center lg:text-left">
            <div className="text-white text-6xl font-bold mb-2">
              {reviewSummary.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  size={24}
                  className={
                    index < Math.floor(reviewSummary.averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-600'
                  }
                />
              ))}
            </div>
            <p className="text-gray-400 text-lg">
              {reviewSummary.totalReviews.toLocaleString()} Reviews
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <RatingBar
                key={stars}
                stars={stars}
                count={reviewSummary.ratingDistribution[stars as keyof typeof reviewSummary.ratingDistribution]}
                total={reviewSummary.totalReviews}
              />
            ))}
          </div>
        </div>

        {/* Write Review Button */}
        {userCanReview && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              Write a Review
            </button>
          </div>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && userCanReview && (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 animate-slide-down">
          <h3 className="text-white text-xl font-semibold mb-6">Share your experience</h3>
          
          <form onSubmit={handleSubmitReview} className="space-y-6">
            {/* Rating Selection */}
            <div>
              <label className="text-white text-sm font-medium mb-3 block">Your Rating</label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    onMouseEnter={() => setHoverRating(index + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setReviewRating(index + 1)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={
                        index < (hoverRating || reviewRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-600 hover:text-yellow-400'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-white text-sm font-medium mb-3 block">Your Review</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your thoughts about this course..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!reviewComment.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-white text-xl font-semibold">
          Recent Reviews ({reviews.length})
        </h3>
        
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No reviews yet</div>
            <p className="text-gray-500">Be the first to review this course!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div
                key={review.id}
                className="bg-gray-900/30 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:bg-gray-900/50 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {review.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-semibold">{review.userName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }, (_, index) => (
                              <Star
                                key={index}
                                size={14}
                                className={
                                  index < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-600'
                                }
                              />
                            ))}
                          </div>
                          <span className="text-gray-400 text-sm">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review Comment */}
                    <p className="text-gray-300 leading-relaxed mb-4">{review.comment}</p>

                    {/* Like Button */}
                    <button
                      onClick={() => onLikeReview?.(review.id)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all duration-300 hover:scale-105 ${
                        review.likedByCurrentUser
                          ? 'text-blue-400 bg-blue-500/20'
                          : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
                      }`}
                    >
                      <ThumbsUp size={16} />
                      <span className="text-sm">{review.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsRatings;
