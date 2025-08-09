/**
 * Product Creation Constants
 * Configuration following backend API specifications exactly
 */

import { CourseLevel, ModuleType, CourseType, PaymentToken } from '../types';

export const COURSE_TYPES: { value: CourseType; label: string }[] = [
  { value: 'video', label: 'Video Course' },
  { value: 'document', label: 'Document Course' }
];

export const COURSE_LEVELS: { value: CourseLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

export const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ar', label: 'Arabic' }
];

export const MODULE_TYPES: { value: ModuleType; label: string }[] = [
  { value: 'video', label: 'Video' },
  { value: 'document', label: 'Document' }
];

// Payment tokens for different chains
export const PAYMENT_TOKENS: PaymentToken[] = [
  // Ethereum Mainnet (Chain ID: 1)
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    chainId: 1,
    chainName: 'Ethereum',
    decimals: 18
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86a33E6441986C3Cc8E6f3Ba8C9F6a7B8f1a1',
    chainId: 1,
    chainName: 'Ethereum',
    decimals: 6
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    chainId: 1,
    chainName: 'Ethereum',
    decimals: 6
  },
  // Polygon (Chain ID: 137)
  {
    symbol: 'MATIC',
    name: 'Polygon',
    address: '0x0000000000000000000000000000000000000000',
    chainId: 137,
    chainName: 'Polygon',
    decimals: 18
  },
  {
    symbol: 'USDC',
    name: 'USD Coin (Polygon)',
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    chainId: 137,
    chainName: 'Polygon',
    decimals: 6
  },
  // BSC (Chain ID: 56)
  {
    symbol: 'BNB',
    name: 'BNB Chain',
    address: '0x0000000000000000000000000000000000000000',
    chainId: 56,
    chainName: 'BSC',
    decimals: 18
  },
  // Local development (Chain ID: 31337)
  {
    symbol: 'ETH',
    name: 'Ethereum (Local)',
    address: '0x0000000000000000000000000000000000000000',
    chainId: 31337,
    chainName: 'Localhost',
    decimals: 18
  }
];

// File upload configurations following API specs exactly
export const FILE_UPLOAD_LIMITS = {
  thumbnail: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  previewVideo: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['video/mp4', 'video/webm']
  },
  // Module main file limits based on API documentation
  moduleMainFile: {
    video: {
      maxSize: 500 * 1024 * 1024, // 500MB as per API docs
      allowedTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv', 'video/quicktime']
    },
    document: {
      maxSize: 500 * 1024 * 1024, // 500MB as per API docs
      allowedTypes: [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'application/vnd.ms-powerpoint', 
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ]
    }
  },
  // Module attachments (up to 10 files)
  moduleAttachment: {
    maxSize: 500 * 1024 * 1024, // 500MB per file
    maxCount: 10, // Maximum 10 attachments as per API docs
    allowedTypes: [
      // All document types
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/vnd.ms-powerpoint', 
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // Plus images
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'
    ]
  },
  // Legacy limits for backward compatibility
  moduleVideo: {
    maxSize: 500 * 1024 * 1024, // 500MB for module main files
    allowedTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv', 'video/quicktime']
  },
  moduleDocument: {
    maxSize: 500 * 1024 * 1024, // Increased to 500MB to match API
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
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
