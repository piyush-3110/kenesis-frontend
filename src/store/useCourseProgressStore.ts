import { create } from 'zustand';

interface CourseProgressState {
  completedModules: string[];
  completionPercentage: number;
  setCourseProgress: (progress: { completedModules: string[]; completionPercentage: number }) => void;
}

export const useCourseProgressStore = create<CourseProgressState>((set) => ({
  completedModules: [],
  completionPercentage: 0,
  setCourseProgress: (progress) => set(progress),
}));
