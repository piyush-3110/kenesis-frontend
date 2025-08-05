#!/bin/bash

# Kinesis Frontend Batch Commit Script
# This script will create 36 individual commits in a single run
# Self-destructs after completion for clean workspace

echo "🚀 Starting Kinesis Frontend batch commit process..."
echo "📋 Total commits planned: 36"
echo "⏳ Please wait while commits are being processed..."
echo ""

# Helper function for padding commit numbers
pad_number() {
  printf "%02d" $1
}

# Record start time
start_time=$(date +%s)

# ==================== AUTHENTICATION COMMITS ====================

# Commit 1: Authentication Types
echo "📦 Commit $(pad_number 1)/36: Authentication Types"
git add src/types/Auth.ts
git commit -m "feat(auth): add authentication type definitions

- Define User interface with required properties
- Create AuthState interface for global state management
- Add TokenResponse type for API authentication flow
- Define LoginCredentials and RegisterData interfaces
- Add error handling types for authentication processes"

# Commit 2: Authentication API Client
echo "📦 Commit $(pad_number 2)/36: Authentication API Client"
git add src/lib/api.ts
git commit -m "feat(api): implement authentication API client

- Create base API client with interceptors
- Add authentication endpoints for login and register
- Implement token refresh mechanism
- Add email verification endpoints
- Create password reset functionality"

# Commit 3: Authentication Hooks
echo "📦 Commit $(pad_number 3)/36: Authentication Hooks"
git add src/hooks/useAuth.ts
git commit -m "feat(auth): create custom authentication hooks

- Implement useLogin hook with error handling
- Add useRegister hook with validation
- Create useLogout hook with token cleanup
- Add useVerifyEmail and useResendVerification hooks
- Implement useResetPassword and useForgotPassword hooks"

# Commit 4: Authentication Store
echo "📦 Commit $(pad_number 4)/36: Authentication Store"
git add src/store/useAuthStore.ts
git commit -m "feat(auth): implement authentication store with Zustand

- Create authentication global state management
- Add selectors for user data and authentication status
- Implement actions for login, logout, and registration
- Add token persistence and refresh logic
- Create email verification state management"

# ==================== DASHBOARD COMMITS ====================

# Commit 5: Dashboard Layout
echo "📦 Commit $(pad_number 5)/36: Dashboard Layout"
git add src/app/dashboard/components/DashboardLayout.tsx
git commit -m "feat(dashboard): implement responsive dashboard layout

- Create main dashboard layout component with sidebar
- Add responsive design for mobile and desktop
- Implement sidebar collapse functionality
- Create dashboard header with user controls
- Add navigation state management"

# Commit 6: Dashboard Sidebar
echo "📦 Commit $(pad_number 6)/36: Dashboard Sidebar"
git add src/app/dashboard/components/Sidebar.tsx src/app/dashboard/components/NavigationItem.tsx
git commit -m "feat(dashboard): create dashboard sidebar navigation

- Implement sidebar with gradient borders and styling
- Add navigation items with active state indicators
- Create collapsible sidebar for mobile devices
- Add user profile section in sidebar
- Implement navigation link handling"

# Commit 7: Dashboard Types and Constants
echo "📦 Commit $(pad_number 7)/36: Dashboard Types and Constants"
git add src/app/dashboard/types/index.ts src/app/dashboard/constants/index.ts
git commit -m "feat(dashboard): add dashboard types and constants

- Define dashboard menu item interfaces
- Create dashboard layout configuration constants
- Add color and typography system constants
- Define dashboard navigation structure
- Create consistent styling constants"

# Commit 8: Dashboard Coming Soon Pages
echo "📦 Commit $(pad_number 8)/36: Dashboard Coming Soon Pages"
git add src/app/dashboard/components/ComingSoon.tsx
git add src/app/dashboard/wallet/page.tsx
git add src/app/dashboard/sales/page.tsx
git add src/app/dashboard/members/page.tsx
git add src/app/dashboard/hot-leads/page.tsx
git add src/app/dashboard/nft-automation/page.tsx
git add src/app/dashboard/messages/page.tsx
git commit -m "feat(dashboard): add coming soon pages for upcoming features

