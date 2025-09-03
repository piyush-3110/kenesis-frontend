"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/features/auth/RequireAuth";
import { CheckSquare } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { useCurrentUser } from "@/features/auth/useCurrentUser";
import { usePendingReviews, useReviewStats } from "./hooks/useApprovals";
import CourseReviewCard from "./components/CourseReviewCard";
import ReviewStatsOverview from "./components/ReviewStatsOverview";
import CourseFilters from "./components/CourseFilters";
import type { PendingReviewsFilters } from "./api/approvalsApi";

/**
 * Course Approvals Page
 * Admin-only page for reviewing and approving/rejecting courses
 */
const ApprovalsPage: React.FC = () => {
  const router = useRouter();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const [filters, setFilters] = useState<PendingReviewsFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    order: "desc",
  });
  const [isClient, setIsClient] = useState(false);

  // Only run on client to avoid hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch data only if user is admin
  const isAdmin = currentUser?.role === "admin";
  const shouldFetchData = !userLoading && isAdmin && isClient;
  const {
    data: pendingReviews,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = usePendingReviews(filters, shouldFetchData);
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useReviewStats(shouldFetchData);

  console.log("🔍 Approvals Page - Current User:", currentUser);
  console.log("🔍 Approvals Page - User Loading:", userLoading);
  console.log("🔍 Approvals Page - User Role:", currentUser?.role);
  console.log("🔍 Approvals Page - Is Admin:", isAdmin);
  console.log("🔍 Approvals Page - Should Fetch Data:", shouldFetchData);
  console.log("🔍 Approvals Page - Pending Reviews:", pendingReviews);
  console.log("🔍 Approvals Page - Reviews Error:", reviewsError);
  console.log("🔍 Approvals Page - Stats:", stats);
  console.log("🔍 Approvals Page - Stats Error:", statsError);

  // Show loading state while user data is being fetched or on server
  if (userLoading || !isClient) {
    return (
      <RequireAuth>
        <DashboardLayout title="Course Approvals" subtitle="Loading...">
          <div className="p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-gray-400 text-lg">
                  {!isClient ? "Initializing..." : "Loading user data..."}
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </RequireAuth>
    );
  }

  // Check if user is admin
  if (currentUser && currentUser.role !== "admin") {
    return (
      <RequireAuth>
        <DashboardLayout
          title="Access Denied"
          subtitle="You don't have permission to access this page"
        >
          <div className="p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-400 text-lg mb-2">
                  Access Denied: Admin role required
                </div>
                <p className="text-gray-400">
                  You need administrator privileges to access course approvals.
                </p>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </RequireAuth>
    );
  }

  const handleFiltersChange = (newFilters: Partial<PendingReviewsFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <RequireAuth>
      <DashboardLayout
        title="Course Approvals"
        subtitle="Review and approve courses submitted by instructors"
      >
        <div className="p-4 md:p-6 lg:p-8 xl:p-12 min-h-screen">
          <div className="w-full max-w-7xl mx-auto space-y-8 lg:space-y-10">
            {/* Page Header */}
            <div className="relative pb-6">
              <div className="flex items-center gap-4 mb-4">
                <CheckSquare className="w-8 h-8 text-blue-400" />
                <h1
                  className="text-white font-bold"
                  style={{
                    fontFamily: "Inter",
                    fontSize: "32px",
                    fontWeight: 700,
                    lineHeight: "140%",
                  }}
                >
                  Course Approvals
                </h1>
              </div>
              <p className="text-gray-400 text-lg mb-6">
                Review submitted courses and approve or reject them with
                feedback
              </p>

              {/* Gradient underline */}
              <div
                className="absolute bottom-0 left-0 h-[3px] w-40"
                style={{
                  background:
                    "linear-gradient(90deg, #0680FF 0%, #010519 88.45%)",
                }}
              />
            </div>

            {/* Stats Overview */}
            {!statsLoading && stats && (
              <ReviewStatsOverview stats={stats} isLoading={statsLoading} />
            )}

            {statsLoading && (
              <div className="p-6 rounded-xl border-2 border-transparent bg-gradient-to-br from-gray-900/90 to-gray-800/50">
                <div className="flex items-center justify-center h-32">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-gray-400">Loading statistics...</div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters and Search */}
            <CourseFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />

            {/* Main Content */}
            <div className="space-y-6">
              {/* Loading State */}
              {reviewsLoading && (
                <div className="flex items-center justify-center h-64">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-gray-400 text-lg">
                      Loading pending reviews...
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {reviewsError && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-red-400 text-lg mb-2">
                      {reviewsError instanceof Error
                        ? reviewsError.message
                        : "Failed to load reviews"}
                    </div>
                    <button
                      onClick={() => router.refresh()}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* Course Reviews List */}
              {pendingReviews &&
              pendingReviews.courses &&
              Array.isArray(pendingReviews.courses) ? (
                <>
                  {pendingReviews.courses.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        No Pending Reviews
                      </h3>
                      <p className="text-gray-400">
                        All courses have been reviewed. Great job!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Results Count and Summary */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-400">
                            Showing {pendingReviews.courses.length} of{" "}
                            {pendingReviews.pagination?.totalItems || 0} courses
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>
                              Page {pendingReviews.pagination?.currentPage || 1}{" "}
                              of {pendingReviews.pagination?.totalPages || 1}
                            </span>
                            {pendingReviews.summary && (
                              <span>
                                •{" "}
                                {pendingReviews.summary.videoCoursesCount || 0}{" "}
                                video,{" "}
                                {pendingReviews.summary.documentCoursesCount ||
                                  0}{" "}
                                document
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Additional Summary Info */}
                        {pendingReviews.summary && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-gray-900/50 border border-gray-700">
                            {pendingReviews.summary.oldestSubmission && (
                              <div className="text-sm">
                                <span className="text-gray-400">Oldest:</span>
                                <span className="text-white ml-2">
                                  {new Date(
                                    pendingReviews.summary.oldestSubmission
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {pendingReviews.summary.newestSubmission && (
                              <div className="text-sm">
                                <span className="text-gray-400">Newest:</span>
                                <span className="text-white ml-2">
                                  {new Date(
                                    pendingReviews.summary.newestSubmission
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {pendingReviews.summary.avgSubmissionAge !==
                              undefined && (
                              <div className="text-sm">
                                <span className="text-gray-400">Avg Age:</span>
                                <span className="text-white ml-2">
                                  {pendingReviews.summary.avgSubmissionAge.toFixed(
                                    1
                                  )}{" "}
                                  days
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* API Message and Timestamp */}
                        {(pendingReviews.message ||
                          pendingReviews.timestamp) && (
                          <div className="text-xs text-gray-500 space-y-1">
                            {pendingReviews.message && (
                              <div>API: {pendingReviews.message}</div>
                            )}
                            {pendingReviews.timestamp && (
                              <div>
                                Updated:{" "}
                                {new Date(
                                  pendingReviews.timestamp
                                ).toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Course Cards */}
                      <div className="grid grid-cols-1 gap-6">
                        {pendingReviews.courses.map((course) => {
                          // Handle both data structures: direct course or nested course
                          const courseKey =
                            (course as any)._id ||
                            (course as any).id ||
                            (course as any).course?.id ||
                            (course as any).course?._id ||
                            `course-${Math.random()}`;
                          return (
                            <CourseReviewCard
                              key={courseKey}
                              course={course}
                              onReviewComplete={() => {
                                // Refetch data after review action
                                // This will be handled by the mutation hooks
                              }}
                            />
                          );
                        })}
                      </div>

                      {/* Pagination */}
                      {pendingReviews.pagination &&
                        pendingReviews.pagination.totalPages > 1 && (
                          <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                              onClick={() =>
                                handlePageChange(
                                  (pendingReviews.pagination?.currentPage ||
                                    1) - 1
                                )
                              }
                              disabled={!pendingReviews.pagination?.hasPrevPage}
                              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                            >
                              Previous
                            </button>

                            <span className="px-4 py-2 text-gray-400">
                              Page {pendingReviews.pagination.currentPage} of{" "}
                              {pendingReviews.pagination.totalPages}
                            </span>

                            <button
                              onClick={() =>
                                handlePageChange(
                                  (pendingReviews.pagination?.currentPage ||
                                    1) + 1
                                )
                              }
                              disabled={!pendingReviews.pagination?.hasNextPage}
                              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                            >
                              Next
                            </button>
                          </div>
                        )}
                    </div>
                  )}
                </>
              ) : (
                pendingReviews && (
                  <div className="text-center py-12">
                    <div className="text-yellow-400 text-lg mb-2">
                      Unexpected data format received
                    </div>
                    <p className="text-gray-400 mb-4">
                      The API response format doesn&apos;t match expectations.
                    </p>
                    <div className="text-xs text-gray-500 bg-gray-800 p-4 rounded-lg max-w-md mx-auto">
                      <pre>{JSON.stringify(pendingReviews, null, 2)}</pre>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
};

export default ApprovalsPage;
