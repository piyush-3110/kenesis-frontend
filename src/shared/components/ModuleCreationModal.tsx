"use client";

import React, { useState, useRef } from "react";
import { X, Upload, Video, FileText, Save, Loader2 } from "lucide-react";
import { DASHBOARD_COLORS } from "@/app/dashboard/constants";
import { uploadFile, UploadProgress } from "@/lib/uploadService";

// The new data contract for the parent
interface ModuleSubmitData {
  id?: string;
  chapterId: string;
  title: string;
  description?: string;
  order?: number;
  duration?: number;
  isPreview: boolean;
  videoUrl?: string;
  documentUrl?: string;
  attachments?: {
    name: string;
    url: string;
    fileSize: number;
    mimeType: string;
  }[];
}

interface ModuleCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (moduleData: ModuleSubmitData) => Promise<boolean>;
  chapters: Array<{ id: string; title: string }>;
  selectedChapterId?: string;
  loading?: boolean;
  editingModule?: ModuleSubmitData & { id?: string };
  isEditing?: boolean;
}

interface ModuleFormData {
  chapterId: string;
  title: string;
  description?: string;
  order?: number;
  duration?: number;
  isPreview: boolean;
  mainFile?: File;
  attachments?: File[];
  id?: string;
}

/**
 * Shared Module Creation/Edit Modal
 * Can be used in both /dashboard/products and /dashboard/my-products
 * Supports both creating new modules and editing existing ones
 * Follows the backend API specification for multipart/form-data uploads
 */
