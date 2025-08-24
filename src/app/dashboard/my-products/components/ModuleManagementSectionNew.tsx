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
} from "lucide-react";
import { CourseAPI } from "@/lib/api";
import { Module } from "@/types/Product";
import ModuleItem from "./ModuleItem";
import { useModuleFetch } from "../hooks/useModuleFetch";
import ModuleEditModal from "../[id]/components/ModuleEditModal";
import { useUIStore } from "@/store/useUIStore";
import DeleteModuleModal from "./DeleteModuleModal";

interface ModuleManagementSectionProps {
  courseId: string;
  chapters: any[];
  canEdit: boolean;
}

interface ModuleFilters {
  status?: "draft" | "published";
  type?: "video" | "document";
  sortBy?: "order" | "createdAt" | "title";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  includeStats?: boolean;
}

/**
 * Module Management Section
 * Handles module viewing, creation, editing, and deletion
 * Uses the correct backend API following GET /api/courses/:id/modules specifications
 * Refactored to use production-grade component structure with proper API integration
 */
const ModuleManagementSection: React.FC<ModuleManagementSectionProps> = ({
  courseId,
  chapters,
  canEdit,
}) => {
  const { addToast } = useUIStore();
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [filters, setFilters] = useState<ModuleFilters>({
    includeStats: true,
    sortBy: "order",
    sortOrder: "asc",
    limit: 20,
  });
  const [allModules, setAllModules] = useState<any[]>([]);
  
  // Modal states for editing
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedModuleForEdit, setSelectedModuleForEdit] = useState<any>(null);
  
  // Modal states for deletion
  const [deletingModule, setDeletingModule] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Use the new module fetch hook for the selected chapter
  const {
    modules: chapterModules,
    stats: chapterStats,
    pagination,
    loading: chapterLoading,
    error: chapterError,
    refetch: refetchChapterModules,
  } = useModuleFetch({
    courseId,
    chapterId: selectedChapter,
    filters: selectedChapter && selectedChapter !== "all" ? filters : undefined,
  });

  // Initialize selected chapter with first available chapter
  useEffect(() => {
    if (chapters.length > 0 && !selectedChapter) {
      setSelectedChapter(chapters[0].id);
    }
  }, [chapters, selectedChapter]);

  // Load all modules when "all" is selected
  useEffect(() => {
    if (selectedChapter === "all") {
      loadAllModules();
    } else if (selectedChapter && selectedChapter !== "all") {
      // Clear all modules when switching to a specific chapter
      setAllModules([]);
    }
  }, [selectedChapter, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAllModules = async () => {
    try {
      console.log("🔍 Loading all modules across chapters using new API");

      const allModulesData: any[] = [];
      const chapterPromises = chapters.map(async (chapter) => {
        try {
          const response = await CourseAPI.getModules(courseId, {
            chapterId: chapter.id,
            ...filters,
            includeStats: false, // We'll calculate stats client-side
          });

          if (response.success && response.data?.modules) {
            // Add chapter info to each module
            const modulesWithChapter = response.data.modules.map(
              (module: any) => ({
                ...module,
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

      const chapterModulesArray = await Promise.all(chapterPromises);
      chapterModulesArray.forEach((modules) => allModulesData.push(...modules));

      // Apply client-side filtering and sorting
      let filteredModules = allModulesData;

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
        if (field === "title") return a.title.localeCompare(b.title) * order;
        if (field === "createdAt")
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ) * order;
        return 0;
      });

      setAllModules(filteredModules);
      console.log("✅ All modules loaded:", filteredModules.length);
    } catch (error) {
      console.error("Error loading all modules:", error);
      setAllModules([]);
    }
  };

  // Determine which modules and stats to display
  const displayModules = selectedChapter === "all" ? allModules : chapterModules;
  const displayStats = selectedChapter === "all" 
    ? {
        totalModules: allModules.length,
        videoModules: allModules.filter((m) => m.type === "video").length,
        documentModules: allModules.filter((m) => m.type === "document").length,
        publishedModules: allModules.filter((m) => m.isPublished).length,
        totalDuration: allModules.reduce(
          (sum, module) => sum + (module.duration || 0),
          0
        ),
      }
    : chapterStats;
  
  const displayLoading = selectedChapter === "all" ? false : chapterLoading;
  const displayError = selectedChapter === "all" ? null : chapterError;

  const handleDeleteModule = async (module: any) => {
    setDeletingModule(module);
  };

  const confirmDeleteModule = async (force: boolean = false) => {
    if (!deletingModule) return;
    
    try {
      setDeleteLoading(true);
      console.log('🗑️ Starting module deletion process...');
      console.log('📊 Module deletion details:');
      console.log('  Course ID:', courseId);
      console.log('  Module ID:', deletingModule.id);
      console.log('  Module Title:', deletingModule.title);
      console.log('  Module Type:', deletingModule.type);
      console.log('  Chapter ID:', deletingModule.chapterId || selectedChapter);
      console.log('  Force Delete:', force);
      
      // Use the correct API signature: CourseAPI.deleteModule(courseId, moduleId, force)
      const response = await CourseAPI.deleteModule(
        courseId,
        deletingModule.id,
        force
      );

      console.log('📥 Module deletion response received:');
      console.log('  Success:', response.success);
      console.log('  Message:', response.message);
      console.log('  Response data:', JSON.stringify(response.data, null, 2));

      if (response.success) {
        console.log("✅ Module deleted successfully!");
        console.log("🗑️ Deleted module details:");
        console.log("  Module ID:", response.data?.moduleId);
        console.log("  Deleted at:", response.data?.deletedAt);
        console.log("  Force delete:", response.data?.force);
        
        addToast({
          type: "success",
          message: response.message || "Module deleted successfully!"
        });
        
        // Close modal and reset state
        setDeletingModule(null);
        
        // Reload modules
        if (selectedChapter === "all") {
          loadAllModules();
        } else {
          refetchChapterModules();
        }
      } else {
        console.error("❌ Module deletion failed:");
        console.error("  Error message:", response.message);
        console.error("  Full response:", JSON.stringify(response, null, 2));
        
        addToast({
          type: "error",
          message: response.message || "Failed to delete module"
        });
      }
    } catch (error: any) {
      console.error("💥 Module deletion error occurred:");
      console.error("  Error type:", error.name);
      console.error("  Error message:", error.message);
      console.error("  Error stack:", error.stack);
      
      if (error.response) {
        console.error("  Response status:", error.response.status);
        console.error("  Response data:", JSON.stringify(error.response.data, null, 2));
        console.error("  Response headers:", error.response.headers);
      }
      
      // Extract meaningful error message from the backend response
      let errorMessage = 'Failed to delete module';
      
      if (error.response?.data?.message) {
        // Backend returned structured error with message
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        // Alternative error field
        errorMessage = error.response.data.error;
      } else if (error.message && !error.message.includes('Request failed with status code')) {
        // Use error message if it's meaningful
        errorMessage = error.message;
      } else if (error.response?.status === 400) {
        // Generic 400 error
        errorMessage = 'Cannot delete module: Invalid request or module is in use';
      } else if (error.response?.status === 404) {
        // Module not found
        errorMessage = 'Module not found or already deleted';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You don\'t have permission to delete this module.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      console.error("🚨 Final error message:", errorMessage);
      
      addToast({
        type: "error",
        message: errorMessage
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditModule = (moduleId: string) => {
    console.log("Edit module:", moduleId);
    
    // Find the module to edit from either displayModules or allModules
    const moduleToEdit = displayModules.find(module => module.id === moduleId);
    
    if (moduleToEdit) {
      console.log("Opening edit modal for module:", moduleToEdit);
      setSelectedModuleForEdit(moduleToEdit);
      setIsEditModalOpen(true);
    } else {
      console.error("Module not found for editing:", moduleId);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedModuleForEdit(null);
  };

  const handleModuleUpdated = () => {
    // Refresh modules after successful update
    if (selectedChapter === "all") {
      loadAllModules();
    } else {
      refetchChapterModules();
    }
    handleCloseEditModal();
  };

  // Get available chapters for filter dropdown
  const availableChapters = [
    { id: "all", title: "All Chapters" },
    ...chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
    })),
  ];

  if (displayError) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-400 mb-4">
          ❌ Error loading modules: {displayError}
        </div>
        <button
          onClick={() => selectedChapter === "all" ? loadAllModules() : refetchChapterModules()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (displayLoading && displayModules.length === 0) {
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
          </p>
        </div>
      </div>

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
        {displayStats && (
          <div className="flex items-center gap-6 text-sm text-gray-400 pt-2 border-t border-gray-700">
            <span>Total: {displayStats.totalModules}</span>
            {"videoModules" in displayStats && displayStats.videoModules !== undefined && (
              <span>Video: {displayStats.videoModules}</span>
            )}
            {"modulesByType" in displayStats && displayStats.modulesByType && (
              <>
                <span>Video: {displayStats.modulesByType.video}</span>
                <span>Document: {displayStats.modulesByType.document}</span>
              </>
            )}
            {"documentModules" in displayStats && displayStats.documentModules !== undefined && (
              <span>Document: {displayStats.documentModules}</span>
            )}
            {"publishedModules" in displayStats && displayStats.publishedModules !== undefined && (
              <span>Published: {displayStats.publishedModules}</span>
            )}
            {"previewModules" in displayStats && displayStats.previewModules !== undefined && (
              <span>Preview: {displayStats.previewModules}</span>
            )}
            {displayStats.totalDuration !== undefined && (
              <span>
                Duration: {Math.floor(displayStats.totalDuration / 60)}h{" "}
                {displayStats.totalDuration % 60}m
              </span>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {displayLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-400">Loading modules...</span>
        </div>
      )}

      {/* No Modules State */}
      {displayModules.length === 0 && !displayLoading && (
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
      {displayModules.length > 0 && (
        <div className="space-y-4">
          {displayModules.map((module: any) => (
            <ModuleItem
              key={module.id}
              module={module}
              courseId={courseId}
              chapterId={module.chapterId || selectedChapter}
              canEdit={canEdit}
              onEdit={handleEditModule}
              onDelete={() => handleDeleteModule(module)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {displayModules.length > 0 &&
        displayStats &&
        displayStats.totalModules > (filters.limit || 20) && (
          <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">
              Showing {((filters.page || 1) - 1) * (filters.limit || 20) + 1}-
              {Math.min(
                (filters.page || 1) * (filters.limit || 20),
                displayStats.totalModules
              )}{" "}
              of {displayStats.totalModules} modules
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
                {Math.ceil(displayStats.totalModules / (filters.limit || 20))}
              </span>
              <button
                onClick={() =>
                  setFilters({ ...filters, page: (filters.page || 1) + 1 })
                }
                disabled={
                  (filters.page || 1) >=
                  Math.ceil(displayStats.totalModules / (filters.limit || 20))
                }
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {/* Module Edit Modal */}
        {isEditModalOpen && selectedModuleForEdit && (
          <ModuleEditModal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            module={selectedModuleForEdit}
            courseId={courseId}
            onModuleUpdated={handleModuleUpdated}
          />
        )}

        {/* Delete Module Modal */}
        {deletingModule && (
          <DeleteModuleModal
            isOpen={!!deletingModule}
            onClose={() => setDeletingModule(null)}
            onConfirm={confirmDeleteModule}
            module={deletingModule}
            loading={deleteLoading}
            canForceDelete={true} // You can adjust this based on user permissions
          />
        )}
    </div>
  );
};

export default ModuleManagementSection;
