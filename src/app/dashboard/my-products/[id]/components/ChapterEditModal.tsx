'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { CourseAPI } from '@/lib/api';
import { DASHBOARD_COLORS } from '../../../constants';
import { useUIStore } from '@/store/useUIStore';

interface ChapterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: any;
  courseId: string;
  onChapterUpdated: () => void;
}

interface ChapterFormData {
  title: string;
  description: string;
  order?: number;
}

// TypeScript interfaces for API consistency
interface UpdateChapterRequest {
  title?: string;
  description?: string;
  order?: number;
}

interface UpdateChapterResponse {
  id: string;
  title: string;
  description: string;
  order: number;
  moduleCount: number;
  totalDuration: number;
  createdAt: string;
  updatedAt: string;
}

const ChapterEditModal: React.FC<ChapterEditModalProps> = ({
  isOpen,
  onClose,
  chapter,
  courseId,
  onChapterUpdated
}) => {
  const [formData, setFormData] = useState<ChapterFormData>({
    title: '',
    description: '',
    order: 1
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const { addToast } = useUIStore();

  // Initialize form data when modal opens or chapter changes
  useEffect(() => {
    if (isOpen && chapter) {
      console.log('📝 Initializing chapter edit form with data:', chapter);
      
      setFormData({
        title: chapter.title || '',
        description: chapter.description || '',
        order: chapter.order || 1
      });
      setError(null);
      setHasChanges(false);
    } else if (!isOpen) {
      // Reset form when modal closes
      setError(null);
      setHasChanges(false);
    }
  }, [isOpen, chapter]);

  // Track form changes
  useEffect(() => {
    if (chapter) {
      const hasFormChanges = 
        formData.title !== (chapter.title || '') ||
        formData.description !== (chapter.description || '') ||
        formData.order !== (chapter.order || 1);
      
      setHasChanges(hasFormChanges);
    }
  }, [formData, chapter]);

  const handleInputChange = (field: keyof ChapterFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Chapter title is required');
      return false;
    }

    if (formData.title.length > 200) {
      setError('Chapter title must be 200 characters or less');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Chapter description is required');
      return false;
    }

    if (formData.description.length > 1000) {
      setError('Chapter description must be 1000 characters or less');
      return false;
    }

    if (formData.order && formData.order < 1) {
      setError('Chapter order must be 1 or greater');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    console.log('💾 Starting chapter update process...');
    
    if (!validateForm()) {
      console.warn('⚠️ Form validation failed');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare the update request following the same pattern as module updates
      const updateRequest: UpdateChapterRequest = {
        title: formData.title.trim(),
        description: formData.description.trim()
      };

      // Only include order if it's been set and is different from current
      if (formData.order && formData.order !== chapter.order) {
        updateRequest.order = Number(formData.order);
      }

      console.log('🚀 Sending chapter update request:', updateRequest);
      console.log('📍 Endpoint: PUT /api/courses/' + courseId + '/chapters/' + chapter.id);

      const response = await CourseAPI.updateChapter(courseId, chapter.id, updateRequest);

      console.log('📥 Chapter update response:', response);

      if (response.success) {
        console.log('✅ Chapter updated successfully');
        
        addToast({
          type: 'success',
          message: 'Chapter updated successfully!',
          duration: 4000
        });

        // Notify parent to refresh data
        onChapterUpdated();
        onClose();
      } else {
        console.error('❌ Chapter update failed:', response.message);
        const errorMessage = response.message || 'Failed to update chapter';
        setError(errorMessage);
        
        addToast({
          type: 'error',
          message: errorMessage,
          duration: 5000
        });
      }
    } catch (error: any) {
      console.error('💥 Chapter update error:', error);
      const errorMessage = error?.message || 'An unexpected error occurred';
      setError(errorMessage);
      
      addToast({
        type: 'error',
        message: errorMessage,
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (hasChanges && !loading) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmClose) {
        return;
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden"
        style={{
          background: DASHBOARD_COLORS.CARD_BG,
          border: `1px solid ${DASHBOARD_COLORS.PRIMARY_BORDER.replace('linear-gradient(90deg, ', '').replace(' 0%, ', '').replace(' 100%)', '').split(' ')[0]}`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Edit Chapter</h2>
            <p className="text-sm text-gray-400 mt-1">
              Update chapter information and settings
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <h4 className="text-red-400 font-medium">Error</h4>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Chapter Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Chapter Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50"
                placeholder="Enter chapter title..."
                maxLength={200}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">Maximum 200 characters</span>
                <span className="text-xs text-gray-500">
                  {formData.title.length}/200
                </span>
              </div>
            </div>

            {/* Chapter Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={loading}
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none disabled:opacity-50"
                placeholder="Describe what this chapter covers..."
                maxLength={1000}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">Maximum 1000 characters</span>
                <span className="text-xs text-gray-500">
                  {formData.description.length}/1000
                </span>
              </div>
            </div>

            {/* Chapter Order */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Chapter Order
              </label>
              <input
                type="number"
                value={formData.order || ''}
                onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
                disabled={loading}
                min="1"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50"
                placeholder="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Set the order in which this chapter appears in the course
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="text-sm text-gray-400">
            {hasChanges && !loading && (
              <span className="text-yellow-400">You have unsaved changes</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !hasChanges}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterEditModal;
