// Course listing interfaces derived from backend /api/courses documentation
// These provide a normalized, front-end friendly model for marketplace listings.

export interface CourseInstructor {
  id: string;
  username?: string;
  avatar?: string;
}

export interface CourseCategory {
  id: string;
  name: string;
}

export interface CourseStats {
  rating?: number;
  reviewCount: number;
  duration?: number; // seconds
}

export interface CourseListItem {
  id: string;
  title: string;
  slug: string;
  type: "video" | "document";
  shortDescription?: string;
  thumbnail?: string;
  isPublished: boolean;
  instructor: CourseInstructor;
  price: number;
  stats: CourseStats;
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  categories?: CourseCategory[];
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCourses: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export interface GetCoursesResponseFilters {
  q?: string;
  type?: string;
  level?: string;
  instructor?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: string;
  categoryIds?: string[];
}

export interface GetCoursesResponse {
  courses: CourseListItem[];
  pagination: Pagination;
  filters: GetCoursesResponseFilters;
}

// Convenience re-exports for marketplace integration
export type { CourseListItem as MarketplaceCourseListItem };
