"use client";

import React from "react";
import {
  Clock,
  Users,
  Star,
  Globe,
  BookOpen,
  Calendar,
  DollarSign,
} from "lucide-react";
import { DASHBOARD_COLORS } from "../../../constants";
import Image from "next/image";

interface CourseOverviewSectionProps {
  course: any;
  canEdit: boolean;
}

/**
 * Course Overview Section
 * Displays comprehensive course information including metadata, stats, and content details
 */
const CourseOverviewSection: React.FC<CourseOverviewSectionProps> = ({
  course,
  canEdit,
}) => {
  console.log("CourseOverviewSection rendered with course:", course?.id);
  const formatPrice = (price: number): string => `$${price.toFixed(2)}`;

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown";
    }
  };

  const getLevelColor = (level: string): string => {
    switch (level) {
      case "beginner":
        return "bg-green-500/20 text-green-400";
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-400";
      case "advanced":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-8">
      {/* Course Header Info */}
      <div
        className="rounded-2xl p-[1px]"
        style={{
          background: DASHBOARD_COLORS.PRIMARY_BORDER,
        }}
      >
        <div
          className="rounded-2xl p-6"
          style={{
            background: DASHBOARD_COLORS.CARD_BG,
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Thumbnail and Preview Video */}
            <div className="lg:col-span-1 space-y-4">
              {/* Thumbnail */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  Course Thumbnail
                </h4>
                <Image
                  src={course.thumbnail || "/images/landing/product.png"}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-xl"
                  width={500}
                  height={200}
                />
              </div>

              {/* Preview Video */}
              {course.previewVideo && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    Course Preview
                  </h4>
                  <video
                    src={course.previewVideo}
                    className="w-full h-48 object-cover rounded-xl bg-gray-800"
                    controls
                    preload="metadata"
                    controlsList="nodownload"
                  >
                    <source src={course.previewVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="lg:col-span-2 space-y-4 min-w-0">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2">
                  {course.title || "Untitled Course"}
                </h2>
                <p className="text-gray-300 leading-relaxed line-clamp-3">
                  {course.description || "No description available"}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(
                    course.level || "beginner"
                  )}`}
                >
                  {(course.level || "beginner").charAt(0).toUpperCase() +
                    (course.level || "beginner").slice(1)}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400">
                  {(course.language || "EN").toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-400">
                  {formatPrice(course.price || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Separator */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(6, 128, 255, 0.3) 50%, transparent 100%)",
        }}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Enrollments Card */}
        <div
          className="rounded-xl p-[1px]"
          style={{
            background: "linear-gradient(135deg, #0680FF 0%, #1E3A8A 100%)",
          }}
        >
          <div
            className="rounded-xl p-4 h-full"
            style={{
              background:
                "linear-gradient(135deg, rgba(6, 128, 255, 0.1) 0%, rgba(30, 58, 138, 0.05) 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/20">
                <Users className="text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-white text-sm">Enrollments</p>
                <p className="text-white text-lg font-semibold">
                  {course.stats?.enrollmentCount || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Card */}
        <div
          className="rounded-xl p-[1px]"
          style={{
            background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
          }}
        >
          <div
            className="rounded-xl p-4 h-full"
            style={{
              background:
                "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/30 to-yellow-600/20">
                <Star className="text-yellow-400" size={20} />
              </div>
              <div>
                <p className="text-white text-sm">Rating</p>
                <p className="text-white text-lg font-semibold">
                  {course.stats?.rating?.toFixed(1) || "N/A"} (
                  {course.stats?.reviewCount || 0})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Duration Card */}
        <div
          className="rounded-xl p-[1px]"
          style={{
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
          }}
        >
          <div
            className="rounded-xl p-4 h-full"
            style={{
              background:
                "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/30 to-green-600/20">
                <Clock className="text-green-400" size={20} />
              </div>
              <div>
                <p className="text-white text-sm">Duration</p>
                <p className="text-white text-lg font-semibold">
                  {course.stats?.duration
                    ? formatDuration(course.stats.duration)
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div
          className="rounded-xl p-[1px]"
          style={{
            background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
          }}
        >
          <div
            className="rounded-xl p-4 h-full"
            style={{
              background:
                "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-600/20">
                <BookOpen className="text-purple-400" size={20} />
              </div>
              <div>
                <p className="text-white text-sm">Content</p>
                <p className="text-white text-lg font-semibold">
                  {course.chapters?.length || 0} chapters,{" "}
                  {course.stats?.moduleCount || 0} modules
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Separator */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(6, 128, 255, 0.2) 50%, transparent 100%)",
        }}
      />

      {/* Course Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metadata */}
        <div
          className="rounded-xl p-[1px]"
          style={{
            background: DASHBOARD_COLORS.PRIMARY_BORDER,
          }}
        >
          <div
            className="rounded-xl p-6"
            style={{
              background: DASHBOARD_COLORS.CARD_BG,
            }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Course Information
            </h3>
            <div className="space-y-4">
              {course.metadata?.requirements &&
                course.metadata.requirements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">
                      Requirements
                    </h4>
                    <ul className="space-y-1">
                      {course.metadata.requirements.map(
                        (req: string, index: number) => (
                          <li
                            key={index}
                            className="text-gray-400 text-sm flex items-center gap-2"
                          >
                            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                            <span className="line-clamp-1">{req}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {course.metadata?.learningOutcomes &&
                course.metadata.learningOutcomes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">
                      Learning Outcomes
                    </h4>
                    <ul className="space-y-1">
                      {course.metadata.learningOutcomes.map(
                        (outcome: string, index: number) => (
                          <li
                            key={index}
                            className="text-gray-400 text-sm flex items-center gap-2"
                          >
                            <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                            <span className="line-clamp-1">{outcome}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {course.metadata?.targetAudience &&
                course.metadata.targetAudience.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">
                      Target Audience
                    </h4>
                    <ul className="space-y-1">
                      {course.metadata.targetAudience.map(
                        (audience: string, index: number) => (
                          <li
                            key={index}
                            className="text-gray-400 text-sm flex items-center gap-2"
                          >
                            <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                            <span className="line-clamp-1">{audience}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Timeline & Pricing */}
        <div
          className="rounded-xl p-[1px]"
          style={{
            background: DASHBOARD_COLORS.PRIMARY_BORDER,
          }}
        >
          <div
            className="rounded-xl p-6"
            style={{
              background: DASHBOARD_COLORS.CARD_BG,
            }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Course Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="text-blue-400" size={16} />
                <div>
                  <p className="text-gray-300 text-sm">Created</p>
                  <p className="text-white truncate">
                    {formatDate(course.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="text-green-400" size={16} />
                <div>
                  <p className="text-gray-300 text-sm">Last Updated</p>
                  <p className="text-white truncate">
                    {formatDate(course.updatedAt)}
                  </p>
                </div>
              </div>

              {course.publishedAt && (
                <div className="flex items-center gap-3">
                  <Globe className="text-purple-400" size={16} />
                  <div>
                    <p className="text-gray-300 text-sm">Published</p>
                    <p className="text-white truncate">
                      {formatDate(course.publishedAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Subtle Separator */}
              <div
                className="h-px w-full my-4"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)",
                }}
              />

              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="text-yellow-400" size={16} />
                <div>
                  <p className="text-gray-300 text-sm">Pricing</p>
                  <p className="text-white text-lg font-semibold">
                    {formatPrice(course.price)}
                  </p>
                </div>
              </div>

              {course.tokenToPayWith && course.tokenToPayWith.length > 0 && (
                <div className="mt-2">
                  <p className="text-gray-400 text-xs">Accepted tokens:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {course.tokenToPayWith.map((token: string) => (
                      <span
                        key={token}
                        className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-lg"
                      >
                        {token}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-400">Access Duration</p>
                  <p className="text-white truncate">
                    {course.accessDuration === -1
                      ? "Unlimited"
                      : `${course.accessDuration} days`}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Available Quantity</p>
                  <p className="text-white truncate">
                    {course.availableQuantity === -1
                      ? "Unlimited"
                      : course.availableQuantity}
                  </p>
                </div>
              </div>

              {course.affiliatePercentage > 0 && (
                <div className="mt-2">
                  <p className="text-gray-400 text-sm">
                    Affiliate Commission:{" "}
                    <span className="text-white">
                      {course.affiliatePercentage / 100}%
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Information */}
      {course.status !== "draft" && (
        <>
          {/* Gradient Separator */}
          <div
            className="h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(6, 128, 255, 0.2) 50%, transparent 100%)",
            }}
          />

          <div
            className="rounded-xl p-[1px]"
            style={{
              background: DASHBOARD_COLORS.PRIMARY_BORDER,
            }}
          >
            <div
              className="rounded-xl p-6"
              style={{
                background: DASHBOARD_COLORS.CARD_BG,
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Status Information
              </h3>
              <div className="space-y-3">
                {course.submittedAt && (
                  <div className="text-sm">
                    <span className="text-gray-400">
                      Submitted for review:{" "}
                    </span>
                    <span className="text-white">
                      {formatDate(course.submittedAt)}
                    </span>
                  </div>
                )}

                {course.status === "rejected" && (
                  <div className="p-3 bg-red-500/10 rounded-xl">
                    <p className="text-red-400 text-sm">
                      This course was rejected. You can edit and resubmit it for
                      review.
                    </p>
                  </div>
                )}

                {course.status === "submitted" && (
                  <div className="p-3 bg-yellow-500/10 rounded-xl">
                    <p className="text-yellow-400 text-sm">
                      This course is under review. You'll be notified once the
                      review is complete.
                    </p>
                  </div>
                )}

                {course.status === "approved" && (
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <p className="text-blue-400 text-sm">
                      This course has been approved and will be published soon.
                    </p>
                  </div>
                )}

                {course.status === "published" && (
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <p className="text-green-400 text-sm">
                      This course is live and available for purchase.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CourseOverviewSection;
