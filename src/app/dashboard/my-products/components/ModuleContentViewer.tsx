import React from "react";
import { FileText, Download, Play, Eye } from "lucide-react";
import { MyProductsModuleContentData } from "../hooks/useModuleContent";

interface ModuleContentViewerProps {
  moduleContent: MyProductsModuleContentData;
  isLoading?: boolean;
}

/**
 * Component for displaying module content in MyProducts management section
 * Follows single-responsibility principle - only handles content display
 */
const ModuleContentViewer: React.FC<ModuleContentViewerProps> = ({
  moduleContent,
  isLoading = false,
}) => {
  const formatFileSize = (bytes: number): string => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Module Info */}
      <div className="p-4 bg-gray-800/30 rounded-lg">
        <h4 className="text-white font-medium mb-2">{moduleContent.title}</h4>
        {moduleContent.description && (
          <p className="text-gray-400 text-sm mb-2">{moduleContent.description}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Type: {moduleContent.type}</span>
          <span>Duration: {moduleContent.duration}min</span>
          <span>Order: #{moduleContent.order}</span>
          {moduleContent.isPreview && (
            <span className="text-green-400">Preview Available</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      {moduleContent.type === "video" && moduleContent.videoUrl && (
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Play className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Video Content</span>
          </div>
          <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
            <video
              src={moduleContent.videoUrl}
              controls
              className="w-full h-full rounded-lg"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {moduleContent.type === "document" && moduleContent.documentUrl && (
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">Document Content</span>
          </div>
          <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300 text-sm">Main Document</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={moduleContent.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm"
              >
                <Eye className="w-3 h-3" />
                View
              </a>
              <a
                href={moduleContent.documentUrl}
                download
                className="flex items-center gap-1 px-3 py-1 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm"
              >
                <Download className="w-3 h-3" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Attachments */}
      {moduleContent.attachments && moduleContent.attachments.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">
              Attachments ({moduleContent.attachments.length})
            </span>
          </div>
          <div className="space-y-2">
            {moduleContent.attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 text-sm truncate">
                      {attachment.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatFileSize(attachment.fileSize)}</span>
                      {attachment.mimeType && <span>• {attachment.mimeType}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </a>
                  <a
                    href={attachment.url}
                    download={attachment.name}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Content State */}
      {!moduleContent.videoUrl && 
       !moduleContent.documentUrl && 
       (!moduleContent.attachments || moduleContent.attachments.length === 0) && (
        <div className="text-center py-8">
          <FileText className="mx-auto mb-3 text-gray-500" size={32} />
          <p className="text-gray-400 text-sm">
            No content files available for this module
          </p>
          <p className="text-gray-500 text-xs mt-1">
            {moduleContent.type === "video" 
              ? "Video content has not been uploaded yet"
              : "Document content has not been uploaded yet"
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ModuleContentViewer;
