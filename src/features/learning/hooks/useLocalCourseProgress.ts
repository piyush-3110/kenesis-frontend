"use client";
import * as React from "react";

interface StoredProgress {
  completed: string[];
  selectedModuleId: string | null;
  updatedAt: string;
}

const buildKey = (courseId: string) => `course-progress:${courseId}`;

export function useLocalCourseProgress(courseId: string | null | undefined) {
  const [completed, setCompleted] = React.useState<Set<string>>(new Set());
  const [selectedModuleId, setSelectedModuleId] = React.useState<string | null>(
    null
  );
  const hasLoadedRef = React.useRef(false);

  // Load from localStorage
  React.useEffect(() => {
    if (!courseId) return;
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem(buildKey(courseId))
          : null;
      if (raw) {
        const parsed: StoredProgress = JSON.parse(raw);
        setCompleted(new Set(parsed.completed || []));
        setSelectedModuleId(parsed.selectedModuleId || null);
      }
    } catch (e) {
      console.warn("Failed to load course progress", e);
    } finally {
      hasLoadedRef.current = true;
    }
  }, [courseId]);

  // Persist to localStorage when changed (after initial load)
  React.useEffect(() => {
    if (!courseId || !hasLoadedRef.current) return;
    try {
      const payload: StoredProgress = {
        completed: Array.from(completed),
        selectedModuleId,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(buildKey(courseId), JSON.stringify(payload));
    } catch (e) {
      console.warn("Failed to save course progress", e);
    }
  }, [courseId, completed, selectedModuleId]);

  const markCompleted = React.useCallback((id: string) => {
    setCompleted((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  const resetProgress = React.useCallback(() => {
    setCompleted(new Set());
    setSelectedModuleId(null);
    if (courseId) localStorage.removeItem(buildKey(courseId));
  }, [courseId]);

  return {
    completed,
    setCompleted,
    selectedModuleId,
    setSelectedModuleId,
    markCompleted,
    resetProgress,
  };
}
