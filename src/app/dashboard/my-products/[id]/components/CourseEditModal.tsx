'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Plus, Trash2, Loader2 } from 'lucide-react';
import { CourseAPI } from '@/lib/api';
import { DASHBOARD_COLORS } from '../../../constants';
import { useUIStore } from '@/store/useUIStore';
import { useLoading } from '@/hooks/useLoading';

interface CourseEditModalProps {
  isOpen: boolean;
  course: any;
  courseId: string;
  onClose: () => void;
  onCourseUpdated: () => void;
}

// TypeScript interfaces following the API specification
interface UpdateCourseRequest {
  title?: string;
  shortDescription?: string;
  description?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  metadata?: {
    requirements?: string[];
    learningOutcomes?: string[];
    targetAudience?: string[];
  };
  price?: number;
}

interface UpdateCourseResponse {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  status: string;
  price: number;
  instructor: {
    id: string;
    username: string;
    avatar: string;
  };
  stats: {
    rating: number;
    reviewCount: number;
    duration: number;
  };
  level: string;
  language: string;
  metadata: {
    requirements: string[];
    learningOutcomes: string[];
    targetAudience: string[];
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Course Edit Modal
 * Allows editing of updateable course fields based on backend API specification
 * Follows the same design patterns as Chapter and Module edit modals
 */
const CourseEditModal: React.FC<CourseEditModalProps> = ({ 
  isOpen, 
  course, 
  courseId, 
  onClose, 
  onCourseUpdated 
}) => {
  const { addToast } = useUIStore();
  const {
    loading,
    status,
    startLoading,
    stopLoading,
    setError: setLoadingError,
    updateStatus,
  } = useLoading({
    successMessage: "Course updated successfully!",
    minDuration: 1000,
  });
  
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    language: 'en',
    requirements: [] as string[],
    learningOutcomes: [] as string[],
    targetAudience: [] as string[],
    price: 0
  });

  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // New item input states
  const [newRequirement, setNewRequirement] = useState('');
  const [newLearningOutcome, setNewLearningOutcome] = useState('');
  const [newTargetAudience, setNewTargetAudience] = useState('');

  // Initialize form data when modal opens or course changes
  useEffect(() => {
    if (isOpen && course) {
      console.log('📝 Initializing course edit form with data:', course);
      
      setFormData({
        title: course.title || '',
        shortDescription: course.shortDescription || '',
        description: course.description || '',
        level: course.level || 'beginner',
        language: course.language || 'en',
        requirements: course.metadata?.requirements || [],
        learningOutcomes: course.metadata?.learningOutcomes || [],
        targetAudience: course.metadata?.targetAudience || [],
        price: course.price || 0
      });
      setError(null);
      setHasChanges(false);
    } else if (!isOpen) {
      // Reset form when modal closes
      setError(null);
      setHasChanges(false);
    }
  }, [isOpen, course]);

  // Track form changes
  useEffect(() => {
    if (course) {
      const hasFormChanges = 
        formData.title !== (course.title || '') ||
        formData.shortDescription !== (course.shortDescription || '') ||
        formData.description !== (course.description || '') ||
        formData.level !== (course.level || 'beginner') ||
        formData.language !== (course.language || 'en') ||
        JSON.stringify(formData.requirements) !== JSON.stringify(course.metadata?.requirements || []) ||
        JSON.stringify(formData.learningOutcomes) !== JSON.stringify(course.metadata?.learningOutcomes || []) ||
        JSON.stringify(formData.targetAudience) !== JSON.stringify(course.metadata?.targetAudience || []) ||
        formData.price !== (course.price || 0);
      
      setHasChanges(hasFormChanges);
    }
  }, [formData, course]);

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  // Helper functions for array fields
  const addArrayItem = (field: 'requirements' | 'learningOutcomes' | 'targetAudience', value: string) => {
    if (value.trim()) {
      const currentArray = formData[field] as string[];
      const maxLimits = {
        requirements: 10,
        learningOutcomes: 15,
        targetAudience: 10
      };
      
      if (currentArray.length < maxLimits[field]) {
        setFormData(prev => ({
          ...prev,
          [field]: [...currentArray, value.trim()]
        }));
      }
    }
  };

