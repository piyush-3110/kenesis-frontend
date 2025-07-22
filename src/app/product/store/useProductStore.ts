import { create } from 'zustand';
import { ExtendedProduct, Review, CourseContent } from '@/app/product/types';

interface ProductState {
  // Product data
  product: ExtendedProduct | null;
  reviews: Review[];
  
  // UI state
  loading: boolean;
  purchasing: boolean;
  error: string | null;
  
  // Course content state
  selectedContent: CourseContent | null;
  contentProgress: Record<string, number>; // contentId -> progress percentage
  completedContent: Set<string>; // Set of completed content IDs
  
  // Review state
  submittingReview: boolean;
  reviewError: string | null;
  
  // Actions
  setProduct: (product: ExtendedProduct | null) => void;
  setReviews: (reviews: Review[]) => void;
  setLoading: (loading: boolean) => void;
  setPurchasing: (purchasing: boolean) => void;
  setError: (error: string | null) => void;
  
  // Content actions
  setSelectedContent: (content: CourseContent | null) => void;
  updateContentProgress: (contentId: string, progress: number) => void;
  markContentComplete: (contentId: string) => void;
  
  // Review actions
  setSubmittingReview: (submitting: boolean) => void;
  setReviewError: (error: string | null) => void;
  addReview: (review: Review) => void;
  updateReview: (reviewId: string, updates: Partial<Review>) => void;
  
  // Reset state
  reset: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  // Initial state
  product: null,
  reviews: [],
  loading: false,
  purchasing: false,
  error: null,
  
  // Course content initial state
  selectedContent: null,
  contentProgress: {},
  completedContent: new Set(),
  
  // Review initial state
  submittingReview: false,
  reviewError: null,
  
  // Basic actions
  setProduct: (product) => set({ product }),
  setReviews: (reviews) => set({ reviews }),
  setLoading: (loading) => set({ loading }),
  setPurchasing: (purchasing) => set({ purchasing }),
  setError: (error) => set({ error }),
  
  // Content actions
  setSelectedContent: (selectedContent) => set({ selectedContent }),
  
  updateContentProgress: (contentId, progress) =>
    set((state) => ({
      contentProgress: {
        ...state.contentProgress,
        [contentId]: progress,
      },
    })),
    
  markContentComplete: (contentId) =>
    set((state) => ({
      completedContent: new Set([...state.completedContent, contentId]),
      contentProgress: {
        ...state.contentProgress,
        [contentId]: 100,
      },
    })),
  
  // Review actions
  setSubmittingReview: (submittingReview) => set({ submittingReview }),
  setReviewError: (reviewError) => set({ reviewError }),
  
  addReview: (review) =>
    set((state) => ({
      reviews: [review, ...state.reviews],
    })),
    
  updateReview: (reviewId, updates) =>
    set((state) => ({
      reviews: state.reviews.map((review) =>
        review.id === reviewId ? { ...review, ...updates } : review
      ),
    })),
  
  // Reset all state
  reset: () =>
    set({
      product: null,
      reviews: [],
      loading: false,
      purchasing: false,
      error: null,
      selectedContent: null,
      contentProgress: {},
      completedContent: new Set(),
      submittingReview: false,
      reviewError: null,
    }),
}));

// Selectors for optimal performance
export const useProductData = () => useProductStore((state) => state.product);
export const useProductLoading = () => useProductStore((state) => state.loading);
export const useProductError = () => useProductStore((state) => state.error);
export const useProductReviews = () => useProductStore((state) => state.reviews);
export const useSelectedContent = () => useProductStore((state) => state.selectedContent);
export const useContentProgress = () => useProductStore((state) => state.contentProgress);
export const useCompletedContent = () => useProductStore((state) => state.completedContent);
