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
  Search,
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
  sortBy?: "order" | "createdAt" | "title";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  includeStats?: boolean;
}

/**
 * Module Management Section
 * Handles module viewing, creation, editing, and deletion
 * Clean implementation with proper modal separation
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    module: any | null;
  }>({ isOpen: false, module: null });
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
        documentModules: allModules.filter((m) => m.type === "document").length,
        previewModules: allModules.filter((m) => m.isPreview).length,
        totalDuration: allModules.reduce((sum, m) => sum + (m.duration || 0), 0),
      };

      setStats(totalStats);
      console.log("✅ All modules loaded:", allModules.length);
    } catch (error: any) {
      console.error("💥 Error loading all modules:", error);
      setModules([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (module: any) => {
    try {
      const response = await CourseAPI.deleteModule(courseId, module.id, true);
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
      
      const response = await CourseAPI.createModule(courseId, moduleData);
      
      if (response.success) {
        console.log("✅ Module created successfully");
        showSuccess(`Module "${moduleData.title}" created successfully`);
        // Reload modules after successful creation
        if (selectedChapter === "all") {
          loadAllModules();
        } else {
          loadModulesForChapter(selectedChapter);
        }
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

  const handleChapterChange = (chapterId: string) => {
    setSelectedChapter(chapterId);
    setModules([]);
    setStats(null);
  };

  const handleFilterChange = (newFilters: Partial<ModuleFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  console.log("Debug: canEdit =", canEdit, ", chapters =", chapters.length);

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          {/* Chapter Selector */}
          <div className="min-w-0 flex-1 sm:max-w-xs">
            <select
              value={selectedChapter}
              onChange={(e) => handleChapterChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Chapter</option>
              <option value="all">All Chapters</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Controls */}
          <div className="flex gap-2">
            <select
              value={filters.type || ""}
              onChange={(e) => handleFilterChange({ type: e.target.value as any || undefined })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
            </select>

            <select
              value={filters.sortBy || "order"}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="order">Order</option>
              <option value="title">Title</option>
              <option value="createdAt">Created Date</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        {canEdit && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!selectedChapter || selectedChapter === "all"}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            Add Module
          </button>
        )}
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">{stats.totalModules || 0}</div>
            <div className="text-sm text-gray-400">Total Modules</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{stats.videoModules || 0}</div>
            <div className="text-sm text-gray-400">Video Modules</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">{stats.documentModules || 0}</div>
            <div className="text-sm text-gray-400">Document Modules</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-purple-400">
              {formatTotalDuration(Math.ceil((stats.totalDuration || 0) / 60))}
            </div>
            <div className="text-sm text-gray-400">Total Duration</div>
          </div>
        </div>
      )}

      {/* Module List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading modules...</p>
          </div>
        ) : !selectedChapter ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Select a Chapter</h3>
            <p className="text-gray-400">Choose a chapter to view its modules</p>
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-12">
            <Video size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No Modules Found</h3>
            <p className="text-gray-400 mb-4">
              {selectedChapter === "all" 
                ? "No modules found across all chapters" 
                : "This chapter doesn't have any modules yet"}
            </p>
            {canEdit && selectedChapter !== "all" && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus size={16} />
                Create First Module
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {modules.map((module) => (
              <ModuleItem
                key={module.id}
                module={module}
                canEdit={canEdit}
                onEdit={() => handleEditModule(module.id)}
                onDelete={() => setDeleteConfirmation({ isOpen: true, module })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ModuleCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateModule}
        chapters={chapters}
        selectedChapterId={selectedChapter !== "all" ? selectedChapter : undefined}
      />

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, module: null })}
        onConfirm={() => {
          if (deleteConfirmation.module) {
            handleDeleteModule(deleteConfirmation.module);
            setDeleteConfirmation({ isOpen: false, module: null });
          }
        }}
        title="Delete Module"
        message={`Are you sure you want to delete "${deleteConfirmation.module?.title}"? This action cannot be undone.`}
        confirmText="Delete Module"
        type="warning"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default ModuleManagementSection;
