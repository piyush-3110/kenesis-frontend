import { Product } from './Product';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  likes: number;
  likedByCurrentUser: boolean;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface CourseAccess {
  hasAccess: boolean;
  purchaseDate?: string;
  progress?: number; // 0-100
  lastWatched?: string;
}

export interface DocumentAttachment {
  id: string;
  title: string;
  url: string;
  type: 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'txt' | 'other';
  size?: string;
}

export interface CourseContent {
  id: string;
  title: string;
  type: 'video' | 'document';
  duration?: number; // for videos in seconds
  videoUrl?: string;
  documentUrl?: string;
  isCompleted: boolean;
  attachments?: DocumentAttachment[]; // Documents attached to the content
}

export interface ExtendedProduct extends Product {
  reviews: Review[];
  reviewSummary: ReviewSummary;
  courseAccess: CourseAccess;
  content?: CourseContent[];
  purchasedBy: string[]; // Array of user IDs who purchased this course
}
