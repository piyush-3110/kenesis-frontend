"use client";

import React, { useState } from "react";
// Using product shape inferred from usage; ExtendedProduct type not exported here
// Navbar is provided globally via EnhancedConditionalLayout in the app layout
import ReviewsRatings from "@/components/product/ReviewsRatings";
import type { ReviewSummary, CourseContent } from "@/types/Review";
import CourseContentViewer from "@/components/product/CourseContentViewer";
import {
  ArrowLeft,
  Star,
  Award,
  Play,
  FileText,
  CheckCircle,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type MinimalProduct = {
  id: string;
  title: string;
  author: string;
  description?: string;
  price: number;
  image?: string;
  type: "video" | "document";
  rating: number;
  totalRatings?: number;
  purchasedBy: string[];
  topics?: string[];
  content?: CourseContent[];
  courseAccess: { hasAccess: boolean; progress?: number };
  reviews: Array<{
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
    likes: number;
    likedByCurrentUser: boolean;
  }>;
  reviewSummary: ReviewSummary;
};

interface ProductDetailViewProps {
  // Minimal product shape required for this component
  product: MinimalProduct;
  loading: boolean;
  isAffiliate?: boolean;
  backLink: string;
  backLabel: string;
  affiliateStats?: {
    commissionRate?: number;
    commissionAmount?: number;
    activeAffiliates?: number;
    recentAffiliateSales?: number;
    recentAffiliateEarnings?: number;
    // New optional fields for richer affiliate details
    lifetimeSales?: number;
    lifetimeEarnings?: number;
  };
  affiliateMeta?: {
    shortDescription?: string;
    level?: string;
    language?: string;
    type?: "video" | "document";
    totalDuration?: number;
    totalPages?: number;
    availableQuantity?: number;
    soldCount?: number;
    tokenToPayWith?: string | string[];
    publishedAt?: string;
    isAvailable?: boolean;
    // Additional affiliate program metadata
    status?: "active" | "paused";
    joinedAt?: string;
    lastSaleAt?: string | null;
  };
  primaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    variant?: "purchase" | "affiliate";
  };
  affiliateActions?: {
    onCopyLink?: () => void;
    onOpenLink?: () => void;
    link?: string;
    copying?: boolean;
  };
  onSubmitReview?: (rating: number, comment: string) => Promise<void>;
  onLikeReview?: (reviewId: string) => Promise<void>;
  onMarkComplete?: (contentId: string) => Promise<void>;
}

