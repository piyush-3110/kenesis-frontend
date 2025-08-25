import { useState, useCallback } from "react";
import { CourseAPI, formatApiError, formatRetryAfter } from "@/lib/api";
import { formatSimpleErrors } from "@/lib/utils/errorFormatter";

/**
 * Custom hook for course creation
 * Handles course creation with proper error handling according to task requirements
 */
export const useCreateCourse = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCourse = useCallback(async (courseData: FormData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await CourseAPI.createCourse(courseData);

      console.log("ye hai apna data: ", response);

      if (!response.success) {
        // Handle specific error scenarios according to task requirements
        if (response.retryAfter) {
          const message = `Too many requests. Please try again in ${formatRetryAfter(
            response.retryAfter
          )}.`;
          setError(message);
          console.error("Create course rate limited:", message);
          return { success: false, message, isRateLimit: true };
        }

        // Handle unauthorized (401)
        if (
          response.message?.includes("Invalid or expired token") ||
          response.message?.includes("Access token required")
        ) {
          const message = "Session expired. Please log in again.";
          setError(message);
          console.error("Create course unauthorized:", response.message);
          return { success: false, message, isUnauthorized: true };
        }

        // Handle forbidden (403) - instructor account deactivated
        if (
          response.errors &&
          response.errors.some((err) => err.field === "account")
        ) {
          const message = "Your instructor account is deactivated.";
          setError(message);
          console.error("Create course forbidden:", response.errors);
          return { success: false, message, isForbidden: true };
        }

        // Handle not found (404) - instructor not found
        if (
          response.errors &&
          response.errors.some((err) => err.field === "user")
        ) {
          const message = "Instructor not found. Please contact support.";
          setError(message);
          console.error("Create course instructor not found:", response.errors);
          return { success: false, message, isNotFound: true };
        }

        // Handle conflict (409) - course title exists
        if (
          response.errors &&
          response.errors.some((err) => err.field === "title")
        ) {
          const message = "A course with this title already exists.";
          setError(message);
          console.error("Create course conflict:", response.errors);
          return { success: false, message, isConflict: true };
        }

        // Other API errors - use clean formatting for better UX
        let message = response.message || "Failed to create course";
        if (response.errors && response.errors.length > 0) {
          message = formatSimpleErrors(response.errors);
        }
        setError(message);
        console.error("Create course failed:", message);
        return { 
          success: false, 
          message,
          errors: response.errors // Include errors for better formatting in UI
        };
      }

      console.log("Course created successfully:", response.data);
      return {
        success: true,
        data: response.data,
        message: "Course created successfully!",
      };
    } catch (error) {
      const message = "Something went wrong while creating the course.";
      setError(message);
      console.error("Create course error:", error);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createCourse,
    loading,
    error,
    clearError,
  };
};

/**
 * Custom hook for chapter creation
 * Handles chapter creation with proper error handling according to task requirements
 */
