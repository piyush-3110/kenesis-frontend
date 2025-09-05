import React from "react";
import {
  BarChart3,
  Clock,
  Users,
  Globe,
  Calendar,
  Lightbulb,
  Target,
  CheckSquare,
} from "lucide-react";

interface CourseInfoSectionProps {
  course: any;
  formatDuration: (seconds: number) => string;
}

export const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({
  course,
  formatDuration,
}) => {
  return (
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
  );
};
