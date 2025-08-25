import React, { useState } from "react";
import { Eye, Edit2, Trash2, FileText, Play, Clock } from "lucide-react";
import { useModuleContentFetch } from "../hooks/useModuleContentFetch";
import ModuleContentViewer from "./ModuleContentViewer";

interface ModuleItemProps {
  module: any;
  courseId?: string;
  chapterId?: string;
  canEdit: boolean;
  onEdit?: (moduleId: string) => void;
  onDelete?: (moduleId: string) => void;
  showChapterInfo?: boolean;
}

/**
 * Single-purpose component for displaying a module item with expandable content
 * Uses the new backend API for fetching module content
 */
const ModuleItem: React.FC<ModuleItemProps> = ({
  module,
  courseId,
  chapterId,
  canEdit,
  onEdit,
  onDelete,
  showChapterInfo = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const { 
    moduleContent, 
    loading: isLoadingContent,
    error: contentError,
    fetchModuleContent 
  } = useModuleContentFetch();

  const formatDuration = (duration: number): string => {
    if (!duration || duration <= 0) return "0m";
    
    // API returns duration in minutes, not seconds
    const totalMinutes = Math.floor(duration);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${totalMinutes}m`;
  };

  const hasActualContent = (module: any): boolean => {
    // Check if module has any content URLs or attachments
    return !!(
      module.videoUrl || 
      module.documentUrl || 
      (module.attachments && module.attachments.length > 0) ||
      (moduleContent && (moduleContent.videoUrl || moduleContent.documentUrl))
    );
  };

  const getStatusBadge = () => {
    if (module?.isPreview) {
      return (
         <span>
        {""}
      </span>
      );
    }
    if (module?.isPublished) {
      return (
        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
          Published
        </span>
      );
    }
    return (
      <span>
        {""}
      </span>
    );
  };

  const getModuleTypeIcon = () => {
    switch (module?.type) {
      case "video":
        return <Play className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleExpand = async () => {
    if (!expanded && courseId) {
      // Fetch content when expanding for the first time
      await fetchModuleContent(courseId, module.id, {
        trackProgress: false, // Set to true if you want to track progress
        generateSignedUrls: true, // Get signed URLs for secure access
      });
    }
    setExpanded(!expanded);
  };

  const handleEdit = () => {
    if (onEdit && module?.id) {
      onEdit(module.id);
    }
  };

  const handleDelete = () => {
    if (onDelete && module) {
      onDelete(module);
    }
  };

  // Safety check - don't render if no module data
  if (!module) {
    return null;
  }

  return (
    <div className="bg-gray-800/30 rounded-lg border border-gray-700/50 overflow-hidden">
      {/* Module Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Module Title and Type */}
            <div className="flex items-center gap-3 mb-2">
              <div className="text-blue-400">
                {getModuleTypeIcon()}
              </div>
              <h4 className="text-white font-medium truncate">{module?.title || 'Untitled Module'}</h4>
              {getStatusBadge()}
            </div>

            {/* Module Description */}
            {module?.description && (
              <p className="text-gray-400 text-sm mb-3 overflow-hidden break-words" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}>
                {module.description}
              </p>
            )}

            {/* Module Metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                Order: {module?.order || 0}
              </span>


              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                {module?.type === 'video' ? 'Video Module' : 'Document Module'}
              </span>

              {showChapterInfo && module?.chapterTitle && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  {module.chapterTitle}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleExpand}
              className={`p-2 rounded transition-colors ${
                expanded
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
              }`}
              title={expanded ? "Hide Content" : "View Content"}
            >
              <Eye size={16} />
            </button>

            {canEdit && (
              <>
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                  title="Edit module"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  title="Delete module"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Module Content (Expandable) */}
      {expanded && (
        <div className="border-t border-gray-700/50">
          {contentError ? (
            <div className="p-6 text-center">
              <FileText className="mx-auto mb-2 text-red-400" size={24} />
              <p className="text-red-400 text-sm mb-2">Failed to load module content</p>
              <p className="text-gray-500 text-xs">{typeof contentError === 'string' ? contentError : 'An error occurred'}</p>
              <button
                onClick={handleExpand}
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Try again
              </button>
            </div>
          ) : moduleContent ? (
            <ModuleContentViewer 
              moduleContent={moduleContent} 
              isLoading={false}
            />
          ) : isLoadingContent ? (
            <div className="p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-400">Loading content...</span>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-400">
              <FileText className="mx-auto mb-2" size={24} />
              <p className="text-sm">
                {module?.type === 'video' ? 'No video content uploaded' : 'No document content uploaded'}
              </p>
              {canEdit && (
                <button
                  onClick={handleEdit}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  Add content
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleItem;
