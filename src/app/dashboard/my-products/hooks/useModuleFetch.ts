"use client";

import { useState, useEffect, useCallback } from "react";
import { CourseAPI } from "@/lib/api";

interface ModuleData {
  id: string;
  chapterId: string;
  title: string;
  description?: string;
  type: "video" | "document";
  order: number;
  duration?: number;
  isPreview: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ModuleStats {
  totalModules: number;
  modulesByType: {
    video: number;
    document: number;
  };
  totalDuration: number;
  previewModules: number;
}

interface ModulePagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UseModuleFetchParams {
  courseId: string;
  chapterId: string;
  filters?: {
    status?: "draft" | "published";
    type?: "video" | "document";
    sortBy?: "createdAt" | "updatedAt" | "title" | "order";
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
    includeStats?: boolean;
  };
}

/**
 * Hook for fetching modules using the correct backend API
 * Follows the backend API documentation for GET /api/courses/:id/modules
 */
export const useModuleFetch = ({ courseId, chapterId, filters = {} }: UseModuleFetchParams) => {
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [stats, setStats] = useState<ModuleStats | null>(null);
  const [pagination, setPagination] = useState<ModulePagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    if (!courseId || !chapterId) {
      console.warn("🚫 Missing courseId or chapterId for module fetch");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching modules with new API:", {
        courseId,
        chapterId,
        filters,
      });

      const params = {
        chapterId, // Required by backend
        ...filters,
        includeStats: filters.includeStats ?? true,
        sortBy: filters.sortBy ?? "order",
        sortOrder: filters.sortOrder ?? "asc",
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
      };

      const response = await CourseAPI.getModules(courseId, params);

      if (response.success && response.data) {
        console.log("✅ Modules fetched successfully:", response.data);
        
        setModules(response.data.modules || []);
        setStats(response.data.stats || null);
        setPagination(response.data.pagination || null);
        
        console.log(`📊 Loaded ${response.data.modules?.length || 0} modules`);
      } else {
        console.error("❌ Failed to fetch modules:", response.message);
        setError(response.message || "Failed to fetch modules");
        setModules([]);
        setStats(null);
        setPagination(null);
      }
    } catch (err: any) {
      console.error("💥 Error fetching modules:", err);
      setError(err.message || "Network error occurred");
      setModules([]);
      setStats(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [courseId, chapterId, filters]);

  // Fetch modules when dependencies change
  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const refetch = useCallback(() => {
    fetchModules();
  }, [fetchModules]);

  return {
    modules,
    stats,
    pagination,
    loading,
    error,
    refetch,
  };
};

export default useModuleFetch;
