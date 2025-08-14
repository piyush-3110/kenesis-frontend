"use client";
import { useQuery } from "@tanstack/react-query";
import { CourseAPI } from "@/lib/api";

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
  return useQuery({
    queryKey: moduleContentKey(courseId || "", moduleId || ""),
    enabled: enabled && !!courseId && !!chapterId && !!moduleId,
    queryFn: async (): Promise<ModuleContentData> => {
      const res = await CourseAPI.getModuleContent(
        courseId!,
        chapterId!,
        moduleId!
      );
      if (!res.success)
        throw new Error(res.message || "Failed to load module content");
      const d = res.data;
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
    },
  });
};
