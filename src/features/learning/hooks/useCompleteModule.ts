"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastMessages } from "@/hooks/useToastMessages";
import { completeModule } from "@/lib/api/learning";

interface CompleteModuleData {
  message: string;
}

export const useCompleteModule = (courseId: string, onModuleComplete: (moduleId: string) => void) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToastMessages();

  return useMutation<CompleteModuleData, Error, string>({
    mutationFn: (moduleId: string) => {
      // Optimistically update UI
      onModuleComplete(moduleId);
      return completeModule(courseId, moduleId);
    },
    onSuccess: (data) => {
      showSuccess(data.message || "Module completed!");
      // Invalidate queries that depend on module completion status
      queryClient.invalidateQueries({ queryKey: ["courseProgress", courseId] });
      queryClient.invalidateQueries({ queryKey: ["chapters", courseId] });
    },
    onError: (error: any) => {
      console.error("Error completing module:", error);
      const errorMessage = error.response?.data?.message || "Failed to mark module as complete.";
      showError(errorMessage);
      // Revert optimistic update if needed, though invalidation on error might handle this
      queryClient.invalidateQueries({ queryKey: ["chapters", courseId] });
    },
  });
};
