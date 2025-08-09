"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useProductCreationStore } from "../store/useProductCreationStore";
import { useCreateModule } from "@/hooks/useCourse";
import { useLogout } from "@/features/auth/hooks";
import { useUIStore } from "@/store/useUIStore";
import { ModuleFormData } from "../types";
import { MODULE_TYPES, FILE_UPLOAD_LIMITS } from "../constants";
import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  FileText,
  Play,
  Headphones,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ModuleCreationForm Component
 * Step 3: Create and manage modules within chapters with blue gradient design and API integration
 */
const ModuleCreationForm: React.FC = () => {
  const router = useRouter();
  const {
    currentCourse,
    selectedChapterId,
    setSelectedChapterId,
    addModule,
    updateModule,
    deleteModule,
    setCurrentStep,
  } = useProductCreationStore();

  const {
    createModule: createModuleAPI,
    loading: apiLoading,
    error: apiError,
    clearError,
  } = useCreateModule();
  const logout = useLogout();
  const { addToast } = useUIStore();

  const [formData, setFormData] = useState<ModuleFormData>({
    title: "",
    description: "",
    type: "video",
    order: 1,
    duration: 0,
    isPreview: false,
    attachments: [],
  });

  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [mainFilePreview, setMainFilePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentChapter = currentCourse?.chapters.find(
    (ch) => ch.id === selectedChapterId
  );

  const handleInputChange = (field: keyof ModuleFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileUpload = (file: File, isMainFile = true) => {
    const moduleType = formData.type;
    let limits;

    switch (moduleType) {
      case "video":
        limits = FILE_UPLOAD_LIMITS.video;
        break;
      case "audio":
        limits = FILE_UPLOAD_LIMITS.audio;
        break;
      case "pdf":
        limits = FILE_UPLOAD_LIMITS.document;
        break;
      default:
        limits = FILE_UPLOAD_LIMITS.document;
    }

    if (file.size > limits.maxSize) {
      setErrors((prev) => ({
        ...prev,
        [isMainFile ? "mainFile" : "attachments"]: `File size exceeds ${
          limits.maxSize / (1024 * 1024)
        }MB limit`,
      }));
      return;
    }

    if (!limits.allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [isMainFile
          ? "mainFile"
          : "attachments"]: `Invalid file type. Allowed: ${limits.allowedTypes.join(
          ", "
        )}`,
      }));
      return;
    }

    // Clear any existing errors
    setErrors((prev) => ({
      ...prev,
      [isMainFile ? "mainFile" : "attachments"]: "",
    }));

    if (isMainFile) {
      setMainFile(file);
      setMainFilePreview(URL.createObjectURL(file));
    } else {
      setAttachmentFiles((prev) => [...prev, file]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Module title is required";
    if (!formData.description.trim())
      newErrors.description = "Module description is required";
    if (formData.duration <= 0)
      newErrors.duration = "Duration must be greater than 0";
    if (!editingModuleId && !mainFile)
      newErrors.mainFile = "Main file is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedChapterId) return;
    if (!currentCourse?.id) {
      addToast({
        type: "error",
        message: "No course found. Please create a course first.",
      });
      return;
    }

    // Clear any existing API errors
    clearError();

    if (editingModuleId) {
      // Local update for editing existing modules
      updateModule(selectedChapterId, editingModuleId, formData);
      setEditingModuleId(null);
      resetForm();
      addToast({ type: "success", message: "Module updated successfully!" });
    } else {
      // API call for creating new modules
      try {
        // Create FormData for the module
        const moduleFormData = new FormData();
        moduleFormData.append("chapterId", selectedChapterId);
        moduleFormData.append("title", formData.title);
        moduleFormData.append("description", formData.description);
        moduleFormData.append("type", formData.type);
        moduleFormData.append(
          "order",
          ((currentChapter?.modules.length || 0) + 1).toString()
        );
        moduleFormData.append("duration", formData.duration.toString());
        moduleFormData.append("isPreview", formData.isPreview.toString());

        // Add main file (required)
        if (mainFile) {
          moduleFormData.append("mainFile", mainFile);
        }

        // Add attachments (optional)
        attachmentFiles.forEach((file) => {
          moduleFormData.append(`attachments`, file);
        });

        const result = await createModuleAPI(currentCourse.id, moduleFormData);

        if (result.success && result.data) {
          // Add module to local state with the API-generated ID
          const nextOrder = (currentChapter?.modules.length || 0) + 1;
          addModule(selectedChapterId, {
            ...formData,
            order: nextOrder,
            mainFile: mainFile!,
            attachments: attachmentFiles,
          });

          resetForm();
          addToast({
            type: "success",
            message: result.message || "Module created successfully!",
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
              message: "You are not authorized to modify this course.",
            });
            return;
          }

          if (result.isNotFound) {
            addToast({
              type: "error",
              message: "Course or chapter not found. Please try again.",
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

          if (result.isServerError) {
            addToast({
              type: "error",
              message: "Something went wrong. Please try again later.",
            });
            return;
          }

          addToast({
            type: "error",
            message: result.message || "Failed to create module",
          });
        }
      } catch (error) {
        console.error("Module creation error:", error);
        addToast({
          type: "error",
          message: "Something went wrong while creating the module.",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "video",
      order: 1,
      duration: 0,
      isPreview: false,
      attachments: [],
    });
    setMainFile(null);
    setAttachmentFiles([]);
    setMainFilePreview(null);
  };

  const handleEdit = (moduleId: string) => {
    const chapterModule = currentChapter?.modules.find(
      (m) => m.id === moduleId
    );
    if (chapterModule) {
      setFormData({
        title: chapterModule.title,
        description: chapterModule.description,
        type: chapterModule.type,
        order: chapterModule.order,
        duration: chapterModule.duration,
        isPreview: chapterModule.isPreview,
        mainFile: chapterModule.mainFile as File,
        attachments: chapterModule.attachments as File[],
      });
      setEditingModuleId(moduleId);
    }
  };

  const handleDelete = (moduleId: string) => {
    if (
      confirm("Are you sure you want to delete this module?") &&
      selectedChapterId
    ) {
      deleteModule(selectedChapterId, moduleId);
    }
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="w-5 h-5" />;
      case "audio":
        return <Headphones className="w-5 h-5" />;
      case "pdf":
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-[#010519] border border-transparent bg-clip-padding rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-transparent focus:ring-0 transition-all duration-300";
  const gradientBorderClass =
    "bg-gradient-to-r from-[#0680FF] to-[#022ED2] p-[2px] rounded-lg";

  if (!currentCourse?.chapters.length) {
    return (
      <div className="text-center">
        <p className="text-gray-400">
          Please create at least one chapter first.
        </p>
        <button
          onClick={() => setCurrentStep("chapters")}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-[#0680FF] to-[#022ED2] text-white rounded-lg"
        >
          Go Back to Chapters
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Chapter Selection */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          Select Chapter to Add Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentCourse.chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => setSelectedChapterId(chapter.id)}
              className={cn(
                "p-4 rounded-lg border text-left transition-all duration-300",
                selectedChapterId === chapter.id
                  ? "border-[#0680FF] bg-[#0680FF]/10"
                  : "border-gray-600 hover:border-gray-500"
              )}
            >
              <h4 className="font-semibold text-white mb-1">{chapter.title}</h4>
              <p className="text-gray-400 text-sm mb-2">
                {chapter.description}
              </p>
              <span className="text-xs text-[#0680FF]">
                {chapter.modules.length} modules
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedChapterId && currentChapter && (
        <>
          {/* Module Form */}
          <div className="bg-gradient-to-r from-gray-900/30 to-gray-800/30 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6">
              {editingModuleId ? "Edit Module" : "Add New Module"}
              <span className="text-[#0680FF] ml-2">
                - {currentChapter.title}
              </span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Module Title and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-3">
                    Module Title *
                  </label>
                  <div className={gradientBorderClass}>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Enter module title"
                      className={inputClass}
                    />
                  </div>
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-2">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">
                    Module Type *
                  </label>
                  <div className={gradientBorderClass}>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        handleInputChange("type", e.target.value)
                      }
                      className={inputClass}
                    >
                      {MODULE_TYPES.map((type) => (
                        <option
                          key={type.value}
                          value={type.value}
                          className="bg-[#010519] text-white"
                        >
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-white font-medium mb-3">
                  Description *
                </label>
                <div className={gradientBorderClass}>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe what this module covers"
                    rows={3}
                    className={cn(inputClass, "resize-none")}
                  />
                </div>
                {errors.description && (
                  <p className="text-red-400 text-sm mt-2">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Duration and Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-3">
                    Duration (minutes) *
                  </label>
                  <div className={gradientBorderClass}>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        handleInputChange(
                          "duration",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      min="1"
                      className={inputClass}
                    />
                  </div>
                  {errors.duration && (
                    <p className="text-red-400 text-sm mt-2">
                      {errors.duration}
                    </p>
                  )}
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isPreview}
                      onChange={(e) =>
                        handleInputChange("isPreview", e.target.checked)
                      }
                      className="w-5 h-5 text-[#0680FF] bg-[#010519] border border-gray-600 rounded focus:ring-[#0680FF] focus:ring-2"
                    />
                    <span className="text-white font-medium">
                      Available as Preview
                    </span>
                  </label>
                </div>
              </div>

              {/* Main File Upload */}
              <div>
                <label className="block text-white font-medium mb-3">
                  Main File
                </label>
                <div className={cn(gradientBorderClass, "h-32")}>
                  <div className="h-full bg-[#010519] rounded-lg flex items-center justify-center relative overflow-hidden">
                    {mainFilePreview ? (
                      <>
                        {formData.type === "video" ? (
                          <video
                            src={mainFilePreview}
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : formData.type === "audio" ? (
                          <audio
                            src={mainFilePreview}
                            controls
                            className="w-full"
                          />
                        ) : (
                          <div className="text-center">
                            <FileText className="w-12 h-12 text-[#0680FF] mx-auto mb-2" />
                            <p className="text-white">
                              {formData.mainFile?.name}
                            </p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setMainFilePreview(null);
                            setFormData((prev) => ({
                              ...prev,
                              mainFile: undefined,
                            }));
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mb-2 mx-auto" />
                          <p className="text-gray-400 text-sm">
                            Upload main file
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {formData.type === "video" && "Max 500MB, MP4/WEBM"}
                            {formData.type === "audio" && "Max 50MB, MP3/WAV"}
                            {formData.type === "pdf" && "Max 10MB, PDF/DOC"}
                            {!["video", "audio", "pdf"].includes(
                              formData.type
                            ) && "Various formats supported"}
                          </p>
                        </div>
                      </>
                    )}
                    <input
                      type="file"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFileUpload(e.target.files[0], true)
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                {errors.mainFile && (
                  <p className="text-red-400 text-sm mt-2">{errors.mainFile}</p>
                )}
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-white font-medium mb-3">
                  Attachments (Optional)
                </label>
                <div className={cn(gradientBorderClass, "min-h-[100px]")}>
                  <div className="bg-[#010519] rounded-lg p-4">
                    {formData.attachments.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {formData.attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-800/50 rounded p-2"
                          >
                            <span className="text-white text-sm">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-gray-400 mb-2 mx-auto" />
                      <p className="text-gray-400 text-sm">
                        Drop files here or click to upload
                      </p>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => {
                          Array.from(e.target.files || []).forEach((file) =>
                            handleFileUpload(file, false)
                          );
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={apiLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0680FF] to-[#022ED2] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {apiLoading && !editingModuleId ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      {editingModuleId ? "Update Module" : "Add Module"}
                    </>
                  )}
                </button>

                {editingModuleId && (
                  <button
                    type="button"
                    disabled={apiLoading}
                    onClick={() => {
                      setEditingModuleId(null);
                      resetForm();
                    }}
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

          {/* Modules List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Modules in {currentChapter.title} ({currentChapter.modules.length}
              )
            </h3>

            {currentChapter.modules.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-r from-gray-900/20 to-gray-800/20 rounded-lg border border-gray-700">
                <p className="text-gray-400">
                  No modules added yet. Create your first module above.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentChapter.modules.map((module) => (
                  <div
                    key={module.id}
                    className="bg-gradient-to-r from-gray-900/40 to-gray-800/40 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-[#0680FF]">
                            {getModuleIcon(module.type)}
                          </div>
                          <span className="text-sm font-medium text-[#0680FF] bg-[#0680FF]/10 px-2 py-1 rounded">
                            #{module.order}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white">
                              {module.title}
                            </h4>
                            {module.isPreview && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                Preview
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm mb-2">
                            {module.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>
                              Type:{" "}
                              {
                                MODULE_TYPES.find(
                                  (t) => t.value === module.type
                                )?.label
                              }
                            </span>
                            <span>Duration: {module.duration} min</span>
                            <span>
                              Attachments: {module.attachments.length}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(module.id)}
                          className="p-2 text-gray-400 hover:text-[#0680FF] transition-colors"
                          title="Edit module"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(module.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete module"
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
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={() => setCurrentStep("chapters")}
          className="flex items-center gap-2 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Chapters
        </button>

        <button
          onClick={() => setCurrentStep("review")}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#0680FF] to-[#022ED2] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
        >
          Continue to Review
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ModuleCreationForm;