const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  loading,
  isAffiliate = false,
  backLink,
  backLabel,
  affiliateStats,
  affiliateMeta,
  primaryAction,
  affiliateActions,
  onSubmitReview,
  onLikeReview,
  onMarkComplete,
}) => {
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());

  const toggleTopicExpansion = (index: number) => {
    setExpandedTopics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={
          index < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-600"
        }
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A071A]">
        <div className="pt-24 md:pt-28 p-4 sm:p-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-700 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                <div className="h-6 bg-gray-700 rounded w-1/4"></div>
                <div className="h-12 bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A071A]">
        <div className="pt-24 md:pt-28 p-4 sm:p-8 max-w-7xl mx-auto">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Link href={backLink} className="text-blue-400 hover:text-blue-300">
              ← {backLabel}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A071A]">
      <div className="pt-24 md:pt-28 p-4 sm:p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href={backLink}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {backLabel}
        </Link>

        {/* Product Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-video rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
              <Image
                src={product.image ?? "/images/landing/product.png"}
                alt={product.title}
                width={600}
                height={400}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 text-center border border-gray-800">
                <div className="flex items-center justify-center mb-2">
                  {product.type === "video" ? (
                    <Play size={24} className="text-blue-400" />
                  ) : (
                    <FileText size={24} className="text-orange-400" />
                  )}
                </div>
                <div className="text-white font-semibold">
                  {(affiliateMeta?.type ?? product.type) === "video"
                    ? "Video Course"
                    : "Document Course"}
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 text-center border border-gray-800">
                <Star size={24} className="text-yellow-400 mx-auto mb-2" />
                <div className="text-white font-semibold">
                  {product.rating}/5
                </div>
                <div className="text-gray-400 text-sm">
                  {product.totalRatings ?? product.reviewSummary.totalReviews}{" "}
                  reviews
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 text-center border border-gray-800">
                <Users size={24} className="text-green-400 mx-auto mb-2" />
                <div className="text-white font-semibold">
                  {isAffiliate && affiliateStats?.activeAffiliates !== undefined
                    ? affiliateStats.activeAffiliates
                    : product.purchasedBy.length}
                </div>
                <div className="text-gray-400 text-sm">
                  {isAffiliate && affiliateStats?.activeAffiliates !== undefined
                    ? "Affiliates"
                    : "Students"}
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-white text-3xl lg:text-4xl font-bold mb-4 animate-fade-in">
                {product.title}
              </h1>

              <p className="text-gray-400 text-lg mb-4">by {product.author}</p>

              {isAffiliate && affiliateMeta?.shortDescription && (
                <p className="text-gray-300 leading-relaxed mb-4">
                  {affiliateMeta.shortDescription}
                </p>
              )}

              {isAffiliate &&
                (affiliateMeta?.level ||
                  affiliateMeta?.language ||
                  affiliateMeta?.tokenToPayWith) && (
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {affiliateMeta.level && (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-gray-900/60 border border-gray-700/60 text-xs text-white">
                        Level {affiliateMeta.level}
                      </span>
                    )}
                    {affiliateMeta.language && (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-gray-900/60 border border-gray-700/60 text-xs text-white">
                        Language {affiliateMeta.language}
                      </span>
                    )}
                    {affiliateMeta.tokenToPayWith && (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-gray-900/60 border border-gray-700/60 text-xs text-white">
                        Currency{" "}
                        {Array.isArray(affiliateMeta.tokenToPayWith)
                          ? affiliateMeta.tokenToPayWith.join(", ")
                          : affiliateMeta.tokenToPayWith}
                      </span>
                    )}
                  </div>
                )}

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {renderStars(product.rating)}
                </div>
                <span className="text-white font-medium">{product.rating}</span>
                <span className="text-gray-400">
                  ({product.totalRatings ?? product.reviewSummary.totalReviews}{" "}
                  reviews)
                </span>
              </div>
            </div>

            {/* Price and Purchase */}
            <div className="space-y-4">
              <div className="text-white text-4xl font-bold">
                ${product.price.toFixed(2)}
              </div>

              {/* Affiliate motivation + meta strip removed to avoid duplicate info (now shown in Affiliate Details below) */}

              {/* Certificate Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-600/30">
                <Award size={20} />
                <span className="font-medium">Certificate Included</span>
              </div>

              {/* Primary Action Button */}
              {primaryAction && (
                <button
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.loading || primaryAction.disabled}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
                    primaryAction.variant === "affiliate"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-500/25 text-white"
                      : "hover:shadow-blue-500/25 text-white"
                  }`}
                  style={
                    primaryAction.variant !== "affiliate"
                      ? {
                          background: primaryAction.loading
                            ? "#4a5568"
                            : "linear-gradient(107.31deg, #00C9FF -30.5%, #4648FF 54.41%, #0D01F6 100%)",
                        }
                      : undefined
                  }
                >
                  {primaryAction.icon}
                  {primaryAction.label}
                </button>
              )}

              {/* Purchase Status for owned courses */}
              {!isAffiliate && product.courseAccess.hasAccess && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-600/20 text-green-400 border border-green-600/30">
                    <CheckCircle size={20} />
                    <span className="font-medium">You own this course</span>
                  </div>

                  {product.courseAccess.progress !== undefined && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white font-medium">
                          {product.courseAccess.progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-700"
                          style={{ width: `${product.courseAccess.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-white text-xl font-semibold mb-3">
                  About this course
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Full-width Course Topics Section - Only for unpurchased courses or affiliate showcase */}
        {/* Affiliate Details section replaces "What you'll learn" on affiliate pages */}
        {isAffiliate ? (
          <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-12 bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-y border-gray-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
              <h2 className="text-white text-2xl lg:text-3xl font-bold mb-8 text-center">
                Affiliate Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                {/* Commission */}
                <div className="rounded-lg p-4 bg-gradient-to-r from-purple-900/40 to-pink-900/30 border border-purple-700/40">
                  <div className="text-gray-300 text-sm">Commission</div>
                  <div className="text-white text-xl font-semibold">
                    {affiliateStats?.commissionRate ?? 0}%
                    {typeof affiliateStats?.commissionAmount === "number" && (
                      <span className="text-gray-300 text-base font-medium ml-2">
                        (${affiliateStats.commissionAmount.toFixed(2)} per sale)
                      </span>
                    )}
                  </div>
                </div>
                {/* Earnings 30d */}
                <div className="rounded-lg p-4 bg-gray-900/60 border border-gray-700/60">
                  <div className="text-gray-300 text-sm">Earnings (30d)</div>
                  <div className="text-white text-xl font-semibold">
                    $
                    {Number(
                      affiliateStats?.recentAffiliateEarnings || 0
                    ).toFixed(2)}
                  </div>
                </div>
                {/* Sales 30d */}
                <div className="rounded-lg p-4 bg-gray-900/60 border border-gray-700/60">
                  <div className="text-gray-300 text-sm">
                    Affiliate Sales (30d)
                  </div>
                  <div className="text-white text-xl font-semibold">
                    {affiliateStats?.recentAffiliateSales ?? 0}
                  </div>
                </div>

                {/* Lifetime Earnings */}
                <div className="rounded-lg p-4 bg-gray-900/60 border border-gray-700/60">
                  <div className="text-gray-300 text-sm">Lifetime Earnings</div>
                  <div className="text-white text-xl font-semibold">
                    ${Number(affiliateStats?.lifetimeEarnings || 0).toFixed(2)}
                  </div>
                </div>
                {/* Lifetime Sales */}
                <div className="rounded-lg p-4 bg-gray-900/60 border border-gray-700/60">
                  <div className="text-gray-300 text-sm">
                    Affiliate Sales (All Time)
                  </div>
                  <div className="text-white text-xl font-semibold">
                    {affiliateStats?.lifetimeSales ?? 0}
                  </div>
                </div>
                {/* Status */}
                {affiliateMeta?.status && (
                  <div className="rounded-lg p-4 bg-gray-900/60 border border-gray-700/60">
                    <div className="text-gray-300 text-sm">Status</div>
                    <div className="text-white text-xl font-semibold capitalize">
                      {affiliateMeta.status}
                    </div>
                  </div>
                )}
              </div>

              {/* Meta grid */}
              {affiliateMeta && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-6xl mx-auto">
                  {affiliateMeta.tokenToPayWith && (
                    <div className="rounded-lg p-3 bg-gray-900/60 border border-gray-700/60 text-center">
                      <div className="text-gray-400 text-xs">Currency</div>
                      <div className="text-white text-sm font-medium truncate">
                        {Array.isArray(affiliateMeta.tokenToPayWith)
                          ? affiliateMeta.tokenToPayWith.join(", ")
                          : affiliateMeta.tokenToPayWith}
                      </div>
                    </div>
                  )}
                  {affiliateMeta.isAvailable !== undefined && (
                    <div className="rounded-lg p-3 bg-gray-900/60 border border-gray-700/60 text-center">
                      <div className="text-gray-400 text-xs">Availability</div>
                      <div className="text-white text-sm font-medium">
                        {affiliateMeta.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </div>
                    </div>
                  )}
                  {affiliateMeta.availableQuantity !== undefined && (
                    <div className="rounded-lg p-3 bg-gray-900/60 border border-gray-700/60 text-center">
                      <div className="text-gray-400 text-xs">Available</div>
                      <div className="text-white text-sm font-medium">
                        {affiliateMeta.availableQuantity === -1
                          ? "Unlimited"
                          : affiliateMeta.availableQuantity}
                      </div>
                    </div>
                  )}
                  {affiliateMeta.soldCount !== undefined && (
                    <div className="rounded-lg p-3 bg-gray-900/60 border border-gray-700/60 text-center">
                      <div className="text-gray-400 text-xs">
                        Units Sold (All Time)
                      </div>
                      <div className="text-white text-sm font-medium">
                        {affiliateMeta.soldCount}
                      </div>
                    </div>
                  )}
                  {affiliateMeta.publishedAt && (
                    <div className="rounded-lg p-3 bg-gray-900/60 border border-gray-700/60 text-center">
                      <div className="text-gray-400 text-xs">Published</div>
                      <div className="text-white text-sm font-medium">
                        {new Date(
                          affiliateMeta.publishedAt
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  {affiliateMeta.joinedAt && (
                    <div className="rounded-lg p-3 bg-gray-900/60 border border-gray-700/60 text-center">
                      <div className="text-gray-400 text-xs">Joined</div>
                      <div className="text-white text-sm font-medium">
                        {new Date(affiliateMeta.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  {affiliateMeta.lastSaleAt !== undefined && (
                    <div className="rounded-lg p-3 bg-gray-900/60 border border-gray-700/60 text-center">
                      <div className="text-gray-400 text-xs">Last Sale</div>
                      <div className="text-white text-sm font-medium">
                        {affiliateMeta.lastSaleAt
                          ? new Date(affiliateMeta.lastSaleAt).toLocaleString()
                          : "—"}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions and link */}
              {(affiliateActions?.onCopyLink ||
                affiliateActions?.onOpenLink ||
                affiliateActions?.link) && (
                <div className="mt-6 max-w-6xl mx-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {affiliateActions?.onCopyLink && (
                      <button
                        onClick={affiliateActions.onCopyLink}
                        disabled={!!affiliateActions?.copying}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        <span>Copy Affiliate Link</span>
                      </button>
                    )}
                    {affiliateActions?.onOpenLink && (
                      <button
                        onClick={affiliateActions.onOpenLink}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        <span>Open Affiliate Link</span>
                      </button>
                    )}
                  </div>
                  {affiliateActions?.link && (
                    <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">
                        Affiliate Link:
                      </p>
                      <p className="text-gray-300 text-sm font-mono break-all">
                        {affiliateActions.link}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Non-affiliate learn section retained for marketing context only
          !product.courseAccess.hasAccess &&
          product.topics &&
          product.topics.length > 0 && (
            <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-12 bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-y border-gray-700/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
                <h2 className="text-white text-2xl lg:text-3xl font-bold mb-8 text-center">
                  What you&apos;ll learn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
                  {product.topics.map((topic: string, index: number) => {
                    const isExpanded = expandedTopics.has(index);
                    return (
                      <div
                        key={index}
                        className="border border-gray-700/50 rounded-lg overflow-hidden bg-gray-900/40 hover:bg-gray-800/50 transition-colors"
                      >
                        <button
                          onClick={() => toggleTopicExpansion(index)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/30 transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-blue-400 text-sm font-mono font-bold min-w-[32px] bg-blue-400/10 px-2 py-1 rounded">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="text-gray-200 font-medium group-hover:text-white transition-colors">
                              {topic}
                            </span>
                          </div>
                          <div className="text-gray-500 group-hover:text-gray-300 transition-colors">
                            {isExpanded ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </div>
                        </button>
                        <div
                          className={`transition-all duration-300 ease-in-out ${
                            isExpanded
                              ? "max-h-96 opacity-100"
                              : "max-h-0 opacity-0"
                          } overflow-hidden`}
                        >
                          <div className="px-4 pb-4 pt-2 border-t border-gray-700/30">
                            <div className="ml-10 space-y-3">
                              <p className="text-gray-400 text-sm leading-relaxed">
                                Master {topic.toLowerCase()} through practical
                                examples and hands-on exercises. This
                                comprehensive module covers fundamental concepts
                                and advanced techniques.
                              </p>
                              <div className="flex items-center gap-6 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Play size={12} className="text-blue-400" />
                                  3-5 lessons
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText
                                    size={12}
                                    className="text-orange-400"
                                  />
                                  Resources included
                                </span>
                                <span className="flex items-center gap-1">
                                  <Award size={12} className="text-green-400" />
                                  Certificate eligible
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )
        )}

        {/* Course Content (if user has access) */}
        {!isAffiliate &&
          product.courseAccess.hasAccess &&
          product.content &&
          onMarkComplete && (
            <div className="mb-12">
              <CourseContentViewer
                content={product.content}
                progress={product.courseAccess.progress || 0}
                onContentSelect={(contentId) =>
                  console.log("Selected content:", contentId)
                }
                onMarkComplete={onMarkComplete}
              />
            </div>
          )}

        {/* Reviews and Ratings */}
        <ReviewsRatings
          productId={product.id}
          reviews={product.reviews}
          reviewSummary={product.reviewSummary}
          userCanReview={!isAffiliate && product.courseAccess.hasAccess}
          onSubmitReview={onSubmitReview}
          onLikeReview={onLikeReview}
        />
      </div>
    </div>
  );
};

export default ProductDetailView;
