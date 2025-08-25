"use client";

import React, { useState, useEffect } from "react";
import {
  Video,
  FileText,
  Edit2,
  Trash2,
  Download,
  Eye,
  Filter,
  ChevronDown,
  Plus,
  X,
  Upload,
  Loader2,
} from "lucide-react";
import { CourseAPI } from "@/lib/api";
import { useToastMessages } from "@/hooks/useToastMessages";
import { Module } from "@/types/Product";
import ModuleItem from "../../components/ModuleItem";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import ModuleCreateModal from "./ModuleCreateModal";
interface ModuleManagementSectionProps {
  courseId: string;
  chapters: any[];
  canEdit: boolean;
}

interface ModuleFilters {
  status?: "draft" | "published";
  type?: "video" | "document";
  includeUnpublished?: boolean;
  sortBy?: "order" | "createdAt" | "title";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  includeStats?: boolean;
}

/**
 * Module Management Section
 * Handles module viewing, creation, editing, and deletion
 * Integrated with backend API following the controller specifications
 * Refactored to use production-grade component structure
 */
const ModuleManagementSection: React.FC<ModuleManagementSectionProps> = ({
  courseId,
  chapters,
  canEdit,
}) => {
  const { messages, showError, showSuccess } = useToastMessages();
  const [modules, setModules] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    module: any | null;
  }>({ isOpen: false, module: null });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState<ModuleFilters>({
    includeStats: true,
    sortBy: "order",
    sortOrder: "asc",
    limit: 20,
  });

  const formatTotalDuration = (totalMinutes: number): string => {
    if (!totalMinutes || totalMinutes <= 0) return "0m";
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${totalMinutes}m`;
  };

  // Initialize selected chapter with first available chapter
  useEffect(() => {
    if (chapters.length > 0 && !selectedChapter) {
      setSelectedChapter(chapters[0].id);
    }
  }, [chapters, selectedChapter]);

  // Load modules when filters or selected chapter changes
  useEffect(() => {
    if (selectedChapter) {
      if (selectedChapter === "all") {
        loadAllModules();
      } else {
        loadModulesForChapter(selectedChapter);
      }
    }
  }, [selectedChapter, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadModulesForChapter = async (chapterId: string) => {
    setLoading(true);
    try {
      console.log("🔍 Loading modules for chapter:", chapterId);

      const response = await CourseAPI.getModulesForChapter(
        courseId,
        chapterId,
        {
          ...filters,
          includeStats: true
        }
      );

      if (response.success && response.data) {
        setModules(response.data.modules || []);
        setStats(response.data.stats || null);
        console.log("✅ Modules loaded:", response.data.modules?.length || 0);
      } else {
        console.error("❌ Failed to load modules:", response.message);
        setModules([]);
        setStats(null);
      }
    } catch (error: any) {
      console.error("💥 Error loading modules:", error);
      setModules([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const loadAllModules = async () => {
    setLoading(true);
    try {
      console.log("🔍 Loading all modules across chapters");

      // Load modules from all chapters
      const allModules: any[] = [];
      const chapterPromises = chapters.map(async (chapter) => {
        try {
          const response = await CourseAPI.getModulesForChapter(
            courseId,
            chapter.id,
            {
              ...filters,
              includeStats: false // Don't include stats for individual chapter calls
            }
          );

          if (response.success && response.data?.modules) {
            // Add chapter info to each module
            const modulesWithChapter = response.data.modules.map(
              (module: any) => ({
                ...module,
                chapterId: chapter.id,
                chapterTitle: chapter.title,
              })
            );
            return modulesWithChapter;
          }
          return [];
        } catch (error) {
          console.error(
            `Failed to load modules for chapter ${chapter.title}:`,
            error
          );
          return [];
        }
      });

      const chapterModules = await Promise.all(chapterPromises);
      chapterModules.forEach((modules) => allModules.push(...modules));

      // Apply filters and sorting
      let filteredModules = allModules;

      if (filters.type) {
        filteredModules = filteredModules.filter(
          (module) => module.type === filters.type
        );
      }

      if (filters.status) {
        filteredModules = filteredModules.filter((module) => {
          if (filters.status === "published") return module.isPublished;
          if (filters.status === "draft") return !module.isPublished;
          return true;
        });
      }

      // Sort modules
      filteredModules.sort((a, b) => {
        const field = filters.sortBy || "order";
        const order = filters.sortOrder === "desc" ? -1 : 1;

        if (field === "order") return (a.order - b.order) * order;
        if (field === "title")
          return a.title.localeCompare(b.title) * order;
        if (field === "createdAt")
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ) * order;
        return 0;
      });

      setModules(filteredModules);

      // Generate stats
      const totalStats = {
        totalModules: allModules.length,
        videoModules: allModules.filter((m) => m.type === "video").length,
        documentModules: allModules.filter((m) => m.type === "document")
          .length,
        publishedModules: allModules.filter((m) => m.isPublished).length,
        totalDuration: allModules.reduce(
          (sum, module) => sum + (module.duration || 0),
          0
        ),
      };
      setStats(totalStats);

      console.log("✅ All modules loaded:", filteredModules.length);
    } catch (error) {
      console.error("Error loading all chapters modules:", error);
      setModules([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (module: any) => {
    try {
      const response = await CourseAPI.deleteModule(
        courseId,
        module.id,
        true // Use hard delete
      );

      if (response.success) {
        console.log("✅ Module deleted successfully (hard delete)");
        messages.moduleDeleted(module.title);
        // Reload modules
        if (selectedChapter === "all") {
          loadAllModules();
        } else {
          loadModulesForChapter(selectedChapter);
        }
      } else {
        console.error("❌ Failed to delete module:", response.message);
        showError(response.message || "Failed to delete module");
      }
    } catch (error) {
      console.error("Failed to delete module:", error);
      showError("Failed to delete module");
    }
  };

  const handleEditModule = (moduleId: string) => {
    // Implementation for module editing would go here
    console.log("Edit module:", moduleId);
    // For now, just log. In production, this would open an edit modal
  };

  const handleCreateModule = async (moduleData: any) => {
    try {
      console.log("Creating module with data:", moduleData);
      
      // Prepare module data for the API in the new format
      const modulePayload = {
        chapterId: moduleData.chapterId,
        title: moduleData.title,
        description: moduleData.description,
        type: moduleData.type,
        isPreview: moduleData.isPreview || false,
        duration: moduleData.duration && moduleData.duration > 0 ? moduleData.duration : undefined,
        order: moduleData.order || undefined,
        mainFile: moduleData.mainFile || undefined,
        attachments: moduleData.attachments || undefined
      };
      
      const response = await CourseAPI.createModule(courseId, modulePayload);
      
      if (response.success) {
        console.log("✅ Module created successfully");
        showSuccess(`Module "${moduleData.title}" created successfully`);
        // Reload modules after successful creation
        if (selectedChapter === "all") {
          loadAllModules();
        } else {
          loadModulesForChapter(selectedChapter);
        }
        setIsCreateModalOpen(false);
        return true;
      } else {
        console.error("❌ Failed to create module:", response.message);
        showError(response.message || "Failed to create module");
        return false;
      }
    } catch (error) {
      console.error("💥 Error creating module:", error);
      showError("Failed to create module");
      return false;
    }
  };

  // Get available chapters for filter dropdown
  const availableChapters = [
    { id: "all", title: "All Chapters" },
    ...chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
    })),
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700/50 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-800/30 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Module Management</h2>
          <p className="text-gray-400 text-sm">
            View and manage course modules across all chapters
          </p>        {/* Debug info */}
        <p className="text-xs text-yellow-400 mt-1">
          Debug: canEdit = {canEdit ? 'TRUE' : 'FALSE'}, chapters = {chapters.length}
        </p>
      </div>
      {canEdit && (
        <button
          onClick={() => {
            console.log("Add Module clicked - chapters available:", chapters.length);
            setIsCreateModalOpen(true);
          }}
          disabled={chapters.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          title={chapters.length === 0 ? "Create a chapter first before adding modules" : "Add a new module"}
        >
          <Plus size={16} />
          Add Module
        </button>
      )}
      </div>

      {/* No Chapters Warning */}
      {chapters.length === 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <div className="text-red-500 mt-0.5 flex-shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1 .53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-red-400 font-medium">No Chapters Available</h4>
            <p className="text-red-300 text-sm mt-1">
              You need to create at least one chapter before you can add modules. Please go to the Chapters tab and create a chapter first.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800/30 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Chapter Filter */}
          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm font-medium">Chapter:</label>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              {availableChapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm font-medium">Type:</label>
            <select
              value={filters.type || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  type: e.target.value as "video" | "document" | undefined,
                })
              }
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm font-medium">Status:</label>
            <select
              value={filters.status || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value as "draft" | "published" | undefined,
                })
              }
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm font-medium">Sort:</label>
            <select
              value={filters.sortBy || "order"}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  sortBy: e.target.value as "order" | "createdAt" | "title",
                })
              }
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="order">Order</option>
              <option value="title">Title</option>
              <option value="createdAt">Created Date</option>
            </select>
          </div>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="flex items-center gap-6 text-sm text-gray-400 pt-2 border-t border-gray-700">
            <span>Total: {stats.totalModules}</span>
            {stats.videoModules !== undefined && (
              <span>Video: {stats.videoModules}</span>
            )}
            {stats.documentModules !== undefined && (
              <span>Document: {stats.documentModules}</span>
            )}
            {stats.publishedModules !== undefined && (
              <span>Published: {stats.publishedModules}</span>
            )}
            {stats.totalDuration !== undefined && stats.totalDuration > 0 && (
              <span>Duration: {formatTotalDuration(stats.totalDuration)}</span>
            )}
          </div>
        )}
      </div>

      {/* No Modules State */}
      {modules.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-800/20 rounded-lg">
          <Video className="mx-auto mb-4 text-gray-500" size={48} />
          <h3 className="text-lg font-medium text-white mb-2">No Modules Found</h3>
          <p className="text-gray-400">
            {selectedChapter === "all"
              ? "No modules match the current filters across all chapters."
              : "No modules found in the selected chapter with current filters."}
          </p>
        </div>
      )}

      {/* Modules List */}
      {modules.length > 0 && (
        <div className="space-y-4">
          {modules.map((module) => (
            <ModuleItem
              key={module.id}
              module={module}
              courseId={courseId}
              chapterId={module.chapterId || selectedChapter}
              canEdit={canEdit}
              onEdit={handleEditModule}
              onDelete={() => setDeleteConfirmation({ isOpen: true, module })}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {modules.length > 0 &&
        stats &&
        stats.totalModules > (filters.limit || 20) && (
          <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">
              Showing {((filters.page || 1) - 1) * (filters.limit || 20) + 1}-
              {Math.min(
                (filters.page || 1) * (filters.limit || 20),
                stats.totalModules
              )}{" "}
              of {stats.totalModules} modules
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setFilters({ ...filters, page: (filters.page || 1) - 1 })
                }
                disabled={(filters.page || 1) <= 1}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm"
              >
                Previous
              </button>
              <span className="text-gray-400 text-sm">
                Page {filters.page || 1} of{" "}
                {Math.ceil(stats.totalModules / (filters.limit || 20))}
              </span>
              <button
                onClick={() =>
                  setFilters({ ...filters, page: (filters.page || 1) + 1 })
                }
                disabled={
                  (filters.page || 1) >=
                  Math.ceil(stats.totalModules / (filters.limit || 20))
                }
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteConfirmation.isOpen}
          onClose={() => setDeleteConfirmation({ isOpen: false, module: null })}
          onConfirm={() => {
            if (deleteConfirmation.module) {
              handleDeleteModule(deleteConfirmation.module);
            }
          }}
          title="Delete Module"
          message={`Are you sure you want to delete the module "${deleteConfirmation.module?.title}"? This action cannot be undone.`}
          confirmText="Delete Module"
          type="warning"
          confirmButtonVariant="danger"
        />

        {/* Create Module Modal */}
        {isCreateModalOpen && (
          <CreateModuleModal
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateModule}
            chapters={chapters}
            courseId={courseId}
          />
        )}
    </div>
  );
};

// Create Module Modal Component - Following course creation design pattern
const CreateModuleModal: React.FC<{
  onClose: () => void;
  onSave: (data: any) => Promise<boolean>;
  chapters: any[];
  courseId: string;
}> = ({ onClose, onSave, chapters, courseId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    chapterId: chapters.length > 0 ? chapters[0].id : '',
    type: 'video' as 'video' | 'document',
    duration: 0,
    isPreview: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Module title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Module title must be at least 3 characters';
    }

    if (!formData.chapterId) {
      newErrors.chapterId = 'Please select a chapter';
    }

    if (formData.duration < 0) {
      newErrors.duration = 'Duration cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Blue gradient design matching course creation
  const inputClass = "w-full px-4 py-3 bg-[#010519] border border-transparent bg-clip-padding rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-transparent focus:ring-0 transition-all duration-300";
  const gradientBorderClass = "bg-gradient-to-r from-[#0680FF] to-[#022ED2] p-[2px] rounded-lg";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-r from-gray-900/95 to-gray-800/95 rounded-2xl p-8 w-full max-w-2xl border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Add New Module</h2>
            <p className="text-gray-400 text-sm mt-1">Create a new module for your course</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Chapter Selection */}
          <div>
            <label className="block text-white font-medium mb-3">
              Select Chapter *
            </label>
            <div className={gradientBorderClass}>
              <select
                value={formData.chapterId}
                onChange={(e) => handleInputChange('chapterId', e.target.value)}
                className={inputClass}
                required
              >
                <option value="">Choose a chapter...</option>
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id} className="bg-[#010519] text-white">
                    {chapter.title} ({chapter.moduleCount || 0} modules)
                  </option>
                ))}
              </select>
            </div>
            {errors.chapterId && (
              <p className="text-red-400 text-sm mt-2">{errors.chapterId}</p>
            )}
          </div>

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
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter module title (min 3 characters)"
                  className={inputClass}
                  required
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
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="video" className="bg-[#010519] text-white">Video</option>
                  <option value="document" className="bg-[#010519] text-white">Document</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-medium mb-3">
              Description
            </label>
            <div className={gradientBorderClass}>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this module covers (optional but recommended)"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Duration and Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-3">
                Duration (minutes)
                <span className="text-xs text-gray-400 ml-2">Optional</span>
              </label>
              <div className={gradientBorderClass}>
                <input
                  type="number"
                  value={formData.duration || ''}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  max="600"
                  className={inputClass}
                />
              </div>
              {errors.duration && (
                <p className="text-red-400 text-sm mt-2">{errors.duration}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Leave as 0 if duration is unknown
              </p>
            </div>

            <div className="flex items-end">
              <div className="w-full">
                <label className="block text-white font-medium mb-3">
                  Module Access
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-800/30 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isPreview}
                    onChange={(e) => handleInputChange('isPreview', e.target.checked)}
                    className="w-5 h-5 text-[#0680FF] bg-[#010519] border border-gray-600 rounded focus:ring-[#0680FF] focus:ring-2"
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

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0680FF] to-[#022ED2] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Module
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuleManagementSection;
