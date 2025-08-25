'use client';

import { create } from 'zustand';
import { MyProductsStore, Product, ProductStats } from '../types';
import { CourseAPI, GetMyCoursesParams, MyCourse } from '@/lib/api';

/**
 * My Products Store
 * Handles state management for the My Products section
 * Now integrated with My Courses API (logged-in user's courses)
 * 
 * Note: The My Courses API provides basic course information without detailed
 * chapters/modules data. For complete analytics including accurate chapter/module
 * counts and calculated durations, use the individual course view which loads
 * complete course data via getCourse + getChapters APIs.
 * 
 * The cards show basic information suitable for overview purposes.
 */

// Transform API MyCourse data to UI Product format
const transformMyCourseToProduct = (course: MyCourse): Product => {
  // Format duration from minutes to readable string
  const formatDuration = (minutes?: number): string => {
    if (!minutes || minutes === 0) return '0m';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  // Determine category based on type
  const category = course.type === 'video' ? 'Video Course' : 'Document Course';

  // Create tags from tokenToPayWith and other properties
  const tags = [...course.tokenToPayWith, course.level, course.type];

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    type: course.type,
    status: course.status,
    shortDescription: course.shortDescription,
    thumbnail: course.thumbnail,
    stats: course.stats,
    price: course.price,
    tokenToPayWith: course.tokenToPayWith,
    affiliatePercentage: course.affiliatePercentage,
    accessDuration: course.accessDuration,
    availableQuantity: course.availableQuantity,
    level: course.level,
    language: course.language,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    submittedAt: course.submittedAt,
    publishedAt: course.publishedAt,
    
    // UI-specific computed properties using available data
    studentCount: 0, // My Courses API doesn't include enrollment data - would need separate API call
    duration: formatDuration(course.stats.duration), // Use basic duration from stats
    category: category,
    tags: tags,
    isPublished: course.status === 'published',
    description: course.shortDescription || 'No description available',
  };
};

// Calculate stats from products
const calculateStats = (products: Product[]): ProductStats => {
  const publishedProducts = products.filter(p => p.status === 'published');
  const draftProducts = products.filter(p => p.status === 'draft' || p.status === 'rejected');
  const submittedProducts = products.filter(p => p.status === 'submitted');
  
  return {
    totalProducts: products.length,
    publishedProducts: publishedProducts.length,
    draftProducts: draftProducts.length,
    submittedProducts: submittedProducts.length,
    totalStudents: products.reduce((sum, p) => sum + p.studentCount, 0),
    totalEarnings: products.reduce((sum, p) => sum + (p.price * p.studentCount), 0),
    averageRating: products.length > 0 
      ? products.reduce((sum, p) => sum + (p.stats.rating || 0), 0) / products.length 
      : 0
  };
};

export const useMyProductsStore = create<MyProductsStore>((set, get) => ({
  // State
  products: [],
  stats: null,
  loading: false,
  error: null,
  
  // Filters
  searchQuery: '',
  statusFilter: 'all',
  typeFilter: 'all',
  categoryFilter: '',

  // Actions
  loadProducts: async () => {
    set({ loading: true, error: null });
    
    try {
      console.log('MyProductsStore: Loading my courses from API');
      
      // Get current user's courses using My Courses endpoint
      const params: GetMyCoursesParams = {
        limit: 20, // Safe limit under the 50 maximum
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      const response = await CourseAPI.getMyCourses(params);
      
      console.log('MyProductsStore: Raw API response:', response);
      
      if (response.success && response.data) {
        console.log('MyProductsStore: Course data received:', response.data.courses);
        
        // Log first course to see actual structure
        if (response.data.courses.length > 0) {
          console.log('MyProductsStore: First course structure:', response.data.courses[0]);
        }
        
        const transformedProducts = response.data.courses.map((course, index) => {
          try {
            return transformMyCourseToProduct(course);
          } catch (transformError) {
            console.error(`MyProductsStore: Error transforming course ${index}:`, transformError);
            console.error('MyProductsStore: Problematic course data:', course);
            throw transformError;
          }
        });
        
        const calculatedStats = calculateStats(transformedProducts);
        
        console.log('MyProductsStore: Successfully loaded and transformed products:', transformedProducts.length);
        
        set({ 
          products: transformedProducts,
          stats: calculatedStats,
          loading: false 
        });
      } else {
        const errorMsg = response.message || 'Failed to load products';
        console.error('MyProductsStore: API error:', errorMsg);
        set({ 
          error: errorMsg,
          loading: false 
        });
      }
    } catch (error) {
      const errorMsg = 'Network error while loading products';
      console.error('MyProductsStore: Network error:', error);
      set({ 
        error: errorMsg,
        loading: false 
      });
    }
  },

  loadStats: async () => {
    // Stats are now calculated from products, no separate API call needed
    const { products } = get();
    if (products.length > 0) {
      const calculatedStats = calculateStats(products);
      set({ stats: calculatedStats });
      console.log('MyProductsStore: Updated stats:', calculatedStats);
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setStatusFilter: (status: 'all' | 'published' | 'draft' | 'submitted') => {
    set({ statusFilter: status });
  },

  setTypeFilter: (type: 'all' | 'video' | 'document') => {
    set({ typeFilter: type });
  },

  setCategoryFilter: (category: string) => {
    set({ categoryFilter: category });
  },

  resetFilters: () => {
    set({
      searchQuery: '',
      statusFilter: 'all',
      typeFilter: 'all',
      categoryFilter: ''
    });
  },

  resetError: () => {
    set({ error: null });
  }
}));
