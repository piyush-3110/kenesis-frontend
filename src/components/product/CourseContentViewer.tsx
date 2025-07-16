'use client';

import { useState } from 'react';
import { Play, FileText, CheckCircle, Clock, Download, Eye } from 'lucide-react';
import { CourseContent, DocumentAttachment } from '@/types/Review';
import CustomVideoPlayer from '@/components/video/CustomVideoPlayer';
import { DocumentViewer } from '@/components/document/DocumentViewer';

interface CourseContentViewerProps {
  content: CourseContent[];
  progress: number;
  onContentSelect: (contentId: string) => void;
  onMarkComplete: (contentId: string) => void;
}

const CourseContentViewer: React.FC<CourseContentViewerProps> = ({
  content,
  progress,
  onContentSelect,
  onMarkComplete,
}) => {
  const [selectedContent, setSelectedContent] = useState<CourseContent | null>(
    content.length > 0 ? content[0] : null
  );
  const [selectedDocument, setSelectedDocument] = useState<DocumentAttachment | null>(null);

  const handleContentSelect = (contentItem: CourseContent) => {
    setSelectedContent(contentItem);
    onContentSelect(contentItem.id);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const completedCount = content.filter(item => item.isCompleted).length;
  const progressPercentage = content.length > 0 ? (completedCount / content.length) * 100 : 0;

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-white text-2xl font-bold mb-4">Course Content</h2>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="text-white font-medium">
              {completedCount} of {content.length} completed ({Math.round(progressPercentage)}%)
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[500px]">
        {/* Content List */}
        <div className="lg:col-span-1 border-r border-gray-800">
          <div className="p-4">
            <h3 className="text-white text-lg font-semibold mb-4">
              Lessons ({content.length})
            </h3>
            
            <div className="space-y-2">
              {content.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleContentSelect(item)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] ${
                    selectedContent?.id === item.id
                      ? 'bg-blue-600/20 border border-blue-500/50'
                      : 'bg-gray-800/50 hover:bg-gray-800 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon and Status */}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 mt-1">
                      {item.isCompleted ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : item.type === 'video' ? (
                        <Play size={14} className="text-blue-400" />
                      ) : (
                        <FileText size={14} className="text-orange-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-400 text-xs font-medium">
                          {index + 1}.
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.type === 'video' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {item.type === 'video' ? 'Video' : 'Document'}
                        </span>
                      </div>
                      
                      <h4 className={`font-medium mb-1 line-clamp-2 ${
                        selectedContent?.id === item.id ? 'text-blue-300' : 'text-white'
                      }`}>
                        {item.title}
                      </h4>
                      
                      {item.duration && (
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Clock size={12} />
                          <span>{formatDuration(item.duration)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="lg:col-span-2">
          {selectedContent ? (
            <div className="h-full flex flex-col">
              {/* Content Header */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white text-xl font-semibold mb-2">
                      {selectedContent.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className={`px-2 py-1 rounded-full ${
                        selectedContent.type === 'video' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {selectedContent.type === 'video' ? 'Video Lesson' : 'Document'}
                      </span>
                      {selectedContent.duration && (
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatDuration(selectedContent.duration)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!selectedContent.isCompleted && (
                      <button
                        onClick={() => onMarkComplete(selectedContent.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Display */}
              <div className="flex-1 p-6">
                {selectedContent.type === 'video' ? (
                  <div className="space-y-4">
                    {/* Custom Video Player */}
                    {selectedContent.videoUrl ? (
                      <CustomVideoPlayer
                        src={selectedContent.videoUrl}
                        title={selectedContent.title}
                        documents={selectedContent.attachments || []}
                        onProgress={(progress) => {
                          // Handle progress update
                          console.log(`Video progress: ${progress}%`);
                        }}
                        onEnded={() => {
                          // Auto-mark as complete when video ends
                          if (!selectedContent.isCompleted) {
                            onMarkComplete(selectedContent.id);
                          }
                        }}
                        className="w-full aspect-video"
                      />
                    ) : (
                      <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                        <div className="text-center">
                          <Play size={48} className="text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400 text-lg font-medium">Video Not Available</p>
                          <p className="text-gray-500 text-sm mt-2">
                            No video URL provided for this content
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Document Content */}
                    {selectedContent.documentUrl ? (
                      <div className="bg-gray-800 rounded-lg overflow-hidden">
                        {/* Document Header */}
                        <div className="p-4 border-b border-gray-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText size={24} className="text-blue-400" />
                              <div>
                                <h3 className="text-white font-semibold">{selectedContent.title}</h3>
                                <p className="text-gray-400 text-sm">Document Content</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const doc: DocumentAttachment = {
                                    id: selectedContent.id,
                                    title: selectedContent.title,
                                    url: selectedContent.documentUrl!,
                                    type: 'pdf', // Default to PDF, could be enhanced to detect type
                                    size: 'Unknown'
                                  };
                                  setSelectedDocument(doc);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                              >
                                <Eye size={16} />
                                View Document
                              </button>
                              <a
                                href={selectedContent.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                              >
                                <Download size={16} />
                                Download
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Document Preview */}
                        <div className="p-6">
                          <div className="bg-gray-700 rounded-lg p-8 text-center">
                            <FileText size={64} className="text-gray-400 mx-auto mb-4" />
                            <h4 className="text-white text-lg font-medium mb-2">
                              {selectedContent.title}
                            </h4>
                            <p className="text-gray-400 mb-6">
                              Click "View Document" to open in full-screen viewer
                            </p>
                            
                            {/* Document Attachments */}
                            {selectedContent.attachments && selectedContent.attachments.length > 0 && (
                              <div className="mt-6 pt-6 border-t border-gray-600">
                                <h5 className="text-white font-medium mb-4">Additional Resources</h5>
                                <div className="grid gap-3">
                                  {selectedContent.attachments.map((attachment) => (
                                    <div
                                      key={attachment.id}
                                      className="flex items-center justify-between bg-gray-600 rounded-lg p-3"
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="text-lg">
                                          {attachment.type === 'pdf' ? '📄' : 
                                           attachment.type === 'docx' ? '📝' : 
                                           attachment.type === 'pptx' ? '📊' : '📄'}
                                        </span>
                                        <div className="text-left">
                                          <p className="text-white text-sm font-medium">
                                            {attachment.title}
                                          </p>
                                          <p className="text-gray-400 text-xs">
                                            {attachment.type.toUpperCase()} {attachment.size && `• ${attachment.size}`}
                                          </p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => setSelectedDocument(attachment)}
                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                                      >
                                        View
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="min-h-[400px] bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                        <div className="text-center">
                          <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400 text-lg font-medium">Document Not Available</p>
                          <p className="text-gray-500 text-sm mt-2">
                            No document URL provided for this content
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Select a lesson to begin</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
};

export default CourseContentViewer;
