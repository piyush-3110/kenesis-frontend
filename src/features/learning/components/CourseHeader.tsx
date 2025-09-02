"use client";

import React from "react";
import { ArrowLeft, User, Award, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { CertificateButtons, CourseCompletionStatus } from "@/features/learning/components";
import type { Course } from "../types";

interface CourseHeaderProps {
  course: Course;
  progressPercent: number;
  totalLessons: number;
  completedLessons: number;
  onToggleInfo: () => void;
  showInfo: boolean;
  showCertificateSection?: boolean;
  className?: string;
}

/**
 * Enhanced Course Header Component
 * Includes certificate buttons and completion status
 */
export const CourseHeader: React.FC<CourseHeaderProps> = ({
  course,
  progressPercent,
  totalLessons,
  completedLessons,
  onToggleInfo,
  showInfo,
  showCertificateSection = true,
  className,
}) => {
  const router = useRouter();
  const isCompleted = progressPercent >= 100;

  const handleViewCertificate = () => {
    if (isCompleted) {
      // Navigate to certificate view or open modal
      router.push(`/certificates/${course.id}`);
    }
  };

  const handleDownloadCertificate = () => {
    if (isCompleted) {
      // Trigger certificate download
      const link = document.createElement('a');
      link.href = `/api/certificates/${course.id}/download`;
      link.download = `${course.title}-certificate.pdf`;
      link.click();
    }
  };

  return (
    <div className={cn("relative border-b backdrop-blur-sm bg-black/30", className)}>
      {/* Main Header */}
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <button
              onClick={() => router.push("/dashboard/purchased-products")}
              className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors group"
            >
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="text-sm hidden sm:inline">Back to My Courses</span>
            </button>
            <div className="h-5 w-px bg-gradient-to-b from-blue-500/60 to-transparent" />
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-semibold text-white line-clamp-1">
                {course.title}
              </h1>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <User size={12} />
                  {course.instructor.username}
                </span>
              </div>
            </div>
          </div>

          {/* Progress & Certificate Buttons */}
          <div className="flex items-center gap-4">
            {/* Progress Display */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-white">
                  {Math.round(progressPercent)}%
                </div>
                <div className="text-xs text-gray-400">
                  {completedLessons}/{totalLessons} lessons
                </div>
              </div>
              <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Certificate Buttons - Creative Position */}
            <div className="hidden lg:flex items-center gap-2">
              <motion.button
                onClick={handleViewCertificate}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  isCompleted
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-lg hover:shadow-blue-500/25"
                    : "bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 border border-gray-700/50"
                )}
                disabled={!isCompleted}
              >
                <Award className="w-4 h-4" />
                <span className="hidden xl:inline">Certificate</span>
              </motion.button>

              <motion.button
                onClick={handleDownloadCertificate}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  isCompleted
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white hover:shadow-lg hover:shadow-emerald-500/25"
                    : "bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 border border-gray-700/50"
                )}
                disabled={!isCompleted}
              >
                <Download className="w-4 h-4" />
                <span className="hidden xl:inline">Download</span>
              </motion.button>
            </div>

            {/* Info Button */}
            <button
              onClick={onToggleInfo}
              className="px-3 py-1 text-xs rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
            >
              Info
            </button>
          </div>
        </div>

        {/* Mobile Certificate Buttons */}
        <div className="lg:hidden mt-4 pt-3 border-t border-gray-800/50">
          <CertificateButtons
            courseTitle={course.title}
            isCompleted={isCompleted}
            completionPercentage={progressPercent}
            onViewCertificate={handleViewCertificate}
            onDownloadCertificate={handleDownloadCertificate}
            className="max-w-md mx-auto"
          />
        </div>
      </div>

      {/* Course Info Section */}
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-800/40 bg-black/30"
        >
          <div className="p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Certificate Status Section */}
              {showCertificateSection && (
                <div className="mb-6">
                  <CourseCompletionStatus
                    courseTitle={course.title}
                    isCompleted={isCompleted}
                    completionPercentage={progressPercent}
                    completionDate={isCompleted ? new Date().toISOString() : undefined}
                  />
                </div>
              )}

              {/* Original Course Info Grid */}
              <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-300">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2 text-white text-sm">
                    📊 Overview
                  </h3>
                  <p className="flex items-center gap-2">
                    🕒 {/* formatDuration would go here */}
                  </p>
                  <p className="flex items-center gap-2">
                    👥 Students: {course.stats.enrollmentCount || "—"}
                  </p>
                  <p className="flex items-center gap-2">
                    🌍 {course.language || "English"}
                  </p>
                  {course.lastUpdated && (
                    <p className="flex items-center gap-2">
                      📅 Updated: {new Date(course.lastUpdated).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2 text-white text-sm">
                      🎯 You'll Learn
                    </h3>
                    <ul className="space-y-1">
                      {course.learningOutcomes
                        .slice(0, 4)
                        .map((outcome: string, i: number) => (
                          <li key={i} className="flex gap-2">
                            ✅ <span>{outcome}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {course.requirements && course.requirements.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2 text-white text-sm">
                      💡 Requirements
                    </h3>
                    <ul className="space-y-1">
                      {course.requirements
                        .slice(0, 4)
                        .map((requirement: string, i: number) => (
                          <li key={i} className="flex gap-2">
                            <span className="w-1 h-1 rounded-full bg-gray-400 mt-2" />
                            <span>{requirement}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CourseHeader;