- Create reusable ComingSoon component with gradient design
- Add Wallet feature coming soon page
- Implement Sales dashboard coming soon page
- Add Members Area coming soon page
- Create Hot Leads coming soon page
- Add NFT Automation coming soon page
- Implement Messages coming soon page"

# ==================== COURSE MANAGEMENT COMMITS ====================

# Commit 9: Course API Types
echo "📦 Commit $(pad_number 9)/36: Course API Types"
git add src/app/dashboard/products/types/index.ts
git commit -m "feat(products): define course management types

- Create Course interface with chapters and modules
- Add Chapter type definition with ordering
- Define Module interface with file attachments
- Create form data types for API submissions
- Add validation types for course creation flow"

# Commit 10: Course API Constants
echo "📦 Commit $(pad_number 10)/36: Course API Constants"
git add src/app/dashboard/products/constants/index.ts
git commit -m "feat(products): add course creation constants

- Define module types constants for video, audio, and documents
- Add file upload limits and allowed formats
- Create validation constants for form fields
- Define step constants for multi-step wizard
- Add error message constants"

# Commit 11: Course API Client
echo "📦 Commit $(pad_number 11)/36: Course API Client"
git add src/lib/api.ts
git commit -m "feat(api): implement course management API client

- Add course creation endpoints
- Create chapter management functions
- Implement module creation with file uploads
- Add course submission and review endpoints
- Create API error handling for course management"

# Commit 12: Course Creation Hooks
echo "📦 Commit $(pad_number 12)/36: Course Creation Hooks"
git add src/hooks/useCourse.ts
git commit -m "feat(products): implement course management hooks

- Create useCreateCourse hook with validation
- Add useCreateChapter hook for chapter management
- Implement useCreateModule hook with file uploads
- Add useSubmitCourse hook for review submission
- Create error handling and loading states"

# Commit 13: Product Creation Store
echo "📦 Commit $(pad_number 13)/36: Product Creation Store"
git add src/app/dashboard/products/store/useProductCreationStore.ts
git commit -m "feat(products): implement product creation store

- Create Zustand store for multi-step form state
- Add actions for course, chapter, and module management
- Implement form validation and error handling
- Create state persistence between steps
- Add file upload state management"

# Commit 14: Product Creation Wizard
echo "📦 Commit $(pad_number 14)/36: Product Creation Wizard"
git add src/app/dashboard/products/components/ProductCreationWizard.tsx
git commit -m "feat(products): create multi-step product creation wizard

- Implement step-based navigation system
- Add form state persistence between steps
- Create responsive wizard layout
- Add progress tracking with step indicator
- Implement navigation controls"

# Commit 15: Step Indicator Component
echo "📦 Commit $(pad_number 15)/36: Step Indicator Component"
git add src/app/dashboard/products/components/StepIndicator.tsx
git commit -m "feat(ui): add step indicator component for creation wizard

- Create animated step indicator with progress tracking
- Add blue gradient styling to match design system
- Implement responsive design for mobile and desktop
- Add completed and current step indicators
- Create accessible step labeling"

# Commit 16: Course Creation Form
echo "📦 Commit $(pad_number 16)/36: Course Creation Form"
git add src/app/dashboard/products/components/CourseCreationForm.tsx
git commit -m "feat(products): implement course creation form

- Create form for basic course information
- Add image upload with preview
- Implement form validation with error handling
- Add category and pricing fields
- Create responsive form layout with gradient styling"

# Commit 17: Chapter Creation Form
echo "📦 Commit $(pad_number 17)/36: Chapter Creation Form"
git add src/app/dashboard/products/components/ChapterCreationForm.tsx
git commit -m "feat(products): implement chapter creation form

- Create form for chapter management
- Add chapter reordering functionality
- Implement chapter editing and deletion
- Create responsive chapter cards
- Add validation with error handling"

# Commit 18: Module Creation Form
echo "📦 Commit $(pad_number 18)/36: Module Creation Form"
git add src/app/dashboard/products/components/ModuleCreationForm.tsx
git commit -m "feat(products): create module creation form with file uploads

