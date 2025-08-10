/**
 * Course Access Status Component
 * Shows the current access status of the user for a course
 */

import React from "react";
import { CheckCircle, Lock, AlertTriangle, Loader2 } from "lucide-react";

interface CourseAccessStatusProps {
  hasAccess: boolean;
  isLoading: boolean;
  error?: Error | null;
  className?: string;
}

export const CourseAccessStatus: React.FC<CourseAccessStatusProps> = ({
  hasAccess,
  isLoading,
  error,
  className = "",
}) => {
  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Checking access status...</span>
      </div>
    );
  }

  if (error) {
    // Handle different types of errors
    const isAuthError =
      error.message.toLowerCase().includes("unauthorized") ||
      error.message.toLowerCase().includes("please log in") ||
      error.message.toLowerCase().includes("authentication failed");

    if (isAuthError) {
      return (
        <div className={`flex items-center gap-2 text-yellow-400 ${className}`}>
          <Lock size={16} />
          <span className="text-sm">Login to check access status</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-2 text-red-400 ${className}`}>
        <AlertTriangle size={16} />
        <span className="text-sm">Failed to check access status</span>
      </div>
    );
  }

  if (hasAccess) {
    return (
      <div className={`flex items-center gap-2 text-green-400 ${className}`}>
        <CheckCircle size={16} />
        <span className="text-sm font-medium">You own this course</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
      <Lock size={16} />
      <span className="text-sm">Purchase required for access</span>
    </div>
  );
};

/**
 * Course Access Banner Component
 * Shows a banner with access status and additional information
 */
interface CourseAccessBannerProps {
  hasAccess: boolean;
  isLoading: boolean;
  error?: Error | null;
  courseTitle: string;
  className?: string;
}

export const CourseAccessBanner: React.FC<CourseAccessBannerProps> = ({
  hasAccess,
  isLoading,
  error,
  courseTitle,
  className = "",
}) => {
  if (isLoading) {
    return (
      <div
        className={`p-4 rounded-lg bg-gray-800/50 border border-gray-700 ${className}`}
      >
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-blue-400" />
          <div>
            <h4 className="text-white font-medium">Checking Access</h4>
            <p className="text-gray-400 text-sm">
              Verifying your access to this course...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError =
      error.message.toLowerCase().includes("unauthorized") ||
      error.message.toLowerCase().includes("please log in") ||
      error.message.toLowerCase().includes("authentication failed");

    if (isAuthError) {
      return (
        <div
          className={`p-4 rounded-lg bg-yellow-600/20 border border-yellow-600/30 ${className}`}
        >
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-yellow-400" />
            <div>
              <h4 className="text-yellow-400 font-medium">Login Required</h4>
              <p className="text-yellow-300 text-sm">
                Please log in to check if you have access to this course.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`p-4 rounded-lg bg-red-600/20 border border-red-600/30 ${className}`}
      >
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-400" />
          <div>
            <h4 className="text-red-400 font-medium">Access Check Failed</h4>
            <p className="text-red-300 text-sm">
              Unable to verify your access status. Please try refreshing the
              page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (hasAccess) {
    return (
      <div
        className={`p-4 rounded-lg bg-green-600/20 border border-green-600/30 ${className}`}
      >
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-green-400" />
          <div>
            <h4 className="text-green-400 font-medium">You Own This Course</h4>
            <p className="text-green-300 text-sm">
              You have full access to &quot;{courseTitle}&quot; and all its
              content.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // User doesn't have access, but no error - this is normal for unpurchased courses
  return null;
};
