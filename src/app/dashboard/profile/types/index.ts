export interface InstructorProfile {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  location: string;
  joinedDate: string;
  verified: boolean;
  social: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
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
  level: 'Beginner' | 'Intermediate' | 'Advanced';
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
  loadProfile: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadCourses: () => Promise<void>;
  updateProfile: (profile: Partial<InstructorProfile>) => Promise<boolean>;
  resetError: () => void;
}
