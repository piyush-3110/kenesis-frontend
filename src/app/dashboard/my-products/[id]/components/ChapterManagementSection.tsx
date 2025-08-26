'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, Video } from 'lucide-react';
import { CourseAPI } from '@/lib/api';
import { DASHBOARD_COLORS } from '../../../constants';
import ChapterEditModal from './ChapterEditModal';
import DeleteChapterModal from './DeleteChapterModal';
import { useUIStore } from '@/store/useUIStore';

interface ChapterManagementSectionProps {
  courseId: string;
  chapters: any[];
  onChaptersChange: (chapters: any[]) => void;
  canEdit: boolean;
  canAddContent?: boolean;
}

/**
 * Chapter Management Section
 * Handles chapter creation, editing, and deletion
 */
const ChapterManagementSection: React.FC<ChapterManagementSectionProps> = ({
  courseId,
  chapters,
  onChaptersChange,
  canEdit,
  canAddContent = canEdit
}) => {
  const { addToast } = useUIStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingChapter, setEditingChapter] = useState<string | null>(null);
  const [selectedChapterForEdit, setSelectedChapterForEdit] = useState<any | null>(null);
  const [deletingChapter, setDeletingChapter] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleEditChapter = (chapter: any) => {
    console.log('📝 Opening chapter edit modal for:', chapter);
    setSelectedChapterForEdit(chapter);
    setEditingChapter(chapter.id);
  };

  const handleChapterUpdated = async () => {
    console.log('🔄 Chapter updated, refreshing chapter list...');
    try {
      // Reload chapters after successful update
      const chaptersResponse = await CourseAPI.getChapters(courseId, true);
      if (chaptersResponse.success) {
        onChaptersChange(chaptersResponse.data.chapters || []);
      }
    } catch (error) {
      console.error('Failed to reload chapters:', error);
    }
    // Close edit modal
    setEditingChapter(null);
    setSelectedChapterForEdit(null);
  };

  const handleDeleteChapter = async (chapterId: string) => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;
    
    setDeletingChapter(chapter);
  };

  const confirmDeleteChapter = async () => {
    if (!deletingChapter) return;
    
    try {
      setDeleteLoading(true);
      console.log('🗑️ Attempting to delete chapter:', deletingChapter.id);
      const response = await CourseAPI.deleteChapter(courseId, deletingChapter.id);
      
      if (response.success) {
        console.log('✅ Chapter deleted successfully');
        onChaptersChange(chapters.filter(ch => ch.id !== deletingChapter.id));
        setDeletingChapter(null);
        addToast({
          type: "success",
          message: response.message || "Chapter deleted successfully!"
        });
      } else {
        console.error('❌ Failed to delete chapter:', response.message);
        addToast({
          type: "error",
          message: response.message || "Failed to delete chapter"
        });
      }
    } catch (error: any) {
      console.error('Failed to delete chapter:', error);
      
      // Extract meaningful error message from the backend response
      let errorMessage = 'Failed to delete chapter';
      
      if (error.response?.data?.message) {
        // Backend returned structured error with message
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        // Alternative error field
        errorMessage = error.response.data.error;
      } else if (error.message && error.message !== 'Request failed with status code 400') {
        // Use error message if it's meaningful
        errorMessage = error.message;
      } else if (error.response?.status === 400) {
        // Generic 400 error, likely validation issue
        errorMessage = 'Cannot delete chapter: Please check if all modules are deleted first';
      }
      
      addToast({
        type: "error",
        message: errorMessage
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Course Chapters</h2>
        {canAddContent && (
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
          {canAddContent && (
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
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-sm rounded whitespace-nowrap">
                      Chapter {index + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-white truncate" title={chapter.title}>
                      {chapter.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 line-clamp-2 break-words" title={chapter.description}>
                    {chapter.description}
                  </p>
                </div>
                
                {canEdit && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditChapter(chapter)}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Edit chapter"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete chapter"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span>{chapter.moduleCount || 0} modules</span>
                {/* <span>{chapter.totalDuration ? formatDuration(chapter.totalDuration) : '0m'}</span> */}
              </div>

              {chapter.modules && chapter.modules.length > 0 && (
                <div className="mt-4 border-t border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Modules</h4>
                  <div className="space-y-2">
                    {chapter.modules.map((module: any, moduleIndex: number) => (
                      <div key={module.id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded">
                        <span className="text-xs text-gray-400 flex-shrink-0">{moduleIndex + 1}</span>
                        {module.type === 'video' ? 
                          <Video size={14} className="text-purple-400 flex-shrink-0" /> : 
                          <FileText size={14} className="text-blue-400 flex-shrink-0" />
                        }
                        <span className="text-white text-sm flex-1 truncate" title={module.title}>
                          {module.title}
                        </span>
                        {module.duration && (
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatDuration(module.duration)}
                          </span>
                        )}
                        {module.isPreview && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded flex-shrink-0">
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

      {/* Edit Chapter Modal */}
      {editingChapter && selectedChapterForEdit && (
        <ChapterEditModal
          isOpen={true}
          onClose={() => {
            setEditingChapter(null);
            setSelectedChapterForEdit(null);
          }}
          chapter={selectedChapterForEdit}
          courseId={courseId}
          onChapterUpdated={handleChapterUpdated}
        />
      )}

      {/* Delete Chapter Modal */}
      {deletingChapter && (
        <DeleteChapterModal
          isOpen={true}
          onClose={() => setDeletingChapter(null)}
          onConfirm={confirmDeleteChapter}
          chapter={deletingChapter}
          loading={deleteLoading}
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
