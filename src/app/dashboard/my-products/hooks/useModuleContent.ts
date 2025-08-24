"use client";
import { useQuery } from "@tanstack/react-query";
import { CourseAPI } from "@/lib/api";

export const moduleContentKey = (courseId: string, moduleId: string) =>
  ["my-products", "moduleContent", courseId, moduleId] as const;

export interface MyProductsModuleContentData {
  id: string;
  chapterId: string;
  title: string;
  description?: string; // Made optional to match backend API
  type: "video" | "document";
  order: number;
  duration?: number; // Made optional to match backend API
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
  // Added fields from backend API documentation
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

/**
 * Hook to fetch module content for MyProducts management section
 * Uses the backend API endpoint: GET /api/courses/:id/modules/:moduleId/content
 * Supports signed URLs, progress tracking, and various content formats
 * Following the backend API documentation for module content fetching
 */
export const useMyProductsModuleContent = (
  courseId: string | undefined,
  chapterId: string | undefined,
  moduleId: string | undefined,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: moduleContentKey(courseId || "", moduleId || ""),
    enabled: enabled && !!courseId && !!chapterId && !!moduleId,
    queryFn: async (): Promise<MyProductsModuleContentData> => {
      console.log("🎥 [MyProducts] Fetching module content using getModuleContentById API:", {
        courseId,
        moduleId,
        endpoint: `/api/courses/${courseId}/modules/${moduleId}/content`
      });

      const response = await CourseAPI.getModuleContentById(
        courseId!,
        moduleId!,
        {
          format: "json",
          trackProgress: false, // Set to true if you want progress tracking in edit mode
          generateSignedUrls: true // Get signed URLs for secure content access
        }
      );

      if (!response.success) {
        console.error("❌ [MyProducts] Failed to fetch module content:", response.message);
        throw new Error(response.message || "Failed to load module content");
      }

      console.log("✅ [MyProducts] Module content fetched successfully:", response.data);
      
      if (!response.data) {
        throw new Error("No module content data received");
      }
      
      return response.data;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
