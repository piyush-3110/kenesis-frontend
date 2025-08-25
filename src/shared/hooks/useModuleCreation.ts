"use client";

import { useState, useCallback } from "react";
import { CourseAPI } from "@/lib/api";
import { useUIStore } from "@/store/useUIStore";

interface ModuleFormData {
  chapterId: string;
  title: string;
  description?: string;
  type: 'video' | 'document';
  order?: number;
  duration?: number;
  isPreview: boolean;
  mainFile?: File;
  attachments?: File[];
}

interface UseModuleCreationOptions {
  onSuccess?: (moduleData: any) => void;
  onError?: (error: string) => void;
}

/**
 * Shared hook for module creation across different pages
 * Standardizes the module creation process and error handling
 */
export const useModuleCreation = (courseId: string, options: UseModuleCreationOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useUIStore();

  const createModule = useCallback(async (moduleData: ModuleFormData): Promise<boolean> => {
    if (!courseId) {
      const errorMsg = "Course ID is required";
      setError(errorMsg);
      options.onError?.(errorMsg);
      addToast({ type: "error", message: errorMsg });
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🚀 Creating module with data:", moduleData);

      // Convert to API format
      const apiData = {
        chapterId: moduleData.chapterId,
        title: moduleData.title.trim(),
        type: moduleData.type,
        description: moduleData.description?.trim(),
        duration: moduleData.duration && moduleData.duration > 0 ? moduleData.duration : undefined,
        isPreview: moduleData.isPreview || false,
        order: moduleData.order,
        mainFile: moduleData.mainFile,
        attachments: moduleData.attachments || []
      };

      const response = await CourseAPI.createModule(courseId, apiData);

      if (response.success) {
        console.log("✅ Module created successfully:", response.data);
        
        const successMsg = `Module "${moduleData.title}" created successfully`;
        addToast({ type: "success", message: successMsg });
        options.onSuccess?.(response.data);
        
        return true;
      } else {
        console.error("❌ Failed to create module:", response.message);
        
        const errorMsg = response.message || "Failed to create module";
        setError(errorMsg);
        options.onError?.(errorMsg);
        addToast({ type: "error", message: errorMsg });
        
        return false;
      }
    } catch (error: any) {
      console.error("💥 Error creating module:", error);
      
      let errorMsg = "Something went wrong while creating the module";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setError(errorMsg);
      options.onError?.(errorMsg);
      addToast({ type: "error", message: errorMsg });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [courseId, options, addToast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createModule,
    loading,
    error,
    clearError
  };
};