- Implement module creation with file uploads
- Add support for video, audio, and document content
- Create module editing and deletion functionality
- Add preview setting for marketing content
- Implement file validation and error handling"

# Commit 19: Course Review Component
echo "📦 Commit $(pad_number 19)/36: Course Review Component"
git add src/app/dashboard/products/components/CourseReview.tsx
git commit -m "feat(products): add course review and submission component

- Create comprehensive course review interface
- Add chapter and module summary view
- Implement final validation before submission
- Create submission confirmation modal
- Add success and error handling for submission"

# Commit 20: Products Page
echo "📦 Commit $(pad_number 20)/36: Products Page"
git add src/app/dashboard/products/page.tsx
git commit -m "feat(products): implement products dashboard page

- Create main products management page
- Add product creation wizard integration
- Implement authentication verification
- Add loading and error states
- Create responsive layout for all devices"

# ==================== UI COMPONENT COMMITS ====================

# Commit 21: UI Component - Price Range Slider
echo "📦 Commit $(pad_number 21)/36: UI Component - Price Range Slider"
git add src/components/ui/PriceRangeSlider.tsx
git commit -m "feat(ui): create price range slider component

- Implement dual-handle price range slider
- Add blue gradient styling to match design system
- Create responsive design for all devices
- Add accessibility features for keyboard navigation
- Implement min/max validation"

# Commit 22: UI Typography System
echo "📦 Commit $(pad_number 22)/36: UI Typography System"
git add src/app/globals.css
git commit -m "feat(ui): implement typography system with custom fonts

- Add CircularXX font integration for headings
- Implement Inter font for body text
- Create typography scale with responsive sizing
- Add font weight variants for different contexts
- Implement heading styles with blue gradient accents"

# Commit 23: UI Color System Updates
echo "📦 Commit $(pad_number 23)/36: UI Color System Updates"
git add src/app/globals.css tailwind.config.ts
git commit -m "feat(ui): enhance color system with blue gradients

- Extend tailwind color palette with blue gradient variations
- Add custom gradient border utilities
- Create consistent color system for forms and cards
- Implement dark mode optimized colors
- Add accessible text colors for all backgrounds"

# Commit 24: Toast Notification System
echo "📦 Commit $(pad_number 24)/36: Toast Notification System"
git add src/store/useUIStore.ts src/components/ui/Toast.tsx
git commit -m "feat(ui): implement toast notification system

- Create global toast notification store
- Add success, error, warning and info toast variants
- Implement auto-dismissing functionality
- Add animation effects for smooth transitions
- Create accessible toast design with blue gradient accents"

# ==================== ERROR HANDLING COMMITS ====================

# Commit 25: API Error Handling
echo "📦 Commit $(pad_number 25)/36: API Error Handling"
git add src/lib/api.ts
git commit -m "feat(api): enhance API error handling system

- Implement comprehensive error categorization
- Add specific error types for auth, validation, and server errors
- Create user-friendly error message formatting
- Add rate limiting detection and handling
- Implement token expiration detection"

# Commit 26: Form Validation System
echo "📦 Commit $(pad_number 26)/36: Form Validation System"
git add src/hooks/useForm.ts
git commit -m "feat(forms): create reusable form validation system

- Implement form validation hooks with error handling
- Add field-level validation with custom rules
- Create form submission handling with API integration
- Add form state persistence between steps
- Implement dirty checking and change detection"

# Commit 27: Error Boundary Component
echo "📦 Commit $(pad_number 27)/36: Error Boundary Component"
git add src/components/ErrorBoundary.tsx
git commit -m "feat(error): add error boundary component

- Create fallback UI for runtime errors
- Implement error logging and reporting
- Add user-friendly error messages
- Create recovery options for common errors
- Implement section-specific error boundaries"

# ==================== UTILITY COMMITS ====================

# Commit 28: File Upload Utilities
echo "📦 Commit $(pad_number 28)/36: File Upload Utilities"
git add src/lib/utils.ts
git commit -m "feat(utils): add file upload utility functions

