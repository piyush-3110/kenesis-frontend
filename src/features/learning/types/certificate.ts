/**
 * Certificate Types
 * TypeScript interfaces for certificate-related components
 */

export interface Certificate {
  id: string;
  title: string;
  date: string; // ISO date string
  imageUrl: string; // URL to certificate thumbnail/preview
  downloadUrl: string; // Direct download link for certificate PDF
  shareUrl: string; // URL for sharing (e.g., LinkedIn)
  courseId?: string; // Associated course ID
  completionRate?: number; // 0-100 percentage
  instructor?: {
    id: string;
    username: string;
  };
  metadata?: {
    issueDate: string;
    expiryDate?: string; // For certificates with expiration
    credentialId?: string; // Unique credential identifier
    verificationType?: "blockchain" | "traditional";
  };
}

export interface CertificateAnalytics {
  totalCertificates: number;
  completedThisMonth: number;
  averageCompletionTime: number; // in days
  topCategories: Array<{
    category: string;
    count: number;
  }>;
}

export interface CourseCompletion {
  courseId: string;
  courseTitle: string;
  completionDate: string;
  certificateId?: string;
  finalScore?: number;
  completionPercentage: number;
  instructor: {
    id: string;
    username: string;
  };
}

// Event handlers for certificate actions
export type CertificateActionHandler = (certificate: Certificate) => void;

export interface CertificateSectionProps {
  certificates: Certificate[];
  className?: string;
  onDownload?: CertificateActionHandler;
  onShare?: CertificateActionHandler;
  onView?: CertificateActionHandler;
  loading?: boolean;
  error?: string | null;
}

export interface CongratulatoryBannerProps {
  courseTitle: string;
  completionDate: string;
  certificateId?: string;
  onViewCertificate: () => void;
  onDownloadCertificate: () => void;
  className?: string;
  instructor?: {
    username: string;
    avatar?: string;
  };
  courseStats?: {
    duration: number; // in minutes
    rating: number;
    reviewCount: number;
  };
}
