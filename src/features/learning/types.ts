export interface ModuleAttachment {
  id: string;
  originalName: string;
  size: number;
  url: string;
  type?: string;
}

export interface Module {
  id: string;
  chapterId?: string;
  title: string;
  description: string;
  type: "video" | "document";
  duration: number;
  order: number;
  isPreview: boolean;
  videoUrl?: string;
  completed?: boolean;
  attachments?: ModuleAttachment[];
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  modules: Module[];
  duration?: number;
  completed?: boolean;
}

export interface CourseStats {
  rating: number;
  reviewCount: number;
  duration: number;
  enrollmentCount?: number;
  completionRate?: number;
}

export interface CourseInstructor {
  username: string;
  bio?: string;
  avatar?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: CourseInstructor;
  stats: CourseStats;
  price?: number;
  originalPrice?: number;
  level?: "Beginner" | "Intermediate" | "Advanced";
  category?: string;
  language?: string;
  lastUpdated?: string;
  requirements?: string[];
  learningOutcomes?: string[];
  targetAudience?: string[];
  chapters: Chapter[];
  thumbnail?: string;
}

export interface LearningData {
  course: Course;
  hasAccess: boolean;
}
