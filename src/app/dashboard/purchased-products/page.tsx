"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CourseAPI } from "@/lib/api";
import { DASHBOARD_COLORS } from "../constants";
import DashboardLayout from "../components/DashboardLayout";
import { useRouter } from "next/navigation";
import {
  Clock,
  Play,
  Star,
  AlertCircle,
  ShoppingBag,
  Book,
  Loader2,
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import Image from "next/image";

interface Purchase {
  id: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  courseThumbnail?: string;
  instructorName: string;
  purchasePrice: number;
  tokenUsed: string;
  tokenInfo?: {
    symbol: string;
    name: string;
    chainName: string;
    chainId: number;
  };
  purchasedAt: string;
  expiresAt?: string;
  isActive: boolean;
  hasAccess: boolean;
  remainingDays: number | null;
  nftId?: string;
}

interface ListedCourse {
  id: string;
  title: string;
  slug: string;
  type: "video" | "document";
  status: "draft" | "submitted" | "approved" | "rejected" | "published";
  shortDescription?: string;
  thumbnail?: string;
  stats: {
    rating?: number;
    reviewCount: number;
    duration?: number;
    totalPages?: number;
  };
  price: number;
  tokenToPayWith: string[];
  affiliatePercentage: number;
  accessDuration: number;
  availableQuantity: number;
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  publishedAt?: string;
}

type FilterType = "all" | "active" | "expired" | "listed";

/**
 * Purchased Products Page
 * Displays user's purchased courses and listed courses with access to learning content
 */
const PurchasedProductsPage: React.FC = () => {
  const router = useRouter();
  const { addToast } = useUIStore();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [listedCourses, setListedCourses] = useState<ListedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (filter === "listed") {
      loadListedCourses();
    } else {
      loadPurchases();
    }
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPurchases = async () => {
    try {
      setLoading(true);
      setError(null);

      const requestParams = {
        status: (filter === "all" ? "all" : filter) as
          | "all"
          | "active"
          | "expired",
        limit: 50,
      };

      console.log("📚 [PURCHASES] Starting request...");
      console.log(
        "📚 [PURCHASES] Request params:",
        JSON.stringify(requestParams, null, 2)
      );
      console.log("📚 [PURCHASES] Filter state:", filter);
      console.log("📚 [PURCHASES] API endpoint: getMyPurchases");

      const response = await CourseAPI.getMyPurchases(requestParams);
    

      console.log(
        "📚 [PURCHASES] Raw response received:",
        JSON.stringify(response, null, 2)
      );
      console.log("📚 [PURCHASES] Response success:", response.success);
      console.log("📚 [PURCHASES] Response message:", response.message);
      console.log(
        "📚 [PURCHASES] Response data:",
        JSON.stringify(response.data, null, 2)
      );

      if (response.success) {
        // Handle nested response structure: response.data.purchases.purchases
        const purchasesData =
          response.data?.purchases?.purchases || response.data?.purchases || [];
        console.log(
          "✅ [PURCHASES] Purchases extracted from response:",
          JSON.stringify(purchasesData, null, 2)
        );
        console.log(
          "✅ [PURCHASES] Number of purchases:",
          purchasesData.length
        );

        if (purchasesData.length === 0) {
          console.log("⚠️ [PURCHASES] No purchases found in response");
        } else {
          console.log(
            "✅ [PURCHASES] First purchase sample:",
            JSON.stringify(purchasesData[0], null, 2)
          );
        }

        setPurchases(purchasesData);
      } else {
        console.error("❌ [PURCHASES] API returned error:", response.message);
        throw new Error(response.message || "Failed to load purchases");
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("❌ [PURCHASES] Exception caught:", error);
      console.error("❌ [PURCHASES] Error message:", error.message);
      console.error("❌ [PURCHASES] Error stack:", error.stack);
      setError(error.message || "Failed to load purchased courses");

      addToast({
        type: "error",
        message: "Failed to load purchased courses. Please try again.",
      });
    } finally {
      setLoading(false);
      console.log(
        "📚 [PURCHASES] Request completed. Loading state set to false."
      );
    }
  };

  const loadListedCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const requestParams = {
        limit: 50,
      };

      console.log("📝 [LISTED] Starting request...");
      console.log(
        "📝 [LISTED] Request params:",
        JSON.stringify(requestParams, null, 2)
      );
      console.log("📝 [LISTED] API endpoint: getMyCourses");

      const response = await CourseAPI.getMyCourses(requestParams);

      console.log(
        "📝 [LISTED] Raw response received:",
        JSON.stringify(response, null, 2)
      );
      console.log("📝 [LISTED] Response success:", response.success);
      console.log("📝 [LISTED] Response message:", response.message);
      console.log(
        "📝 [LISTED] Response data:",
        JSON.stringify(response.data, null, 2)
      );

      if (response.success) {
        // Handle potential nested response structure for listed courses
        const coursesData = response.data?.courses || [];
        console.log(
          "✅ [LISTED] Courses extracted from response:",
          JSON.stringify(coursesData, null, 2)
        );
        console.log("✅ [LISTED] Number of courses:", coursesData.length);

        if (coursesData.length === 0) {
          console.log("⚠️ [LISTED] No courses found in response");
        } else {
          console.log(
            "✅ [LISTED] First course sample:",
            JSON.stringify(coursesData[0], null, 2)
          );
        }

        setListedCourses(coursesData);
      } else {
        console.error("❌ [LISTED] API returned error:", response.message);
        throw new Error(response.message || "Failed to load listed courses");
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("❌ [LISTED] Exception caught:", error);
      console.error("❌ [LISTED] Error message:", error.message);
      console.error("❌ [LISTED] Error stack:", error.stack);
      setError(error.message || "Failed to load listed courses");

      addToast({
        type: "error",
        message: "Failed to load listed courses. Please try again.",
      });
    } finally {
      setLoading(false);
      console.log("📝 [LISTED] Request completed. Loading state set to false.");
    }
  };

  const handleCourseClick = async (purchase: Purchase) => {
    if (!purchase.hasAccess) {
      addToast({
        type: "warning",
        message: "Access expired for this course",
      });
      return;
    }

    try {
      setLoadingCourseId(purchase.courseId);

      // Simulate a brief delay for better UX (API call or access check could go here)
      await new Promise((resolve) => setTimeout(resolve, 500));

      router.push(`/learn/${purchase.courseId}`);
      setLoadingCourseId(null);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to access course";
      addToast({
        type: "error",
        message: errorMsg,
      });
      setLoadingCourseId(null);
    }
  };

  const handleListedCourseClick = (course: ListedCourse) => {
    if (course.status === "published") {
      router.push(`/learn/${course.id}`);
    } else {
      addToast({
        type: "info",
        message: `Course is ${course.status}. Only published courses can be accessed.`,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRemainingDaysText = (remainingDays: number | null) => {
    if (remainingDays === null) return "Lifetime access";
    if (remainingDays <= 0) return "Expired";
    if (remainingDays === 1) return "1 day left";
    return `${remainingDays} days left`;
  };

  const getStatusColor = (isActive: boolean, remainingDays: number | null) => {
    if (!isActive || (remainingDays !== null && remainingDays <= 0)) {
      return "text-red-400";
    }
    if (remainingDays !== null && remainingDays <= 7) {
      return "text-yellow-400";
    }
    return "text-green-400";
  };

  const filteredPurchases = useMemo(() => {
    console.log("🔍 [FILTER] Filtering purchases...");
    console.log("🔍 [FILTER] Current filter:", filter);
    console.log(
      "🔍 [FILTER] Raw purchases array:",
      JSON.stringify(purchases, null, 2)
    );
    console.log("🔍 [FILTER] Purchases is array:", Array.isArray(purchases));
    console.log("🔍 [FILTER] Purchases length:", purchases?.length);

    if (!Array.isArray(purchases)) {
      console.log(
        "⚠️ [FILTER] Purchases is not an array, returning empty array"
      );
      return [];
    }

    let filtered: Purchase[] = [];
    switch (filter) {
      case "active":
        filtered = purchases.filter(
          (purchase) => purchase.isActive && purchase.hasAccess
        );
        console.log(
          "🔍 [FILTER] Active filter applied, result count:",
          filtered.length
        );
        break;
      case "expired":
        filtered = purchases.filter(
          (purchase) => !purchase.isActive || !purchase.hasAccess
        );
        console.log(
          "🔍 [FILTER] Expired filter applied, result count:",
          filtered.length
        );
        break;
      case "listed":
        filtered = [];
        console.log(
          "🔍 [FILTER] Listed filter applied, result count:",
          filtered.length
        );
        break;
      default:
        filtered = purchases;
        console.log(
          "🔍 [FILTER] All filter applied, result count:",
          filtered.length
        );
        break;
    }

    console.log(
      "🔍 [FILTER] Final filtered purchases:",
      JSON.stringify(filtered, null, 2)
    );
    return filtered;
  }, [purchases, filter]);

  const filteredListedCourses = useMemo(() => {
    console.log("🔍 [FILTER] Filtering listed courses...");
    console.log("🔍 [FILTER] Current filter:", filter);
    console.log(
      "🔍 [FILTER] Listed courses array:",
      JSON.stringify(listedCourses, null, 2)
    );

    if (filter !== "listed" || !Array.isArray(listedCourses)) {
      console.log(
        "🔍 [FILTER] Not listed filter or courses not array, returning empty"
      );
      return [];
    }

    console.log(
      "🔍 [FILTER] Returning listed courses, count:",
      listedCourses.length
    );
    return listedCourses;
  }, [listedCourses, filter]);

  // Loading State
  if (loading) {
    return (
      <DashboardLayout
        title="Purchased Products"
        subtitle="Access your purchased courses and learning materials"
      >
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div
                  className="rounded-2xl p-[1px] mb-4"
                  style={{ background: DASHBOARD_COLORS.PRIMARY_BORDER }}
                >
                  <div
                    className="rounded-2xl p-6"
                    style={{ background: DASHBOARD_COLORS.CARD_BG }}
                  >
                    <div className="h-40 bg-gray-700/50 rounded-lg mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-700/50 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-700/50 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Main Content
  console.log("🎨 [RENDER] About to render main content...");
  console.log("🎨 [RENDER] Current filter:", filter);
  console.log("🎨 [RENDER] Loading state:", loading);
  console.log("🎨 [RENDER] Error state:", error);
  console.log(
    "🎨 [RENDER] Filtered purchases count:",
    filteredPurchases.length
  );
  console.log(
    "🎨 [RENDER] Filtered listed courses count:",
    filteredListedCourses.length
  );

  return (
    <DashboardLayout
      title="Purchased Products"
      subtitle="Access your purchased courses and learning materials"
    >
      <div className="p-6 space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-800/50 rounded-lg p-1">
            {[
              { id: "all", label: "All Courses" },
              { id: "active", label: "Active" },
              { id: "expired", label: "Expired" },
              { id: "listed", label: "Listed Courses" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as FilterType)}
                className={`px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
                  filter === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle
              className="text-red-500 mt-0.5 flex-shrink-0"
              size={16}
            />
            <div>
              <h4 className="text-red-400 font-medium">Error</h4>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Content Display */}
        {filter === "listed" ? (
          // Listed Courses Section
          <ListedCoursesContent
            courses={filteredListedCourses}
            onCourseClick={handleListedCourseClick}
            onCreateCourse={() => router.push("/dashboard/my-products")}
            formatDate={formatDate}
          />
        ) : (
          // Purchased Courses Section
          <PurchasedCoursesContent
            purchases={filteredPurchases}
            filter={filter}
            onCourseClick={handleCourseClick}
            onBrowseMarketplace={() => router.push("/marketplace")}
            formatDate={formatDate}
            getRemainingDaysText={getRemainingDaysText}
            getStatusColor={getStatusColor}
            loadingCourseId={loadingCourseId}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

// Listed Courses Component
const ListedCoursesContent: React.FC<{
  courses: ListedCourse[];
  onCourseClick: (course: ListedCourse) => void;
  onCreateCourse: () => void;
  formatDate: (date: string) => string;
}> = ({ courses, onCourseClick, onCreateCourse, formatDate }) => {
  if (courses.length === 0) {
    return (
      <div
        className="rounded-2xl p-[1px]"
        style={{ background: DASHBOARD_COLORS.PRIMARY_BORDER }}
      >
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: DASHBOARD_COLORS.CARD_BG }}
        >
          <Book className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">
            No listed courses yet
          </h3>
          <p className="text-gray-400 mb-4">
            Create and publish your first course to start sharing knowledge.
          </p>
          <button
            onClick={onCreateCourse}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
          >
            Create Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div key={course.id} className="group">
          <div
            className="rounded-2xl p-[1px] transition-all duration-300 group-hover:scale-[1.02]"
            style={{ background: DASHBOARD_COLORS.PRIMARY_BORDER }}
          >
            <div
              className="rounded-2xl overflow-hidden cursor-pointer"
              style={{ background: DASHBOARD_COLORS.CARD_BG }}
              onClick={() => onCourseClick(course)}
            >
              {/* Course Thumbnail */}
              <div className="relative">
                <Image
                  src={course.thumbnail || "/images/course-placeholder.png"}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/course-placeholder.png";
                  }}
                  width={500}
                  height={200}
                />
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      course.status === "published"
                        ? "bg-green-500/20 text-green-400"
                        : course.status === "approved"
                        ? "bg-blue-500/20 text-blue-400"
                        : course.status === "submitted"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : course.status === "rejected"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {course.status.charAt(0).toUpperCase() +
                      course.status.slice(1)}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-gray-900/80 text-white text-xs rounded-full">
                    {course.type === "video" ? "Video" : "Document"}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Course Title */}
                <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                  {course.title}
                </h3>

                {/* Course Description */}
                {course.shortDescription && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {course.shortDescription}
                  </p>
                )}

                {/* Course Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500" />
                      <span>{course.stats.rating || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>
                        {course.type === "video" && course.stats.duration
                          ? `${Math.round(course.stats.duration / 3600)}h`
                          : course.type === "document" &&
                            course.stats.totalPages
                          ? `${course.stats.totalPages} pages`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <span className="text-white font-bold">${course.price}</span>
                </div>

                {/* Course Level */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                    {course.level.charAt(0).toUpperCase() +
                      course.level.slice(1)}
                  </span>
                  <span className="text-gray-400 text-xs">
                    Created {formatDate(course.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Purchased Courses Component
const PurchasedCoursesContent: React.FC<{
  purchases: Purchase[];
  filter: FilterType;
  onCourseClick: (purchase: Purchase) => Promise<void>;
  onBrowseMarketplace: () => void;
  formatDate: (date: string) => string;
  getRemainingDaysText: (days: number | null) => string;
  getStatusColor: (isActive: boolean, days: number | null) => string;
  loadingCourseId: string | null;
}> = ({
  purchases,
  filter,
  onCourseClick,
  onBrowseMarketplace,
  formatDate,
  getRemainingDaysText,
  getStatusColor,
  loadingCourseId,
}) => {
  if (purchases.length === 0) {
    return (
      <div
        className="rounded-2xl p-[1px]"
        style={{ background: DASHBOARD_COLORS.PRIMARY_BORDER }}
      >
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: DASHBOARD_COLORS.CARD_BG }}
        >
          <ShoppingBag className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">
            {filter === "all"
              ? "No courses purchased yet"
              : `No ${filter} courses found`}
          </h3>
          <p className="text-gray-400 mb-4">
            {filter === "all"
              ? "Explore our marketplace to find amazing courses to purchase."
              : `You don't have any ${filter} courses at the moment.`}
          </p>
          {filter === "all" && (
            <button
              onClick={onBrowseMarketplace}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
            >
              Browse Marketplace
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {purchases.map((purchase) => (
        <div key={purchase.id} className="group">
          <div
            className="rounded-2xl p-[1px] transition-all duration-300 group-hover:scale-[1.02]"
            style={{ background: DASHBOARD_COLORS.PRIMARY_BORDER }}
          >
            <div
              className="rounded-2xl overflow-hidden cursor-pointer"
              style={{ background: DASHBOARD_COLORS.CARD_BG }}
              onClick={() => onCourseClick(purchase)}
            >
              {/* Course Thumbnail */}
              <div className="relative">
                <Image
                  src={
                    purchase.courseThumbnail || "/images/course-placeholder.png"
                  }
                  alt={purchase.courseTitle}
                  className="w-full h-40 object-cover"
                  width={500}
                  height={200}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Play className="text-white" size={32} />
                </div>
                {/* Access Status Badge */}
                <div
                  className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium ${
                    purchase.hasAccess
                      ? "bg-green-500/90 text-white"
                      : "bg-red-500/90 text-white"
                  }`}
                >
                  {purchase.hasAccess ? "Active" : "Expired"}
                </div>
              </div>

              {/* Course Info */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {purchase.courseTitle}
                </h3>

                <p className="text-gray-400 text-sm mb-3">
                  by {purchase.instructorName}
                </p>

                {/* Purchase Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Purchased:</span>
                    <span className="text-white">
                      {formatDate(purchase.purchasedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-white">
                      ${purchase.purchasePrice}{" "}
                      {purchase.tokenInfo?.symbol || purchase.tokenUsed}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Access:</span>
                    <span
                      className={getStatusColor(
                        purchase.isActive,
                        purchase.remainingDays
                      )}
                    >
                      {getRemainingDaysText(purchase.remainingDays)}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCourseClick(purchase);
                  }}
                  disabled={
                    !purchase.hasAccess || loadingCourseId === purchase.courseId
                  }
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    purchase.hasAccess && loadingCourseId !== purchase.courseId
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {loadingCourseId === purchase.courseId ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Accessing...</span>
                    </>
                  ) : (
                    <span>
                      {purchase.hasAccess
                        ? "Continue Learning"
                        : "Access Expired"}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PurchasedProductsPage;
