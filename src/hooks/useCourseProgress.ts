import { useQuery } from '@tanstack/react-query';
import { getCourseProgress } from '@/lib/api/learning';
import { useCourseProgressStore } from '@/store/useCourseProgressStore';
import { useEffect } from 'react';
import { useToastMessages } from './useToastMessages';

export const useCourseProgress = (courseId: string) => {
  const { setCourseProgress } = useCourseProgressStore();
  const { showError } = useToastMessages();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['courseProgress', courseId],
    queryFn: async () => {
      try {
        const response = await getCourseProgress(courseId);
        return response.data; 
      } catch (err: any) {
        showError(err.response?.data?.message || 'Failed to fetch course progress');
        throw err;
      }
    },
    enabled: !!courseId,
  });

  useEffect(() => {
    if (data) {
      setCourseProgress({
        completedModules: data.completedModules.map((m: any) => m._id),
        completionPercentage: data.progressPercentage,
      });
    }
  }, [data, setCourseProgress]);

  return {
    progress: data,
    isLoading,
    error,
    refetch,
  };
};
