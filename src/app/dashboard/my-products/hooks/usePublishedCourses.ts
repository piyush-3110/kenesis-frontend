'use client';

import { useState, useEffect } from 'react';
import { CourseAPI, GetPublishedCoursesParams, PublishedCoursesResponse, ApiResponse } from '@/lib/api';

/**
 * Custom hook for fetching published courses
 * Follows integration.md guidelines - keeps API logic out of components
 * Provides clean, reusable interface for My Products page
 */
export const usePublishedCourses = () => {
  const [data, setData] = useState<PublishedCoursesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async (params?: GetPublishedCoursesParams) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('usePublishedCourses: Fetching courses with params:', params);
      
      const response: ApiResponse<PublishedCoursesResponse> = await CourseAPI.getPublishedCourses(params);
      
      console.log('usePublishedCourses: API response:', response);
      
      if (response.success && response.data) {
        setData(response.data);
        console.log('usePublishedCourses: Successfully loaded courses:', response.data.courses.length);
      } else {
        const errorMsg = response.message || 'Failed to fetch courses';
        setError(errorMsg);
        console.error('usePublishedCourses: API error:', errorMsg);
      }
    } catch (err) {
      const errorMsg = 'Network error while fetching courses';
      setError(errorMsg);
      console.error('usePublishedCourses: Network error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = (params?: GetPublishedCoursesParams) => {
    fetchCourses(params);
  };

  return {
    data,
    loading,
    error,
    fetchCourses,
    refetch,
  };
};
