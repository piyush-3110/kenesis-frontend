"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProductCreationStore } from "../store/useProductCreationStore";
import { useCreateChapter } from "@/hooks/useCourse";
import { useLogout } from "@/features/auth/hooks";
import { useUIStore } from "@/store/useUIStore";
import { ChapterFormData } from "../types";
import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  ArrowRight,
  GripVertical,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

/**
 * ChapterCreationForm Component
 * Step 2: Create and manage course chapters with blue gradient design and API integration
 */
const ChapterCreationForm: React.FC = () => {
  const router = useRouter();
  const {
    currentCourse,
    addChapter,
    updateChapter,
    deleteChapter,
    setCurrentStep,
  } = useProductCreationStore();

  const {
    createChapter: createChapterAPI,
    loading: apiLoading,
    error: apiError,
    clearError,
  } = useCreateChapter();
  const logout = useLogout();
  const { addToast } = useUIStore();

  const [formData, setFormData] = useState<ChapterFormData>({
    title: "",
    description: "",
  });

  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(false);

  // Debug effect to monitor store changes
  useEffect(() => {
    console.log("🔍 Chapter Form - Store updated:");
    console.log("  - Current course:", currentCourse);
    console.log("  - Course ID:", currentCourse?.id);
    console.log("  - Course title:", currentCourse?.title);
    console.log(
      "  - Number of chapters:",
      currentCourse?.chapters?.length || 0
    );
  }, [currentCourse]);

  const handleInputChange = (field: keyof ChapterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Chapter title is required";
    if (!formData.description.trim())
      newErrors.description = "Chapter description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Debug logging
    console.log("🔍 Chapter creation - Current course:", currentCourse);
    console.log("🔍 Chapter creation - Course ID:", currentCourse?.id);

    // Check if we have a valid course with ID from backend
    if (!currentCourse?.id) {
      console.error("❌ No course ID found in store");
      addToast({
        type: "error",
        message: "No course found. Please create a course first.",
      });
      setCurrentStep("course");
      return;
    }

    // Validate that the course ID looks like a backend-generated ID (MongoDB ObjectId format)
    if (currentCourse.id.includes("-") && currentCourse.id.length < 20) {
      console.error(
        "❌ Course ID appears to be local temp ID:",
        currentCourse.id
      );
      addToast({
        type: "error",
        message:
          "Course not yet saved to backend. Please save the course first.",
      });
      setCurrentStep("course");
      return;
    }

    if (editingChapterId) {
      // Local update for editing existing chapters
      updateChapter(editingChapterId, formData);
      setEditingChapterId(null);
      setFormData({ title: "", description: "" });
      addToast({ type: "success", message: "Chapter updated successfully!" });
    } else {
      // Show confirmation modal for new chapter creation
      setShowConfirmationModal(true);
    }
  };

  const handleConfirmSubmission = async () => {
    setPendingSubmission(true);

    // Clear any existing API errors
    clearError();

    if (!currentCourse?.id) {
      setPendingSubmission(false);
      return;
    }

    try {
      console.log("📤 Creating chapter for course ID:", currentCourse.id);
      console.log("📤 Chapter data:", formData);

      const result = await createChapterAPI(currentCourse.id, formData);

      if (result.success && result.data) {
        // Add chapter to local state with both local and backend IDs
        const newChapter = {
          ...formData,
          modules: [],
          backendId: result.data.id, // Store backend ID for future API calls
        };

        addChapter(newChapter);

        console.log("✅ Chapter created with backend ID:", result.data.id);

        setFormData({ title: "", description: "" });
        setShowConfirmationModal(false);
        setPendingSubmission(false);
        addToast({
          type: "success",
          message: result.message || "Chapter created successfully!",
        });
      } else {
        // Handle specific error scenarios
        console.error("❌ Chapter creation failed:", result);

        if (result.isUnauthorized) {
          logout.mutate();
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
            message: "You are not authorized to add chapters to this course.",
          });
          setPendingSubmission(false);
          return;
        }

        if (result.isNotFound) {
          addToast({
            type: "error",
            message:
              "Course not found. Please ensure the course was saved properly.",
          });
          setCurrentStep("course");
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

        addToast({
          type: "error",
          message: result.message || "Failed to create chapter",
        });
        setPendingSubmission(false);
      }
    } catch (error) {
      console.error("Chapter creation error:", error);
      addToast({
        type: "error",
        message: "Something went wrong while creating the chapter.",
      });
      setPendingSubmission(false);
    }
  };

  const handleEdit = (chapterId: string) => {
    const chapter = currentCourse?.chapters?.find((ch) => ch.id === chapterId);
    if (chapter) {
      setFormData({
        title: chapter.title,
        description: chapter.description,
      });
      setEditingChapterId(chapterId);
    }
  };

  const handleCancelEdit = () => {
    setEditingChapterId(null);
    setFormData({ title: "", description: "" });
    setErrors({});
  };

  const handleDelete = (chapterId: string) => {
    if (confirm("Are you sure you want to delete this chapter?")) {
      deleteChapter(chapterId);
    }
  };

  const handleContinueToModules = () => {
    if (!currentCourse?.chapters?.length) {
      addToast({
        type: "error",
        message: "Please add at least one chapter before continuing.",
      });
      return;
    }

    // Check if all chapters have backend IDs (have been saved)
    const chaptersWithoutBackendId = currentCourse?.chapters?.filter(
      (ch) => !ch.backendId
    );
    if (chaptersWithoutBackendId.length > 0) {
      setErrors({
        general: `${chaptersWithoutBackendId.length} chapter(s) need to be saved to the backend before continuing. Please try creating them again.`,
      });
      return;
    }

    setCurrentStep("modules");
  };

  // Gradient input class
  const inputClass =
    "w-full px-4 py-3 bg-[#010519] border border-transparent bg-clip-padding rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-transparent focus:ring-0 transition-all duration-300";
  const gradientBorderClass =
    "bg-gradient-to-r from-[#0680FF] to-[#022ED2] p-[2px] rounded-lg";

  if (!currentCourse) {
    return (
      <div className="text-center max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg p-8 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">
            No Course Found
          </h3>
          <p className="text-gray-400 mb-6">
            You need to create a course first before adding chapters. Please go
            back and complete the course creation step.
          </p>
          <button
            onClick={() => setCurrentStep("course")}
            className="px-6 py-3 bg-gradient-to-r from-[#0680FF] to-[#022ED2] text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
          >
            Go Back to Course Creation
          </button>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          <p>Debug Info:</p>
          <p>
            Current course in store: {currentCourse ? "Found" : "Not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Course Info Header */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Course: {currentCourse.title}
            </h2>
            <p className="text-gray-400">
              Add chapters to organize your course content
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Course Status</div>
            {currentCourse.id?.includes("-") ? (
              <span className="text-orange-400 bg-orange-400/10 px-3 py-1 rounded text-sm">
                ⚠ Save course first
              </span>
            ) : (
              <span className="text-green-400 bg-green-400/10 px-3 py-1 rounded text-sm">
                ✅ Course saved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chapter Form */}
      <div className="bg-gradient-to-r from-gray-900/30 to-gray-800/30 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-6">
          {editingChapterId ? "Edit Chapter" : "Add New Chapter"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Chapter Title */}
          <div>
            <label className="block text-white font-medium mb-3">
              Chapter Title *
            </label>
            <div className={gradientBorderClass}>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter chapter title"
                className={inputClass}
              />
            </div>
            {errors.title && (
              <p className="text-red-400 text-sm mt-2">{errors.title}</p>
            )}
          </div>

          {/* Chapter Description */}
          <div>
            <label className="block text-white font-medium mb-3">
              Chapter Description *
            </label>
            <div className={gradientBorderClass}>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe what this chapter covers"
                rows={4}
                className={cn(inputClass, "resize-none")}
              />
            </div>
            {errors.description && (
              <p className="text-red-400 text-sm mt-2">{errors.description}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            {editingChapterId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={apiLoading || pendingSubmission}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0680FF] to-[#022ED2] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {apiLoading || pendingSubmission ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {editingChapterId ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  {editingChapterId ? "Update Chapter" : "Add Chapter"}
                </>
              )}
            </button>
          </div>

          {/* General errors */}
          {errors.general && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Display API errors */}
          {apiError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{apiError}</p>
            </div>
          )}
        </form>
      </div>

      {/* Existing Chapters */}
      {currentCourse?.chapters?.length > 0 && (
        <div className="bg-gradient-to-r from-gray-900/30 to-gray-800/30 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-6">
            Course Chapters ({currentCourse?.chapters?.length})
          </h3>

          <div className="space-y-4">
            {currentCourse?.chapters?.map((chapter, index) => (
              <div
                key={chapter.id}
                className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-gray-500" />
                  <span className="text-[#0680FF] font-medium text-lg">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{chapter.title}</h4>
                  <p className="text-gray-400 text-sm">{chapter.description}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    {chapter.modules?.length || 0} modules
                    {chapter.backendId ? (
                      <span className="ml-2 text-green-400">✓ Saved</span>
                    ) : (
                      <span className="ml-2 text-orange-400">⚠ Local only</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(chapter.id)}
                    className="p-2 text-gray-400 hover:text-[#0680FF] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(chapter.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep("course")}
          className="flex items-center gap-2 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Course
        </button>
        <button
          onClick={handleContinueToModules}
          disabled={!currentCourse?.chapters?.length}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0680FF] to-[#022ED2] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Modules
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
        }}
        onConfirm={handleConfirmSubmission}
        title="Create Chapter"
        message="Once you create this chapter, you'll be able to add modules to it. After creation, chapter details can only be edited from the My Products section. Do you want to proceed?"
        type="info"
        confirmText="Create Chapter"
        cancelText="Review Again"
        isLoading={pendingSubmission}
      />
    </div>
  );
};

export default ChapterCreationForm;
