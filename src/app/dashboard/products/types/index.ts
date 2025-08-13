/**
 * Product Creation Types
 * Type definitions following backend API specifications exactly
 */

export interface Course {
  id?: string;
  title: string;
  description: string;
  shortDescription: string;
  type: CourseType;
  level: CourseLevel;
  language: string;
  price: number;
  tokenToPayWith: string[];
  accessDuration: number; // in seconds, -1 for unlimited
  affiliatePercentage: number; // e.g., 1000 = 10%
  availableQuantity: number; // -1 for unlimited
  thumbnail?: File | string;
  previewVideo?: File | string;
  metadata?: CourseMetadata;
  chapters: Chapter[];
  status: CourseStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseMetadata {
  requirements?: string[];
  learningOutcomes?: string[];
  targetAudience?: string[];
}

export interface Chapter {
  id: string; // Local ID for UI state management
  backendId?: string; // Backend-generated ID from API
  title: string;
  description: string;
  order: number;
  modules: Module[];
  courseId?: string;
}

export interface Module {
  id: string; // Local ID for UI state management
  backendId?: string; // Backend-generated ID from API
  chapterId: string;
  title: string;
  description?: string;
  type: ModuleType;
  order: number;
  duration?: number; // in minutes
  isPreview: boolean;
  mainFile?: File | string;
  attachments: File[] | string[];
}

export type CourseType = "video" | "document";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type CourseStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "published";

export type ModuleType = "video" | "document";

export type CreateCourseStep = "course" | "chapters" | "modules" | "review";

// Form data interfaces
export interface CourseFormData {
  title: string;
  type: CourseType;
  shortDescription: string;
  description: string;
  level: CourseLevel;
  language: string;
  thumbnail?: File;
  previewVideo?: File;
  price: number;
  tokenToPayWith: string[];
  accessDuration: number;
  affiliatePercentage: number;
  availableQuantity: number;
  metadata?: CourseMetadata;
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
