"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Star,
  Grid3X3,
  List,
  PlayCircle,
  FileText,
} from "lucide-react";
import {
  SellerCourses as SellerCoursesType,
  CoursePreview,
} from "@/types/seller";

interface SellerCoursesProps {
  courses: SellerCoursesType;
}

/**
 * SellerCourses Component
 * Featured and all courses with filtering and layout options
 */
const SellerCourses: React.FC<SellerCoursesProps> = ({ courses }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"rating" | "price" | "newest">("rating");

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const getCourseTypeIcon = (type: string) => {
    return type === "video" ? (
      <PlayCircle className="w-4 h-4" />
    ) : (
      <FileText className="w-4 h-4" />
    );
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "intermediate":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "advanced":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Get filtered and sorted courses
  const getFilteredCourses = () => {
    let filteredCourses = courses.all;

    // Filter by category
    if (selectedCategory !== "all") {
      const categoryData = courses.byCategory.find(
        (cat) => cat.category.id === selectedCategory
      );
      filteredCourses = categoryData ? categoryData.courses : [];
    }

    // Sort courses
    const sortedCourses = [...filteredCourses].sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.averageRating - a.averageRating;
        case "price":
          return a.price - b.price;
        case "newest":
          return (
            new Date(b.publishedAt || 0).getTime() -
            new Date(a.publishedAt || 0).getTime()
          );
        default:
          return 0;
      }
    });

    return sortedCourses;
  };

  // Determine featured courses based on rating and sales if not explicitly set
  const getFeaturedCourses = () => {
    if (courses.featured.length > 0) {
      return courses.featured;
    }

    // Auto-select featured courses based on rating (4.5+) and review count (20+)
    return courses.all
      .filter(
        (course) => course.averageRating >= 4.5 && course.reviewCount >= 20
      )
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 3); // Show max 3 auto-featured courses
  };

  const filteredCourses = getFilteredCourses();
  const featuredCourses = getFeaturedCourses();

  const CourseCard: React.FC<{ course: CoursePreview; featured?: boolean }> = ({
    course,
    featured = false,
  }) => {
    if (viewMode === "list") {
      return (
        <Link
          href={`/product/${course.slug}`}
          className="group flex items-center gap-4 bg-gradient-to-r from-gray-800/30 to-gray-700/30 rounded-lg p-4 backdrop-blur-sm border border-gray-600/20 hover:border-blue-500/30 transition-all duration-200"
        >
          {/* Compact Thumbnail */}
          <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={course.thumbnail || "/images/landing/product.png"}
              alt={course.title}
              width={96}
              height={64}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {featured && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
            )}
          </div>

          {/* Course Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-blue-400 transition-colors">
                {course.title}
              </h3>
              <div className="text-lg font-bold text-white flex-shrink-0">
                {formatPrice(course.price)}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-white">
                  {formatRating(course.averageRating)}
                </span>
                <span>({course.reviewCount})</span>
              </div>

              <div className="flex items-center gap-1">
                {getCourseTypeIcon(course.type)}
                <span>
                  {course.type === "video"
                    ? formatDuration(course.totalDuration)
                    : `${course.totalPages || 0} pages`}
                </span>
              </div>

              <div
                className={`px-2 py-1 rounded text-xs ${getLevelColor(
                  course.level
                )}`}
              >
                {course.level}
              </div>
            </div>
          </div>
        </Link>
      );
    }

    // Grid view (existing card design)
    return (
      <Link
        href={`/product/${course.slug}`}
        className="group block bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-600/20 hover:border-blue-500/30 transition-all duration-200 hover:scale-105"
      >
        {/* Course Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={course.thumbnail || "/images/landing/product.png"}
            alt={course.title}
            width={400}
            height={225}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />

          {/* Course Type Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white">
            {getCourseTypeIcon(course.type)}
            <span className="capitalize">{course.type}</span>
          </div>

          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full px-2 py-1 text-xs text-white font-medium">
              Featured
            </div>
          )}
        </div>

        {/* Course Info */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="font-semibold text-white text-lg line-clamp-2 group-hover:text-blue-400 transition-colors">
              {course.title}
            </h3>

            <div
              className={`px-2 py-1 rounded-md text-xs border ${getLevelColor(
                course.level
              )}`}
            >
              {course.level}
            </div>
          </div>

          <p className="text-gray-400 text-sm line-clamp-2 mb-4">
            {course.shortDescription}
          </p>

          <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-white">
                {formatRating(course.averageRating)}
              </span>
              <span>({course.reviewCount})</span>
            </div>

            {/* Duration or Pages */}
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {course.type === "video"
                  ? formatDuration(course.totalDuration)
                  : `${course.totalPages || 0} pages`}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-white">
              {formatPrice(course.price)}
            </div>

            {course.publishedAt && (
              <div className="text-xs text-gray-400">
                {new Date(course.publishedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="mb-8">
      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-400" />
            Featured Courses
            {courses.featured.length === 0 && (
              <span className="text-sm font-normal text-gray-400">
                (Auto-selected based on ratings)
              </span>
            )}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} featured />
            ))}
          </div>
        </div>
      )}

      {/* All Courses */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-8 backdrop-blur-sm border border-gray-600/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-400" />
            All Courses ({filteredCourses.length})
          </h2>

          {/* Filters and Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {courses.byCategory.map((category) => (
                <option key={category.category.id} value={category.category.id}>
                  {category.category.name} ({category.courses.length})
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "rating" | "price" | "newest")
              }
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="rating">Highest Rated</option>
              <option value="price">Lowest Price</option>
              <option value="newest">Newest</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Courses Grid/List */}
        {filteredCourses.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No courses found
            </h3>
            <p className="text-gray-400">
              {selectedCategory === "all"
                ? "This seller hasn't published any courses yet."
                : "No courses found in the selected category."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerCourses;
