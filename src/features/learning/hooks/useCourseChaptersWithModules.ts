"use client";
import React from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { CourseAPI } from "@/lib/api";
import { useToastMessages } from "@/hooks/useToastMessages";
import type { Chapter, Module } from "../types";

export const learningKeys = {
  chapters: (courseId: string) => ["learning","chapters",courseId] as const,
  chapterModules: (courseId: string, chapterId: string) => ["learning","chapterModules",courseId,chapterId] as const,
};

const fetchChapters = async (courseId: string): Promise<Chapter[]> => {
  console.log("📚 [CHAPTERS] Starting chapters fetch...");
  console.log("📚 [CHAPTERS] Course ID:", courseId);
  
  const res = await CourseAPI.getChapters(courseId, false);
  
  console.log("📚 [CHAPTERS] API Response received:");
  console.log("📚 [CHAPTERS] Success:", res.success);
  console.log("📚 [CHAPTERS] Message:", res.message);
  console.log("📚 [CHAPTERS] Data:", JSON.stringify(res.data, null, 2));
  
  if (!res.success) {
    console.error("❌ [CHAPTERS] Failed to load chapters:", res.message);
    throw new Error(res.message || "Failed to load chapters");
  }
  
  const chapters = (res.data?.chapters || res.data || []) as any[];
  console.log("✅ [CHAPTERS] Processing", chapters.length, "chapters");
  
  return chapters.map(c => ({ 
    id: c.id, 
    title: c.title, 
    description: c.description || "", 
    order: c.order, 
    modules: [] as Module[] 
  })).sort((a,b)=> a.order - b.order);
};

const fetchModules = async (courseId: string, chapterId: string): Promise<Module[]> => {
  console.log("📖 [MODULES] Starting modules fetch...");
  console.log("📖 [MODULES] Course ID:", courseId);
  console.log("📖 [MODULES] Chapter ID:", chapterId);
  
  const res = await CourseAPI.getModules(courseId, { chapterId });
  
  console.log("📖 [MODULES] API Response received for chapter", chapterId);
  console.log("📖 [MODULES] Success:", res.success);
  console.log("📖 [MODULES] Message:", res.message);
  console.log("📖 [MODULES] Data:", JSON.stringify(res.data, null, 2));
  
  if (!res.success) {
    console.error("❌ [MODULES] Failed to load modules for chapter", chapterId, ":", res.message);
    throw new Error(res.message || "Failed to load modules");
  }
  
  const modules = res.data?.modules || [];
  console.log("✅ [MODULES] Processing", modules.length, "modules for chapter", chapterId);
  
  return modules.map((m:any)=> ({ 
    id: m.id, 
    chapterId, 
    title: m.title, 
    description: m.description || "", 
    type: m.type, 
    duration: m.duration || 0, 
    order: m.order, 
    isPreview: !!m.isPreview, 
    completed: !!m.completed 
  })).sort((a,b)=> a.order - b.order);
};

export const useCourseChaptersWithModules = (courseId: string | undefined, enabled: boolean) => {
  const { messages } = useToastMessages();

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

  const chaptersWithModules: Chapter[] | undefined = chaptersQuery.data?.map((c, idx) => ({ 
    ...c, 
    modules: modulesQueries[idx].data || [] 
  }));

  // Handle errors with toast messages
  React.useEffect(() => {
    if (chaptersQuery.error) {
      console.error("💥 [CHAPTERS] Error loading chapters:", chaptersQuery.error);
      messages.chapterLoadError();
    }
  }, [chaptersQuery.error, messages]);

  React.useEffect(() => {
    if (modulesError) {
      console.error("💥 [MODULES] Error loading modules:", modulesError);
      messages.modulesLoadError();
    }
  }, [modulesError, messages]);

  // Log successful data loading
  React.useEffect(() => {
    if (chaptersWithModules && chaptersWithModules.length > 0) {
      console.log("🎉 [CHAPTERS_WITH_MODULES] Successfully loaded course structure:");
      console.log("🎉 [CHAPTERS_WITH_MODULES] Chapters:", chaptersWithModules.length);
      console.log("🎉 [CHAPTERS_WITH_MODULES] Total modules:", chaptersWithModules.reduce((sum, ch) => sum + ch.modules.length, 0));
      chaptersWithModules.forEach((ch, idx) => {
        console.log(`📖 [CHAPTER_${idx + 1}] ${ch.title}: ${ch.modules.length} modules`);
        ch.modules.forEach((mod, modIdx) => {
          console.log(`  📄 [MODULE_${modIdx + 1}] ${mod.title} (${mod.type}) - ID: ${mod.id}`);
        });
      });
    }
  }, [chaptersWithModules]);

  return { 
    chaptersQuery, 
    modulesQueries, 
    chapters: chaptersWithModules, 
    isLoading: chaptersQuery.isLoading || isLoadingModules, 
    isError: chaptersQuery.isError || isErrorModules, 
    error: (chaptersQuery.error as Error) || modulesError, 
    refetch: async ()=> { 
      await chaptersQuery.refetch(); 
      await Promise.all(modulesQueries.map(q=> q.refetch())); 
    } 
  };
};
