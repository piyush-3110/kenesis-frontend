# 🏗️ Kenesis Frontend - Production-Grade Architecture

## 📋 Overview

This project has been restructured to follow **production-grade code quality standards** with a focus on **scalability**, **maintainability**, and **developer experience**. The architecture implements the folder structure guidelines from `instructions/code-quality.md`.

## 🚀 Key Improvements

### ✅ **Zustand State Management**
- **Global stores**: `src/store/` for auth, UI, and navigation
- **Page-specific stores**: Each page has its own isolated store
- **Performance optimized**: Selective subscriptions with custom selectors
- **Type-safe**: Full TypeScript support with proper interfaces

### ✅ **Page-Level Architecture**
Each page follows the mandatory structure:
```
/app/{page}/
├── components/   → Page-specific UI components
├── store/        → Zustand stores for page state
├── hooks/        → Custom hooks for page logic
├── types/        → TypeScript interfaces
├── constants/    → Page configuration and constants
└── page.tsx      → Main page component
```

### ✅ **Shared Infrastructure**
```
/shared/
├── components/   → Reusable UI components (ErrorBoundary, Loading)
├── hooks/        → Common custom hooks (useAsync, useStorage)
├── utils/        → Utility functions (formatters, validation, helpers)
└── types/        → Global TypeScript types
```

### ✅ **Global State Architecture**
```
/store/
├── useAuthStore.ts       → User authentication & session
├── useUIStore.ts         → Global UI state (modals, toasts, theme)
├── useNavigationStore.ts → Navigation, breadcrumbs, search
└── index.ts              → Store exports and utilities
```

## 🛠️ Technology Stack

- **Frontend**: React 18 + Next.js 14 + TypeScript
- **State Management**: Zustand (replacing React Context)
- **Styling**: Tailwind CSS
- **Type Safety**: Strict TypeScript configuration
- **Code Quality**: ESLint + Production-grade patterns

## 📦 Package Structure

### **Implemented Pages**

#### 🛒 **Marketplace** (`/app/marketplace/`)
- **Store**: `useMarketplaceStore` - Product filtering, pagination, search
- **Components**: ProductGrid, SearchFilterBar, Sidebar
- **Hooks**: `useMarketplace` - Business logic abstraction
- **Types**: Product, Category, MarketplaceFilters
- **Constants**: Sort options, filter categories, API endpoints

#### 📚 **Product** (`/app/product/`)
- **Store**: `useProductStore` - Product details, reviews, course content
- **Components**: CourseContentViewer, ReviewsRatings
- **Types**: ExtendedProduct, Review, CourseContent
- **Features**: Video player integration, document viewer, progress tracking

## 🎯 Code Quality Standards

### **Type Safety**
- ✅ Strict TypeScript configuration
- ✅ No `any` types in production code
- ✅ Proper interface definitions for all data structures
- ✅ Type-safe store selectors and actions

### **Performance**
- ✅ Selective store subscriptions with Zustand selectors
- ✅ Component memoization where appropriate
- ✅ Debounced search and filtering
- ✅ Lazy loading for large component trees

### **Error Handling**
- ✅ Global ErrorBoundary with production-grade error UI
- ✅ Proper async error handling in stores and hooks
- ✅ User-friendly error messages and fallback states
- ✅ Development error details with stack traces

### **Developer Experience**
- ✅ Consistent folder structure across all pages
- ✅ Reusable utility functions and custom hooks
- ✅ Comprehensive type definitions
- ✅ Clear separation of concerns

## 🧩 Store Architecture

### **Global Stores**

#### **AuthStore** (`useAuthStore`)
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
```

#### **UIStore** (`useUIStore`)
```typescript
interface UIState {
  modals: { login: boolean; signup: boolean; ... };
  toasts: Toast[];
  theme: 'dark' | 'light';
  addToast: (toast: Toast) => void;
}
```

#### **NavigationStore** (`useNavigationStore`)
```typescript
interface NavigationState {
  currentPage: string;
  breadcrumbs: BreadcrumbItem[];
  globalSearchQuery: string;
  searchResults: any[];
}
```

### **Page Stores**

#### **MarketplaceStore** (`useMarketplaceStore`)
- Products and categories management
- Filter state (category, price, search, sort)
- Pagination and infinite scroll state
- Loading and error states

#### **ProductStore** (`useProductStore`)
- Product details and reviews
- Course content and progress tracking
- Purchase state and access control
- Review submission and management

## 🔧 Utility Functions

### **Formatters** (`/shared/utils/formatters.ts`)
- `formatCurrency()` - Currency formatting with locale support
- `formatDuration()` - Video/audio duration formatting
- `formatFileSize()` - Human-readable file sizes
- `formatNumber()` - Large number abbreviations (K, M, B)

### **Validation** (`/shared/utils/validation.ts`)
- `isValidEmail()` - Email validation
- `validatePassword()` - Password strength checking
- `validateRequiredFields()` - Form validation
- `sanitizeHtml()` - XSS prevention

### **Helpers** (`/shared/utils/helpers.ts`)
- `debounce()` / `throttle()` - Performance optimization
- `deepClone()` - Object cloning
- `removeDuplicates()` - Array deduplication
- `groupBy()` - Data grouping utilities

## 🪝 Custom Hooks

### **Storage Hooks** (`/shared/hooks/useStorage.ts`)
- `useLocalStorage<T>()` - Type-safe localStorage management
- `useSessionStorage<T>()` - Type-safe sessionStorage management

### **Async Hooks** (`/shared/hooks/useAsync.ts`)
- `useAsync<T>()` - Generic async operation handling
- `useApi<T>()` - API calls with caching
- `useAsyncSubmit<T>()` - Form submission handling

## 🎨 UI Components

### **Error Handling** (`/shared/components/ErrorBoundary.tsx`)
- Production-grade error boundary
- User-friendly error messages
- Development error details
- Refresh and navigation options

### **Loading States** (`/shared/components/Loading.tsx`)
- Multiple loading variants (spinner, dots, pulse, skeleton)
- Component-specific skeletons (ProductCard, Review, VideoPlayer)
- Configurable sizes and full-screen modes

## 🚀 Getting Started

### **Development**
```bash
npm install
npm run dev
```

### **Production**
```bash
npm run build
npm start
```

### **Code Quality**
```bash
npm run lint       # ESLint checking
npm run type-check # TypeScript validation
```

## 📝 Contributing

1. Follow the **page-level folder structure** for new features
2. Use **Zustand stores** for all state management
3. Implement proper **TypeScript types** for all data structures
4. Add **error handling** and **loading states** for async operations
5. Write **reusable components** in `/shared/components/`
6. Follow **git commit guidelines** from `instructions/git-commit.instructions.md`

## 🔍 Code Quality Checklist

- [ ] TypeScript: No type errors or `any` usage
- [ ] ESLint: No lint warnings or errors
- [ ] Responsive design for mobile and desktop
- [ ] Proper loading and error states
- [ ] Zustand used for state management
- [ ] Page uses standard folder structure
- [ ] Components are modular and reusable
- [ ] Proper error boundaries implemented
- [ ] Performance optimizations applied

---

*This architecture follows the production-grade standards outlined in `instructions/code-quality.md` and provides a scalable foundation for the Kenesis platform.*
