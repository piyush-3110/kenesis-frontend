// Re-export existing types
export type {
  Review,
  CourseContent,
  DocumentAttachment,
  ReviewSummary,
  CourseAccess,
} from "@/types/Review";

// Product page specific types
export interface ProductPageState {
  hasAccess: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  error: string | null;
}

export interface ReviewSubmission {
  rating: number;
  comment: string;
}

export interface ContentProgress {
  contentId: string;
  progress: number;
  completed: boolean;
  lastAccessed: Date;
}

export interface PurchaseResult {
  success: boolean;
  message: string;
  accessGranted?: boolean;
}
