"use client";
import { ArrowLeft, User } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Course } from "../types";

interface Props {
  course: Course;
  progressPercent: number;
  totalLessons: number;
  completedLessons: number;
  onToggleInfo: () => void;
  showInfo: boolean;
}
export const CourseHeader: React.FC<Props> = ({
  course,
  progressPercent,
  totalLessons,
  completedLessons,
  onToggleInfo,
}) => {
  const router = useRouter();
  return (
    <div className="relative border-b px-4 sm:px-6 py-3 backdrop-blur-sm bg-black/30">
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
            <span className="text-sm hidden sm:inline">Back to My Courses</span>
          </button>
          <div className="h-5 w-px bg-gradient-to-b from-blue-500/60 to-transparent" />
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-semibold text-white line-clamp-1">
              {course.title}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <User size={12} />
                {course.instructor.username}
              </span>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-white">
              {Math.round(progressPercent)}%
            </div>
            <div className="text-xs text-gray-400">
              {completedLessons}/{totalLessons} lessons
            </div>
          </div>
          <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <button
            onClick={onToggleInfo}
            className="px-3 py-1 text-xs rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
          >
            Info
          </button>
        </div>
      </div>
    </div>
  );
};