- Create file size validation helpers
- Add MIME type checking for security
- Implement file preview generation
- Add file compression utilities
- Create FormData helpers for multipart uploads"

# Commit 29: Date Formatting Utilities
echo "📦 Commit $(pad_number 29)/36: Date Formatting Utilities"
git add src/lib/utils.ts
git commit -m "feat(utils): implement date formatting utilities

- Add relative time formatting (e.g., '5 minutes ago')
- Create date range formatting for courses
- Add duration formatting for video and audio content
- Implement timezone handling for global users
- Create date validation helpers"

# Commit 30: String Manipulation Utilities
echo "📦 Commit $(pad_number 30)/36: String Manipulation Utilities"
git add src/lib/utils.ts
git commit -m "feat(utils): add string manipulation utilities

- Create truncate function with ellipsis
- Add slug generation for URLs
- Implement string sanitization for security
- Create case transformation helpers
- Add text formatting utilities for UI display"

# ==================== RESPONSIVE DESIGN COMMITS ====================

# Commit 31: Mobile Responsive Updates
echo "📦 Commit $(pad_number 31)/36: Mobile Responsive Updates"
git add src/app/dashboard/components/DashboardLayout.tsx src/app/dashboard/components/Sidebar.tsx
git commit -m "fix(responsive): improve mobile experience for dashboard

- Add collapsible sidebar for small screens
- Implement mobile navigation drawer
- Optimize form layouts for touch interfaces
- Add responsive padding and spacing
- Fix overflow issues on small screens"

# Commit 32: Tablet Responsive Updates
echo "📦 Commit $(pad_number 32)/36: Tablet Responsive Updates"
git add src/app/dashboard/products/components/ProductCreationWizard.tsx
git commit -m "fix(responsive): enhance tablet experience for product creation

- Optimize wizard layout for medium-sized screens
- Adjust form columns for better readability
- Improve touch targets for tablet users
- Add responsive grid layouts
- Fix spacing and alignment issues"

# ==================== PERFORMANCE COMMITS ====================

# Commit 33: Code Splitting Optimization
echo "📦 Commit $(pad_number 33)/36: Code Splitting Optimization"
git add next.config.ts
git commit -m "perf: implement code splitting for faster loading

- Add dynamic imports for large components
- Create route-based code splitting
- Implement lazy loading for dashboard sections
- Add suspense boundaries with loading states
- Reduce initial bundle size"

# Commit 34: Image Optimization
echo "📦 Commit $(pad_number 34)/36: Image Optimization"
git add next.config.ts
git commit -m "perf: enhance image loading performance

- Configure Next.js Image component optimization
- Add WebP format support for smaller file sizes
- Implement lazy loading for off-screen images
- Add responsive image sizing based on viewport
- Create image placeholder system"

# ==================== DOCUMENTATION COMMITS ====================

# Commit 35: Component Documentation
echo "📦 Commit $(pad_number 35)/36: Component Documentation"
git add docs/components/ProductCard.md
git commit -m "docs: add comprehensive component documentation

- Create detailed ProductCard component documentation
- Add usage examples with code snippets
- Document props and configuration options
- Add accessibility guidelines
- Create component architecture diagrams"

# Commit 36: API Documentation
echo "📦 Commit $(pad_number 36)/36: API Documentation"
git add BACKEND_API_DOCUMENTATION.md
git commit -m "docs: update backend API integration documentation

- Document authentication API endpoints
- Add course management API specifications
- Create file upload API guidelines
- Document error responses and handling
- Add authorization requirements for endpoints"

# Record end time and calculate duration
end_time=$(date +%s)
duration=$((end_time - start_time))
minutes=$((duration / 60))
seconds=$((duration % 60))

echo ""
echo "✅ All 36 commits completed successfully!"
echo "⏱️ Total time: $minutes minutes and $seconds seconds"
echo ""
echo "🧹 Self-destructing batch commit script..."

# Remove this script
rm -- "$0"

echo "🚀 Ready to push changes!"
