"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Play,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  DollarSign,
  Timer,
  ExternalLink,
} from "lucide-react";
import type {
  CourseForReview,
  PendingReviewItem,
  CourseApprovalData,
  CourseRejectionData,
} from "../api/approvalsApi";
import { useApproveCourse, useRejectCourse } from "../hooks/useApprovals";

interface CourseReviewCardProps {
  course: CourseForReview | PendingReviewItem;
  onReviewComplete?: () => void;
}

/**
 * Course Review Card Component
 * Displays a course pending review with approve/reject actions
 */
const CourseReviewCard: React.FC<CourseReviewCardProps> = ({
  course: rawCourse,
  onReviewComplete,
}) => {
  const router = useRouter();

  // Type guard to check if this is a PendingReviewItem
  const isPendingReviewItem = (item: any): item is PendingReviewItem => {
    return (
      item &&
      typeof item === "object" &&
      "course" in item &&
      "status" in item &&
      "submittedAt" in item
    );
  };

  // Extract the actual course data from the nested structure
  const course = isPendingReviewItem(rawCourse) ? rawCourse.course : rawCourse;
  const pendingInfo = isPendingReviewItem(rawCourse)
    ? {
        pendingId: rawCourse.id,
        status: rawCourse.status,
        submittedAt: rawCourse.submittedAt,
        daysPending: rawCourse.daysPending,
      }
    : null;

  // Defensive checks - check for both _id and id since API might use either
  if (!course || (!course._id && !course.id)) {
    console.warn("CourseReviewCard received invalid course data:", rawCourse);
    return null;
  }

  // Normalize the course ID - ensure it's always a string
  const courseId = (course._id || course.id) as string;

  // Helper function to get instructor display name
  const getInstructorName = () => {
    const instructor = course?.instructor;
    if (!instructor) return "Unknown Instructor";

    // Try various fields for the instructor name
    return (
      instructor.username ||
      instructor.email?.split("@")[0] ||
      (instructor as any)?.name ||
      ((course as any)?.createdBy &&
      typeof (course as any).createdBy === "object"
        ? (course as any).createdBy.username ||
          (course as any).createdBy.email?.split("@")[0]
        : null) ||
      "Unknown Instructor"
    );
  };

  // Helper function to get instructor email
  const getInstructorEmail = () => {
    const instructor = course?.instructor;
    if (!instructor) return null;

    return (
      instructor.email ||
      ((course as any)?.createdBy &&
      typeof (course as any).createdBy === "object"
        ? (course as any).createdBy.email
        : null)
    );
  };

  // Helper function to get instructor ID
  const getInstructorId = () => {
    const instructor = course?.instructor;
    if (!instructor) return null;

    return (
      instructor.id ||
      instructor._id ||
      ((course as any)?.createdBy &&
      typeof (course as any).createdBy === "object"
        ? (course as any).createdBy.id || (course as any).createdBy._id
        : null)
    );
  };

  const [showDetails, setShowDetails] = useState(false);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");

  const approveMutation = useApproveCourse();
  const rejectMutation = useRejectCourse();

  const handleApprove = async () => {
    if (!approvalMessage.trim()) {
      alert("Please provide an approval message");
      return;
    }

    const approvalData: CourseApprovalData = {
      message: approvalMessage,
      reviewNotes: approvalNotes,
    };

    try {
      await approveMutation.mutateAsync({ courseId, data: approvalData });
      setShowApprovalForm(false);
      setApprovalMessage("");
      setApprovalNotes("");
      onReviewComplete?.();
    } catch (error) {
      console.error("Failed to approve course:", error);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    const rejectionData: CourseRejectionData = {
      reason: rejectionReason,
      reviewNotes: rejectionNotes,
    };

    try {
      await rejectMutation.mutateAsync({ courseId, data: rejectionData });
      setShowRejectionForm(false);
      setRejectionReason("");
      setRejectionNotes("");
      onReviewComplete?.();
    } catch (error) {
      console.error("Failed to reject course:", error);
    }
  };

  const formatDate = (dateString: string) => {
    // Use consistent formatting for SSR
    try {
      const date = new Date(dateString);
      return (
        date.toISOString().split("T")[0] +
        " " +
        date.toISOString().split("T")[1].substring(0, 5)
      );
    } catch (error) {
      return dateString;
    }
  };

  const getDaysAgo = (dateString: string) => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      return 0;
    }
  };

  const getTotalModules = () => {
    if (!course?.chapters || !Array.isArray(course.chapters)) return 0;
    return course.chapters.reduce((total: number, chapter: any) => {
      return total + (chapter?.modules?.length || 0);
    }, 0);
  };

  const isLoading = approveMutation.isPending || rejectMutation.isPending;

  // Navigation function with better error handling
  const handleNavigateToLearn = () => {
    try {
      console.log(
        "🚀 [APPROVAL] Navigating to learn page for course:",
        courseId
      );
      console.log("🚀 [APPROVAL] Course title:", course.title);

      // Navigate to the learn page - the learn page will handle fetching missing details
      router.push(`/learn/${courseId}`);
    } catch (error) {
      console.error("❌ [APPROVAL] Navigation error:", error);
      alert("Failed to navigate to course. Please try again.");
    }
  };

  return (
    <>
      <div
        className="p-6 rounded-xl border-2 border-transparent bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-sm relative overflow-hidden"
        style={{
          borderImage: "linear-gradient(90deg, #0680FF 0%, #022ED2 100%) 1",
        }}
      >
        {/* Background Gradient Effect */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #0680FF 0%, #022ED2 100%)",
          }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div
                className="flex items-center gap-3 mb-2 cursor-pointer group hover:bg-gray-800/30 -mx-2 px-2 py-1 rounded-lg transition-all duration-200 hover:scale-[1.01]"
                onClick={handleNavigateToLearn}
                title={`Click to preview course: ${course.title}`}
              >
                <div className="flex items-center gap-2 flex-1">
                  {course.type === "video" ? (
                    <Play className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  ) : (
                    <FileText className="w-5 h-5 text-green-400 group-hover:text-green-300 transition-colors" />
                  )}
                  <h3 className="text-xl font-semibold text-white line-clamp-1 group-hover:text-blue-300 transition-colors flex-1">
                    {course.title}
                  </h3>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    course.type === "video"
                      ? "bg-blue-500/20 text-blue-300 group-hover:bg-blue-500/30"
                      : "bg-green-500/20 text-green-300 group-hover:bg-green-500/30"
                  } transition-colors`}
                >
                  {course.type.toUpperCase()}
                </span>
              </div>

              <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                {course.shortDescription}
              </p>

              {/* Instructor & Status Info */}
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{getInstructorName()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDate(
                      course?.createdAt || pendingInfo?.submittedAt || ""
                    )}
                  </span>
                  <span className="text-orange-400">
                    (
                    {getDaysAgo(
                      course?.createdAt || pendingInfo?.submittedAt || ""
                    )}{" "}
                    days ago)
                  </span>
                </div>
                {course?.price && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>${course.price}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <div className="text-sm text-gray-400">Status</div>
                <div className="text-sm font-medium text-orange-400 capitalize">
                  {pendingInfo?.status ||
                    course?.latestHistoryEntry?.status ||
                    course?.status ||
                    "Unknown"}
                </div>
              </div>
              {course?.chapters && course.chapters.length > 0 && (
                <div className="text-right">
                  <div className="text-sm text-gray-400">Content</div>
                  <div className="text-sm font-medium text-white">
                    {course.chapters.length} chapters, {getTotalModules()} modules
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Latest History Entry */}
          <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Latest Update:</span>
              <span>
                {course?.latestHistoryEntry?.message ||
                  (pendingInfo
                    ? `Submitted for review ${pendingInfo.daysPending} day${
                        pendingInfo.daysPending !== 1 ? "s" : ""
                      } ago`
                    : "No update message")}
              </span>
              <span className="text-gray-500">
                •{" "}
                {formatDate(
                  course?.latestHistoryEntry?.timestamp ||
                    pendingInfo?.submittedAt ||
                    ""
                )}
              </span>
              {course?.latestHistoryEntry?.metadata?.submissionCount && (
                <span className="text-orange-400">
                  • Submission #
                  {course.latestHistoryEntry.metadata.submissionCount}
                </span>
              )}
              {pendingInfo && (
                <span className="text-orange-400 capitalize">
                  • Status: {pendingInfo.status}
                </span>
              )}
            </div>
          </div>

          {/* Expandable Details */}
          <div className="space-y-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showDetails ? "Hide Details" : "View Details"}
            </button>

            {showDetails && (
              <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg">
                {/* Full Description */}
                {course.description && (
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">
                      Description
                    </h4>
                    <p className="text-sm text-gray-300">{course.description}</p>
                  </div>
                )}

                {/* Chapters & Modules */}
                {course.chapters &&
                  Array.isArray(course.chapters) &&
                  course.chapters.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">
                        Course Structure
                      </h4>
                      <div className="space-y-2">
                        {course.chapters.map((chapter: any, index: number) => {
                          if (!chapter) {
                            return null;
                          }

                          const chapterKey =
                            chapter._id || `chapter-${courseId}-${index}`;

                          return (
                            <div
                              key={chapterKey}
                              className="bg-gray-700/30 rounded p-3"
                            >
                              <div className="text-sm font-medium text-blue-300 mb-1">
                                Chapter {index + 1}:{" "}
                                {chapter.title || "Untitled Chapter"}
                              </div>
                              <div className="text-xs text-gray-400">
                                {chapter.modules?.length || 0} module
                                {(chapter.modules?.length || 0) !== 1 ? "s" : ""}
                              </div>
                              {chapter.modules &&
                                Array.isArray(chapter.modules) &&
                                chapter.modules.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {chapter.modules.map(
                                      (module: any, moduleIndex: number) => {
                                        if (!module) {
                                          return null;
                                        }

                                        const moduleKey =
                                          module._id ||
                                          `module-${chapterKey}-${moduleIndex}`;

                                        return (
                                          <div
                                            key={moduleKey}
                                            className="flex items-center gap-2 text-xs text-gray-400"
                                          >
                                            {module.contentType === "video" ? (
                                              <Play className="w-3 h-3" />
                                            ) : (
                                              <FileText className="w-3 h-3" />
                                            )}
                                            <span>
                                              {module.title || "Untitled Module"}
                                            </span>
                                            {module.duration && (
                                              <span className="text-gray-500">
                                                ({module.duration}min)
                                              </span>
                                            )}
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Additional Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {course.accessDuration && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1">
                        Access Duration
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Timer className="w-4 h-4" />
                        <span>{course.accessDuration} days</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">
                      Instructor
                    </h4>
                    <div className="text-sm text-gray-300">
                      <div className="font-medium">{getInstructorName()}</div>
                      {getInstructorEmail() && (
                        <div className="text-xs text-gray-400 mt-1">
                          {getInstructorEmail()}
                        </div>
                      )}
                      {getInstructorId() && (
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {getInstructorId()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <button
              onClick={() => setShowApprovalForm(true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>

            <button
              onClick={() => setShowRejectionForm(true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>

            <button
              onClick={handleNavigateToLearn}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Preview Course
            </button>

            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approval Form Modal - Now outside the card container */}
      {showApprovalForm && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowApprovalForm(false);
            }
          }}
        >
          <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full border border-gray-700 max-h-[85vh] overflow-y-auto shadow-2xl relative z-[100000]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                Approve Course
              </h3>
              <button
                onClick={() => setShowApprovalForm(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm text-gray-300 mb-4 p-3 bg-green-900/20 rounded-lg border border-green-700/30">
              <strong>Course:</strong> {course.title}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Approval Message *
                </label>
                <textarea
                  value={approvalMessage}
                  onChange={(e) => setApprovalMessage(e.target.value)}
                  placeholder="Congratulations! Your course has been approved..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Internal Review Notes (Optional)
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Internal notes for admin reference..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleApprove}
                disabled={
                  approveMutation.isPending || !approvalMessage.trim()
                }
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
              >
                {approveMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Approve Course
                  </>
                )}
              </button>
              <button
                onClick={() => setShowApprovalForm(false)}
                disabled={approveMutation.isPending}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Form Modal - Now outside the card container */}
      {showRejectionForm && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRejectionForm(false);
            }
          }}
        >
          <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full border border-gray-700 max-h-[85vh] overflow-y-auto shadow-2xl relative z-[100000]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                Reject Course
              </h3>
              <button
                onClick={() => setShowRejectionForm(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm text-gray-300 mb-4 p-3 bg-red-900/20 rounded-lg border border-red-700/30">
              <strong>Course:</strong> {course.title}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why this course cannot be approved..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Internal Review Notes (Optional)
                </label>
                <textarea
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder="Internal notes for admin reference..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleReject}
                disabled={rejectMutation.isPending || !rejectionReason.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
              >
                {rejectMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Reject Course
                  </>
                )}
              </button>
              <button
                onClick={() => setShowRejectionForm(false)}
                disabled={rejectMutation.isPending}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseReviewCard;
