/**
 * Product Creation Types
 * Type definitions for the multi-step product creation flow
 */

export interface Course {
  id?: string;
  title: string;
  type: string;
  shortDescription: string;
  description: string;
  level: CourseLevel;
  language: string;
  thumbnail?: File | string;
  previewVideo?: File | string;
  price: string;
  tokensToPayWith: string[];
  chapters: Chapter[];
  status: CourseStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  modules: Module[];
  courseId?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  type: ModuleType;
  order: number;
  duration: number; // in minutes
  isPreview: boolean;
  mainFile?: File | string;
  attachments: File[] | string[];
  chapterId?: string;
}

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type CourseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'published';

export type ModuleType = 'video' | 'pdf' | 'quiz' | 'assignment' | 'text' | 'audio';

export type CreateCourseStep = 'course' | 'chapters' | 'modules' | 'review';

// Form data interfaces
export interface CourseFormData {
  title: string;
  type: string;
  shortDescription: string;
  description: string;
  level: CourseLevel;
  language: string;
  thumbnail?: File;
  previewVideo?: File;
  price: string;
  tokensToPayWith: string[];
}

export interface ChapterFormData {
  title: string;
  description: string;
}

export interface ModuleFormData {
  title: string;
  description: string;
  type: ModuleType;
  order: number;
  duration: number;
  isPreview: boolean;
  mainFile?: File;
  attachments: File[];
}

// UI State interfaces
export interface ProductCreationState {
  currentStep: CreateCourseStep;
  currentCourse: Course | null;
  selectedChapterId: string | null;
  isLoading: boolean;
  error: string | null;
}
