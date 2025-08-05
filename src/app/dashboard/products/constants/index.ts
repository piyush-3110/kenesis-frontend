/**
 * Product Creation Constants
 * Configuration and static data for product creation
 */

import { CourseLevel, ModuleType } from '../types';

export const COURSE_LEVELS: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

export const SUPPORTED_LANGUAGES = [
  'English',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Korean',
  'Chinese',
  'Portuguese',
  'Arabic'
];

export const MODULE_TYPES: { value: ModuleType; label: string }[] = [
  { value: 'video', label: 'Video' },
  { value: 'pdf', label: 'PDF Document' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'text', label: 'Text Content' },
  { value: 'audio', label: 'Audio' }
];

export const CRYPTO_TOKENS = [
  'USDC-31337',
  'ETH-1',
  'BTC-1',
  'MATIC-137',
  'BNB-56',
  'USDT-1',
  'ADA-1',
  'DOT-1'
];

// File upload configurations
export const FILE_UPLOAD_LIMITS = {
  thumbnail: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  video: {
    maxSize: 500 * 1024 * 1024, // 500MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/avi']
  },
  document: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },
  audio: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg']
  }
};

// Validation messages
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  minLength: (min: number) => `Minimum ${min} characters required`,
  maxLength: (max: number) => `Maximum ${max} characters allowed`,
  invalidFile: 'Invalid file type or size',
  invalidPrice: 'Please enter a valid price',
  duplicateToken: 'Token already selected'
};

// Step configuration
export const CREATION_STEPS = [
  { id: 'course', label: 'Course Details', description: 'Basic course information' },
  { id: 'chapters', label: 'Chapters', description: 'Organize your course content' },
  { id: 'modules', label: 'Modules', description: 'Add learning materials' },
  { id: 'review', label: 'Review', description: 'Submit for approval' }
] as const;
