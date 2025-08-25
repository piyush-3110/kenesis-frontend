"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useProductCreationStore } from "../store/useProductCreationStore";
import { useSubmitCourseForReview } from "@/hooks/useCourse";
import { useLogout } from "@/features/auth/hooks";
import { useUIStore } from "@/store/useUIStore";
import {
  ArrowLeft,
  FileText,
  Play,
  Headphones,
  Users,
  Clock,
  DollarSign,
  Send,
  CheckCircle,
  Loader2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

/**
 * CourseReview Component
 * Step 4: Review and submit course for admin approval with blue gradient design and API integration
 */
const CourseReview: React.FC = () => {
  const router = useRouter();
  const { currentCourse, setCurrentStep, resetCreation, markStepCompleted } =
    useProductCreationStore();
  const {
    submitForReview: submitCourseAPI,
    loading: apiLoading,
    error: apiError,
    clearError,
  } = useSubmitCourseForReview();
  const logout = useLogout();
  const { addToast } = useUIStore();

  const [submissionNotes, setSubmissionNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(false);

  const getModuleIcon = (module: any) => {
    // Determine type from file name if available, otherwise use generic icon
    if (module.mainFile?.name) {
      const extension = module.mainFile.name.split('.').pop()?.toLowerCase() || '';
      const videoExtensions = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv', 'm4v'];
      
      if (videoExtensions.includes(extension)) {
        return <Play className="w-4 h-4" />;
      }
    }
    
    // Default to document icon for all other types
    return <FileText className="w-4 h-4" />;
  };

  const getTotalDuration = () => {
    if (!currentCourse) return 0;
    return currentCourse.chapters.reduce((total, chapter) => {
      return (
        total +
        chapter.modules.reduce((chapterTotal, module) => {
          return chapterTotal + (module.duration || 0);
        }, 0)
      );
      return (
        total +
        chapter.modules.reduce((chapterTotal, module) => {
          return chapterTotal + (module.duration || 0);
        }, 0)
      );
    }, 0);
  };

  const getTotalModules = () => {
    if (!currentCourse) return 0;
    return currentCourse.chapters.reduce(
      (total, chapter) => total + chapter.modules.length,
      0
    );
  };

  /**
   * Validates that every chapter has at least one module
   * This is a critical requirement for course submission
   * @returns Object with validation status and details about missing modules
   */
  const validateChapterModules = () => {
    if (!currentCourse || !currentCourse.chapters.length) {
      return {
        isValid: false,
        message: "Course must have at least one chapter",
        chaptersWithoutModules: [],
      };
    }

    const chaptersWithoutModules = currentCourse.chapters.filter(
      (chapter) => !chapter.modules || chapter.modules.length === 0
    );

    return {
      isValid: chaptersWithoutModules.length === 0,
      message:
        chaptersWithoutModules.length > 0
          ? `The following chapters need at least one module: ${chaptersWithoutModules
              .map((chapter) => `"${chapter.title}"`)
              .join(", ")}`
          : "All chapters have modules",
      chaptersWithoutModules,
    };
  };

  /**
   * Checks if the course is ready for submission
   * Includes all necessary validations for production readiness
   */
  const isCourseReadyForSubmission = () => {
    const moduleValidation = validateChapterModules();
    const hasBasicInfo = currentCourse?.title && currentCourse?.description;
    
    return {
      isReady: moduleValidation.isValid && hasBasicInfo,
      validationErrors: [
        ...(moduleValidation.isValid ? [] : [moduleValidation.message]),
        ...(hasBasicInfo ? [] : ["Course must have title and description"]),
      ],
    };
  };

  const handleSubmitForApproval = async () => {
    if (!currentCourse?.id) {
      addToast({ type: "error", message: "No course found to submit." });
      return;
    }

    // Validate course before submission
    const readinessCheck = isCourseReadyForSubmission();
    if (!readinessCheck.isReady) {
      addToast({
        type: "error",
        message: `Course not ready for submission: ${readinessCheck.validationErrors.join(", ")}`,
      });
      return;
    }

    // Show confirmation modal
    setShowConfirmationModal(true);
  };

  const handleConfirmSubmission = async () => {
    if (!currentCourse?.id) {
      setPendingSubmission(false);
      return;
    }

    setPendingSubmission(true);

    // Clear any existing API errors
    clearError();

    try {
      const result = await submitCourseAPI(
        currentCourse.id,
        submissionNotes.trim() || undefined
      );

      if (result.success) {
        setIsSubmitted(true);
        setShowConfirmationModal(false);
        setPendingSubmission(false);
        
        // Mark review step as completed
        markStepCompleted("review");
        
        addToast({
          type: "success",
          message: result.message || "Course submitted for review!",
        });

        // Reset the creation flow after 3 seconds and redirect to dashboard
        setTimeout(() => {
          resetCreation();
          router.push("/dashboard/products");
        }, 3000);
      } else {
        // Handle specific error scenarios
        if (result.isUnauthorized) {
          await logout.mutateAsync();
          addToast({
            type: "error",
            message: "Session expired. Please log in again.",
          });
          router.push("/");
          return;
        }

        if (result.isForbidden) {
          addToast({
            type: "error",
            message: "You are not authorized to submit this course.",
          });
          setPendingSubmission(false);
          return;
        }

        if (result.isNotFound) {
          addToast({
            type: "error",
            message: "Course not found. Please refresh and try again.",
          });
          setPendingSubmission(false);
          return;
        }

        if (result.isRateLimit) {
          addToast({ type: "error", message: result.message });
          setPendingSubmission(false);
          return;
        }

        if (result.isValidationError) {
          addToast({ type: "error", message: result.message });
          setPendingSubmission(false);
          return;
        }

        if (result.isNotReady) {
          addToast({
            type: "error",
            message: "Course not ready for submission.",
          });
          setPendingSubmission(false);
          return;
        }

        addToast({
          type: "error",
          message: result.message || "Failed to submit course",
        });
        setPendingSubmission(false);
      }
    } catch (error) {
      console.error("Course submission error:", error);
      addToast({
        type: "error",
        message: "Something went wrong while submitting the course.",
      });
      setPendingSubmission(false);
    }
  };

  if (!currentCourse) {
    return (
      <div className="text-center">
        <p className="text-gray-400">No course data found.</p>
        <button
          onClick={() => setCurrentStep("course")}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-[#0680FF] to-[#022ED2] text-white rounded-lg"
        >
          Start Over
        </button>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-8 border border-green-500/20">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Course Submitted Successfully!
          </h2>
          <p className="text-gray-400 mb-6">
            Your course {currentCourse.title} has been submitted for admin
            review. You&apos;ll receive an email notification once the review is
            complete.
          </p>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              Typical review time: 1-3 business days
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalDuration = getTotalDuration();
  const totalModules = getTotalModules();
  const totalChapters = currentCourse.chapters.length;
  
  // Validation checks for production readiness
  const moduleValidation = validateChapterModules();
  const courseReadiness = isCourseReadyForSubmission();
  const isSubmissionDisabled = apiLoading || !courseReadiness.isReady;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Course Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg p-6 border border-gray-700 text-center">
          <Users className="w-8 h-8 text-[#0680FF] mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{totalChapters}</div>
          <div className="text-gray-400 text-sm">Chapters</div>
        </div>

        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg p-6 border border-gray-700 text-center">
          <FileText className="w-8 h-8 text-[#0680FF] mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{totalModules}</div>
          <div className="text-gray-400 text-sm">Modules</div>
        </div>

        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg p-6 border border-gray-700 text-center">
          <Clock className="w-8 h-8 text-[#0680FF] mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {Math.round(totalDuration / 60)}h {totalDuration % 60}m
          </div>
          <div className="text-gray-400 text-sm">Total Duration</div>
        </div>

        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg p-6 border border-gray-700 text-center">
          <DollarSign className="w-8 h-8 text-[#0680FF] mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            ${currentCourse.price}
          </div>
          <div className="text-gray-400 text-sm">Price</div>
        </div>
      </div>

      {/* Course Details */}
      <div className="bg-gradient-to-r from-gray-900/30 to-gray-800/30 rounded-lg p-8 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">
          {currentCourse.title}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-white mb-2">Course Type</h3>
              <p className="text-gray-400 break-words">{currentCourse.type}</p>
            </div>

            {/* Categories Section */}
            {(currentCourse as any)?.categories && (currentCourse as any).categories.length > 0 && (
              <div>
                <h3 className="font-semibold text-white mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {(currentCourse as any).categories.map((category: any, index: number) => (
                    <span
                      key={category.id || index}
                      className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm truncate max-w-[150px]"
                      title={category.name}
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-white mb-2">
                Short Description
              </h3>
              <p className="text-gray-400 break-words line-clamp-3">{currentCourse.shortDescription}</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">
                Level & Language
              </h3>
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-[#0680FF]/10 text-[#0680FF] rounded-full text-sm">
                  {currentCourse.level}
                </span>
                <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                  {currentCourse.language}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">Payment Tokens</h3>
              <div className="flex flex-wrap gap-2">
                {currentCourse.tokenToPayWith.map((token) => (
                  <span
                    key={token}
                    className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm"
                  >
                    {token}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <h3 className="font-semibold text-white mb-2">
              Detailed Description
            </h3>
            <p className="text-gray-400 leading-relaxed break-words">
              {currentCourse.description}
            </p>
          </div>
        </div>
      </div>

      {/* Chapters and Modules */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Course Content</h2>

        {currentCourse.chapters.map((chapter, chapterIndex) => (
          <div
            key={chapter.id}
            className="bg-gradient-to-r from-gray-900/20 to-gray-800/20 rounded-lg border border-gray-700"
          >
            {/* Chapter Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-lg font-semibold text-white mb-2 truncate" title={`Chapter ${chapterIndex + 1}: ${chapter.title}`}>
                    Chapter {chapterIndex + 1}: {chapter.title}
                  </h3>
                  <p className="text-gray-400 break-words line-clamp-2">{chapter.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm text-[#0680FF] font-medium">
                    {chapter.modules.length} modules
                  </div>
                  <div className="text-xs text-gray-500">
                    {chapter.modules.reduce(
                      (total, module) => total + (module.duration || 0),
                      0
                    )}{" "}
                    min
                  </div>
                </div>
              </div>
            </div>

            {/* Modules */}
            <div className="p-6 space-y-3">
              {chapter.modules.map((module, moduleIndex) => (
                <div
                  key={module.id}
                  className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg overflow-hidden"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-[#0680FF] flex-shrink-0">
                      {getModuleIcon(module)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 min-w-0">
                        <span className="font-medium text-white truncate min-w-0 flex-1" title={`${moduleIndex + 1}. ${module.title}`}>
                          {moduleIndex + 1}. {module.title}
                        </span>
                        {module.isPreview && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded flex-shrink-0 whitespace-nowrap">
                            Preview
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm break-words overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word'
                      }}>
                        {module.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500 flex-shrink-0 ml-3 min-w-0">
                    <div className="whitespace-nowrap">{module.duration || 0} min</div>
                    <div className="text-xs truncate">MODULE</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Validation Checklist */}
      <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-lg p-6 border border-blue-500/20">
        <h3 className="font-semibold text-white mb-4">
          Pre-submission Checklist
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">Course details completed</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">
              {totalChapters} chapters created
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">{totalModules} modules added</span>
          </div>
          
          {/* Module validation check */}
          <div className="flex items-start gap-2">
            {moduleValidation.isValid ? (
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
            )}
            <div className="flex-1">
              <span className={moduleValidation.isValid ? "text-gray-300" : "text-red-400"}>
                Every chapter has at least one module
              </span>
              {!moduleValidation.isValid && moduleValidation.chaptersWithoutModules.length > 0 && (
                <div className="mt-1 text-sm text-red-300">
                  Missing modules in: {moduleValidation.chaptersWithoutModules.map(chapter => `"${chapter.title}"`).join(", ")}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">Payment tokens configured</span>
          </div>
        </div>
        
        {/* Warning message if validation fails */}
        {!courseReadiness.isReady && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-400 font-medium text-sm">Course Not Ready for Submission</p>
              <p className="text-yellow-300 text-sm mt-1">
                {courseReadiness.validationErrors.join(". ")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-6">
        {/* Submit Button with Tooltip */}
        <div className="relative group">
          <button
            onClick={handleSubmitForApproval}
            disabled={isSubmissionDisabled}
            className={cn(
              "flex items-center gap-2 px-8 py-3 font-medium rounded-lg transition-all duration-300",
              isSubmissionDisabled
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#0680FF] to-[#022ED2] text-white hover:shadow-lg hover:shadow-blue-500/25"
            )}
          >
            {apiLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit for Approval
              </>
            )}
          </button>
          
          {/* Tooltip for disabled state */}
          {!courseReadiness.isReady && !apiLoading && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 min-w-max max-w-xs">
              <div className="text-center">
                <p className="font-medium text-red-400 mb-1">Cannot Submit Course</p>
                <p className="text-gray-300">{courseReadiness.validationErrors.join(". ")}</p>
              </div>
              {/* Tooltip arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      </div>

      {/* Submission Notes */}
      <div className="bg-[#0A0B1A] rounded-lg p-6 border border-[#1E2139] mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Submission Notes (Optional)
        </h3>
        <div className="bg-gradient-to-r from-[#0680FF] to-[#022ED2] p-[2px] rounded-lg">
          <textarea
            value={submissionNotes}
            onChange={(e) => setSubmissionNotes(e.target.value)}
            placeholder="Add any notes for the reviewers (e.g., changes made, special instructions, etc.)"
            className="w-full px-4 py-3 bg-[#010519] border border-transparent bg-clip-padding rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-transparent focus:ring-0 transition-all duration-300 resize-none"
            rows={4}
            maxLength={500}
          />
        </div>
        <p className="text-gray-400 text-sm mt-2">
          {submissionNotes.length}/500 characters
        </p>
      </div>

      {/* Display API errors */}
      {apiError && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
          setPendingSubmission(false);
        }}
        onConfirm={handleConfirmSubmission}
        title="Submit Course for Review"
        message="Are you sure you want to submit this course for admin review? Once submitted, you won't be able to make changes until the review is complete."
        confirmText="Submit Course"
        type="info"
        isLoading={pendingSubmission}
      />
    </div>
  );
};

export default CourseReview;
