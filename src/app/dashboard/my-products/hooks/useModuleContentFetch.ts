"use client";

import { useState, useCallback } from "react";
import { CourseAPI } from "@/lib/api";

interface ModuleContentData {
  id: string;
  chapterId: string;
  title: string;
  description?: string;
  type: "video" | "document";
  order: number;
  duration?: number;
  videoUrl?: string;
  documentUrl?: string;
  attachments?: Array<{
    name: string;
    url: string;
    fileSize: number;
    mimeType: string;
  }>;
  isPreview: boolean;
  createdAt: string;
  updatedAt: string;
  signedUrls?: {
    videoUrl?: string;
    attachments?: Array<{
      name: string;
      signedUrl: string;
    }>;
  };
  progress?: {
    progressPercentage: number;
    timeSpent: number;
    lastAccessedAt: string;
  };
  metadata?: {
    accessedAt: string;
    hasAccess: boolean;
  };
}

interface UseModuleContentParams {
  format?: "json" | "html" | "markdown";
  trackProgress?: boolean;
  generateSignedUrls?: boolean;
}

/**
 * Hook for fetching individual module content using the correct backend API
 * Follows the backend API documentation for GET /api/courses/:id/modules/:moduleId/content
 */
export const useModuleContentFetch = () => {
  const [moduleContent, setModuleContent] = useState<ModuleContentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModuleContent = useCallback(async (
    courseId: string,
    moduleId: string,
    params: UseModuleContentParams = {}
  ) => {
    if (!courseId || !moduleId) {
      console.warn("🚫 Missing courseId or moduleId for module content fetch");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching module content with new API:", {
        courseId,
        moduleId,
        params,
      });

      const queryParams = {
        format: params.format ?? "json",
        trackProgress: params.trackProgress,
        generateSignedUrls: params.generateSignedUrls,
      };

      const response = await CourseAPI.getModuleContentById(courseId, moduleId, queryParams);

      if (response.success && response.data) {
        console.log("✅ Module content fetched successfully:", response.data);
        
        setModuleContent(response.data);
        return response.data;
      } else {
        console.error("❌ Failed to fetch module content:", response.message);
        setError(response.message || "Failed to fetch module content");
        setModuleContent(null);
        return null;
      }
    } catch (err: any) {
      console.error("💥 Error fetching module content:", err);
      setError(err.message || "Network error occurred");
      setModuleContent(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearContent = useCallback(() => {
    setModuleContent(null);
    setError(null);
  }, []);

  return {
    moduleContent,
    loading,
    error,
    fetchModuleContent,
    clearContent,
  };
};

export default useModuleContentFetch;
