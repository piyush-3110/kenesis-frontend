/**
 * Example demonstrating the new error formatting
 * This shows how validation errors are transformed from technical field names
 * to user-friendly messages for better UX
 */

import { formatSimpleErrors, formatValidationErrors, getFirstErrorMessage } from '@/lib/utils/errorFormatter';

// Example API response like what you showed
const exampleApiResponse = {
  success: false,
  message: "Validation failed",
  data: null,
  errors: [
    { 
      field: "body.shortDescription", 
      message: "Short description must be at least 20 characters" 
    },
    { 
      field: "body.title", 
      message: "Title is required" 
    },
    { 
      field: "body.price", 
      message: "Price must be a positive number" 
    }
  ]
};

// ❌ OLD WAY (what users saw before):
// "body.shortDescription: Short description must be at least 20 characters, body.title: Title is required, body.price: Price must be a positive number"

// ✅ NEW WAY (what users see now):

console.log('=== NEW ERROR FORMATTING EXAMPLES ===\n');

// 1. Simple errors for toast messages (clean, no field labels)
const simpleErrors = formatSimpleErrors(exampleApiResponse.errors);
console.log('🔥 TOAST MESSAGE (Simple):', simpleErrors);
// Output: "Short description must be at least 20 characters; Title is required; Price must be a positive number"

// 2. Validation errors with field labels (for form validation display)
const validationErrors = formatValidationErrors(exampleApiResponse.errors);
console.log('📋 FORM VALIDATION (With Labels):', validationErrors);
// Output: "Short Description: Short description must be at least 20 characters; Title: Title is required; Price: Price must be a positive number"

// 3. First error only (for simple notifications)
const firstError = getFirstErrorMessage(exampleApiResponse.errors);
console.log('⚠️  FIRST ERROR ONLY:', firstError);
// Output: "Short description must be at least 20 characters"

console.log('\n=== USAGE IN COMPONENTS ===\n');

// Usage in CourseCreationForm:
console.log('📝 CourseCreationForm.tsx:');
console.log(`
// Before:
addToast({
  type: "error",
  message: result.message || "Failed to create course", // Generic message
});

// After:
let errorMessage = result.message || "Failed to create course";
if ('errors' in result && result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
  errorMessage = formatSimpleErrors(result.errors); // Clean user-friendly message
}
addToast({
  type: "error",
  message: errorMessage,
});
`);

// Usage in ModuleEditModal:
console.log('🛠️  ModuleEditModal.tsx:');
console.log(`
// Before:
if (response.errors && Array.isArray(response.errors)) {
  const errorMessage = response.errors.map((err: any) => err.message || err).join(', ');
  setError(errorMessage);
}

// After:
let errorMessage = response.message || 'Failed to update module';
if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
  errorMessage = formatSimpleErrors(response.errors); // Clean formatting
}
setError(errorMessage);
`);

console.log('\n=== BENEFITS ===\n');
console.log('✅ Clean, user-friendly error messages');
console.log('✅ No technical field names like "body.shortDescription"');
console.log('✅ Consistent formatting across all components');
console.log('✅ Better UX with clear, actionable error messages');
console.log('✅ Support for both simple and detailed error display');
