import type { User } from "@/types/auth";

export interface InstructorProfile {
  id: string;
  username?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  emailVerified: boolean;
  email?: string;
  walletAddress?: string;
  socialMedia: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface InstructorStats {
  totalStudents: number;
  totalCourses: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  studentCount: number;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileStore {
  // State
  profile: InstructorProfile | null;
  stats: InstructorStats | null;
  courses: Course[];
  loading: boolean;
  error: string | null;

  // Actions
  loadProfile: (user?: User) => Promise<void>; // Accept optional user parameter
  loadStats: () => Promise<void>;
  loadCourses: () => Promise<void>;
  updateProfile: (profile: Partial<InstructorProfile>) => Promise<boolean>;
  resetError: () => void;
}