  const removeArrayItem = (field: 'requirements' | 'learningOutcomes' | 'targetAudience', index: number) => {
    const currentArray = formData[field] as string[];
    setFormData(prev => ({
      ...prev,
      [field]: currentArray.filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: 'requirements' | 'learningOutcomes' | 'targetAudience', index: number, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = [...currentArray];
    newArray[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const validateForm = (): boolean => {
    // Title validation (3-100 characters)
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (formData.title.length < 3 || formData.title.length > 100) {
      setError('Title must be between 3 and 100 characters');
      return false;
    }

    // Short description validation (20-200 characters)
    if (!formData.shortDescription.trim()) {
      setError('Short description is required');
      return false;
    }
    if (formData.shortDescription.length < 20 || formData.shortDescription.length > 200) {
      setError('Short description must be between 20 and 200 characters');
      return false;
    }

    // Description validation (50-5000 characters)
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (formData.description.length < 50 || formData.description.length > 5000) {
      setError('Description must be between 50 and 5000 characters');
      return false;
    }

    // Learning outcomes validation (minimum 3)
    if (formData.learningOutcomes.length < 3) {
      setError('At least 3 learning outcomes are required');
      return false;
    }

    // Validate individual learning outcomes length
    for (const outcome of formData.learningOutcomes) {
      if (outcome.length > 200) {
        setError('Each learning outcome must be 200 characters or less');
        return false;
      }
    }

    // Validate requirements length
    for (const requirement of formData.requirements) {
      if (requirement.length > 200) {
        setError('Each requirement must be 200 characters or less');
        return false;
      }
    }

    // Validate target audience length
    for (const audience of formData.targetAudience) {
      if (audience.length > 100) {
        setError('Each target audience must be 100 characters or less');
        return false;
      }
    }

    // Validate language format (simple check for now)
    const languageRegex = /^[a-z]{2}(-[A-Z]{2})?$/;
    if (!languageRegex.test(formData.language)) {
      setError('Invalid language format. Use format like "en" or "en-US"');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    console.log('💾 Starting course update process...');
    
    if (!validateForm()) {
      console.warn('⚠️ Form validation failed');
      return;
    }

    startLoading("Validating course data...");
    setError(null);

    try {
      updateStatus("Preparing course update...");
      
      // Prepare the update request following API specification
      const updateRequest: UpdateCourseRequest = {
        title: formData.title.trim(),
        shortDescription: formData.shortDescription.trim(),
        description: formData.description.trim(),
        level: formData.level,
        language: formData.language,
        metadata: {
          requirements: formData.requirements.filter(req => req.trim().length > 0),
          learningOutcomes: formData.learningOutcomes.filter(outcome => outcome.trim().length > 0),
          targetAudience: formData.targetAudience.filter(audience => audience.trim().length > 0)
        }
      };

      // Only include price if it's different from current
      if (formData.price !== (course.price || 0)) {
        updateRequest.price = Number(formData.price);
      }

      updateStatus("Saving course changes...");
      console.log('🚀 Sending course update request:', updateRequest);
      console.log('📍 Endpoint: PUT /api/courses/' + courseId);

      const response = await CourseAPI.updateCourse(courseId, updateRequest);

      console.log('📥 Course update response:', response);

      if (response.success) {
        console.log('✅ Course updated successfully');
        
        stopLoading(true);

        // Notify parent to refresh data
        onCourseUpdated();
        onClose();
      } else {
        console.error('❌ Course update failed:', response.message);
        const errorMessage = response.message || 'Failed to update course';
        setError(errorMessage);
        stopLoading(false, errorMessage);
      }
    } catch (error: any) {
      console.error('💥 Course update error:', error);
      const errorMessage = error?.message || 'An unexpected error occurred';
      setError(errorMessage);
      stopLoading(false, errorMessage);
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

  // Component for dynamic array inputs
  const ArrayInputSection: React.FC<{
    label: string;
    items: string[];
    newItemValue: string;
    onNewItemChange: (value: string) => void;
    onAddItem: () => void;
    onRemoveItem: (index: number) => void;
    onUpdateItem: (index: number, value: string) => void;
    placeholder: string;
    maxItems: number;
    maxLength: number;
    required?: boolean;
  }> = ({
    label,
    items,
    newItemValue,
    onNewItemChange,
    onAddItem,
    onRemoveItem,
    onUpdateItem,
    placeholder,
    maxItems,
    maxLength,
    required = false
  }) => {
    const handleAddClick = () => {
      if (newItemValue.trim() && items.length < maxItems) {
        onAddItem();
        onNewItemChange('');
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddClick();
      }
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        
        {/* Existing items */}
        <div className="space-y-2 mb-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => onUpdateItem(index, e.target.value)}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50"
                maxLength={maxLength}
              />
              <button
                type="button"
                onClick={() => onRemoveItem(index)}
                disabled={loading}
                className="p-2 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Add new item */}
        {items.length < maxItems && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newItemValue}
              onChange={(e) => onNewItemChange(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50"
              placeholder={placeholder}
              maxLength={maxLength}
            />
            <button
              type="button"
              onClick={handleAddClick}
              disabled={loading || !newItemValue.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
            </button>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-1">
          {items.length}/{maxItems} items • {maxLength} characters max each
          {required && items.length < 3 && (
            <span className="text-yellow-400 ml-2">Minimum 3 required</span>
          )}
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden"
        style={{
          background: DASHBOARD_COLORS.CARD_BG,
          border: `1px solid ${DASHBOARD_COLORS.PRIMARY_BORDER.replace('linear-gradient(90deg, ', '').replace(' 0%, ', '').replace(' 100%)', '').split(' ')[0]}`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Edit Course</h2>
            <p className="text-sm text-gray-400 mt-1">
              Update course information and metadata
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
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>
              
              {/* Course Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Course Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50"
                  placeholder="Enter course title (3-100 characters)"
                  maxLength={100}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">3-100 characters required</span>
                  <span className="text-xs text-gray-500">
                    {formData.title.length}/100
                  </span>
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Short Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  disabled={loading}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none disabled:opacity-50"
                  placeholder="Brief course summary (20-200 characters)"
                  maxLength={200}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">20-200 characters required</span>
                  <span className="text-xs text-gray-500">
                    {formData.shortDescription.length}/200
                  </span>
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Detailed Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={loading}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none disabled:opacity-50"
                  placeholder="Detailed course description (50-5000 characters)"
                  maxLength={5000}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">50-5000 characters required</span>
                  <span className="text-xs text-gray-500">
                    {formData.description.length}/5000
                  </span>
                </div>
              </div>

              {/* Level and Language */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Course Level <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Language <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50"
                  >
                    <option value="en">English</option>
                    <option value="en-US">English (US)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="ar">Arabic</option>
                    <option value="hi">Hindi</option>
                    <option value="ru">Russian</option>
                  </select>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price (USD)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  disabled={loading}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Course price in USD (minimum $0.00)
                </p>
              </div>
            </div>

            {/* Course Metadata Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Course Metadata</h3>

              {/* Requirements */}
              <ArrayInputSection
                label="Requirements"
                items={formData.requirements}
                newItemValue={newRequirement}
                onNewItemChange={setNewRequirement}
                onAddItem={() => addArrayItem('requirements', newRequirement)}
                onRemoveItem={(index) => removeArrayItem('requirements', index)}
                onUpdateItem={(index, value) => updateArrayItem('requirements', index, value)}
                placeholder="Add a requirement (e.g., Basic computer knowledge)"
                maxItems={10}
                maxLength={200}
              />

              {/* Learning Outcomes */}
              <ArrayInputSection
                label="Learning Outcomes"
                items={formData.learningOutcomes}
                newItemValue={newLearningOutcome}
                onNewItemChange={setNewLearningOutcome}
                onAddItem={() => addArrayItem('learningOutcomes', newLearningOutcome)}
                onRemoveItem={(index) => removeArrayItem('learningOutcomes', index)}
                onUpdateItem={(index, value) => updateArrayItem('learningOutcomes', index, value)}
                placeholder="Add a learning outcome (e.g., Build web applications)"
                maxItems={15}
                maxLength={200}
                required
              />

              {/* Target Audience */}
              <ArrayInputSection
                label="Target Audience"
                items={formData.targetAudience}
                newItemValue={newTargetAudience}
                onNewItemChange={setNewTargetAudience}
                onAddItem={() => addArrayItem('targetAudience', newTargetAudience)}
                onRemoveItem={(index) => removeArrayItem('targetAudience', index)}
                onUpdateItem={(index, value) => updateArrayItem('targetAudience', index, value)}
                placeholder="Add target audience (e.g., Beginner developers)"
                maxItems={10}
                maxLength={100}
              />
            </div>

            {/* Non-Updateable Fields Notice */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">Note: Non-Updateable Fields</h4>
              <p className="text-blue-300 text-sm">
                Course type, thumbnail, and preview video cannot be updated after creation. 
                These settings were configured when the course was first created. Changing the title may regenerate the course URL slug.
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
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{status || "Saving..."}</span>
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

export default CourseEditModal;
