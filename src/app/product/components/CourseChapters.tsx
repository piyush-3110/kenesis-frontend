import React, { useState } from "react";
import {
  BookOpen,
  FileText,
  ChevronDown,
  ChevronRight,
  Play,
  File,
  Clock,
} from "lucide-react";

interface Module {
  id: string;
  title: string;
  type: "video" | "document" | "quiz" | "assignment";
  duration: number; // in seconds (backend format)
  order: number;
  isPreview: boolean;
  isCompleted?: boolean; // This would come from user progress, not backend module data
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  moduleCount: number;
  modules?: Module[];
}

interface CourseChaptersProps {
  chapters?: Chapter[];
  className?: string;
}

const CourseChapters: React.FC<CourseChaptersProps> = ({
  chapters,
  className = "",
}) => {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );

  if (!chapters || chapters.length === 0) {
    return null;
  }

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play size={16} className="text-blue-400" />;
      case "document":
        return <File size={16} className="text-orange-400" />;
      case "quiz":
        return <BookOpen size={16} className="text-purple-400" />;
      case "assignment":
        return <FileText size={16} className="text-green-400" />;
      default:
        return <FileText size={16} className="text-gray-400" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <BookOpen size={24} className="text-blue-400" />
        <h3 className="text-white text-xl font-semibold">Course Content</h3>
        <span className="text-gray-400 text-sm">
          {chapters.length} chapter{chapters.length !== 1 ? "s" : ""}
        </span>
        <span className="text-gray-500 text-xs">• Click to expand</span>
      </div>

      <div className="space-y-4">
        {chapters
          .sort((a, b) => a.order - b.order)
          .map((chapter, index) => {
            const isExpanded = expandedChapters.has(chapter.id);

            return (
              <div
                key={chapter.id}
                className="bg-gray-900/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden"
              >
                {/* Chapter Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-900/30 transition-colors"
                  onClick={() => toggleChapter(chapter.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <h4 className="text-white font-semibold text-lg">
                        {chapter.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <FileText size={16} />
                        {chapter.moduleCount} module
                        {chapter.moduleCount !== 1 ? "s" : ""}
                      </div>

                      {isExpanded ? (
                        <ChevronDown size={20} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={20} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {chapter.description && (
                    <p className="text-gray-300 leading-relaxed ml-11">
                      {chapter.description}
                    </p>
                  )}
                </div>

                {/* Chapter Modules (Expanded Content) */}
                {isExpanded && (
                  <div className="border-t border-gray-800 bg-gray-900/30">
                    {chapter.modules && chapter.modules.length > 0 ? (
                      <div className="p-6 space-y-3">
                        {chapter.modules
                          .sort((a, b) => a.order - b.order)
                          .map((module, moduleIndex) => (
                            <div
                              key={module.id}
                              className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors"
                            >
                              <div className="flex items-center justify-center w-6 h-6 rounded bg-gray-700 text-gray-300 text-xs">
                                {moduleIndex + 1}
                              </div>

                              {getModuleIcon(module.type)}

                              <div className="flex-1 min-w-0">
                                <h5 className="text-white font-medium truncate">
                                  {module.title}
                                </h5>
                              </div>

                              <div className="flex items-center gap-3 text-sm text-gray-400">
                                {module.duration && (
                                  <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {formatDuration(module.duration)}
                                  </div>
                                )}

                                {module.isCompleted && (
                                  <div className="w-2 h-2 rounded-full bg-green-400" />
                                )}

                                {module.isPreview && (
                                  <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                                    Preview
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-400">
                        <FileText
                          size={24}
                          className="mx-auto mb-2 opacity-50"
                        />
                        <p>No modules available for this chapter yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CourseChapters;
