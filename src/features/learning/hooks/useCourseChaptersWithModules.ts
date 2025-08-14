"use client";
import { useQuery, useQueries } from "@tanstack/react-query";
import { CourseAPI } from "@/lib/api";
import type { Chapter, Module } from "../types";

export const learningKeys = {
  chapters: (courseId: string) => ["learning","chapters",courseId] as const,
  chapterModules: (courseId: string, chapterId: string) => ["learning","chapterModules",courseId,chapterId] as const,
};

const fetchChapters = async (courseId: string): Promise<Chapter[]> => {
  const res = await CourseAPI.getChapters(courseId, false);
  if (!res.success) throw new Error(res.message || "Failed to load chapters");
  const chapters = (res.data?.chapters || res.data || []) as any[];
  return chapters.map(c => ({ id: c.id, title: c.title, description: c.description || "", order: c.order, modules: [] as Module[] })).sort((a,b)=> a.order - b.order);
};

const fetchModules = async (courseId: string, chapterId: string): Promise<Module[]> => {
  const res = await CourseAPI.getModules(courseId, { chapterId });
  if (!res.success) throw new Error(res.message || "Failed to load modules");
  const modules = res.data?.modules || [];
  return modules.map((m:any)=> ({ id: m.id, chapterId, title: m.title, description: m.description || "", type: m.type, duration: m.duration || 0, order: m.order, isPreview: !!m.isPreview, completed: !!m.completed })).sort((a,b)=> a.order - b.order);
};

export const useCourseChaptersWithModules = (courseId: string | undefined, enabled: boolean) => {
  const chaptersQuery = useQuery({
    queryKey: learningKeys.chapters(courseId || ""),
    queryFn: () => fetchChapters(courseId!),
    enabled: enabled && !!courseId,
  });

  const modulesQueries = useQueries({
    queries: (chaptersQuery.data || []).map(ch => ({
      queryKey: learningKeys.chapterModules(courseId!, ch.id),
      queryFn: () => fetchModules(courseId!, ch.id),
      enabled: enabled && !!courseId,
    })),
  });

  const isLoadingModules = modulesQueries.some(q=> q.isLoading);
  const isErrorModules = modulesQueries.some(q=> q.isError);
  const modulesError = modulesQueries.find(q=> q.error)?.error as Error | undefined;

  const chaptersWithModules: Chapter[] | undefined = chaptersQuery.data?.map((c, idx) => ({ ...c, modules: modulesQueries[idx].data || [] }));

  return { chaptersQuery, modulesQueries, chapters: chaptersWithModules, isLoading: chaptersQuery.isLoading || isLoadingModules, isError: chaptersQuery.isError || isErrorModules, error: (chaptersQuery.error as Error)|| modulesError, refetch: async ()=> { await chaptersQuery.refetch(); await Promise.all(modulesQueries.map(q=> q.refetch())); } };
};
