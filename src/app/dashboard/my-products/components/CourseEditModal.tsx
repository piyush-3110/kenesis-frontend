'use client';

import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

interface CourseEditModalProps {
  course: any;
  onClose: () => void;
  onSave: (updatedData: any) => Promise<void>;
}

/**
 * Course Edit Modal
 * Allows editing of updateable course fields based on backend API specification
 */
const CourseEditModal: React.FC<CourseEditModalProps> = ({ course, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: course.title || '',
    shortDescription: course.shortDescription || '',
    description: course.description || '',
    level: course.level || 'beginner',
    language: course.language || 'en',
    requirements: course.metadata?.requirements?.join('\n') || '',
    learningOutcomes: course.metadata?.learningOutcomes?.join('\n') || '',
    targetAudience: course.metadata?.targetAudience?.join('\n') || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title validation (3-100 characters)
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3 || formData.title.length > 100) {
      newErrors.title = 'Title must be between 3 and 100 characters';
    }

    // Short description validation (20-200 characters)
    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required';
    } else if (formData.shortDescription.length < 20 || formData.shortDescription.length > 200) {
      newErrors.shortDescription = 'Short description must be between 20 and 200 characters';
    }

    // Description validation (50-5000 characters)
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50 || formData.description.length > 5000) {
      newErrors.description = 'Description must be between 50 and 5000 characters';
    }

    // Learning outcomes validation (minimum 3)
    const learningOutcomes = formData.learningOutcomes
      .split('\n')
      .map((outcome: string) => outcome.trim())
      .filter((outcome: string) => outcome.length > 0);
    
    if (learningOutcomes.length < 3) {
      newErrors.learningOutcomes = 'At least 3 learning outcomes are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare metadata
      const metadata = {
        requirements: formData.requirements
          .split('\n')
          .map((req: string) => req.trim())
          .filter((req: string) => req.length > 0),
        learningOutcomes: formData.learningOutcomes
          .split('\n')
          .map((outcome: string) => outcome.trim())
          .filter((outcome: string) => outcome.length > 0),
        targetAudience: formData.targetAudience
          .split('\n')
          .map((audience: string) => audience.trim())
          .filter((audience: string) => audience.length > 0),
      };

      const updateData = {
        title: formData.title.trim(),
        shortDescription: formData.shortDescription.trim(),
        description: formData.description.trim(),
        level: formData.level,
        language: formData.language,
        metadata: JSON.stringify(metadata),
      };

      await onSave(updateData);
    } catch (error) {
      console.error('Failed to update course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Edit Course</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Basic Information</h3>
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter course title (3-100 characters)"
                maxLength={100}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.title}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Short Description *
              </label>
              <textarea
                value={formData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.shortDescription ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Brief course summary (20-200 characters)"
                maxLength={200}
              />
              {errors.shortDescription && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.shortDescription}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                {formData.shortDescription.length}/200 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Detailed Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Detailed course description (50-5000 characters)"
                maxLength={5000}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                {formData.description.length}/5000 characters
              </p>
            </div>

            {/* Level and Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Course Level *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Language *
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
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
          </div>

          {/* Course Metadata */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Course Metadata</h3>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Requirements
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Enter each requirement on a new line&#10;Basic computer knowledge&#10;Internet connection"
              />
              <p className="mt-1 text-xs text-gray-400">
                Enter each requirement on a separate line
              </p>
            </div>

            {/* Learning Outcomes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Learning Outcomes *
              </label>
              <textarea
                value={formData.learningOutcomes}
                onChange={(e) => handleInputChange('learningOutcomes', e.target.value)}
                rows={5}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.learningOutcomes ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter each learning outcome on a new line&#10;Understand JavaScript fundamentals&#10;Build interactive web applications&#10;Master ES6+ features"
              />
              {errors.learningOutcomes && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.learningOutcomes}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                Enter each learning outcome on a separate line (minimum 3 required)
              </p>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Audience
              </label>
              <textarea
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Enter each target audience on a new line&#10;Beginner developers&#10;Students learning web development&#10;Career changers"
              />
              <p className="mt-1 text-xs text-gray-400">
                Enter each target audience on a separate line
              </p>
            </div>
          </div>

          {/* Non-Updateable Fields Notice */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-blue-400 font-medium mb-2">Note: Non-Updateable Fields</h4>
            <p className="text-blue-300 text-sm">
              Course type, pricing, access settings, thumbnail, and preview video cannot be updated after creation. 
              These settings were configured when the course was first created.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseEditModal;
