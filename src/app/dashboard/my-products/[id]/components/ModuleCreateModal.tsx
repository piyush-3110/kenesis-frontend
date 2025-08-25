'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, Video, FileText, Plus, Trash2, AlertCircle } from 'lucide-react';

interface ModuleCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (moduleData: ModuleFormData) => Promise<boolean>;
  chapters: Array<{ id: string; title: string }>;
  selectedChapterId?: string;
}

interface ModuleFormData {
  chapterId: string;
  title: string;
  description?: string;
  order?: number;
  duration?: number;
  isPreview: boolean;
  mainFile?: File;
  attachments?: File[];
}

/**
 * Module Create Modal
 * Comprehensive modal for creating new modules with file upload support
 * Following the backend API specification for multipart/form-data uploads
 */
const ModuleCreateModal: React.FC<ModuleCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  chapters,
  selectedChapterId
}) => {
  const [formData, setFormData] = useState<ModuleFormData>({
    chapterId: selectedChapterId || '',
    title: '',
    description: '',
    order: undefined,
    duration: undefined,
    isPreview: false,
    mainFile: undefined,
    attachments: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!formData.chapterId.trim()) {
      newErrors.chapterId = 'Chapter is required';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }



    // Optional field validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    if (formData.order && formData.order < 1) {
      newErrors.order = 'Order must be at least 1';
    }

    if (formData.duration && formData.duration < 0) {
      newErrors.duration = 'Duration must be non-negative';
    }

    // File validation
    if (formData.mainFile) {
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (formData.mainFile.size > maxSize) {
        newErrors.mainFile = 'File size exceeds 500MB limit';
      }

      // Basic file type validation - allow all supported types
      const allowedTypes = [
        'video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/avi', 'video/mkv',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(formData.mainFile.type)) {
        newErrors.mainFile = 'Please select a valid video or document file';
      }
    }

    // Attachment validation (max 10 files)
    if (formData.attachments && formData.attachments.length > 10) {
      newErrors.attachments = 'Maximum 10 attachments allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to determine file type based on extension
  const getFileTypeIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const videoExtensions = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv', 'm4v'];
    return videoExtensions.includes(extension) ? <Video size={20} /> : <FileText size={20} />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit(formData);
      if (success) {
        handleClose();
      }
    } catch (error) {
      console.error('Failed to create module:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        chapterId: selectedChapterId || '',
        title: '',
        description: '',
        order: undefined,
        duration: undefined,
        isPreview: false,
        mainFile: undefined,
        attachments: []
      });
      setErrors({});
      onClose();
    }
  };

  const handleMainFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, mainFile: file }));
      setErrors(prev => ({ ...prev, mainFile: '' }));
    }
  };

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...files].slice(0, 10)
      }));
      setErrors(prev => ({ ...prev, attachments: '' }));
    }
  };

  const removeMainFile = () => {
    setFormData(prev => ({ ...prev, mainFile: undefined }));
    if (mainFileInputRef.current) {
      mainFileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index)
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Create New Module</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Chapter Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Chapter *
              </label>
              <select
                value={formData.chapterId}
                onChange={(e) => setFormData(prev => ({ ...prev, chapterId: e.target.value }))}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.chapterId ? 'border-red-500' : 'border-gray-600'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select a chapter</option>
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.title}
                  </option>
                ))}
              </select>
              {errors.chapterId && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.chapterId}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Module Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter module title (3-200 characters)"
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Optional module description (max 1000 characters)"
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Order and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Order (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.order || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    order: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.order ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Auto-calculated if empty"
                  disabled={isSubmitting}
                />
                {errors.order && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.order}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    duration: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.duration ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Optional duration"
                  disabled={isSubmitting}
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.duration}
                  </p>
                )}
              </div>
            </div>

            {/* Preview Toggle */}
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isPreview}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPreview: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-300">
                  Make this module available as a preview
                </span>
              </label>
            </div>

            {/* Main File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Main Content File
              </label>
              <div className="space-y-3">
                <input
                  ref={mainFileInputRef}
                  type="file"
                  onChange={handleMainFileSelect}
                  accept="video/mp4,video/webm,video/ogg,video/mov,video/avi,video/mkv,.mp4,.webm,.ogg,.mov,.avi,.mkv,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  disabled={isSubmitting}
                />
                
                {!formData.mainFile ? (
                  <button
                    type="button"
                    onClick={() => mainFileInputRef.current?.click()}
                    className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    <Upload size={20} />
                    <span>
                      Click to upload content file (max 500MB)
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      {formData.mainFile && getFileTypeIcon(formData.mainFile)}
                      <div>
                        <p className="text-white text-sm font-medium">{formData.mainFile.name}</p>
                        <p className="text-gray-400 text-xs">{formatFileSize(formData.mainFile.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeMainFile}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      disabled={isSubmitting}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                
                {errors.mainFile && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.mainFile}
                  </p>
                )}
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Attachments (Optional, max 10)
              </label>
              <div className="space-y-3">
                <input
                  ref={attachmentInputRef}
                  type="file"
                  multiple
                  onChange={handleAttachmentSelect}
                  className="hidden"
                  disabled={isSubmitting}
                />
                
                <button
                  type="button"
                  onClick={() => attachmentInputRef.current?.click()}
                  className="w-full p-3 border border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
                  disabled={isSubmitting || (formData.attachments?.length || 0) >= 10}
                >
                  <Plus size={16} />
                  <span>Add attachment files</span>
                </button>

                {formData.attachments && formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                        <div className="flex items-center gap-2">
                          <FileText size={16} />
                          <div>
                            <p className="text-white text-sm">{file.name}</p>
                            <p className="text-gray-400 text-xs">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          disabled={isSubmitting}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {errors.attachments && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.attachments}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus size={16} />
                Create Module
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleCreateModal;
