"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { CourseAPI } from "@/lib/api";
import { useToastMessages } from "@/hooks/useToastMessages";

export const moduleContentKey = (courseId: string, moduleId: string) =>
  ["learning", "moduleContent", courseId, moduleId] as const;

export interface ModuleContentData {
  videoUrl?: string;
  documentUrl?: string;
  attachments?: Array<{
    id: string;
    originalName: string;
    url: string;
    size: number;
    type?: string;
  }>;
}

export const useModuleContent = (
  courseId: string | undefined,
  chapterId: string | undefined,
  moduleId: string | undefined,
  enabled: boolean
) => {
  const { messages } = useToastMessages();

  const query = useQuery({
    queryKey: moduleContentKey(courseId || "", moduleId || ""),
    enabled: enabled && !!courseId && !!chapterId && !!moduleId,
    queryFn: async (): Promise<ModuleContentData> => {
      console.log("🔍 [MODULE_CONTENT] Starting module content fetch...");
      console.log("🔍 [MODULE_CONTENT] Course ID:", courseId);
      console.log("🔍 [MODULE_CONTENT] Chapter ID:", chapterId);
      console.log("🔍 [MODULE_CONTENT] Module ID:", moduleId);
      console.log("🔍 [MODULE_CONTENT] Enabled:", enabled);

      try {
        // Fix: Use moduleId instead of chapterId as the second parameter
        const res = await CourseAPI.getModuleContentById(
          courseId!,
          moduleId!, // Fixed: was chapterId before
          {
            trackProgress: true,
            generateSignedUrls: false
          }
        );

        console.log("📦 [MODULE_CONTENT] API Response received:");
        console.log("📦 [MODULE_CONTENT] Success:", res.success);
        console.log("📦 [MODULE_CONTENT] Message:", res.message);
        console.log("📦 [MODULE_CONTENT] Data:", JSON.stringify(res.data, null, 2));

        if (!res.success) {
          console.error("❌ [MODULE_CONTENT] API Error:", res.message);
          
          // Handle specific error cases with appropriate toast messages
          if (res.message?.includes("not found")) {
            messages.moduleNotFound();
          } else if (res.message?.includes("Access denied")) {
            messages.accessDenied();
          } else if (res.message?.includes("Authentication")) {
            messages.authRequired();
          } else {
            messages.moduleContentError(res.message || "Failed to load module content");
          }
          
          throw new Error(res.message || "Failed to load module content");
        }

        const d = res.data;
        console.log("✅ [MODULE_CONTENT] Successfully processed module content");
        console.log("✅ [MODULE_CONTENT] Video URL:", d?.videoUrl ? "Present" : "None");
        console.log("✅ [MODULE_CONTENT] Document URL:", d?.documentUrl ? "Present" : "None");
        console.log("✅ [MODULE_CONTENT] Attachments count:", d?.attachments?.length || 0);

        return {
          videoUrl: d?.videoUrl,
          documentUrl: d?.documentUrl,
          attachments: (d?.attachments || []).map((att: any) => ({
            id: `${moduleId}-${att.name}`,
            originalName: att.name,
            url: att.url,
            size: att.fileSize,
            type: att.mimeType,
          })),
        };
      } catch (error) {
        console.error("💥 [MODULE_CONTENT] Error in queryFn:", error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      console.log(`🔄 [MODULE_CONTENT] Retry attempt ${failureCount}:`, error);
      return failureCount < 2; // Retry up to 2 times
    }
  });

  // Handle error state outside of query options
  React.useEffect(() => {
    if (query.error) {
      console.error("💥 [MODULE_CONTENT] Final error after retries:", query.error);
      // Show toast on final failure after all retries
      if (!query.error.message?.includes("not found")) {
        messages.moduleLoadError();
      }
    }
  }, [query.error, messages]);

  return query;
};
