'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProductCreationStore } from '../store/useProductCreationStore';
import { useCreateCourse } from '@/hooks/useCourse';
import { useAuthActions } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { CourseFormData } from '../types';
import { COURSE_LEVELS, SUPPORTED_LANGUAGES, CRYPTO_TOKENS, FILE_UPLOAD_LIMITS } from '../constants';
import { Upload, X, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * CourseCreationForm Component
 * Step 1: Basic course information with blue gradient design and API integration
 */
const CourseCreationForm: React.FC = () => {
  const router = useRouter();
  const { currentCourse, createCourse, updateCourse, setCurrentStep, setCurrentCourse } = useProductCreationStore();
  const { createCourse: createCourseAPI, loading: apiLoading, error: apiError, clearError } = useCreateCourse();
  const { logout } = useAuthActions();
  const { addToast } = useUIStore();
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: currentCourse?.title || '',
    type: currentCourse?.type || '',
    shortDescription: currentCourse?.shortDescription || '',
    description: currentCourse?.description || '',
    level: currentCourse?.level || 'Beginner',
    language: currentCourse?.language || 'English',
    price: currentCourse?.price || '',
    tokensToPayWith: currentCourse?.tokensToPayWith || [],
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewVideoFile, setPreviewVideoFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CourseFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (field: 'thumbnail' | 'previewVideo', file: File) => {
    const limits = field === 'thumbnail' ? FILE_UPLOAD_LIMITS.thumbnail : FILE_UPLOAD_LIMITS.video;
    
    if (file.size > limits.maxSize) {
      setErrors(prev => ({ 
        ...prev, 
        [field]: `File size exceeds ${limits.maxSize / (1024 * 1024)}MB limit` 
      }));
      return;
    }

    if (!limits.allowedTypes.includes(file.type)) {
      setErrors(prev => ({ 
        ...prev, 
        [field]: `Invalid file type. Allowed: ${limits.allowedTypes.join(', ')}` 
      }));
      return;
    }

    // Clear any existing errors
    setErrors(prev => ({ ...prev, [field]: '' }));

    // Store the file and create preview
    if (field === 'thumbnail') {
      setThumbnailFile(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    } else {
      setPreviewVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleTokenToggle = (token: string) => {
    setFormData(prev => ({
      ...prev,
      tokensToPayWith: prev.tokensToPayWith.includes(token)
        ? prev.tokensToPayWith.filter(t => t !== token)
        : [...prev.tokensToPayWith, token]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.type.trim()) newErrors.type = 'Course type is required';
    if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price.trim()) newErrors.price = 'Price is required';
    if (isNaN(Number(formData.price))) newErrors.price = 'Price must be a valid number';
    if (formData.tokensToPayWith.length === 0) newErrors.tokensToPayWith = 'Select at least one payment token';
    if (!thumbnailFile) newErrors.thumbnail = 'Thumbnail image is required';
    if (!previewVideoFile) newErrors.previewVideo = 'Preview video is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Clear any existing API errors
    clearError();

    // Create FormData for the API call
    const courseFormData = new FormData();
    courseFormData.append('title', formData.title);
    courseFormData.append('type', formData.type);
    courseFormData.append('shortDescription', formData.shortDescription);
    courseFormData.append('description', formData.description);
    courseFormData.append('level', formData.level);
    courseFormData.append('language', formData.language);
    
    // Add files
    if (thumbnailFile) {
      courseFormData.append('thumbnail', thumbnailFile);
    }
    if (previewVideoFile) {
      courseFormData.append('previewVideo', previewVideoFile);
    }

    // Add metadata
    const metadata = {
      price: formData.price,
      tokensToPayWith: formData.tokensToPayWith,
    };
    courseFormData.append('metadata', JSON.stringify(metadata));

    try {
      const result = await createCourseAPI(courseFormData);

      if (result.success && result.data) {
        // Update store with the newly created course
        updateCourse({
          ...formData,
          id: result.data.course,
          status: 'draft',
        });
        
        // Set the course in the store
        setCurrentCourse({
          ...currentCourse,
          ...formData,
          id: result.data.course,
          status: 'draft',
          chapters: [],
          createdAt: new Date().toISOString(),
        });

        addToast({ type: 'success', message: result.message || 'Course created successfully!' });
        setCurrentStep('chapters');
      } else {
        // Handle specific error scenarios
        if (result.isUnauthorized) {
          logout();
          addToast({ type: 'error', message: 'Session expired. Please log in again.' });
          router.push('/');
          return;
        }

        if (result.isForbidden) {
          addToast({ type: 'error', message: 'Your instructor account is deactivated.' });
          return;
        }

        if (result.isNotFound) {
          addToast({ type: 'error', message: 'Instructor not found. Please contact support.' });
          return;
        }

        if (result.isConflict) {
          addToast({ type: 'error', message: 'A course with this title already exists.' });
          return;
        }

        if (result.isRateLimit) {
          addToast({ type: 'error', message: result.message });
          return;
        }

        addToast({ type: 'error', message: result.message || 'Failed to create course' });
      }
    } catch (error) {
      console.error('Course creation error:', error);
      addToast({ type: 'error', message: 'Something went wrong while creating the course.' });
    }
  };

  // Gradient input class
  const inputClass = "w-full px-4 py-3 bg-[#010519] border border-transparent bg-clip-padding rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-transparent focus:ring-0 transition-all duration-300";
  const gradientBorderClass = "bg-gradient-to-r from-[#0680FF] to-[#022ED2] p-[2px] rounded-lg";

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Course Title */}
        <div>
          <label className="block text-white font-medium mb-3">Course Title *</label>
          <div className={gradientBorderClass}>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter course title"
              className={inputClass}
            />
          </div>
          {errors.title && <p className="text-red-400 text-sm mt-2">{errors.title}</p>}
        </div>

        {/* Course Type */}
        <div>
          <label className="block text-white font-medium mb-3">Course Type *</label>
          <div className={gradientBorderClass}>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              placeholder="e.g., Programming, Design, Marketing"
              className={inputClass}
            />
          </div>
          {errors.type && <p className="text-red-400 text-sm mt-2">{errors.type}</p>}
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-white font-medium mb-3">Short Description *</label>
          <div className={gradientBorderClass}>
            <textarea
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              placeholder="Brief course overview (2-3 sentences)"
              rows={3}
              className={cn(inputClass, "resize-none")}
            />
          </div>
          {errors.shortDescription && <p className="text-red-400 text-sm mt-2">{errors.shortDescription}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-white font-medium mb-3">Detailed Description *</label>
          <div className={gradientBorderClass}>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed course description, what students will learn, prerequisites, etc."
              rows={6}
              className={cn(inputClass, "resize-none")}
            />
          </div>
          {errors.description && <p className="text-red-400 text-sm mt-2">{errors.description}</p>}
        </div>

        {/* Level and Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white font-medium mb-3">Level *</label>
            <div className={gradientBorderClass}>
              <select
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value as any)}
                className={inputClass}
              >
                {COURSE_LEVELS.map(level => (
                  <option key={level} value={level} className="bg-[#010519] text-white">
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-3">Language *</label>
            <div className={gradientBorderClass}>
              <select
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className={inputClass}
              >
                {SUPPORTED_LANGUAGES.map(language => (
                  <option key={language} value={language} className="bg-[#010519] text-white">
                    {language}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-white font-medium mb-3">Price (USD) *</label>
          <div className={gradientBorderClass}>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={inputClass}
            />
          </div>
          {errors.price && <p className="text-red-400 text-sm mt-2">{errors.price}</p>}
        </div>

        {/* Payment Tokens */}
        <div>
          <label className="block text-white font-medium mb-3">Accepted Payment Tokens *</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CRYPTO_TOKENS.map(token => (
              <button
                key={token}
                type="button"
                onClick={() => handleTokenToggle(token)}
                className={cn(
                  "px-4 py-2 rounded-lg border transition-all duration-300 text-sm font-medium",
                  formData.tokensToPayWith.includes(token)
                    ? "bg-gradient-to-r from-[#0680FF] to-[#022ED2] border-[#0680FF] text-white"
                    : "border-gray-600 text-gray-400 hover:border-[#0680FF] hover:text-white"
                )}
              >
                {token}
              </button>
            ))}
          </div>
          {errors.tokensToPayWith && <p className="text-red-400 text-sm mt-2">{errors.tokensToPayWith}</p>}
        </div>

        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Thumbnail Upload */}
          <div>
            <label className="block text-white font-medium mb-3">Course Thumbnail</label>
            <div className={cn(gradientBorderClass, "h-40")}>
              <div className="h-full bg-[#010519] rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                {thumbnailPreview ? (
                  <>
                    <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        if (thumbnailPreview) {
                          URL.revokeObjectURL(thumbnailPreview);
                        }
                        setThumbnailPreview(null);
                        setThumbnailFile(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-gray-400 text-sm text-center">Upload thumbnail image</p>
                    <p className="text-gray-500 text-xs mt-1">Max 5MB, JPG/PNG</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('thumbnail', e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
            {errors.thumbnail && <p className="text-red-400 text-sm mt-2">{errors.thumbnail}</p>}
          </div>

          {/* Preview Video Upload */}
          <div>
            <label className="block text-white font-medium mb-3">Preview Video</label>
            <div className={cn(gradientBorderClass, "h-40")}>
              <div className="h-full bg-[#010519] rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                {videoPreview ? (
                  <>
                    <video src={videoPreview} className="w-full h-full object-cover" controls />
                    <button
                      type="button"
                      onClick={() => {
                        if (videoPreview) {
                          URL.revokeObjectURL(videoPreview);
                        }
                        setVideoPreview(null);
                        setPreviewVideoFile(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-gray-400 text-sm text-center">Upload preview video</p>
                    <p className="text-gray-500 text-xs mt-1">Max 500MB, MP4/WEBM</p>
                  </>
                )}
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('previewVideo', e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
            {errors.previewVideo && <p className="text-red-400 text-sm mt-2">{errors.previewVideo}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={apiLoading}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#0680FF] to-[#022ED2] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {apiLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Course...
              </>
            ) : (
              <>
                Continue to Chapters
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Display API errors */}
        {apiError && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{apiError}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default CourseCreationForm;
