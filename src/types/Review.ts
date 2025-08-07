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
  type: "pdf" | "doc" | "docx" | "ppt" | "pptx" | "txt" | "other";
  size?: string;
}

export interface CourseContent {
  id: string;
  title: string;
  type: "video" | "document";
  duration?: number; // for videos in seconds
  videoUrl?: string;
  documentUrl?: string;
  isCompleted: boolean;
  attachments?: DocumentAttachment[]; // Documents attached to the content
}

export interface CourseChapter {
  id: string;
  title: string;
  description: string;
  order: number;
  moduleCount: number;
  modules?: CourseModule[];
}

export interface CourseModule {
  id: string;
  title: string;
  type: "video" | "document" | "quiz" | "assignment";
  duration: number; // in seconds (backend format)
  order: number;
  isPreview: boolean;
}

export interface CourseMetadata {
  requirements: string[];
  learningOutcomes: string[];
  targetAudience: string[];
  level: string;
  tags: string[];
}