const ModuleCreationModal: React.FC<ModuleCreationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  chapters,
  selectedChapterId,
  loading = false,
  editingModule,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<ModuleFormData>({
    chapterId: selectedChapterId || "",
    title: "",
    description: "",
    order: undefined,
    duration: undefined,
    isPreview: false,
    mainFile: undefined,
    attachments: [],
  });

  // Initialize form data when editing
  React.useEffect(() => {
    if (isEditing && editingModule) {
      setFormData({
        id: editingModule.id,
        chapterId: editingModule.chapterId || selectedChapterId || "",
        title: editingModule.title || "",
        description: editingModule.description || "",
        order: editingModule.order,
        duration: editingModule.duration,
        isPreview: editingModule.isPreview || false,
        mainFile: undefined, // Files need to be re-uploaded for edits
        attachments: [],
      });
    } else {
      setFormData({
        chapterId: selectedChapterId || "",
        title: "",
        description: "",
        order: undefined,
        duration: undefined,
        isPreview: false,
        mainFile: undefined,
        attachments: [],
      });
    }
  }, [isEditing, editingModule, selectedChapterId]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState<{
    mainFile: UploadProgress | null;
    attachments: (UploadProgress | null)[];
  }>({
    mainFile: null,
    attachments: [],
  });
  const [isUploading, setIsUploading] = useState(false);
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!formData.chapterId.trim()) {
      newErrors.chapterId = "Chapter is required";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title cannot exceed 200 characters";
    }

    // Optional field validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Description cannot exceed 1000 characters";
    }

    if (formData.order && formData.order < 1) {
      newErrors.order = "Order must be at least 1";
    }

    if (formData.duration && formData.duration < 0) {
      newErrors.duration = "Duration must be non-negative";
    }

    // File validation - only required for new modules
    if (formData.mainFile) {
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (formData.mainFile.size > maxSize) {
        newErrors.mainFile = "File size exceeds 500MB limit";
      }

      // Basic file type validation - accept both video and document files
      const allowedTypes = [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(formData.mainFile.type)) {
        newErrors.mainFile =
          "Please select a valid file (MP4, WebM, OGG, PDF, DOC, DOCX)";
      }
    } else if (!isEditing) {
      // Main file is required only for new modules
      newErrors.mainFile = "Main file is required";
    }

    // Attachment validation (max 10 files)
    if (formData.attachments && formData.attachments.length > 10) {
      newErrors.attachments = "Maximum 10 attachments allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);
    try {
      // --- New S3 Upload Logic ---
      let finalMainFileUrl: string | undefined;
      let finalAttachments: any[] = [];

      // 1. Upload main file if it exists
      if (formData.mainFile) {
        const moduleType = formData.mainFile.type.startsWith("video/")
          ? "video"
          : "document";
        const folder =
          moduleType === "video" ? "module-videos" : "module-documents";
        const result = await uploadFile(
          formData.mainFile,
          folder,
          (progress) => {
            setUploadProgress((prev) => ({ ...prev, mainFile: progress }));
          }
        );
        finalMainFileUrl = result.url;
      }

      // 2. Upload attachments concurrently
      if (formData.attachments && formData.attachments.length > 0) {
        const attachmentUploadPromises = formData.attachments.map(
          (file, index) =>
            uploadFile(file, "module-attachments", (progress) => {
              setUploadProgress((prev) => {
                const newAttachmentProgress = [...prev.attachments];
                newAttachmentProgress[index] = progress;
                return { ...prev, attachments: newAttachmentProgress };
              });
            })
        );
        const attachmentResults = await Promise.all(attachmentUploadPromises);
        finalAttachments = formData.attachments.map((file, index) => ({
          name: file.name,
          url: attachmentResults[index].url,
          fileSize: file.size,
          mimeType: file.type,
        }));
      }

      setIsUploading(false);

      // 3. Prepare final data payload with URLs
      const moduleSubmitData: ModuleSubmitData = {
        id: formData.id,
        chapterId: formData.chapterId,
        title: formData.title,
        description: formData.description,
        order: formData.order,
        duration: formData.duration,
        isPreview: formData.isPreview,
        attachments: finalAttachments.length > 0 ? finalAttachments : undefined,
      };

      // Add videoUrl or documentUrl based on the main file type
      if (finalMainFileUrl) {
        if (formData.mainFile?.type.startsWith("video/")) {
          moduleSubmitData.videoUrl = finalMainFileUrl;
        } else {
          moduleSubmitData.documentUrl = finalMainFileUrl;
        }
      }

      // 4. Call the parent's onSubmit with the final data
      const success = await onSubmit(moduleSubmitData);
      if (success) {
        handleClose();
      }
    } catch (error) {
      console.error("Failed to upload files or submit module:", error);
      // You should show an error toast here
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setUploadProgress({ mainFile: null, attachments: [] });
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !loading) {
      if (isEditing && editingModule) {
        setFormData({
          id: editingModule.id,
          chapterId: editingModule.chapterId || selectedChapterId || "",
          title: editingModule.title || "",
          description: editingModule.description || "",
          order: editingModule.order,
          duration: editingModule.duration,
          isPreview: editingModule.isPreview || false,
          mainFile: undefined,
          attachments: [],
        });
      } else {
        setFormData({
          chapterId: selectedChapterId || "",
          title: "",
          description: "",
          order: undefined,
          duration: undefined,
          isPreview: false,
          mainFile: undefined,
          attachments: [],
        });
      }
      setErrors({});
      onClose();
    }
  };

  const handleMainFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, mainFile: file }));
      setErrors((prev) => ({ ...prev, mainFile: "" }));
    }
  };

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...files].slice(0, 10),
      }));
      setErrors((prev) => ({ ...prev, attachments: "" }));
    }
  };

  const removeMainFile = () => {
    setFormData((prev) => ({ ...prev, mainFile: undefined }));
    if (mainFileInputRef.current) {
      mainFileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index),
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-4xl rounded-2xl shadow-2xl max-h-[100vh] overflow-hidden"
        style={{
          background: DASHBOARD_COLORS.CARD_BG,
          border: `1px solid ${
            DASHBOARD_COLORS.PRIMARY_BORDER.replace(
              "linear-gradient(90deg, ",
              ""
            )
              .replace(" 0%, ", "")
              .replace(" 100%)", "")
              .split(" ")[0]
          }`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">
              {isEditing ? "Edit Module" : "Create Module"}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {isEditing
                ? "Update module information and content"
                : "Add a new module to your course"}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting || loading}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[65vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Basic Information
              </h3>

              {/* Chapter Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chapter <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.chapterId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      chapterId: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50"
                  required
                  disabled={isSubmitting || loading}
                >
                  <option value="">Select a chapter</option>
                  {chapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.title}
                    </option>
                  ))}
                </select>
                {errors.chapterId && (
                  <p className="mt-1 text-red-400 text-sm">
                    {errors.chapterId}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Module Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50"
                  placeholder="Enter module title"
                  maxLength={200}
                  required
                  disabled={isSubmitting || loading}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    3-200 characters required
                  </span>
                  <span className="text-xs text-gray-500">
                    {formData.title.length}/200
                  </span>
                </div>
                {errors.title && (
                  <p className="mt-1 text-red-400 text-sm">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50"
                  rows={3}
                  placeholder="Enter module description (optional)"
                  maxLength={1000}
                  disabled={isSubmitting || loading}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    Optional - describe what this module covers
                  </span>
                  <span className="text-xs text-gray-500">
                    {(formData.description || "").length}/1000
                  </span>
                </div>
                {errors.description && (
                  <p className="mt-1 text-red-400 text-sm">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Module Settings Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Module Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Order
                  </label>
                  <input
                    type="text"
                    value={formData.order || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d+$/.test(value)) {
                        setFormData((prev) => ({
                          ...prev,
                          order: value ? parseInt(value) : undefined,
                        }));
                      }
                    }}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50"
                    placeholder="Auto-assign"
                    disabled={isSubmitting || loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for automatic ordering
                  </p>
                  {errors.order && (
                    <p className="mt-1 text-red-400 text-sm">{errors.order}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="text"
                    value={formData.duration || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d+$/.test(value)) {
                        setFormData((prev) => ({
                          ...prev,
                          duration: value ? parseInt(value) : undefined,
                        }));
                      }
                    }}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50"
                    placeholder="Optional"
                    disabled={isSubmitting || loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Estimated duration for completion
                  </p>
                  {errors.duration && (
                    <p className="mt-1 text-red-400 text-sm">
                      {errors.duration}
                    </p>
                  )}
                </div>

                <div className="flex flex-col justify-center">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Module Options
                  </label>
                  <label className="flex items-center gap-3 text-white bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isPreview}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isPreview: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      disabled={isSubmitting || loading}
                    />
                    <span className="text-sm">Preview Module</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Allow free preview access
                  </p>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Content Files
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main File */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Main Content File{" "}
                    {!isEditing && <span className="text-red-400">*</span>}
                    {isEditing && (
                      <span className="text-gray-400 text-sm ml-2">
                        (leave empty to keep existing)
                      </span>
                    )}
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors cursor-pointer bg-gray-800/50"
                    onClick={() => mainFileInputRef.current?.click()}
                  >
                    {formData.mainFile ? (
                      <div className="flex items-center gap-3 justify-center">
                        <FileText size={24} className="text-blue-400" />
                        <div className="flex-1 text-left">
                          <p className="text-white text-sm font-medium">
                            {formData.mainFile.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {formatFileSize(formData.mainFile.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMainFile();
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        <Upload size={32} className="mx-auto mb-3" />
                        <p className="text-sm font-medium">
                          Click to upload content file
                          {isEditing &&
                            " (optional - will replace existing file)"}
                        </p>
                        <p className="text-xs mt-1">
                          Max 500MB • Supported: MP4, WebM, OGG, PDF, DOC, DOCX
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={mainFileInputRef}
                    type="file"
                    className="hidden"
                    accept="video/*,.pdf,.doc,.docx"
                    onChange={handleMainFileSelect}
                    disabled={isSubmitting || loading}
                  />
                  {/* Upload Progress Bar */}
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
                  {errors.mainFile && (
                    <p className="mt-1 text-red-400 text-sm">
                      {errors.mainFile}
                    </p>
                  )}
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Files{" "}
                    <span className="text-gray-500">(Optional)</span>
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors cursor-pointer bg-gray-800/50"
                    onClick={() => attachmentInputRef.current?.click()}
                  >
                    <Upload size={32} className="mx-auto mb-3 text-gray-400" />
                    <p className="text-sm font-medium text-gray-400">
                      Click to upload attachments
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Max 10 files • PDF, DOC, DOCX, JPG, PNG
                    </p>
                  </div>
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleAttachmentSelect}
                    disabled={isSubmitting || loading}
                  />

                  {/* Attachment List */}
                  {formData.attachments && formData.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between bg-gray-800 border border-gray-600 rounded-lg p-3">
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium truncate">
                                {file.name}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-400 hover:text-red-300 transition-colors ml-3"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          {/* Upload Progress Bar for each attachment */}
                          {uploadProgress.attachments[index] && (
                            <div className="px-3">
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Uploading...</span>
                                <span>
                                  {Math.round(
                                    uploadProgress.attachments[index]!
                                      .percentage
                                  )}
                                  %
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${
                                      uploadProgress.attachments[index]!
                                        .percentage
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.attachments && (
                    <p className="mt-1 text-red-400 text-sm">
                      {errors.attachments}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="text-sm text-gray-400">
            {isEditing && (
              <span className="text-blue-400">Editing existing module</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting || loading}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || loading || isUploading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Uploading Files...</span>
                </>
              ) : isSubmitting || loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">
                    {isEditing ? "Updating..." : "Creating..."}
                  </span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  {isEditing ? "Update Module" : "Create Module"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleCreationModal;
