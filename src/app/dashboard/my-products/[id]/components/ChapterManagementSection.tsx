'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, Video } from 'lucide-react';
import { CourseAPI } from '@/lib/api';
import { DASHBOARD_COLORS } from '../../../constants';

interface ChapterManagementSectionProps {
  courseId: string;
  chapters: any[];
  onChaptersChange: (chapters: any[]) => void;
  canEdit: boolean;
}

/**
 * Chapter Management Section
 * Handles chapter creation, editing, and deletion
 */
const ChapterManagementSection: React.FC<ChapterManagementSectionProps> = ({
  courseId,
  chapters,
  onChaptersChange,
  canEdit
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingChapter, setEditingChapter] = useState<string | null>(null);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleCreateChapter = async (chapterData: any) => {
    try {
      const response = await CourseAPI.createChapter(courseId, chapterData);
      if (response.success) {
        // Reload chapters
        const chaptersResponse = await CourseAPI.getChapters(courseId, true);
        if (chaptersResponse.success) {
          onChaptersChange(chaptersResponse.data.chapters || []);
        }
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Failed to create chapter:', error);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter? All modules in this chapter will also be deleted.')) {
      return;
    }

    try {
      const response = await CourseAPI.deleteChapter(courseId, chapterId);
      if (response.success) {
        onChaptersChange(chapters.filter(ch => ch.id !== chapterId));
      }
    } catch (error) {
      console.error('Failed to delete chapter:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Course Chapters</h2>
        {canEdit && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
          >
            <Plus size={16} />
            Add Chapter
          </button>
        )}
      </div>

      {chapters.length === 0 ? (
        <div 
          className="rounded-2xl border p-8 text-center"
          style={{
            background: DASHBOARD_COLORS.CARD_BG,
            borderImage: DASHBOARD_COLORS.PRIMARY_BORDER,
            borderImageSlice: 1,
          }}
        >
          <FileText className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">No chapters yet</h3>
          <p className="text-gray-400 mb-4 line-clamp-2">
            Start building your course by adding chapters and modules.
          </p>
          {canEdit && (
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
            >
              Create First Chapter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {chapters.map((chapter, index) => (
            <div key={chapter.id} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-sm rounded">
                      Chapter {index + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-white">{chapter.title}</h3>
                  </div>
                  <p className="text-gray-400">{chapter.description}</p>
                </div>
                
                {canEdit && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingChapter(chapter.id)}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span>{chapter.moduleCount || 0} modules</span>
                <span>{chapter.totalDuration ? formatDuration(chapter.totalDuration) : '0m'}</span>
              </div>

              {chapter.modules && chapter.modules.length > 0 && (
                <div className="mt-4 border-t border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Modules</h4>
                  <div className="space-y-2">
                    {chapter.modules.map((module: any, moduleIndex: number) => (
                      <div key={module.id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded">
                        <span className="text-xs text-gray-400">{moduleIndex + 1}</span>
                        {module.type === 'video' ? 
                          <Video size={14} className="text-purple-400" /> : 
                          <FileText size={14} className="text-blue-400" />
                        }
                        <span className="text-white text-sm flex-1">{module.title}</span>
                        {module.duration && (
                          <span className="text-xs text-gray-400">
                            {formatDuration(module.duration)}
                          </span>
                        )}
                        {module.isPreview && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                            Preview
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Chapter Modal */}
      {isCreating && (
        <CreateChapterModal
          onClose={() => setIsCreating(false)}
          onSave={handleCreateChapter}
        />
      )}
    </div>
  );
};

// Simple Create Chapter Modal
const CreateChapterModal: React.FC<{
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-white mb-4">Add New Chapter</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Chapter Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
              required
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Chapter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChapterManagementSection;
