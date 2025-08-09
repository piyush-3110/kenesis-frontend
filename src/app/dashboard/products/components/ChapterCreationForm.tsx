"use client";

import React, { useState } from "react";
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
    if (!currentCourse?.id) {
      addToast({
        type: "error",
        message: "No course found. Please create a course first.",
      });
      return;
    }

    // Clear any existing API errors
    clearError();

    if (editingChapterId) {
      // Local update for editing existing chapters
      updateChapter(editingChapterId, formData);
      setEditingChapterId(null);
      setFormData({ title: "", description: "" });
      addToast({ type: "success", message: "Chapter updated successfully!" });
    } else {
      // API call for creating new chapters
      try {
        const result = await createChapterAPI(currentCourse.id, formData);

        if (result.success && result.data) {
          // Add chapter to local state with the API-generated ID
          addChapter({
            ...formData,
            modules: [],
          });

          setFormData({ title: "", description: "" });
          addToast({
            type: "success",
            message: result.message || "Chapter created successfully!",
          });
        } else {
          // Handle specific error scenarios
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
            return;
          }

          if (result.isNotFound) {
            addToast({
              type: "error",
              message: "Course not found. Please contact support.",
            });
            return;
          }

          if (result.isRateLimit) {
            addToast({ type: "error", message: result.message });
            return;
          }

          if (result.isValidationError) {
            addToast({ type: "error", message: result.message });
            return;
          }

          addToast({
            type: "error",
            message: result.message || "Failed to create chapter",
          });
        }
      } catch (error) {
        console.error("Chapter creation error:", error);
        addToast({
          type: "error",
          message: "Something went wrong while creating the chapter.",
        });
      }
    }
  };

  const handleEdit = (chapterId: string) => {
    const chapter = currentCourse?.chapters.find((ch) => ch.id === chapterId);
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

  const handleContinue = () => {
    if (!currentCourse?.chapters.length) {
      setErrors({
        general: "Please add at least one chapter before continuing",
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
      <div className="text-center">
        <p className="text-gray-400">
          Please complete the course details first.
        </p>
        <button
          onClick={() => setCurrentStep("course")}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-[#0680FF] to-[#022ED2] text-white rounded-lg"
        >
          Go Back to Course Details
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Course Info */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-2">
          {currentCourse.title}
        </h3>
        <p className="text-gray-400">{currentCourse.shortDescription}</p>
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
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={apiLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0680FF] to-[#022ED2] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {apiLoading && !editingChapterId ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  {editingChapterId ? "Update Chapter" : "Add Chapter"}
                </>
              )}
            </button>

            {editingChapterId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={apiLoading}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Display API errors */}
          {apiError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{apiError}</p>
            </div>
          )}
        </form>
      </div>

      {/* Chapters List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">
          Chapters ({currentCourse.chapters.length})
        </h3>

        {currentCourse.chapters.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-r from-gray-900/20 to-gray-800/20 rounded-lg border border-gray-700">
            <p className="text-gray-400">
              No chapters added yet. Create your first chapter above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentCourse.chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className="bg-gradient-to-r from-gray-900/40 to-gray-800/40 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center gap-2 mt-1">
                      <GripVertical className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-[#0680FF] bg-[#0680FF]/10 px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">
                        {chapter.title}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {chapter.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{chapter.modules.length} modules</span>
                        <span>Order: {chapter.order}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(chapter.id)}
                      className="p-2 text-gray-400 hover:text-[#0680FF] transition-colors"
                      title="Edit chapter"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(chapter.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete chapter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {errors.general && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{errors.general}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={() => setCurrentStep("course")}
          className="flex items-center gap-2 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Course Details
        </button>

        <button
          onClick={handleContinue}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#0680FF] to-[#022ED2] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
        >
          Continue to Modules
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChapterCreationForm;
