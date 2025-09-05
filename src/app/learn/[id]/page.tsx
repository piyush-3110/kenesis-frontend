"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useCourseAccess } from "@/hooks/useCourseAccess";
import { useCourse } from "@/hooks/useCourseQuery";
import { useCourseChaptersWithModules } from "@/features/learning/hooks/useCourseChaptersWithModules";
import { useModuleContent } from "@/features/learning/hooks/useModuleContent";
import { useToastMessages } from "@/hooks/useToastMessages";
import type { Module } from "@/features/learning/types";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { useCourseProgressStore } from "@/store/useCourseProgressStore";
import { CourseHeader } from "@/features/learning/components";
import { Sidebar } from "@/features/learning/components/Sidebar";
import { ModuleContent } from "@/features/learning/components/ModuleContent";
import CourseReviewsSection from "@/features/reviews/CourseReviewsSection";
import { useCompleteModule } from "@/features/learning/hooks/useCompleteModule";
import { useGenerateCertificate } from "@/hooks/useGenerateCertificate";
import { CourseInfoSection } from "@/features/learning/components/CourseInfoSection";
import { CourseCompletionBanner } from "@/features/learning/components/CourseCompletionBanner";
import { LoadingState, AccessRequiredState } from "@/features/learning/components/LearningPageStates";

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const LearningPage: React.FC = () => {
  const params = useParams();
  const courseId = params.id as string;
  const { messages } = useToastMessages();

  console.log("🚀 [LEARN_PAGE] Starting learn page...");
  console.log("🚀 [LEARN_PAGE] Course ID:", courseId);

  useCourseProgress(courseId);
  const { completedModules, completionPercentage } = useCourseProgressStore();

  const accessQuery = useCourseAccess(courseId, !!courseId);
  const courseQuery = useCourse(courseId);
  const { chapters, isLoading: chaptersLoading, error: chaptersError } = useCourseChaptersWithModules(
    courseId,
    !!(courseId && accessQuery.data?.hasAccess)
  );

  console.log("📊 [LEARN_PAGE] Access query state:", {
    isLoading: accessQuery.isLoading,
    hasAccess: accessQuery.data?.hasAccess,
    error: accessQuery.error
  });

  console.log("📊 [LEARN_PAGE] Course query state:", {
    isLoading: courseQuery.isLoading,
    hasData: !!courseQuery.data,
    error: courseQuery.error
  });

  console.log("📊 [LEARN_PAGE] Chapters state:", {
    isLoading: chaptersLoading,
    chaptersCount: chapters?.length || 0,
    error: chaptersError
  });

  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [showInfo, setShowInfo] = React.useState(false);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [selectedModuleId, setSelectedModuleId] = React.useState<string | null>(null);

  const { mutate: markModuleAsComplete } = useCompleteModule(courseId, () => {});
  const { mutate: downloadCertificate, isPending: isGeneratingCertificate } = useGenerateCertificate();

  const completed = React.useMemo(() => new Set(completedModules), [completedModules]);

  const effectiveChapters = React.useMemo(
    () =>
      (chapters || []).map((ch) => ({
        ...ch,
        modules: ch.modules.map((m) => ({
          ...m,
          completed: completed.has(m.id),
        })),
      })),
    [chapters, completed]
  );

  const allModules: Module[] = React.useMemo(
    () => effectiveChapters.flatMap((c) => c.modules),
    [effectiveChapters]
  );
  const selectedModule: Module | null = React.useMemo(
    () => allModules.find((m) => m.id === selectedModuleId) || null,
    [allModules, selectedModuleId]
  );

  React.useEffect(() => {
    console.log("🔄 [LEARN_PAGE] Chapters/modules effect triggered");
    console.log("🔄 [LEARN_PAGE] Effective chapters count:", effectiveChapters.length);
    console.log("🔄 [LEARN_PAGE] Expanded chapters count:", expanded.size);
    console.log("🔄 [LEARN_PAGE] All modules count:", allModules.length);
    console.log("🔄 [LEARN_PAGE] Selected module ID:", selectedModuleId);
    
    if (effectiveChapters.length && expanded.size === 0) {
      console.log("✅ [LEARN_PAGE] Expanding all chapters");
      setExpanded(new Set(effectiveChapters.map((c) => c.id)));
    }
    if (!selectedModuleId && allModules.length) {
      console.log("✅ [LEARN_PAGE] Setting first module as selected:", allModules[0].id);
      setSelectedModuleId(allModules[0].id);
    }
  }, [
    effectiveChapters,
    allModules,
    expanded.size,
    selectedModuleId,
  ]);

  const { data: moduleContent, isLoading: moduleLoading, error: moduleError } = useModuleContent(
    courseId,
    selectedModule?.chapterId,
    selectedModule?.id,
    !!selectedModule
  );

  console.log("📖 [LEARN_PAGE] Selected module details:", {
    moduleId: selectedModule?.id,
    chapterId: selectedModule?.chapterId,
    title: selectedModule?.title,
    type: selectedModule?.type
  });

  console.log("📦 [LEARN_PAGE] Module content state:", {
    isLoading: moduleLoading,
    hasContent: !!moduleContent,
    error: moduleError,
    videoUrl: moduleContent?.videoUrl ? "Present" : "None",
    documentUrl: moduleContent?.documentUrl ? "Present" : "None"
  });

  const currentIndex = selectedModule
    ? allModules.findIndex((m) => m.id === selectedModule.id)
    : -1;
  const prevModule = currentIndex > 0 ? allModules[currentIndex - 1] : null;
  const nextModule =
    currentIndex >= 0 && currentIndex < allModules.length - 1
      ? allModules[currentIndex + 1]
      : null;

  const toggleChapter = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  if (accessQuery.isLoading || courseQuery.isLoading || chaptersLoading) {
    console.log("⏳ [LEARN_PAGE] Loading state - showing loading screen");
    return <LoadingState />;
  }

  if (accessQuery.error) {
    console.error("💥 [LEARN_PAGE] Access query error:", accessQuery.error);
    messages.networkError();
  }

  if (courseQuery.error) {
    console.error("💥 [LEARN_PAGE] Course query error:", courseQuery.error);
    messages.networkError();
  }

  if (!accessQuery.data?.hasAccess) {
    console.log("🔒 [LEARN_PAGE] No access - showing access required screen");
    return <AccessRequiredState />;
  }

  const course = courseQuery.data; // useCourse returns the course directly
  if (!course) {
    console.log("❌ [LEARN_PAGE] No course data available");
    return null;
  }

  console.log("✅ [LEARN_PAGE] Course data loaded:", {
    title: course.title,
    id: course.id,
    type: course.type,
    soldCount: course.soldCount
  });

  // Adapt backend CourseResponse shape to the UI expectations (temporary mapper until unified type)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const courseForHeader: any = {
    ...course,
    stats: {
      ...course.stats,
      enrollmentCount: course.soldCount,
    },
    learningOutcomes: course.metadata?.learningOutcomes,
    requirements: course.metadata?.requirements,
    lastUpdated: course.updatedAt,
  };

  return (
    <div className="min-h-screen flex flex-col pt-16 lg:pt-24">
      {completionPercentage === 100 && (
        <CourseCompletionBanner
          onDownloadCertificate={() => downloadCertificate(courseId)}
          isGeneratingCertificate={isGeneratingCertificate}
        />
      )}
      <CourseHeader
        course={courseForHeader}
        progressPercent={completionPercentage}
        totalLessons={allModules.length}
        completedLessons={completedModules.length}
        onToggleInfo={() => setShowInfo((v) => !v)}
        showInfo={showInfo}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          chapters={effectiveChapters}
          expanded={expanded}
          onToggleChapter={toggleChapter}
          onSelect={(m) => setSelectedModuleId(m.id)}
          selectedModule={selectedModule}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          formatDuration={formatDuration}
        />
        <div className="flex-1 flex flex-col min-w-0">
          {showInfo && (
            <CourseInfoSection course={course} formatDuration={formatDuration} />
          )}
          <div className="flex-1 overflow-y-auto">
            <ModuleContent
              module={selectedModule}
              content={moduleContent}
              loading={moduleLoading}
              onPrev={() => prevModule && setSelectedModuleId(prevModule.id)}
              onNext={() => nextModule && setSelectedModuleId(nextModule.id)}
              hasPrev={!!prevModule}
              hasNext={!!nextModule}
              markCompleted={markModuleAsComplete}
              formatDuration={formatDuration}
            />
            <div className="max-w-6xl mx-auto px-4 pb-12">
              <div className="h-px bg-gradient-to-r from-transparent via-blue-600/60 to-transparent my-8" />
              <CourseReviewsSection
                courseId={courseId}
                courseTitle={course.title}
                hasAccess={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LearningPage;
