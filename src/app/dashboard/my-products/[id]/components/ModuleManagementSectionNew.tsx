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
import ModuleItem from "../../components/ModuleItem";

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
  const [modules, setModules] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [filters, setFilters] = useState<ModuleFilters>({
    includeStats: true,
    sortBy: "order",
    sortOrder: "asc",
    limit: 20,
  });

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
        selectedChapter,
        courseId
      );

      if (response.success && response.data) {
        setModules(response.data.modules || []);
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
            chapter.id,
            courseId
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
    if (
      !confirm(
        `Are you sure you want to delete the module "${module.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await CourseAPI.deleteModule(
        courseId,
        module.chapterId || selectedChapter,
        module.id
      );

      if (response.success) {
        console.log("✅ Module deleted successfully");
        // Reload modules
        if (selectedChapter === "all") {
          loadAllModules();
        } else {
          loadModulesForChapter(selectedChapter);
        }
      } else {
        console.error("❌ Failed to delete module:", response.message);
        alert(response.message || "Failed to delete module");
      }
    } catch (error) {
      console.error("Failed to delete module:", error);
      alert("Failed to delete module");
    }
  };

  const handleEditModule = (moduleId: string) => {
    // Implementation for module editing would go here
    console.log("Edit module:", moduleId);
    // For now, just log. In production, this would open an edit modal
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
            {stats.totalDuration !== undefined && (
              <span>
                Duration: {Math.floor(stats.totalDuration / 60)}h{" "}
                {stats.totalDuration % 60}m
              </span>
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
              onDelete={() => handleDeleteModule(module)}
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
    </div>
  );
};

export default ModuleManagementSection;
