import React, { useState } from "react";
import { useProductCreationStore } from "../store/useProductCreationStore";
import { useUIStore } from "@/store/useUIStore";
import { ModuleFormData } from "../types";
import { MODULE_TYPES, FILE_UPLOAD_LIMITS } from "../constants";
import {
  Plus,
  ArrowRight,
  Upload,
  X,
  FileText,
  Play,
  Headphones,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { uploadFile } from "@/lib/uploadService";
import { http } from "@/lib/http/axios";

/**
 * ModuleCreationForm Component
 * Step 3: Create and manage modules within chapters with blue gradient design and API integration
 */
const ModuleCreationForm: React.FC = () => {
  const {
    currentCourse,
    selectedChapterId,
    setSelectedChapterId,
    addModule,
    updateModule,
    setCurrentStep,
    markStepCompleted,
  } = useProductCreationStore();

  const { addToast } = useUIStore();

  /**
   * Validates that every chapter has at least one module before proceeding to review
   * @returns Object with validation status and details
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
          ? `Please add at least one module to: ${chaptersWithoutModules
              .map((chapter) => `"${chapter.title}"`)
              .join(", ")}`
          : "All chapters have modules",
      chaptersWithoutModules,
    };
  };

  const handleContinueToReview = () => {
    const validation = validateChapterModules();
    if (!validation.isValid) {
      addToast({
        type: "error",
        message: validation.message,
      });
      return;
    }

    // Mark modules step as completed
    markStepCompleted("modules");
    setCurrentStep("review");
  };

  const [formData, setFormData] = useState<ModuleFormData>({
    title: "",
    description: "",
    type: "document", // Default to document, will be auto-detected on file upload
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
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(false);

  const [uploadedUrls, setUploadedUrls] = useState<{
    mainFileUrl: string | null;
    attachmentUrls: string[];
  }>({
    mainFileUrl: null,
    attachmentUrls: [],
  });

  const [uploadProgress, setUploadProgress] = useState<{
    mainFile: { percentage: number; status: string } | null;
    attachments: { [index: number]: { percentage: number; status: string } };
  }>({
    mainFile: null,
    attachments: {},
  });

  const currentChapter = currentCourse?.chapters.find(
    (ch) => ch.id === selectedChapterId
  );

  const handleInputChange = (
    field: keyof ModuleFormData,
    value: string | string[] | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileUpload = (file: File, isMainFile = true) => {
    if (isMainFile) {
      // Auto-detect module type based on file type
      const isVideoFile = file.type.startsWith("video/");
      const autoDetectedType = isVideoFile ? "video" : "document";

      // Update form data with auto-detected type
      setFormData((prev) => ({ ...prev, type: autoDetectedType }));

      // Validate main file size (unified 500MB limit for all types)
      const maxSize = 500 * 1024 * 1024; // 500MB

      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          mainFile: `File size exceeds 500MB limit`,
        }));
        return;
      }

      // Accept all supported video and document types
      const allowedTypes = [
        // Video types
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/avi",
        "video/mov",
        "video/mkv",
        "video/wmv",
        "video/quicktime",
        // Document types
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];

      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          mainFile: `Unsupported file type. Please select a video or document file.`,
        }));
        return;
      }

      setErrors((prev) => ({ ...prev, mainFile: "" }));
      setMainFile(file);
      setMainFilePreview(URL.createObjectURL(file));

      // Show info about auto-detection
      addToast({
        type: "info",
        message: `Module type automatically set to "${autoDetectedType}" based on uploaded file.`,
      });
    } else {
      // Validate attachment files based on API specs
      const attachmentLimits = FILE_UPLOAD_LIMITS.moduleAttachment;

      // Check attachment count limit (max 10)
      if (attachmentFiles.length >= attachmentLimits.maxCount) {
        setErrors((prev) => ({
          ...prev,
          attachments: `Maximum ${attachmentLimits.maxCount} attachments allowed`,
        }));
        return;
      }

      if (file.size > attachmentLimits.maxSize) {
        setErrors((prev) => ({
          ...prev,
          attachments: `Attachment file size exceeds ${
            attachmentLimits.maxSize / (1024 * 1024)
          }MB limit`,
        }));
        return;
      }

      if (!attachmentLimits.allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          attachments: `Invalid attachment file type. Allowed: documents and images`,
        }));
        return;
      }

      setErrors((prev) => ({ ...prev, attachments: "" }));
      setAttachmentFiles((prev) => [...prev, file]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation according to API docs
    if (!formData.title.trim()) {
      newErrors.title = "Module title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Module title must be at least 3 characters";
    }

    // Chapter ID validation - required for API call
    if (!selectedChapterId) {
      newErrors.general = "Please select a chapter first";
    }

    // Main file validation - required for proper type detection
    if (!editingModuleId && !mainFile) {
      newErrors.mainFile =
        "Please upload a main file to determine the module type";
    }

    // Type validation - ensure type is set (auto-detected from uploaded file)
    if (!formData.type || !["video", "document"].includes(formData.type)) {
      if (!newErrors.mainFile) {
        newErrors.mainFile =
          "Module type could not be determined. Please upload a valid file.";
      }
    }

    // Duration validation - optional but should be positive if provided
    if (formData.duration && formData.duration < 0) {
      newErrors.duration = "Duration cannot be negative";
    }

    // Attachment count validation
    if (attachmentFiles.length > FILE_UPLOAD_LIMITS.moduleAttachment.maxCount) {
      newErrors.attachments = `Maximum ${FILE_UPLOAD_LIMITS.moduleAttachment.maxCount} attachments allowed`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedChapterId) return;

    // Debug logging
    console.log("🔍 Module creation - Current course:", currentCourse);
    console.log("🔍 Module creation - Selected chapter ID:", selectedChapterId);
    console.log("🔍 Module creation - Chapter data:", currentChapter);

    if (!currentCourse?.id) {
      console.error("❌ No course ID found");
      addToast({
        type: "error",
        message: "No course found. Please create a course first.",
      });
      return;
    }

    // Find the selected chapter and ensure it has a backend ID
    const selectedChapter = currentCourse.chapters.find(
      (ch) => ch.id === selectedChapterId
    );
    if (!selectedChapter) {
      console.error("❌ Selected chapter not found");
      addToast({
        type: "error",
        message: "Selected chapter not found. Please select a valid chapter.",
      });
      return;
    }

    // Use backend chapter ID if available, otherwise local ID
    const chapterIdForAPI = selectedChapter.backendId || selectedChapter.id;
    console.log("📍 Using chapter ID for API:", chapterIdForAPI);

    if (editingModuleId) {
      // Local update for editing existing modules
      updateModule(selectedChapterId, editingModuleId, formData);
      setEditingModuleId(null);
      resetForm();
      addToast({ type: "success", message: "Module updated successfully!" });
    } else {
      // Show confirmation modal for new module creation
      setShowConfirmationModal(true);
    }
  };

  const handleConfirmSubmission = async () => {
    setPendingSubmission(true);

    if (!selectedChapterId || !currentCourse?.id) {
      setPendingSubmission(false);
      return;
    }

    // Find the selected chapter and ensure it has a backend ID
    const selectedChapter = currentCourse.chapters.find(
      (ch) => ch.id === selectedChapterId
    );
    if (!selectedChapter) {
      console.error("❌ Selected chapter not found");
      addToast({
        type: "error",
        message: "Selected chapter not found. Please select a valid chapter.",
      });
      setPendingSubmission(false);
      return;
    }

    // Use backend chapter ID if available, otherwise local ID
    const chapterIdForAPI = selectedChapter.backendId || selectedChapter.id;
    console.log("📍 Using chapter ID for API:", chapterIdForAPI);

    try {
      // Step 1: Upload files concurrently if they exist and capture results directly

      // Upload main file and capture result directly
      const mainFileResult = mainFile
        ? await uploadFile(
            mainFile,
            formData.type === "video" ? "module-videos" : "module-documents",
            (progress) => {
              // Update progress state for main file
              setUploadProgress((prev) => ({
                ...prev,
                mainFile: {
                  percentage: progress.percentage,
                  status: "Uploading...",
                },
              }));
            }
          )
        : null;

      // Upload attachments concurrently and capture results directly
      const attachmentResults =
        attachmentFiles.length > 0
          ? await Promise.all(
              attachmentFiles.map((file, index) =>
                uploadFile(file, "module-attachments", (progress) => {
                  // Update progress state for each attachment
                  setUploadProgress((prev) => ({
                    ...prev,
                    attachments: {
                      ...prev.attachments,
                      [index]: {
                        percentage: progress.percentage,
                        status: "Uploading...",
                      },
                    },
                  }));
                })
              )
            )
          : [];

      // Extract URLs from results
      const finalMainFileUrl = mainFileResult ? mainFileResult.url : null;
      const finalAttachmentUrls = attachmentResults.map((result) => result.url);

      // Optional: Update state for UI consistency (but not critical for API call)
      setUploadedUrls({
        mainFileUrl: finalMainFileUrl,
        attachmentUrls: finalAttachmentUrls,
      });

      // Clear upload progress after completion
      setUploadProgress({
        mainFile: null,
        attachments: {},
      });

      addToast({
        type: "success",
        message: "All files uploaded successfully!",
      });

      // Step 2: Create module with the correct, final URLs
      const nextOrder = (selectedChapter?.modules.length || 0) + 1;
      const formattedAttachments = attachmentFiles.map((file, index) => ({
        name: file.name,
        url: finalAttachmentUrls[index], // Use the corresponding uploaded URL
        fileSize: file.size,
        mimeType: file.type,
      }));

      const moduleData = {
        chapterId: chapterIdForAPI,
        title: formData.title.trim(),
        // 'type' is inferred on the backend, but sending it is fine.
        type: formData.type,
        description: formData.description?.trim(),
        duration:
          formData.duration && formData.duration > 0
            ? formData.duration
            : undefined,
        isPreview: formData.isPreview,
        order: nextOrder,
        videoUrl: formData.type === "video" ? finalMainFileUrl : undefined,
        documentUrl:
          formData.type === "document" ? finalMainFileUrl : undefined,

        // Use the new `formattedAttachments` array
        attachments:
          formattedAttachments.length > 0 ? formattedAttachments : undefined,
      };

      console.log("📤 Creating module with data:", moduleData);

      const response = await http.post(
        `/api/courses/${currentCourse.id}/modules`,
        moduleData
      );

      if (response.data.success && response.data.data) {
        console.log("✅ Module created successfully:", response.data.data);

        // Add module to local state with the API-generated data
        const newModuleData = {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          chapterId: selectedChapterId,
          order: response.data?.data?.order || nextOrder,
          duration: formData.duration,
          isPreview: formData.isPreview,
          mainFile: uploadedUrls.mainFileUrl || undefined,
          attachments: uploadedUrls.attachmentUrls,
          backendId: response.data?.data?.id, // Store backend ID for future API calls
        };

        addModule(selectedChapterId, newModuleData);

        resetForm();
        setShowConfirmationModal(false);
        setPendingSubmission(false);
        addToast({
          type: "success",
          message: response.data.message || "Module created successfully!",
        });
      } else {
        console.error("❌ Module creation failed:", response.data);

        addToast({
          type: "error",
          message: response.data.message || "Failed to create module",
        });
        setPendingSubmission(false);
      }
    } catch (error: unknown) {
      console.error("Module creation error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the module.";
      addToast({
        type: "error",
        message: errorMessage,
      });
      setPendingSubmission(false);
      setUploadProgress({
        mainFile: null,
        attachments: {},
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "document", // Default to document, will be auto-detected on file upload
      order: 1,
      duration: 0,
      isPreview: false,
      attachments: [],
    });
    setMainFile(null);
    setAttachmentFiles([]);
    setMainFilePreview(null);
    setUploadProgress({
      mainFile: null,
      attachments: {},
    });
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
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg p-6 border border-gray-700 relative">
        {pendingSubmission && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center z-50">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#0680FF] mx-auto mb-2" />
              <p className="text-white font-medium">Uploading files...</p>
              <p className="text-gray-300 text-sm">
                Please wait while we process your module
              </p>
            </div>
          </div>
        )}
        <h3 className="text-lg font-semibold text-white mb-4">
          Select Chapter to Add Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentCourse.chapters.map((chapter) => {
            const hasModules = chapter.modules && chapter.modules.length > 0;
            return (
              <button
                key={chapter.id}
                onClick={() => setSelectedChapterId(chapter.id)}
                disabled={pendingSubmission}
                className={cn(
                  "p-4 rounded-lg border text-left transition-all duration-300 relative",
                  selectedChapterId === chapter.id
                    ? "border-[#0680FF] bg-[#0680FF]/10"
                    : hasModules
                    ? "border-gray-600 hover:border-gray-500"
                    : "border-red-500/50 bg-red-500/5 hover:border-red-500",
                  pendingSubmission && "opacity-50 cursor-not-allowed"
                )}
              >
                {!hasModules && (
                  <div className="absolute top-2 right-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                )}
                <h4 className="font-semibold text-white mb-1 truncate">
                  {chapter.title}
                </h4>
                <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                  {chapter.description}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs",
                      hasModules ? "text-[#0680FF]" : "text-red-400"
                    )}
                  >
                    {chapter.modules.length} modules
                  </span>
                  {!hasModules && (
                    <span className="text-xs text-red-400 font-medium">
                      Needs modules
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedChapterId && currentChapter && (
        <>
          {/* Module Form */}
          <div className="bg-gradient-to-r from-gray-900/30 to-gray-800/30 rounded-lg p-6 border border-gray-700 relative">
            {pendingSubmission && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center z-50">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0680FF] mx-auto mb-2" />
                  <p className="text-white font-medium">Uploading files...</p>
                  <p className="text-gray-300 text-sm">
                    Please wait while we process your module
                  </p>
                </div>
              </div>
            )}
            <h3 className="text-lg font-semibold text-white mb-6">
              {editingModuleId ? "Edit Module" : "Add New Module"}
              <span className="text-[#0680FF] ml-2">
                - {currentChapter.title}
              </span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Module Title */}
              <div className="relative z-10">
                <label className="block text-white font-medium mb-3">
                  Module Title *
                </label>
                <div className={gradientBorderClass}>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter module title (min 3 characters)"
                    className={inputClass}
                    minLength={3}
                    required
                    disabled={pendingSubmission}
                  />
                </div>
                {errors.title && (
                  <p className="text-red-400 text-sm mt-2">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="relative z-10">
                <label className="block text-white font-medium mb-3">
                  Description
                </label>
                <div className={gradientBorderClass}>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe what this module covers (optional but recommended)"
                    rows={3}
                    className={cn(inputClass, "resize-none")}
                    disabled={pendingSubmission}
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
                <div className="relative z-10">
                  <label className="block text-white font-medium mb-3">
                    Duration (minutes)
                    <span className="text-xs text-gray-400 ml-2">Optional</span>
                  </label>
                  <div className={gradientBorderClass}>
                    <input
                      type="number"
                      value={formData.duration || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "duration",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      min="0"
                      max="600"
                      className={inputClass}
                      disabled={pendingSubmission}
                    />
                  </div>
                  {errors.duration && (
                    <p className="text-red-400 text-sm mt-2">
                      {errors.duration}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Leave as 0 if duration is unknown
                  </p>
                </div>

                <div className="flex items-end relative z-10">
                  <div className="w-full">
                    <label className="block text-white font-medium mb-3">
                      Module Access
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-800/30 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.isPreview}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          handleInputChange("isPreview", isChecked);

                          // Notify user about preview functionality
                          if (isChecked) {
                            addToast({
                              type: "info",
                              message:
                                "💡 Preview modules can be accessed by anyone without purchasing the course. Great for attracting students!",
                            });
                          }
                        }}
                        className="w-5 h-5 text-[#0680FF] bg-[#010519] border border-gray-600 rounded focus:ring-[#0680FF] focus:ring-2"
                        disabled={pendingSubmission}
                      />
                      <div>
                        <span className="text-white font-medium block">
                          Available as Preview
                        </span>
                        <span className="text-xs text-gray-400">
                          Free to watch for everyone
                        </span>
                      </div>
                    </label>
                  </div>
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
                        ) : (
                          <div className="text-center">
                            <FileText className="w-12 h-12 text-[#0680FF] mx-auto mb-2" />
                            <p className="text-white">{mainFile?.name}</p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setMainFilePreview(null);
                            setMainFile(null);
                          }}
                          disabled={pendingSubmission}
                          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mb-2 mx-auto" />
                          <p className="text-gray-400 text-sm">
                            Click to upload main file
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            Max 500MB - Supports videos (MP4, WEBM, OGG, AVI,
                            MOV, WMV) and documents (PDF, DOC, DOCX, PPT, PPTX)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/ogg,video/avi,video/mov,video/mkv,video/wmv,video/quicktime,.mp4,.webm,.ogg,.avi,.mov,.mkv,.wmv,.qt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pdf,.doc,.docx,.ppt,.pptx"
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            handleFileUpload(e.target.files[0], true)
                          }
                          disabled={pendingSubmission}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
                {errors.mainFile && (
                  <p className="text-red-400 text-sm mt-2">{errors.mainFile}</p>
                )}
                {/* Main File Upload Progress Bar */}
                {uploadProgress.mainFile && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Uploading main file...</span>
                      <span>
                        {Math.round(uploadProgress.mainFile.percentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${uploadProgress.mainFile.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-white font-medium mb-3">
                  Attachments (Optional)
                  <span className="text-xs text-gray-400 ml-2">
                    Max 10 files, 500MB each
                  </span>
                </label>
                <div className={cn(gradientBorderClass, "min-h-[100px]")}>
                  <div className="bg-[#010519] rounded-lg p-4">
                    {attachmentFiles.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {attachmentFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-800/50 rounded p-2"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-white text-sm truncate block">
                                {file.name}
                              </span>
                              {/* Attachment Upload Progress Bar */}
                              {uploadProgress.attachments[index] && (
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Uploading...</span>
                                    <span>
                                      {Math.round(
                                        uploadProgress.attachments[index]
                                          .percentage
                                      )}
                                      %
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                                    <div
                                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${uploadProgress.attachments[index].percentage}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              disabled={pendingSubmission}
                              className="text-red-400 hover:text-red-300 flex-shrink-0 ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {attachmentFiles.length <
                      FILE_UPLOAD_LIMITS.moduleAttachment.maxCount && (
                      <label className="cursor-pointer block">
                        <div className="text-center py-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-500 transition-colors">
                          <Upload className="w-6 h-6 text-gray-400 mb-2 mx-auto" />
                          <p className="text-gray-400 text-sm">
                            Click to add attachment files
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            Documents and images allowed
                          </p>
                        </div>
                        <input
                          type="file"
                          multiple
                          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/*"
                          onChange={(e) => {
                            Array.from(e.target.files || []).forEach((file) =>
                              handleFileUpload(file, false)
                            );
                            // Clear the input so the same file can be selected again if needed
                            e.target.value = "";
                          }}
                          disabled={pendingSubmission}
                          className="hidden"
                        />
                      </label>
                    )}

                    {attachmentFiles.length >=
                      FILE_UPLOAD_LIMITS.moduleAttachment.maxCount && (
                      <div className="text-center py-4">
                        <p className="text-yellow-400 text-sm">
                          Maximum {FILE_UPLOAD_LIMITS.moduleAttachment.maxCount}{" "}
                          attachments reached
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {errors.attachments && (
                  <p className="text-red-400 text-sm mt-2">
                    {errors.attachments}
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={pendingSubmission}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0680FF] to-[#022ED2] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pendingSubmission && !editingModuleId ? (
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
                    disabled={pendingSubmission}
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
                    className="bg-gradient-to-r from-gray-900/40 to-gray-800/40 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-[#0680FF]">
                            {getModuleIcon(module.type)}
                          </div>
                          <span className="text-sm font-medium text-[#0680FF] bg-[#0680FF]/10 px-2 py-1 rounded">
                            #{module.order}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 min-w-0">
                            <h4 className="font-semibold text-white truncate min-w-0 flex-1">
                              {module.title}
                            </h4>
                            {module.isPreview && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded flex-shrink-0 whitespace-nowrap">
                                Preview
                              </span>
                            )}
                          </div>
                          <p
                            className="text-gray-400 text-sm mb-2 overflow-hidden break-words"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                            }}
                          >
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
                      {/* Edit/Delete buttons removed - only available in My Products section after creation */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="space-y-4">
        {/* Validation warning if needed */}
        {(() => {
          const validation = validateChapterModules();
          if (!validation.isValid) {
            return (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-400 font-medium text-sm">
                    Warning: Missing Modules
                  </p>
                  <p className="text-yellow-300 text-sm mt-1">
                    {validation.message}
                  </p>
                </div>
              </div>
            );
          }
          return null;
        })()}

        <div className="flex justify-end pt-2">
          {/* Continue to Review Button with Tooltip */}
          <div className="relative group">
            <button
              onClick={handleContinueToReview}
              className={cn(
                "flex items-center gap-2 px-8 py-3 font-medium rounded-lg transition-all duration-300",
                validateChapterModules().isValid
                  ? "bg-gradient-to-r from-[#0680FF] to-[#022ED2] text-white hover:shadow-lg hover:shadow-blue-500/25"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed",
                pendingSubmission && "opacity-50 cursor-not-allowed"
              )}
              disabled={!validateChapterModules().isValid || pendingSubmission}
            >
              Continue to Review
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Tooltip for disabled state */}
            {!validateChapterModules().isValid && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 min-w-max max-w-xs">
                <div className="text-center">
                  <p className="font-medium text-red-400 mb-1">
                    Cannot Continue
                  </p>
                  <p className="text-gray-300">
                    {validateChapterModules().message}
                  </p>
                </div>
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
        }}
        onConfirm={handleConfirmSubmission}
        title="Create Module"
        message="Are you sure you want to create this module? Once created, you'll be able to edit the content but the module structure will be saved to your course."
        confirmText="Create Module"
        isLoading={pendingSubmission}
      />
    </div>
  );
};

export default ModuleCreationForm;
