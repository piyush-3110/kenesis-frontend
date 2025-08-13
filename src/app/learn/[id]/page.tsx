"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CourseAPI } from "@/lib/api";
import { DASHBOARD_COLORS } from "../../dashboard/constants";
import {
  ArrowLeft,
  FileText,
  Download,
  CheckCircle,
  Lock,
  Menu,
  X,
  Clock,
  User,
  Star,
  BookOpen,
  Target,
  Users,
  BarChart3,
  ChevronRight,
  ChevronDown,
  PlayCircle,
  Bookmark,
  Calendar,
  Globe,
  Lightbulb,
  CheckSquare,
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import CustomVideoPlayer from "@/components/video/CustomVideoPlayer";
import CourseReviewsSection from "@/components/CourseReviewsSection";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: { username: string; bio?: string; avatar?: string };
  stats: {
    rating: number;
    reviewCount: number;
    duration: number;
    enrollmentCount?: number;
    completionRate?: number;
  };
  price?: number;
  originalPrice?: number;
  level?: "Beginner" | "Intermediate" | "Advanced";
  category?: string;
  language?: string;
  lastUpdated?: string;
  requirements?: string[];
  learningOutcomes?: string[];
  targetAudience?: string[];
  chapters: Chapter[];
  thumbnail?: string;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  modules: Module[];
  duration?: number;
  completed?: boolean;
}

interface Module {
  id: string;
  chapterId?: string; // Add chapterId to track which chapter this module belongs to
  title: string;
  description: string;
  type: "video" | "document";
  duration: number;
  order: number;
  isPreview: boolean;
  videoUrl?: string;
  completed?: boolean;
  attachments?: Array<{
    id: string;
    filename: string;
    originalName: string;
    size: number;
    url: string;
    type?: string;
  }>;
}

/**
 * Learning Page - Udemy-like interface for purchased courses
 * Displays video player, chapter navigation, and course content
 */
const LearningPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useUIStore();

  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [moduleContent, setModuleContent] = useState<{
    videoUrl?: string;
    attachments?: Array<{
      id: string;
      originalName: string;
      size: number;
      url: string;
      type?: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );
  const [courseProgress, setCourseProgress] = useState(0);
  const [showCourseInfo, setShowCourseInfo] = useState(false);
  const [failedChapters, setFailedChapters] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkAccessAndLoadCourse();
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedModule) {
      loadModuleContent();
    }
  }, [selectedModule]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadModulesForChapters = async (
    chapters: Chapter[]
  ): Promise<Chapter[]> => {
    console.log("📚 [MODULES] Loading modules for all chapters...");

    const chaptersWithModules: Chapter[] = [];
    let hasRateLimitError = false;
    const currentFailedChapters = new Set<string>();

    // Process chapters sequentially with delay to avoid rate limiting
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];

      try {
        console.log(
          `📚 [MODULES] Loading modules for chapter: ${chapter.id} (${i + 1}/${
            chapters.length
          })`
        );

        // Add a small delay between requests to avoid rate limiting
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        const modulesResponse = await CourseAPI.getModulesForChapter(
          chapter.id,
          courseId
        );

        console.log(
          `📚 [MODULES] Modules response for chapter ${chapter.id}:`,
          JSON.stringify(modulesResponse, null, 2)
        );

        if (modulesResponse.success) {
          const modules = modulesResponse.data?.modules || [];
          console.log(
            `📚 [MODULES] Found ${modules.length} modules for chapter ${chapter.id}`
          );
          chaptersWithModules.push({
            ...chapter,
            modules: modules
              .map((m: any) => ({
                ...m,
                chapterId: chapter.id, // Add the chapter ID to each module
                description: m.description ?? "",
              }))
              .sort((a: Module, b: Module) => a.order - b.order),
          });
        } else {
          console.error(
            `❌ [MODULES] Failed to load modules for chapter ${chapter.id}:`,
            modulesResponse.message
          );

          // Handle rate limiting and other errors with toast notifications
          if (
            modulesResponse.message?.toLowerCase().includes("too many requests")
          ) {
            hasRateLimitError = true;
            currentFailedChapters.add(chapter.id);
            chaptersWithModules.push({ ...chapter, modules: [] });

            // Break early on rate limit to avoid more requests
            console.log(
              "⚠️ [MODULES] Rate limit detected, skipping remaining chapters"
            );
            // Add remaining chapters without modules
            for (let j = i + 1; j < chapters.length; j++) {
              currentFailedChapters.add(chapters[j].id);
              chaptersWithModules.push({ ...chapters[j], modules: [] });
            }
            break;
          } else {
            currentFailedChapters.add(chapter.id);
            addToast({
              type: "error",
              message: `Failed to load modules for chapter: ${chapter.title}`,
            });
            chaptersWithModules.push({ ...chapter, modules: [] });
          }
        }
      } catch (err) {
        console.error(
          `❌ [MODULES] Exception loading modules for chapter ${chapter.id}:`,
          err
        );

        // Handle different types of errors
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";

        if (
          errorMessage.toLowerCase().includes("network") ||
          errorMessage.toLowerCase().includes("fetch")
        ) {
          addToast({
            type: "error",
            message:
              "Network error while loading modules. Please check your connection.",
          });
        } else if (errorMessage.toLowerCase().includes("timeout")) {
          addToast({
            type: "warning",
            message:
              "Request timed out while loading modules. Please try again.",
          });
        } else {
          addToast({
            type: "error",
            message: `Error loading modules for chapter: ${chapter.title}`,
          });
        }

        currentFailedChapters.add(chapter.id);
        chaptersWithModules.push({ ...chapter, modules: [] });
      }
    }

    // Show rate limit toast only once at the end
    if (hasRateLimitError) {
      addToast({
        type: "warning",
        message:
          "Rate limit reached. Some modules may not load. Please wait a moment and refresh the page.",
      });
    }

    // Update failed chapters state
    setFailedChapters(currentFailedChapters);

    console.log(
      "📚 [MODULES] All chapters with modules loaded:",
      JSON.stringify(chaptersWithModules, null, 2)
    );
    return chaptersWithModules;
  };

  const checkAccessAndLoadCourse = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔐 [LEARN] ============= STARTING ACCESS CHECK =============");
      console.log("🔐 [LEARN] Course ID:", courseId);
      console.log("🔐 [LEARN] Timestamp:", new Date().toISOString());
      console.log("🔐 [LEARN] User Agent:", navigator.userAgent);
      
      // Get current user info for debugging
      const currentUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      console.log("🔐 [LEARN] Current user data:", currentUser ? JSON.parse(currentUser) : 'No user data found');
      
      // Get current token for debugging
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log("🔐 [LEARN] Token present:", !!token);
      console.log("🔐 [LEARN] Token length:", token ? token.length : 0);
      console.log("🔐 [LEARN] Token preview:", token ? `${token.substring(0, 20)}...` : 'No token');

      // Check if user has access to this course
      console.log("🔐 [LEARN] Making access check API call...");
      console.log("🔐 [LEARN] API endpoint: /api/courses/purchases/access/" + courseId);
      
      const accessResponse = await CourseAPI.checkCourseAccess(courseId);

      console.log("🔐 [LEARN] ============= ACCESS CHECK RESPONSE =============");
      console.log("🔐 [LEARN] Full response object:", accessResponse);
      console.log("🔐 [LEARN] Response type:", typeof accessResponse);
      console.log("🔐 [LEARN] Response keys:", Object.keys(accessResponse || {}));
      console.log("🔐 [LEARN] Access response success:", accessResponse?.success);
      console.log("🔐 [LEARN] Access response message:", accessResponse?.message);
      console.log("🔐 [LEARN] Access response data:", accessResponse?.data);
      console.log("🔐 [LEARN] Raw JSON:", JSON.stringify(accessResponse, null, 2));
      
      // Handle nested response structure - the API returns data.data.hasAccess
      const responseData = accessResponse?.data?.data || accessResponse?.data;
      const hasAccessValue = responseData?.hasAccess;
      const isSuccess = accessResponse?.data?.success || accessResponse?.success;
      
      console.log("🔐 [LEARN] ============= PARSED ACCESS DATA =============");
      console.log("🔐 [LEARN] Response data extracted:", responseData);
      console.log("🔐 [LEARN] Is success:", isSuccess);
      console.log("🔐 [LEARN] Has access value:", hasAccessValue);
      console.log("🔐 [LEARN] Has access type:", typeof hasAccessValue);

      if (isSuccess && hasAccessValue === true) {
        console.log("✅ [LEARN] ============= ACCESS GRANTED =============");
        console.log("✅ [LEARN] Access granted, proceeding to load course...");
        setHasAccess(true);

        // Load course data with chapters and modules
        console.log("📚 [LEARN] ============= LOADING COURSE DATA =============");
        console.log("📚 [LEARN] Making course API call...");
        console.log("📚 [LEARN] API endpoint: /api/courses/" + courseId);
        
        const courseResponse = await CourseAPI.getCourse(courseId);

        console.log("📚 [LEARN] ============= COURSE RESPONSE =============");
        console.log("📚 [LEARN] Full course response:", courseResponse);
        console.log("📚 [LEARN] Course response type:", typeof courseResponse);
        console.log("📚 [LEARN] Course response keys:", Object.keys(courseResponse || {}));
        console.log("📚 [LEARN] Course response success:", courseResponse?.success);
        console.log("📚 [LEARN] Course response message:", courseResponse?.message);
        console.log("📚 [LEARN] Course response data:", courseResponse?.data);
        console.log("📚 [LEARN] Raw course JSON:", JSON.stringify(courseResponse, null, 2));

        if (courseResponse.success) {
          const courseData = courseResponse.data?.data?.course || courseResponse.data?.course || courseResponse.data;
          console.log(
            "📚 [LEARN] Course data extracted:",
            JSON.stringify(courseData, null, 2)
          );

          // Load chapters with modules
          console.log("📖 [LEARN] Loading chapters with modules...");
          const chaptersResponse = await CourseAPI.getChapters(courseId, true);

          console.log(
            "📖 [LEARN] Chapters response:",
            JSON.stringify(chaptersResponse, null, 2)
          );
          console.log(
            "📖 [LEARN] Chapters response success:",
            chaptersResponse.success
          );

          if (chaptersResponse.success) {
            const chapters = chaptersResponse.data?.chapters || [];
            console.log(
              "📖 [LEARN] Chapters extracted:",
              JSON.stringify(chapters, null, 2)
            );
            console.log("📖 [LEARN] Number of chapters:", chapters.length);

            const sortedChapters = chapters.sort(
              (a: Chapter, b: Chapter) => a.order - b.order
            );
            console.log(
              "📖 [LEARN] Sorted chapters:",
              JSON.stringify(sortedChapters, null, 2)
            );

            // Load modules for each chapter
            const chaptersWithModules = await loadModulesForChapters(
              sortedChapters
            );

            const fullCourse: Course = {
              ...courseData,
              chapters: chaptersWithModules,
            };

            console.log(
              "📚 [LEARN] Full course object created:",
              JSON.stringify(fullCourse, null, 2)
            );
            setCourse(fullCourse);

            // Initialize expanded chapters
            const allChapterIds = new Set<string>(
              chaptersWithModules.map((ch: Chapter) => ch.id)
            );
            setExpandedChapters(allChapterIds);

            // Calculate initial progress
            setTimeout(() => setCourseProgress(calculateProgress()), 100);

            // Auto-select the first module
            if (
              chaptersWithModules.length > 0 &&
              chaptersWithModules[0].modules?.length > 0
            ) {
              const firstModule = chaptersWithModules[0].modules.sort(
                (a: Module, b: Module) => a.order - b.order
              )[0];
              console.log(
                "🎯 [LEARN] Auto-selecting first module:",
                JSON.stringify(firstModule, null, 2)
              );
              setSelectedModule(firstModule);
            } else {
              console.log("⚠️ [LEARN] No modules found to auto-select");
            }
          } else {
            console.error(
              "❌ [LEARN] Failed to load chapters:",
              chaptersResponse.message
            );
            throw new Error(
              chaptersResponse.message || "Failed to load chapters"
            );
          }
        } else {
          console.error("❌ [LEARN] Failed to load course:", courseResponse.message);
          throw new Error(courseResponse.message || "Failed to load course");
        }
      } else {
        console.log("🚫 [LEARN] ============= ACCESS DENIED =============");
        console.log("🚫 [LEARN] Access denied details:");
        console.log("🚫 [LEARN] Response success:", isSuccess);
        console.log("🚫 [LEARN] Response message:", accessResponse?.data?.message || accessResponse?.message);
        console.log("🚫 [LEARN] Response data:", responseData);
        console.log("🚫 [LEARN] Has access value:", hasAccessValue);
        console.log("🚫 [LEARN] Full response:", JSON.stringify(accessResponse, null, 2));
        
        // Check if it's an authentication issue
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          console.log("🚫 [LEARN] No authentication token found!");
          setError("Authentication required. Please log in again.");
        } else if (hasAccessValue === false) {
          console.log("🚫 [LEARN] User authenticated but course not purchased or access denied");
          setError("You do not have access to this course. Please purchase it first.");
        } else if (!isSuccess) {
          console.log("🚫 [LEARN] API call failed");
          setError(accessResponse?.data?.message || accessResponse?.message || "Failed to check course access.");
        } else {
          console.log("🚫 [LEARN] Unknown access issue. Possible reasons:");
          console.log("🚫 [LEARN] 1. Course not purchased");
          console.log("🚫 [LEARN] 2. Token expired");
          console.log("🚫 [LEARN] 3. Server authentication issue");
          console.log("🚫 [LEARN] 4. API endpoint changed");
          setError("Unable to verify course access. Please try again or contact support.");
        }
        
        setHasAccess(false);
      }
    } catch (err: any) {
      console.error("❌ [LEARN] ============= EXCEPTION OCCURRED =============");
      console.error("❌ [LEARN] Exception in checkAccessAndLoadCourse:", err);
      console.error("❌ [LEARN] Error type:", typeof err);
      console.error("❌ [LEARN] Error constructor:", err?.constructor?.name);
      console.error("❌ [LEARN] Error message:", err?.message);
      console.error("❌ [LEARN] Error stack:", err?.stack);
      console.error("❌ [LEARN] Error response:", err?.response);
      console.error("❌ [LEARN] Error response data:", err?.response?.data);
      console.error("❌ [LEARN] Error response status:", err?.response?.status);
      console.error("❌ [LEARN] Error response headers:", err?.response?.headers);
      console.error("❌ [LEARN] Full error object:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      
      let errorMessage = "Failed to load course content";
      
      if (err?.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
        console.error("❌ [LEARN] 401 Unauthorized - Token may be expired");
      } else if (err?.response?.status === 403) {
        errorMessage = "Access forbidden. You may not have purchased this course.";
        console.error("❌ [LEARN] 403 Forbidden - Access denied");
      } else if (err?.response?.status === 404) {
        errorMessage = "Course not found.";
        console.error("❌ [LEARN] 404 Not Found - Course doesn't exist");
      } else if (err?.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
        console.error("❌ [LEARN] 5xx Server Error");
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);

      addToast({
        type: "error",
        message: "Failed to load course. Please try again.",
      });
    } finally {
      setLoading(false);
      console.log("🔐 [LEARN] ============= ACCESS CHECK COMPLETED =============");
      console.log("🔐 [LEARN] Final state - Loading:", false);
      console.log("🔐 [LEARN] Final state - Has Access:", hasAccess);
      console.log("🔐 [LEARN] Final state - Error:", error);
    }
  };

  const loadModuleContent = async () => {
    if (!selectedModule) {
      console.log("⚠️ [MODULE] No selected module, skipping content load");
      return;
    }

    try {
      setContentLoading(true);

      console.log("📖 [MODULE] Loading module content...");
      console.log("📖 [MODULE] Course ID:", courseId);
      console.log("📖 [MODULE] Module ID:", selectedModule.id);
      console.log(
        "📖 [MODULE] Module details:",
        JSON.stringify(selectedModule, null, 2)
      );

      // Find the chapter that contains this module
      let chapterId = selectedModule.chapterId;
      if (!chapterId && course) {
        const chapter = course.chapters.find(ch => 
          ch.modules.some(m => m.id === selectedModule.id)
        );
        chapterId = chapter?.id;
      }

      if (!chapterId) {
        console.error("❌ [MODULE] Could not find chapter ID for module:", selectedModule.id);
        throw new Error("Could not find chapter for this module");
      }

      console.log("📖 [MODULE] Chapter ID:", chapterId);

      const response = await CourseAPI.getModuleContent(
        courseId,
        chapterId,
        selectedModule.id
      );

      console.log(
        "📖 [MODULE] Module content response:",
        JSON.stringify(response, null, 2)
      );
      console.log("📖 [MODULE] Response success:", response.success);
      console.log(
        "📖 [MODULE] Response data:",
        JSON.stringify(response.data, null, 2)
      );

      if (response.success) {
        console.log("✅ [MODULE] Module content loaded successfully");
        // Transform the response to match our interface
        const transformedContent = {
          videoUrl: response.data?.videoUrl,
          attachments: response.data?.attachments?.map(
            (att: {
              name: string;
              url: string;
              fileSize: number;
              mimeType: string;
            }) => ({
              id: `${selectedModule.id}-${att.name}`, // Generate an ID since API doesn't provide one
              originalName: att.name,
              url: att.url,
              type: att.mimeType,
              size: att.fileSize,
            })
          ),
        };
        setModuleContent(transformedContent);
      } else {
        console.error(
          "❌ [MODULE] Failed to load module content:",
          response.message
        );
        throw new Error(response.message || "Failed to load module content");
      }
    } catch (err: any) {
      console.error("❌ [MODULE] Exception in loadModuleContent:", err);
      console.error("❌ [MODULE] Error message:", err.message);
      console.error("❌ [MODULE] Error stack:", err.stack);

      addToast({
        type: "error",
        message: "Failed to load module content",
      });
    } finally {
      setContentLoading(false);
      console.log("📖 [MODULE] loadModuleContent completed");
    }
  };

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
  };

  const retryFailedChapters = async () => {
    if (!course || failedChapters.size === 0) return;

    addToast({
      type: "info",
      message: "Retrying to load modules...",
    });

    const failedChaptersList = course.chapters.filter((ch) =>
      failedChapters.has(ch.id)
    );

    try {
      const retryChapters = await loadModulesForChapters(failedChaptersList);

      // Update the course with the retried chapters
      const updatedChapters = course.chapters.map((chapter) => {
        const retryChapter = retryChapters.find((rch) => rch.id === chapter.id);
        return retryChapter || chapter;
      });

      setCourse({
        ...course,
        chapters: updatedChapters,
      });

      addToast({
        type: "success",
        message: "Successfully retried loading modules!",
      });
    } catch (error) {
      addToast({
        type: "error",
        message: "Retry failed. Please try again later.",
      });
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getAllModules = (): Module[] => {
    if (!course) return [];

    return course.chapters.reduce((modules: Module[], chapter) => {
      return [...modules, ...(chapter.modules || [])];
    }, []);
  };

  const getCurrentModuleIndex = (): number => {
    const allModules = getAllModules();
    return allModules.findIndex((m) => m.id === selectedModule?.id);
  };

  const getNextModule = (): Module | null => {
    const allModules = getAllModules();
    const currentIndex = getCurrentModuleIndex();

    if (currentIndex >= 0 && currentIndex < allModules.length - 1) {
      return allModules[currentIndex + 1];
    }

    return null;
  };

  const getPreviousModule = (): Module | null => {
    const allModules = getAllModules();
    const currentIndex = getCurrentModuleIndex();

    if (currentIndex > 0) {
      return allModules[currentIndex - 1];
    }

    return null;
  };

  const calculateProgress = (): number => {
    if (!course) return 0;

    const allModules = getAllModules();
    const completedModules = allModules.filter((m) => m.completed);

    return allModules.length > 0
      ? (completedModules.length / allModules.length) * 100
      : 0;
  };

  const toggleChapterExpansion = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const markModuleCompleted = (moduleId: string) => {
    if (!course) return;

    const updatedCourse = {
      ...course,
      chapters: course.chapters.map((chapter) => ({
        ...chapter,
        modules: chapter.modules.map((module) =>
          module.id === moduleId ? { ...module, completed: true } : module
        ),
      })),
    };

    setCourse(updatedCourse);
    setCourseProgress(calculateProgress());
  };

  const getChapterProgress = (chapter: Chapter): number => {
    if (!chapter.modules || chapter.modules.length === 0) return 0;

    const completedModules = chapter.modules.filter((m) => m.completed);
    return (completedModules.length / chapter.modules.length) * 100;
  };

  const getBadgeColor = (level?: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Intermediate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: DASHBOARD_COLORS.PRIMARY_BG }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading your learning experience...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess || error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: DASHBOARD_COLORS.PRIMARY_BG }}
      >
        <div className="text-center max-w-md">
          <Lock className="mx-auto mb-4 text-red-400" size={48} />
          <h2 className="text-xl font-bold text-white mb-4">Access Required</h2>
          <p className="text-gray-400 mb-6">
            {error || "You need to purchase this course to access the content."}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/dashboard/purchased-products")}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              My Courses
            </button>
            <button
              onClick={() => router.push("/marketplace")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: DASHBOARD_COLORS.PRIMARY_BG }}
      >
        <div className="text-center">
          <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-white">Course not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-16 lg:pt-28 relative">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6,128,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6,128,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            background: DASHBOARD_COLORS.PRIMARY_BG,
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.1) 80%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.1) 80%, transparent 100%)",
          }}
        />
      </div>

      {/* Background Base */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: DASHBOARD_COLORS.PRIMARY_BG }}
      />

      {/* Course Header */}
      <div
        className="relative border-b px-4 sm:px-6 py-3 backdrop-blur-sm"
        style={{
          background:
            "linear-gradient(152.97deg, rgba(6,128,255,0.08) 18.75%, rgba(0,0,0,0.4) 100%)",
          borderImage: "linear-gradient(90deg, #0680FF 0%, #022ED2 100%) 1",
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <button
              onClick={() => router.push("/dashboard/purchased-products")}
              className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors group"
            >
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="text-sm hidden sm:inline">
                Back to My Courses
              </span>
              <span className="text-sm sm:hidden">Back</span>
            </button>

            {/* Gradient Separator */}
            <div
              className="h-5 w-px"
              style={{
                background:
                  "linear-gradient(180deg, #0680FF 0%, transparent 100%)",
              }}
            />

            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-semibold text-white line-clamp-1">
                {course.title}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <User size={12} />
                  <span>{course.instructor?.username}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Star size={12} className="text-yellow-400" />
                  <span>{course.stats?.rating || "N/A"}</span>
                  <span>({course.stats?.reviewCount || 0})</span>
                </div>
                {course.level && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full border ${getBadgeColor(
                      course.level
                    )}`}
                  >
                    {course.level}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Progress Indicator */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-white">
                  {Math.round(courseProgress)}%
                </div>
                <div className="text-xs text-gray-400">
                  {getAllModules().filter((m) => m.completed).length}/
                  {getAllModules().length} lessons
                </div>
              </div>
              <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                  style={{ width: `${courseProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowCourseInfo(!showCourseInfo)}
                className="p-2 text-gray-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-500/10"
                title="Course Information"
              >
                <BookOpen size={16} />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-500/10"
                title="Bookmark"
              >
                <Bookmark size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Course Navigation Sidebar */}
        <div
          className={`${
            sidebarOpen ? "w-72 sm:w-80" : "w-0"
          } transition-all duration-300 overflow-hidden flex-shrink-0 relative`}
        >
          {/* Sidebar Background with Gradient Border */}
          <div
            className="h-full relative"
            style={{
              background:
                "linear-gradient(152.97deg, rgba(6,128,255,0.05) 18.75%, rgba(0,0,0,0.3) 100%)",
            }}
          >
            {/* Right Border Gradient */}
            <div
              className="absolute right-0 top-0 bottom-0 w-px"
              style={{
                background:
                  "linear-gradient(180deg, #0680FF 0%, rgba(1,5,25,0.5) 88.45%)",
              }}
            />

            <div className="h-full overflow-y-auto backdrop-blur-sm">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-800/30">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-white">
                    Course Content
                  </h2>
                  <div className="flex items-center gap-2">
                    {failedChapters.size > 0 && (
                      <button
                        onClick={retryFailedChapters}
                        className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded hover:bg-yellow-500/30 transition-colors border border-yellow-500/30"
                        title="Retry loading failed modules"
                      >
                        Retry
                      </button>
                    )}
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="text-gray-400 hover:text-white transition-colors lg:hidden"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  {course.chapters.length} chapters • {getAllModules().length}{" "}
                  lessons • {formatDuration(course.stats?.duration || 0)}
                  {failedChapters.size > 0 && (
                    <div className="text-yellow-400 mt-1">
                      ⚠️ {failedChapters.size} chapter
                      {failedChapters.size > 1 ? "s" : ""} failed to load
                      modules
                    </div>
                  )}
                </div>
              </div>

              {/* Chapters and Modules */}
              <div className="p-3 space-y-3">
                {course.chapters.map((chapter, chapterIndex) => {
                  const chapterProgress = getChapterProgress(chapter);
                  const isExpanded = expandedChapters.has(chapter.id);

                  return (
                    <div key={chapter.id} className="space-y-2">
                      {/* Chapter Header */}
                      <button
                        onClick={() => toggleChapterExpansion(chapter.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-transparent transition-all duration-200 backdrop-blur-sm border ${
                          failedChapters.has(chapter.id)
                            ? "bg-yellow-500/10 border-yellow-500/30"
                            : "bg-gray-800/30 border-gray-700/30"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <ChevronDown
                                size={14}
                                className="text-blue-400"
                              />
                            ) : (
                              <ChevronRight
                                size={14}
                                className="text-gray-400"
                              />
                            )}
                          </div>

                          <div className="text-left flex-1">
                            <div className="text-sm font-medium text-white flex items-center gap-2">
                              Chapter {chapterIndex + 1}: {chapter.title}
                              {failedChapters.has(chapter.id) && (
                                <span className="text-yellow-400 text-xs">
                                  ⚠️
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {chapter.modules?.length || 0} lessons •{" "}
                              {Math.round(chapterProgress)}% complete
                              {failedChapters.has(chapter.id) && (
                                <span className="text-yellow-400 ml-1">
                                  (modules failed to load)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="w-6 h-1 bg-gray-700 rounded-full overflow-hidden ml-2">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
                            style={{ width: `${chapterProgress}%` }}
                          ></div>
                        </div>
                      </button>

                      {/* Chapter Modules */}
                      {isExpanded && (
                        <div className="space-y-1 ml-4">
                          {chapter.modules?.map((module, moduleIndex) => (
                            <button
                              key={module.id}
                              onClick={() => handleModuleSelect(module)}
                              className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
                                selectedModule?.id === module.id
                                  ? "bg-gradient-to-r from-blue-600/20 to-blue-500/5 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                                  : "hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-transparent hover:border hover:border-blue-500/20"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  {module.completed ? (
                                    <CheckCircle
                                      size={14}
                                      className="text-green-400"
                                    />
                                  ) : module.type === "video" ? (
                                    <PlayCircle
                                      size={14}
                                      className={
                                        selectedModule?.id === module.id
                                          ? "text-blue-400"
                                          : "text-blue-300"
                                      }
                                    />
                                  ) : (
                                    <FileText
                                      size={14}
                                      className={
                                        selectedModule?.id === module.id
                                          ? "text-green-400"
                                          : "text-green-300"
                                      }
                                    />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm font-medium line-clamp-2 ${
                                      selectedModule?.id === module.id
                                        ? "text-blue-400"
                                        : "text-white group-hover:text-blue-300"
                                    }`}
                                  >
                                    {moduleIndex + 1}. {module.title}
                                  </p>

                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-400">
                                      {formatDuration(module.duration)}
                                    </span>
                                    {module.isPreview && (
                                      <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                                        Preview
                                      </span>
                                    )}
                                    {module.completed && (
                                      <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                                        Completed
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Course Information Panel */}
          {showCourseInfo && (
            <div
              className="border-b p-4 sm:p-6 backdrop-blur-sm"
              style={{
                background:
                  "linear-gradient(152.97deg, rgba(6,128,255,0.05) 18.75%, rgba(0,0,0,0.2) 100%)",
                borderImage:
                  "linear-gradient(90deg, #0680FF 0%, #022ED2 100%) 1",
                borderBottomWidth: "1px",
                borderBottomStyle: "solid",
              }}
            >
              <div className="max-w-5xl mx-auto">
                <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
                  {/* Course Stats */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <BarChart3 size={16} className="text-blue-400" />
                      Course Overview
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-green-400" />
                        <span className="text-sm text-gray-300">
                          Duration:{" "}
                          {formatDuration(course.stats?.duration || 0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-purple-400" />
                        <span className="text-sm text-gray-300">
                          Students: {course.stats?.enrollmentCount || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-yellow-400" />
                        <span className="text-sm text-gray-300">
                          Language: {course.language || "English"}
                        </span>
                      </div>
                      {course.lastUpdated && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-orange-400" />
                          <span className="text-sm text-gray-300">
                            Updated: {course.lastUpdated}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Learning Outcomes */}
                  {course.learningOutcomes &&
                    course.learningOutcomes.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                          <Target size={16} className="text-green-400" />
                          What You&apos;ll Learn
                        </h3>
                        <ul className="space-y-2">
                          {course.learningOutcomes
                            .slice(0, 4)
                            .map((outcome, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <CheckSquare
                                  size={12}
                                  className="text-green-400 mt-0.5 flex-shrink-0"
                                />
                                <span className="text-sm text-gray-300">
                                  {outcome}
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                  {/* Requirements */}
                  {course.requirements && course.requirements.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                        <Lightbulb size={16} className="text-yellow-400" />
                        Requirements
                      </h3>
                      <ul className="space-y-2">
                        {course.requirements
                          .slice(0, 4)
                          .map((requirement, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-gray-300">
                                {requirement}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Module Content Header */}
          <div
            className="border-b p-3 sm:p-4 backdrop-blur-sm"
            style={{
              background:
                "linear-gradient(152.97deg, rgba(6,128,255,0.03) 18.75%, rgba(0,0,0,0.1) 100%)",
              borderBottomColor: "rgba(107,114,128,0.3)",
            }}
          >
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {!sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="text-gray-400 hover:text-blue-400 transition-colors p-1 rounded"
                  >
                    <Menu size={18} />
                  </button>
                )}

                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-lg font-semibold text-white line-clamp-1">
                    {selectedModule?.title || "Welcome to Your Course"}
                  </h1>
                  {selectedModule && (
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{formatDuration(selectedModule.duration)}</span>
                      <span>•</span>
                      <span className="capitalize">{selectedModule.type}</span>
                      {selectedModule.isPreview && (
                        <>
                          <span>•</span>
                          <span className="text-green-400">
                            Preview Available
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Controls */}
              {selectedModule && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const prev = getPreviousModule();
                      if (prev) setSelectedModule(prev);
                    }}
                    disabled={!getPreviousModule()}
                    className="px-3 py-1.5 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm border border-gray-600/30"
                  >
                    Previous
                  </button>

                  <button
                    onClick={() => markModuleCompleted(selectedModule.id)}
                    className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors text-sm"
                  >
                    Complete
                  </button>

                  <button
                    onClick={() => {
                      const next = getNextModule();
                      if (next) setSelectedModule(next);
                    }}
                    disabled={!getNextModule()}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto relative">
            {/* Additional Grid Overlay for Content Area */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(6,128,255,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(6,128,255,0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: "40px 40px",
                  maskImage:
                    "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.3) 80%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.3) 80%, transparent 100%)",
                }}
              />
            </div>

            {selectedModule ? (
              <div className="max-w-5xl mx-auto p-4 sm:p-6 relative z-10">
                {contentLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400 text-sm">
                      Loading lesson content...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Video Player */}
                    {selectedModule.type === "video" &&
                      moduleContent?.videoUrl && (
                        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-700/30">
                          <CustomVideoPlayer
                            src={moduleContent.videoUrl}
                            title={selectedModule.title}
                            onEnded={() =>
                              markModuleCompleted(selectedModule.id)
                            }
                            documents={moduleContent?.attachments?.map(
                              (att: {
                                id: string;
                                originalName: string;
                                url: string;
                                type?: string;
                                size: number;
                              }) => ({
                                id: att.id,
                                title: att.originalName,
                                url: att.url,
                                type:
                                  (att.type as
                                    | "pdf"
                                    | "doc"
                                    | "docx"
                                    | "ppt"
                                    | "pptx"
                                    | "txt"
                                    | "other") || "other",
                                size: att.size
                                  ? `${(att.size / 1024 / 1024).toFixed(2)} MB`
                                  : undefined,
                              })
                            )}
                            className="w-full h-full"
                          />
                        </div>
                      )}

                    {/* Module Description */}
                    {selectedModule.description && (
                      <div
                        className="rounded-xl p-6 backdrop-blur-sm border border-gray-700/30"
                        style={{
                          background:
                            "linear-gradient(152.97deg, rgba(6,128,255,0.05) 18.75%, rgba(0,0,0,0.2) 100%)",
                        }}
                      >
                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <BookOpen size={20} className="text-blue-400" />
                          About This Lesson
                        </h2>
                        <div className="prose prose-invert max-w-none">
                          <p className="text-gray-300 leading-relaxed text-base">
                            {selectedModule.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Downloadable Resources */}
                    {moduleContent?.attachments &&
                      moduleContent.attachments.length > 0 && (
                        <div
                          className="rounded-xl p-6 backdrop-blur-sm border border-gray-700/30"
                          style={{
                            background:
                              "linear-gradient(152.97deg, rgba(6,128,255,0.05) 18.75%, rgba(0,0,0,0.2) 100%)",
                          }}
                        >
                          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Download size={20} className="text-green-400" />
                            Downloadable Resources
                          </h2>
                          <div className="grid gap-3">
                            {moduleContent.attachments.map(
                              (attachment: {
                                id: string;
                                originalName: string;
                                size: number;
                                url: string;
                                type?: string;
                              }) => (
                                <div
                                  key={attachment.id}
                                  className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-blue-500/30 hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-transparent transition-all duration-200 backdrop-blur-sm"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                                      <FileText
                                        className="text-blue-400"
                                        size={18}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-white font-medium text-sm">
                                        {attachment.originalName}
                                      </p>
                                      <p className="text-gray-400 text-xs">
                                        {(
                                          attachment.size /
                                          1024 /
                                          1024
                                        ).toFixed(2)}{" "}
                                        MB
                                      </p>
                                    </div>
                                  </div>

                                  <a
                                    href={attachment.url}
                                    download={attachment.originalName}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium text-sm"
                                  >
                                    <Download size={14} />
                                    Download
                                  </a>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Lesson Navigation */}
                    <div className="flex justify-between items-center pt-6">
                      {/* Gradient Separator */}
                      {/* <div 
                        className="absolute left-0 right-0 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent 0%, #0680FF 50%, transparent 100%)' }}
                      /> */}

                      <div className="pt-6">
                        {getPreviousModule() && (
                          <button
                            onClick={() => {
                              const prev = getPreviousModule();
                              if (prev) setSelectedModule(prev);
                            }}
                            className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 text-white rounded-lg hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 transition-all duration-200 backdrop-blur-sm border border-gray-700/30"
                          >
                            <ArrowLeft size={16} />
                            <div className="text-left">
                              <div className="text-xs text-gray-400">
                                Previous Lesson
                              </div>
                              <div className="font-medium line-clamp-1 text-sm">
                                {getPreviousModule()?.title}
                              </div>
                            </div>
                          </button>
                        )}
                      </div>

                      <div className="pt-6">
                        {getNextModule() && (
                          <button
                            onClick={() => {
                              const next = getNextModule();
                              if (next) setSelectedModule(next);
                            }}
                            className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors border border-blue-500/30"
                          >
                            <div className="text-right">
                              <div className="text-xs text-blue-200">
                                Next Lesson
                              </div>
                              <div className="font-medium line-clamp-1 text-sm">
                                {getNextModule()?.title}
                              </div>
                            </div>
                            <ChevronRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full relative z-10">
                <div className="text-center max-w-md mx-auto p-6">
                  <div
                    className="p-8 rounded-2xl backdrop-blur-sm border border-gray-700/30"
                    style={{
                      background:
                        "linear-gradient(152.97deg, rgba(6,128,255,0.08) 18.75%, rgba(0,0,0,0.3) 100%)",
                    }}
                  >
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                      <PlayCircle
                        className="mx-auto text-blue-400 relative z-10"
                        size={48}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      Welcome to Your Course!
                    </h3>
                    <p className="text-gray-400 mb-6 text-sm">
                      Ready to start learning? Select a lesson from the course
                      content sidebar to begin your journey.
                    </p>
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium text-sm border border-blue-500/30"
                    >
                      View Course Content
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Course Reviews Section - Always visible */}
          <div className="w-full px-4 sm:px-6 py-8 relative z-10">
            {/* Gradient Separator */}
            <div
              className="w-full h-px mb-8"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, #0680FF 50%, transparent 100%)",
              }}
            />

            <CourseReviewsSection
              courseId={courseId}
              courseTitle={course.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;
