/**
 * Course Chapter Hooks
 * Custom hooks for fetching chapter-related data
 *
 * Uses TanStack Query for caching and provides loading/error states.
 * Query is only enabled when chapterId is provided.
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

// Chapter with modules response interface
interface ChapterWithModulesResponse {
  chapter: {
    id: string;
    courseId: string;
    title: string;
    description?: string;
    order: number;
    modules: {
      id: string;
      title: string;
      type: "video" | "document";
      duration: number; // in seconds (backend format)
      order: number;
      isPreview: boolean;
    }[];
    createdAt: string;
    updatedAt: string;
  };
  courseInfo: {
    id: string;
    title: string;
    isOwner: boolean;
  };
}

// API function to fetch chapter modules
const fetchChapterModules = async (
  courseId: string,
  chapterId: string
): Promise<ChapterWithModulesResponse> => {
  const response = await apiClient.get<ChapterWithModulesResponse>(
    `/api/courses/${courseId}/chapters/${chapterId}?includeModules=true`
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch chapter modules");
  }

  return response.data!;
};

/**
 * Query keys for chapter-related queries
 */
export const chapterKeys = {
  all: ["chapters"] as const,
  modules: (courseId: string, chapterId: string) =>
    [...chapterKeys.all, "modules", courseId, chapterId] as const,
};

/**
 * Hook to fetch chapter modules when chapter is expanded
 */
export const useChapterModules = (
  courseId: string,
  chapterId: string | null
) => {
  return useQuery({
    queryKey: chapterKeys.modules(courseId, chapterId || ""),
    queryFn: () => fetchChapterModules(courseId, chapterId!),
    enabled: !!courseId && !!chapterId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export type { ChapterWithModulesResponse };