export const useCreateChapter = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createChapter = useCallback(
    async (
      courseId: string,
      chapterData: { title: string; description: string }
    ) => {
      try {
        setLoading(true);
        setError(null);

        const response = await CourseAPI.createChapter(courseId, chapterData);

        if (!response.success) {
          // Handle specific error scenarios according to task requirements
          if (response.retryAfter) {
            const message = `Too many requests. Please try again in ${formatRetryAfter(
              response.retryAfter
            )}.`;
            setError(message);
            console.error("Create chapter rate limited:", message);
            return { success: false, message, isRateLimit: true };
          }

          // Handle unauthorized (401)
          if (
            response.message?.includes("Invalid or expired token") ||
            response.message?.includes("Access token required")
          ) {
            const message = "Session expired. Please log in again.";
            setError(message);
            console.error("Create chapter unauthorized:", response.message);
            return { success: false, message, isUnauthorized: true };
          }

          // Handle forbidden (403)
          if (response.message?.includes("Access denied")) {
            const message =
              "You are not authorized to add chapters to this course.";
            setError(message);
            console.error("Create chapter forbidden:", response.message);
            return { success: false, message, isForbidden: true };
          }

          // Handle not found (404)
          if (response.message?.includes("Course not found")) {
            const message = "Course not found. Please contact support.";
            setError(message);
            console.error("Create chapter course not found:", response.message);
            return { success: false, message, isNotFound: true };
          }

          // Handle validation errors (400) with clean formatting
          if (response.errors && response.errors.length > 0) {
            const message = formatSimpleErrors(response.errors);
            setError(message);
            console.error("Create chapter validation error:", response.errors);
            return { success: false, message, isValidationError: true };
          }

          // Other API errors with clean formatting
          let message = response.message || "Failed to create chapter";
          if (response.errors && response.errors.length > 0) {
            message = formatSimpleErrors(response.errors);
          }
          setError(message);
          console.error("Create chapter failed:", message);
          return { success: false, message };
        }

        console.log("Chapter created successfully:", response.data);
        return {
          success: true,
          data: response.data,
          message: "Chapter created successfully!",
        };
      } catch (error) {
        const message = "Something went wrong while creating the chapter.";
        setError(message);
        console.error("Create chapter error:", error);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createChapter,
    loading,
    error,
    clearError,
  };
};

/**
 * Custom hook for module creation
 * Handles module creation with proper error handling according to task requirements
 */
export const useCreateModule = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createModule = useCallback(
    async (courseId: string, moduleData: any) => {
      try {
        setLoading(true);
        setError(null);

        // Convert to FormData or keep as object based on what API expects
        let apiData;
        if (moduleData instanceof FormData) {
          apiData = moduleData;
        } else {
          apiData = moduleData;
        }

        const response = await CourseAPI.createModule(courseId, apiData);

        if (!response.success) {
          // Handle specific error scenarios according to task requirements
          if (response.retryAfter) {
            const message = `Too many requests. Try again in ${formatRetryAfter(
              response.retryAfter
            )}.`;
            setError(message);
            console.error("Create module rate limited:", message);
            return { success: false, message, isRateLimit: true };
          }

          // Handle unauthorized (401)
          if (
            response.message?.includes("Invalid or expired token") ||
            response.message?.includes("Access token required")
          ) {
            const message = "Session expired. Please log in again.";
            setError(message);
            console.error("Create module unauthorized:", response.message);
            return { success: false, message, isUnauthorized: true };
          }

          // Handle forbidden (403)
          if (response.message?.includes("Access denied")) {
            const message = "You are not authorized to modify this course.";
            setError(message);
            console.error("Create module forbidden:", response.message);
            return { success: false, message, isForbidden: true };
          }

          // Handle not found (404)
          if (response.message?.includes("Chapter or course not found")) {
            const message = "Course or chapter not found. Please try again.";
            setError(message);
            console.error("Create module not found:", response.message);
            return { success: false, message, isNotFound: true };
          }

          // Handle validation errors (400) with clean formatting
          if (response.errors && response.errors.length > 0) {
            const message = formatSimpleErrors(response.errors);
            setError(message);
            console.error("Create module validation error:", response.errors);
            return { success: false, message, isValidationError: true };
          }

          // Handle server error (500)
          if (response.message?.includes("Internal server error")) {
            const message = "Something went wrong. Please try again later.";
            setError(message);
            console.error("Create module server error:", response.message);
            return { success: false, message, isServerError: true };
          }

          // Other API errors with clean formatting
          let message = response.message || "Failed to create module";
          if (response.errors && response.errors.length > 0) {
            message = formatSimpleErrors(response.errors);
          }
          setError(message);
          console.error("Create module failed:", message);
          return { success: false, message };
        }

        console.log("Module created successfully:", response.data);
        return {
          success: true,
          data: response.data,
          message: "Module created successfully!",
        };
      } catch (error) {
        const message = "Something went wrong while creating the module.";
        setError(message);
        console.error("Create module error:", error);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createModule,
    loading,
    error,
    clearError,
  };
};

/**
 * Custom hook for submitting course for review
 * Handles course submission with proper error handling according to task requirements
 */
export const useSubmitCourseForReview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitForReview = useCallback(
    async (courseId: string, submissionNotes?: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await CourseAPI.submitForReview(
          courseId,
          submissionNotes
        );

        if (!response.success) {
          // Handle specific error scenarios according to task requirements
          if (response.retryAfter) {
            const message = `Too many requests. Try again in ${formatRetryAfter(
              response.retryAfter
            )}.`;
            setError(message);
            console.error("Submit course rate limited:", message);
            return { success: false, message, isRateLimit: true };
          }

          // Handle unauthorized (401)
          if (
            response.message?.includes("Invalid or expired token") ||
            response.message?.includes("Access token required")
          ) {
            const message = "Session expired. Please log in again.";
            setError(message);
            console.error("Submit course unauthorized:", response.message);
            return { success: false, message, isUnauthorized: true };
          }

          // Handle validation errors (400)
          if (response.errors && response.errors.length > 0) {
            if (
              response.errors.some((err) => err.field === "submissionNotes")
            ) {
              const message = "Notes must be under 500 characters.";
              setError(message);
              console.error("Submit course validation error:", response.errors);
              return { success: false, message, isValidationError: true };
            }
            const message = "Course not ready for submission.";
            setError(message);
            console.error("Submit course not ready:", response.errors);
            return { success: false, message, isNotReady: true };
          }

          // Handle forbidden (403)
          if (
            response.success &&
            response.errors &&
            response.errors.length === 0
          ) {
            const message = "You are not authorized to submit this course.";
            setError(message);
            console.error("Submit course forbidden");
            return { success: false, message, isForbidden: true };
          }

          // Handle not found (404)
          if (
            response.success &&
            response.errors &&
            response.errors.length === 0
          ) {
            const message = "Course not found. Please refresh and try again.";
            setError(message);
            console.error("Submit course not found");
            return { success: false, message, isNotFound: true };
          }

          // Other API errors
          const message = formatApiError(response);
          setError(message);
          console.error("Submit course failed:", message);
          return { success: false, message };
        }

        console.log("Course submitted successfully:", response.data);
        return {
          success: true,
          data: response.data,
          message: "Course submitted successfully!",
        };
      } catch (error) {
        const message = "Something went wrong while submitting the course.";
        setError(message);
        console.error("Submit course error:", error);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    submitForReview,
    loading,
    error,
    clearError,
  };
};
