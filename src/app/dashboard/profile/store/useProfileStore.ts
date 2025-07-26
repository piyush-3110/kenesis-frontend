'use client';

import { create } from 'zustand';
import { InstructorProfile, InstructorStats, Course, ProfileStore } from '../types';

// Mock data for development
const mockProfile: InstructorProfile = {
  id: 'instructor-001',
  name: 'Sarah Johnson',
  title: 'Senior UI/UX Designer & Product Strategy Expert',
  avatar: '/images/landing/avatar1.png',
  bio: 'Passionate educator with 8+ years of experience in product design and user experience. I\'ve worked with Fortune 500 companies and startups, helping them create intuitive and user-centered digital products. My teaching approach focuses on practical, real-world applications that prepare students for successful careers in design.',
  location: 'San Francisco, CA',
  joinedDate: '2021-03-15',
  verified: true,
  social: {
    website: 'https://sarahjohnson.design',
    twitter: 'https://twitter.com/sarahdesigns',
    linkedin: 'https://linkedin.com/in/sarah-johnson-design',
    youtube: 'https://youtube.com/c/sarahdesigntutorials'
  }
};

const mockStats: InstructorStats = {
  totalStudents: 12847,
  totalCourses: 15,
  totalEarnings: 89420.50,
  averageRating: 4.8,
  totalReviews: 2341,
  completionRate: 87.5
};

const mockCourses: Course[] = [
  {
    id: 'course-001',
    title: 'Complete UI/UX Design Masterclass 2024',
    description: 'Master the fundamentals and advanced techniques of user interface and user experience design.',
    thumbnail: '/images/landing/product.png',
    price: 89.99,
    originalPrice: 149.99,
    rating: 4.9,
    reviewCount: 1245,
    studentCount: 8934,
    duration: '24h 30m',
    level: 'Intermediate',
    category: 'Design',
    tags: ['UI Design', 'UX Research', 'Figma', 'Prototyping'],
    isPublished: true,
    createdAt: '2023-09-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 'course-002',
    title: 'Figma Advanced Prototyping',
    description: 'Learn advanced prototyping techniques and create interactive designs that wow your clients.',
    thumbnail: '/images/landing/product.png',
    price: 59.99,
    originalPrice: 99.99,
    rating: 4.7,
    reviewCount: 892,
    studentCount: 5421,
    duration: '18h 45m',
    level: 'Advanced',
    category: 'Design Tools',
    tags: ['Figma', 'Prototyping', 'Animation', 'Micro-interactions'],
    isPublished: true,
    createdAt: '2023-11-10T09:00:00Z',
    updatedAt: '2024-02-05T11:15:00Z'
  },
  {
    id: 'course-003',
    title: 'Design System Fundamentals',
    description: 'Build scalable and maintainable design systems from scratch using industry best practices.',
    thumbnail: '/images/landing/product.png',
    price: 79.99,
    rating: 4.8,
    reviewCount: 567,
    studentCount: 3782,
    duration: '16h 20m',
    level: 'Intermediate',
    category: 'Design Systems',
    tags: ['Design Systems', 'Component Library', 'Tokens', 'Documentation'],
    isPublished: true,
    createdAt: '2024-01-05T12:00:00Z',
    updatedAt: '2024-02-28T16:45:00Z'
  },
  {
    id: 'course-004',
    title: 'Mobile App Design Workshop',
    description: 'Design beautiful and functional mobile applications with a focus on iOS and Android guidelines.',
    thumbnail: '/images/landing/product.png',
    price: 69.99,
    originalPrice: 119.99,
    rating: 4.6,
    reviewCount: 423,
    studentCount: 2156,
    duration: '14h 10m',
    level: 'Beginner',
    category: 'Mobile Design',
    tags: ['Mobile Design', 'iOS', 'Android', 'Material Design'],
    isPublished: false,
    createdAt: '2024-02-20T08:30:00Z',
    updatedAt: '2024-03-01T10:20:00Z'
  }
];

export const useProfileStore = create<ProfileStore>((set, get) => ({
  // Initial state
  profile: null,
  stats: null,
  courses: [],
  loading: false,
  error: null,

  // Load profile data
  loadProfile: async () => {
    set({ loading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set({ 
        profile: mockProfile,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load profile',
        loading: false 
      });
    }
  },

  // Load stats data
  loadStats: async () => {
    set({ loading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      set({ 
        stats: mockStats,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load stats',
        loading: false 
      });
    }
  },

  // Load courses data
  loadCourses: async () => {
    set({ loading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      set({ 
        courses: mockCourses,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load courses',
        loading: false 
      });
    }
  },

  // Update profile
  updateProfile: async (profileUpdate: Partial<InstructorProfile>) => {
    const { profile } = get();
    if (!profile) return false;

    set({ loading: true, error: null });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedProfile = { ...profile, ...profileUpdate };
      set({ 
        profile: updatedProfile,
        loading: false 
      });
      
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update profile',
        loading: false 
      });
      return false;
    }
  },

  // Reset error state
  resetError: () => set({ error: null })
}));
