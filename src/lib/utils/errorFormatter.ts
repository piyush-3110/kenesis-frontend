/**
 * Error Formatting Utilities
 * Clean, user-friendly error message formatting for validation errors
 */

export interface ApiError {
  field: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ApiError[];
  retryAfter?: number;
}

/**
 * Map of field names to user-friendly labels
 */
const FIELD_LABELS: Record<string, string> = {
  // Course fields
  'title': 'Title',
  'body.title': 'Title',
  'description': 'Description',
  'body.description': 'Description',
  'shortDescription': 'Short Description',
  'body.shortDescription': 'Short Description',
  'type': 'Course Type',
  'body.type': 'Course Type',
  'level': 'Difficulty Level',
  'body.level': 'Difficulty Level',
  'language': 'Language',
  'body.language': 'Language',
  'price': 'Price',
  'body.price': 'Price',
  'tokenToPayWith': 'Payment Tokens',
  'body.tokenToPayWith': 'Payment Tokens',
  'categoryIds': 'Categories',
  'body.categoryIds': 'Categories',
  'accessDuration': 'Access Duration',
  'body.accessDuration': 'Access Duration',
  'affiliatePercentage': 'Affiliate Percentage',
  'body.affiliatePercentage': 'Affiliate Percentage',
  'availableQuantity': 'Available Quantity',
  'body.availableQuantity': 'Available Quantity',
  'thumbnail': 'Thumbnail Image',
  'body.thumbnail': 'Thumbnail Image',
  'previewVideo': 'Preview Video',
  'body.previewVideo': 'Preview Video',
  'metadata': 'Additional Information',
  'body.metadata': 'Additional Information',
  
  // Module fields
  'chapterId': 'Chapter',
  'body.chapterId': 'Chapter',
  'duration': 'Duration',
  'body.duration': 'Duration',
  'order': 'Order',
  'body.order': 'Order',
  'isRequired': 'Required Status',
  'body.isRequired': 'Required Status',
  'learningObjectives': 'Learning Objectives',
  'body.learningObjectives': 'Learning Objectives',
  'prerequisites': 'Prerequisites',
  'body.prerequisites': 'Prerequisites',
  'resources': 'Resources',
  'body.resources': 'Resources',
  'content': 'Content',
  'body.content': 'Content',
  'mainFile': 'Main File',
  'body.mainFile': 'Main File',
  'attachments': 'Attachments',
  'body.attachments': 'Attachments',
  
  // Auth fields
  'username': 'Username',
  'body.username': 'Username',
  'email': 'Email',
  'body.email': 'Email',
  'password': 'Password',
  'body.password': 'Password',
  'confirmPassword': 'Confirm Password',
  'body.confirmPassword': 'Confirm Password',
  'bio': 'Bio',
  'body.bio': 'Bio',
  
  // Generic fields
  'account': 'Account',
  'user': 'User',
  'wallet': 'Wallet',
  'walletAddress': 'Wallet Address',
  'body.walletAddress': 'Wallet Address',
};

/**
 * Format validation errors into user-friendly messages
 * Removes technical field prefixes and provides clean error messages
 */
export const formatValidationErrors = (errors: ApiError[]): string => {
  if (!errors || errors.length === 0) {
    return 'Validation failed';
  }

  const formattedErrors = errors.map(error => {
    // Get user-friendly field name
    const fieldLabel = FIELD_LABELS[error.field] || 
                      FIELD_LABELS[error.field.replace('body.', '')] || 
                      error.field.replace('body.', '').replace(/([A-Z])/g, ' $1').trim();
    
    // Clean up the message to remove redundant field references
    let message = error.message;
    
    // Remove field name from message if it's already included
    const fieldNameVariations = [
      error.field,
      error.field.replace('body.', ''),
      fieldLabel.toLowerCase(),
      fieldLabel
    ];
    
    fieldNameVariations.forEach(fieldName => {
      const regex = new RegExp(`^${fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:?\\s*`, 'i');
      message = message.replace(regex, '');
    });
    
    // Capitalize first letter of message
    message = message.charAt(0).toUpperCase() + message.slice(1);
    
    // Return formatted error with field label
    return `${fieldLabel}: ${message}`;
  });

  return formattedErrors.join('; ');
};

/**
 * Format API error response into user-friendly message
 * Prioritizes validation errors over generic messages
 */
export const formatApiError = (response: ApiResponse): string => {
  // If we have validation errors, format them nicely
  if (response.errors && response.errors.length > 0) {
    return formatValidationErrors(response.errors);
  }
  
  // Otherwise return the generic message
  return response.message || 'An unexpected error occurred';
};

/**
 * Format simple error messages without field prefixes
 * Useful for toast messages where field context isn't needed
 */
export const formatSimpleErrors = (errors: ApiError[]): string => {
  if (!errors || errors.length === 0) {
    return 'Validation failed';
  }

  const messages = errors.map(error => {
    let message = error.message;
    
    // Remove field name prefixes from the message
    const fieldNameVariations = [
      error.field,
      error.field.replace('body.', ''),
      FIELD_LABELS[error.field] || error.field.replace('body.', '').replace(/([A-Z])/g, ' $1').trim()
    ];
    
    fieldNameVariations.forEach(fieldName => {
      const regex = new RegExp(`^${fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:?\\s*`, 'i');
      message = message.replace(regex, '');
    });
    
    // Capitalize first letter
    message = message.charAt(0).toUpperCase() + message.slice(1);
    
    return message;
  });

  return messages.join('; ');
};

/**
 * Extract the first error message for simple display
 */
export const getFirstErrorMessage = (errors: ApiError[]): string => {
  if (!errors || errors.length === 0) {
    return 'Validation failed';
  }

  const firstError = errors[0];
  let message = firstError.message;
  
  // Remove field name prefixes
  const fieldNameVariations = [
    firstError.field,
    firstError.field.replace('body.', ''),
    FIELD_LABELS[firstError.field] || firstError.field.replace('body.', '').replace(/([A-Z])/g, ' $1').trim()
  ];
  
  fieldNameVariations.forEach(fieldName => {
    const regex = new RegExp(`^${fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:?\\s*`, 'i');
    message = message.replace(regex, '');
  });
  
  // Capitalize first letter
  message = message.charAt(0).toUpperCase() + message.slice(1);
  
  return message;
};
