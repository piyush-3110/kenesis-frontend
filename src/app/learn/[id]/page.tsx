"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useCourseAccess } from "@/hooks/useCourseAccess";
import { useCourse } from "@/hooks/useCourseQuery";
import { useCourseChaptersWithModules } from "@/features/learning/hooks/useCourseChaptersWithModules";
import { useModuleContent } from "@/features/learning/hooks/useModuleContent";
import type { Module } from "@/features/learning/types";
import { useLocalCourseProgress } from "@/features/learning/hooks/useLocalCourseProgress";
import { CourseHeader } from "@/features/learning/components/CourseHeader";
import { Sidebar } from "@/features/learning/components/Sidebar";
import { ModuleContent } from "@/features/learning/components/ModuleContent";
import CourseReviewsSection from "@/features/reviews/CourseReviewsSection";
import {
  Lock,
  BarChart3,
  Clock,
  Users,
  Globe,
  Calendar,
  Lightbulb,
  Target,
  CheckSquare,
} from "lucide-react";

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const LearningPage: React.FC = () => {
  const params = useParams();
  const courseId = params.id as string;

  const accessQuery = useCourseAccess(courseId, !!courseId);
  const courseQuery = useCourse(courseId);
  const { chapters, isLoading: chaptersLoading } = useCourseChaptersWithModules(
    courseId,
    !!(courseId && accessQuery.data?.hasAccess)
  );

  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [showInfo, setShowInfo] = React.useState(false);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const { completed, selectedModuleId, setSelectedModuleId, markCompleted } =
    useLocalCourseProgress(courseId);

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
    if (effectiveChapters.length && expanded.size === 0) {
      setExpanded(new Set(effectiveChapters.map((c) => c.id)));
    }
    if (!selectedModuleId && allModules.length) {
      setSelectedModuleId(allModules[0].id);
    }
  }, [
    effectiveChapters,
    allModules,
    expanded.size,
    selectedModuleId,
    setSelectedModuleId,
  ]);

  const { data: moduleContent, isLoading: moduleLoading } = useModuleContent(
    courseId,
    selectedModule?.chapterId,
    selectedModule?.id,
    !!selectedModule
  );

  const progressPct = React.useMemo(() => {
    if (!allModules.length) return 0;
    const done = allModules.filter((m) => completed.has(m.id)).length;
    return (done / allModules.length) * 100;
  }, [allModules, completed]);

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="h-12 w-12 border-b-2 border-blue-500 rounded-full animate-spin mx-auto mb-4" />
          Loading course...
        </div>
      </div>
    );
  }

  if (!accessQuery.data?.hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <Lock className="mx-auto mb-4 text-red-400" size={48} />
          <h2 className="text-xl font-semibold text-white mb-3">
            Access Required
          </h2>
          <p className="text-gray-400 text-sm">
            You don&apos;t have access to this course.
          </p>
        </div>
      </div>
    );
  }

  const course = courseQuery.data; // useCourse returns the course directly
  if (!course) return null;

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
      <CourseHeader
        course={courseForHeader}
        progressPercent={progressPct}
        totalLessons={allModules.length}
        completedLessons={Array.from(completed).length}
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
            <div className="border-b border-gray-800/40 bg-black/30 p-4">
              <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 text-sm text-gray-300">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2 text-white text-sm">
                    <BarChart3 size={14} />
                    Overview
                  </h3>
                  <p className="flex items-center gap-2">
                    <Clock size={14} className="text-green-400" />
                    {formatDuration(course.stats?.duration || 0)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users size={14} className="text-purple-400" />
                    Students: {course.soldCount || "—"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Globe size={14} className="text-yellow-400" />
                    {course.language || "English"}
                  </p>
                  {course.updatedAt && (
                    <p className="flex items-center gap-2">
                      <Calendar size={14} className="text-orange-400" />
                      Updated: {new Date(course.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {course.metadata?.learningOutcomes?.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2 text-white text-sm">
                      <Target size={14} className="text-green-400" />
                      You&apos;ll Learn
                    </h3>
                    <ul className="space-y-1">
                      {course.metadata.learningOutcomes
                        .slice(0, 4)
                        .map((o: string, i: number) => (
                          <li key={i} className="flex gap-2">
                            <CheckSquare
                              size={12}
                              className="text-green-400 mt-0.5"
                            />
                            <span>{o}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
                {course.metadata?.requirements?.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2 text-white text-sm">
                      <Lightbulb size={14} className="text-yellow-400" />
                      Requirements
                    </h3>
                    <ul className="space-y-1">
                      {course.metadata.requirements
                        .slice(0, 4)
                        .map((r: string, i: number) => (
                          <li key={i} className="flex gap-2">
                            <span className="w-1 h-1 rounded-full bg-gray-400 mt-2" />
                            <span>{r}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
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
              markCompleted={markCompleted}
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
