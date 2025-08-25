'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Video, Trash2, Plus, Loader2 } from 'lucide-react';
import { CourseAPI } from '@/lib/api';
import { DASHBOARD_COLORS } from '../../../constants';
import { useLoading } from '@/hooks/useLoading';
import { formatSimpleErrors } from '@/lib/utils/errorFormatter';

interface ModuleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: any;
  courseId: string;
  onModuleUpdated: () => void;
}

interface ModuleFormData {
  title: string;
  description: string;
  type: "video" | "document";
  duration: number;
  order: number;
  isRequired: boolean;
  learningObjectives: string[];
  prerequisites: string[];
  resources: string[];
  content: {
    text: string;
    sections: Array<{
      title: string;
      content: string;
    }>;
  };
  // Additional fields from the API response
  videoUrl?: string;
  documentUrl?: string;
  attachments?: Array<{
    name: string;
    url: string;
    fileSize: number;
    mimeType: string;
  }>;
  isPreview: boolean;
}

const ModuleEditModal: React.FC<ModuleEditModalProps> = ({
  isOpen,
  onClose,
  module,
  courseId,
  onModuleUpdated
}) => {
  const {
    loading,
    status,
    startLoading,
    stopLoading,
    updateStatus,
    setError: setLoadingError,
  } = useLoading({
    successMessage: "Module updated successfully!",
    minDuration: 1000,
  });
  
  const [formData, setFormData] = useState<ModuleFormData>({
    title: '',
    description: '',
    type: 'video',
    duration: 0,
    order: 1,
    isRequired: false,
    learningObjectives: [],
    prerequisites: [],
    resources: [],
    content: {
      text: '',
      sections: []
    },
    isPreview: false
  });
  
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<ModuleFormData | null>(null);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [newObjective, setNewObjective] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newResource, setNewResource] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');
  const [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    if (isOpen && module) {
      loadModuleData();
    } else if (!isOpen) {
      // Reset form and clear errors when modal closes
      setError(null);
      setOriginalData(null);
      setMainFile(null);
      setAttachments([]);
      setNewObjective('');
      setNewPrerequisite('');
      setNewResource('');
      setNewSectionTitle('');
      setNewSectionContent('');
      setForceUpdate(false);
    }
  }, [isOpen, module]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadModuleData = async () => {
    try {
      setLoadingContent(true);
      setError(null);

      console.log('📊 Loading module content for editing...');
      console.log('📋 Module object:', module);
      console.log('📋 Course ID:', courseId);
      console.log('📋 Module ID:', module.id);
      
      // Updated to use new API endpoint format with proper parameters
      const response = await CourseAPI.getModuleContentById(courseId, module.id, {
        format: "json",
        trackProgress: false, // We don't need progress tracking for editing
        generateSignedUrls: true // Get signed URLs for secure content access
      });
      
      console.log('📥 Module content response:', response);
      
      let moduleData;
      if (response.success && response.data) {
        console.log('✅ Module content loaded for editing:', response.data);
        moduleData = response.data;
      } else {
        console.error('❌ Failed to load module content for editing:', response.message);
        // Fallback to basic module data
        moduleData = module;
      }

      // Create normalized data structure with all API fields
      const normalizedData: ModuleFormData = {
        title: moduleData.title || module.title || '',
        description: moduleData.description || module.description || '',
        type: moduleData.type || module.type || 'video',
        duration: moduleData.duration || module.duration || 0,
        order: moduleData.order || (module as any).order || 1,
        isRequired: (moduleData as any).isRequired || (module as any).isRequired || false,
        learningObjectives: (moduleData as any).learningObjectives || [],
        prerequisites: (moduleData as any).prerequisites || [],
        resources: (moduleData as any).resources || [],
        content: (moduleData as any).content?.text 
          ? (moduleData as any).content 
          : { text: '', sections: [] },
        // Additional API fields from the documentation
        videoUrl: moduleData.videoUrl,
        documentUrl: moduleData.documentUrl,
        attachments: moduleData.attachments || [],
        isPreview: moduleData.isPreview || false
      };

      console.log('📝 Normalized module data for editing:', normalizedData);

      // Set both form data and original data
      setFormData(normalizedData);
      setOriginalData(normalizedData);
    } catch (error) {
      console.error('Failed to load module data:', error);
      setError('Failed to load module data. Please try again.');
      
      // Set fallback data even on error
      const fallbackData: ModuleFormData = {
        title: module.title || '',
        description: module.description || '',
        type: module.type || 'video',
        duration: module.duration || 0,
        order: (module as any).order || 1,
        isRequired: (module as any).isRequired || false,
        learningObjectives: [],
        prerequisites: [],
        resources: [],
        content: { text: '', sections: [] },
        isPreview: false
      };
      
      setFormData(fallbackData);
      setOriginalData(fallbackData);
    } finally {
      setLoadingContent(false);
    }
  };

  // Helper function to determine if a field should be updated
  const shouldUpdateField = (current: any, original: any): boolean => {
    // Always update if no original data or force update is enabled
    if (!originalData || forceUpdate) return true;
    
    // For arrays and objects, compare JSON strings
    if (typeof current === 'object' || typeof original === 'object') {
      return JSON.stringify(current) !== JSON.stringify(original);
    }
    
    // For primitives, direct comparison
    return current !== original;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (formData.title.length > 200) {
      setError('Title must be 200 characters or less');
      return;
    }

    if (formData.duration < 0) {
      setError('Duration cannot be negative');
      return;
    }

    if (formData.order < 1) {
      setError('Order must be at least 1');
      return;
    }

    try {
      startLoading("Validating module data...");
      setError(null);

      // Prepare form data for multipart upload - only send fields the backend expects
      const updateData = new FormData();
      let hasChanges = false;

      // Basic fields that backend definitely accepts
      if (shouldUpdateField(formData.title.trim(), originalData?.title)) {
        updateData.append('title', formData.title.trim());
        hasChanges = true;
      }
      
      if (shouldUpdateField(formData.description.trim(), originalData?.description)) {
        updateData.append('description', formData.description.trim());
        hasChanges = true;
      }
      
      // Send duration as number (not string)
      if (shouldUpdateField(formData.duration, originalData?.duration)) {
        const duration = Math.max(0, formData.duration);
        updateData.append('duration', duration.toString());
        hasChanges = true;
      }
      
      // Send order as number (not string)
      if (shouldUpdateField(formData.order, originalData?.order)) {
        const order = Math.max(1, formData.order);
        updateData.append('order', order.toString());
        hasChanges = true;
      }
      
      // Send boolean as string (backend will parse it)
      if (shouldUpdateField(formData.isRequired, originalData?.isRequired)) {
        updateData.append('isRequired', formData.isRequired ? 'true' : 'false');
        hasChanges = true;
      }
      
      // Arrays - send each item separately with indexed keys
      const currentObjectives = formData.learningObjectives.filter(obj => obj.trim().length > 0);
      if (currentObjectives.length > 0 || forceUpdate) {
        try {
          // Send array items with indexed keys: learningObjectives[0], learningObjectives[1], etc.
          currentObjectives.forEach((objective, index) => {
            updateData.append(`learningObjectives[${index}]`, objective.trim());
          });
          hasChanges = true;
          console.log('📝 Added learningObjectives:', currentObjectives);
        } catch (e) {
          console.warn('⚠️ Skipping learningObjectives due to error:', e);
        }
      }
      
      const currentPrerequisites = formData.prerequisites.filter(pre => pre.trim().length > 0);
      if (currentPrerequisites.length > 0 || forceUpdate) {
        try {
          // Send array items with indexed keys: prerequisites[0], prerequisites[1], etc.
          currentPrerequisites.forEach((prerequisite, index) => {
            updateData.append(`prerequisites[${index}]`, prerequisite.trim());
          });
          hasChanges = true;
          console.log('📝 Added prerequisites:', currentPrerequisites);
        } catch (e) {
          console.warn('⚠️ Skipping prerequisites due to error:', e);
        }
      }
      
      const currentResources = formData.resources.filter(res => res.trim().length > 0);
      if (currentResources.length > 0 || forceUpdate) {
        try {
          // Send array items with indexed keys: resources[0], resources[1], etc.
          currentResources.forEach((resource, index) => {
            updateData.append(`resources[${index}]`, resource.trim());
          });
          hasChanges = true;
          console.log('📝 Added resources:', currentResources);
        } catch (e) {
          console.warn('⚠️ Skipping resources due to error:', e);
        }
      }
      
      // Content object - send with nested keys: content[text], content[sections][0][title], etc.
      const cleanContent = {
        text: formData.content.text.trim(),
        sections: formData.content.sections.filter(section => 
          section.title.trim().length > 0 && section.content.trim().length > 0
        ).map(section => ({
          title: section.title.trim(),
          content: section.content.trim()
        }))
      };
      
      if ((cleanContent.text.length > 0 || cleanContent.sections.length > 0) || forceUpdate) {
        try {
          // Send content object with nested keys
          if (cleanContent.text) {
            updateData.append('content[text]', cleanContent.text);
          }
          cleanContent.sections.forEach((section, index) => {
            updateData.append(`content[sections][${index}][title]`, section.title);
            updateData.append(`content[sections][${index}][content]`, section.content);
          });
          hasChanges = true;
          console.log('📝 Added content:', cleanContent);
        } catch (e) {
          console.warn('⚠️ Skipping content due to error:', e);
        }
      }

      // Add files if selected (always considered new)
      if (mainFile) {
        updateData.append('mainFile', mainFile);
        hasChanges = true;
      }

      attachments.forEach((file, index) => {
        updateData.append('attachments', file);
        hasChanges = true;
      });

      if (!hasChanges && !forceUpdate) {
        setError('No changes detected. Check "Force Update" below if you want to update anyway, or modify at least one field.');
        stopLoading(false, 'No changes to save');
        return;
      }

      // If force update is enabled but no changes detected, send basic fields with proper formatting
      if (forceUpdate && !hasChanges) {
        console.log('🔥 Force update enabled - sending all fields with proper types');
        updateData.append('title', formData.title.trim());
        updateData.append('description', formData.description.trim());
        updateData.append('duration', Math.max(0, formData.duration).toString());
        updateData.append('order', Math.max(1, formData.order).toString());
        updateData.append('isRequired', formData.isRequired ? 'true' : 'false');
        
        // Send arrays with indexed keys
        const cleanObjectives = formData.learningObjectives.filter(obj => obj.trim().length > 0);
        cleanObjectives.forEach((objective, index) => {
          updateData.append(`learningObjectives[${index}]`, objective.trim());
        });
        
        const cleanPrerequisites = formData.prerequisites.filter(pre => pre.trim().length > 0);
        cleanPrerequisites.forEach((prerequisite, index) => {
          updateData.append(`prerequisites[${index}]`, prerequisite.trim());
        });
        
        const cleanResources = formData.resources.filter(res => res.trim().length > 0);
        cleanResources.forEach((resource, index) => {
          updateData.append(`resources[${index}]`, resource.trim());
        });
        
        // Send content object with nested keys
        const cleanContent = {
          text: formData.content.text.trim(),
          sections: formData.content.sections.filter(section => 
            section.title.trim().length > 0 && section.content.trim().length > 0
          ).map(section => ({
            title: section.title.trim(),
            content: section.content.trim()
          }))
        };
        
        if (cleanContent.text) {
          updateData.append('content[text]', cleanContent.text);
        }
        cleanContent.sections.forEach((section, index) => {
          updateData.append(`content[sections][${index}][title]`, section.title);
          updateData.append(`content[sections][${index}][content]`, section.content);
        });
        
        hasChanges = true; // Mark as having changes since we're forcing update
      }

      updateStatus("Preparing module update...");
      console.log('🔄 Updating module with changes:', Array.from(updateData.keys()));
      console.log('📋 Force update enabled:', forceUpdate);
      console.log('📊 Original data available:', !!originalData);
      console.log('🆔 Course ID:', courseId, '(type:', typeof courseId, ')');
      console.log('🆔 Module ID:', module.id, '(type:', typeof module.id, ')');
      
      // Ensure courseId and moduleId are strings
      if (!courseId || typeof courseId !== 'string') {
        setError('Invalid course ID');
        stopLoading(false, 'Invalid course ID');
        return;
      }
      
      if (!module.id || typeof module.id !== 'string') {
        setError('Invalid module ID');
        stopLoading(false, 'Invalid module ID');
        return;
      }
      
      updateStatus("Saving module changes...");
      // Log the form data being sent
      console.log('📦 FormData entries:');
      /* eslint-disable prefer-const */
      for (let [key, value] of updateData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `[File: ${value.name}]` : value);
      }

      // Updated to use new API endpoint format: PUT /api/courses/:id/modules/:moduleId
      const response = await CourseAPI.updateModule(courseId, module.id, updateData);

      if (response.success) {
        console.log('✅ Module updated successfully');
        stopLoading(true);
        onModuleUpdated();
        onClose();
      } else {
        console.error('❌ Update failed:', response);
        // Handle specific validation errors from backend with clean formatting
        let errorMessage = response.message || 'Failed to update module';
        
        if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
          errorMessage = formatSimpleErrors(response.errors);
        }
        
        setError(errorMessage);
        stopLoading(false, errorMessage);
      }
    } catch (error: any) {
      console.error('💥 Failed to update module:', error);
      
      // Handle network and other errors with clean formatting
      let errorMessage = 'Failed to update module';
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = formatSimpleErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      stopLoading(false, errorMessage);
    }
  };

  const handleArrayAdd = (type: 'learningObjectives' | 'prerequisites' | 'resources', value: string) => {
    if (!value.trim()) return;

    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], value.trim()]
    }));

    // Clear input
    if (type === 'learningObjectives') setNewObjective('');
    if (type === 'prerequisites') setNewPrerequisite('');
    if (type === 'resources') setNewResource('');
  };

  const handleArrayRemove = (type: 'learningObjectives' | 'prerequisites' | 'resources', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSectionAdd = () => {
    if (!newSectionTitle.trim() || !newSectionContent.trim()) return;

    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        sections: [
          ...prev.content.sections,
          {
            title: newSectionTitle.trim(),
            content: newSectionContent.trim()
          }
        ]
      }
    }));

    setNewSectionTitle('');
    setNewSectionContent('');
  };

  const handleSectionRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        sections: prev.content.sections.filter((_, i) => i !== index)
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-[1px]"
        style={{ background: DASHBOARD_COLORS.PRIMARY_BORDER }}
      >
        <div 
          className="rounded-2xl p-6"
          style={{ background: DASHBOARD_COLORS.CARD_BG }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Edit Module</h2>
              <p className="text-gray-400">Update module information and content</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Loading State */}
          {loadingContent && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading module content...</p>
              <p className="text-gray-500 text-sm mt-2">Fetching module details, attachments, and content data</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-red-400 font-medium mb-1">Update Failed</h4>
                  <div className="text-red-300 text-sm">
                    {error.split(', ').map((err, index) => (
                      <div key={index} className="mb-1">• {err}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          {!loadingContent && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Enter module title"
                    maxLength={200}
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  rows={3}
                  placeholder="Enter module description"
                  maxLength={1000}
                />
              </div>

              {/* Module Type and Content Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Module Type</label>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      formData.type === 'video' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {formData.type === 'video' ? (
                        <>
                          <Video className="inline w-4 h-4 mr-1" />
                          Video Module
                        </>
                      ) : (
                        <>
                          <FileText className="inline w-4 h-4 mr-1" />
                          Document Module
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Preview Status</label>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      formData.isPreview 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {formData.isPreview ? 'Preview Available' : 'Premium Content'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content URLs and Attachments */}
              {(formData.videoUrl || formData.documentUrl || (formData.attachments && formData.attachments.length > 0)) && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <FileText size={18} />
                    Module Content
                  </h4>
                  
                  {/* Video URL */}
                  {formData.videoUrl && (
                    <div className="mb-3">
                      <label className="block text-gray-300 text-sm font-medium mb-1">Video Content</label>
                      <div className="flex items-center gap-2 p-2 bg-gray-700 rounded text-sm">
                        <Video className="text-blue-400" size={16} />
                        <span className="text-gray-300 truncate flex-1">{formData.videoUrl}</span>
                      </div>
                    </div>
                  )}

                  {/* Document URL */}
                  {formData.documentUrl && (
                    <div className="mb-3">
                      <label className="block text-gray-300 text-sm font-medium mb-1">Document Content</label>
                      <div className="flex items-center gap-2 p-2 bg-gray-700 rounded text-sm">
                        <FileText className="text-green-400" size={16} />
                        <span className="text-gray-300 truncate flex-1">{formData.documentUrl}</span>
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {formData.attachments && formData.attachments.length > 0 && (
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Attachments ({formData.attachments.length})
                      </label>
                      <div className="space-y-2">
                        {formData.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-700 rounded text-sm">
                            <FileText className="text-purple-400" size={16} />
                            <div className="flex-1 min-w-0">
                              <div className="text-gray-300 truncate">{attachment.name}</div>
                              <div className="text-gray-500 text-xs">
                                {attachment.mimeType} • {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    min="1"
                  />
                </div>

                <div className="flex items-center justify-center">
                  <label className="flex items-center gap-3 text-white">
                    <input
                      type="checkbox"
                      checked={formData.isRequired}
                      onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                      className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    Required Module
                  </label>
                </div>
              </div>

              {/* Learning Objectives */}
              <div>
                <label className="block text-white font-medium mb-2">Learning Objectives</label>
                <div className="space-y-3">
                  {formData.learningObjectives.map((objective, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={objective}
                        onChange={(e) => {
                          const newObjectives = [...formData.learningObjectives];
                          newObjectives[index] = e.target.value;
                          setFormData(prev => ({ ...prev, learningObjectives: newObjectives }));
                        }}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder="Enter learning objective"
                      />
                      <button
                        type="button"
                        onClick={() => handleArrayRemove('learningObjectives', index)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Add new learning objective"
                    />
                    <button
                      type="button"
                      onClick={() => handleArrayAdd('learningObjectives', newObjective)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Prerequisites */}
              <div>
                <label className="block text-white font-medium mb-2">Prerequisites</label>
                <div className="space-y-3">
                  {formData.prerequisites.map((prerequisite, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={prerequisite}
                        onChange={(e) => {
                          const newPrerequisites = [...formData.prerequisites];
                          newPrerequisites[index] = e.target.value;
                          setFormData(prev => ({ ...prev, prerequisites: newPrerequisites }));
                        }}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder="Enter prerequisite"
                      />
                      <button
                        type="button"
                        onClick={() => handleArrayRemove('prerequisites', index)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newPrerequisite}
                      onChange={(e) => setNewPrerequisite(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Add new prerequisite"
                    />
                    <button
                      type="button"
                      onClick={() => handleArrayAdd('prerequisites', newPrerequisite)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div>
                <label className="block text-white font-medium mb-2">Resources</label>
                <div className="space-y-3">
                  {formData.resources.map((resource, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={resource}
                        onChange={(e) => {
                          const newResources = [...formData.resources];
                          newResources[index] = e.target.value;
                          setFormData(prev => ({ ...prev, resources: newResources }));
                        }}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder="Enter resource URL or description"
                      />
                      <button
                        type="button"
                        onClick={() => handleArrayRemove('resources', index)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newResource}
                      onChange={(e) => setNewResource(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Add new resource"
                    />
                    <button
                      type="button"
                      onClick={() => handleArrayAdd('resources', newResource)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Text */}
              <div>
                <label className="block text-white font-medium mb-2">Content Text</label>
                <textarea
                  value={formData.content.text}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    content: { ...prev.content, text: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  rows={4}
                  placeholder="Enter main content text"
                />
              </div>

              {/* Content Sections */}
              <div>
                <label className="block text-white font-medium mb-2">Content Sections</label>
                <div className="space-y-4">
                  {formData.content.sections.map((section, index) => (
                    <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-white font-medium">Section {index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => handleSectionRemove(index)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => {
                            const newSections = [...formData.content.sections];
                            newSections[index] = { ...newSections[index], title: e.target.value };
                            setFormData(prev => ({ 
                              ...prev, 
                              content: { ...prev.content, sections: newSections }
                            }));
                          }}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          placeholder="Section title"
                        />
                        
                        <textarea
                          value={section.content}
                          onChange={(e) => {
                            const newSections = [...formData.content.sections];
                            newSections[index] = { ...newSections[index], content: e.target.value };
                            setFormData(prev => ({ 
                              ...prev, 
                              content: { ...prev.content, sections: newSections }
                            }));
                          }}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          rows={3}
                          placeholder="Section content"
                        />
                      </div>
                    </div>
                  ))}
                  
                  {/* Add New Section */}
                  <div className="bg-gray-800/30 border border-gray-700 border-dashed rounded-lg p-4">
                    <h5 className="text-white font-medium mb-3">Add New Section</h5>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder="New section title"
                      />
                      
                      <textarea
                        value={newSectionContent}
                        onChange={(e) => setNewSectionContent(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        rows={3}
                        placeholder="New section content"
                      />
                      
                      <button
                        type="button"
                        onClick={handleSectionAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Plus size={16} />
                        Add Section
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main File */}
                <div>
                  <label className="block text-white font-medium mb-2">Main File</label>
                  <div 
                    className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-gray-500 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('mainFile')?.click()}
                  >
                    {mainFile ? (
                      <div className="flex items-center gap-2 justify-center">
                        {mainFile.type.startsWith('video/') ? <Video size={20} className="text-purple-400" /> : <FileText size={20} className="text-blue-400" />}
                        <span className="text-white text-sm">{mainFile.name}</span>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                        <p className="text-gray-400 text-sm">Click to upload main file</p>
                        <p className="text-gray-500 text-xs">Max 500MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="mainFile"
                    type="file"
                    className="hidden"
                    onChange={(e) => setMainFile(e.target.files?.[0] || null)}
                    accept="video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
                  />
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-white font-medium mb-2">Attachments</label>
                  <div 
                    className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-gray-500 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('attachments')?.click()}
                  >
                    {attachments.length > 0 ? (
                      <div>
                        <FileText className="mx-auto mb-2 text-blue-400" size={24} />
                        <p className="text-white text-sm">{attachments.length} file(s) selected</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                        <p className="text-gray-400 text-sm">Click to upload attachments</p>
                        <p className="text-gray-500 text-xs">Multiple files allowed</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="attachments"
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/*"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={forceUpdate}
                      onChange={(e) => setForceUpdate(e.target.checked)}
                      className="rounded bg-gray-700 border-gray-600"
                    />
                    <span className="text-sm">Force Update (send all fields even if unchanged)</span>
                  </label>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">{status || "Updating..."}</span>
                      </>
                    ) : (
                      'Update Module'
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleEditModal;
