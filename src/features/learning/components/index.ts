/**
 * Learning Feature Components
 * Centralized exports for all learning-related components
 */

// Certificate components
export {
  CertificateSection,
  default as CertificateSectionComponent
} from './CertificateSection';

export { CongratulatoryBanner, default as CongratulatoryBannerComponent } from './CongratulatoryBanner';

export { CertificateButtons, default as CertificateButtonsComponent } from './CertificateButtons';

export { CourseCompletionStatus, default as CourseCompletionStatusComponent } from './CourseCompletionStatus';

export { CourseHeader, default as CourseHeaderComponent } from './CourseHeader';

// Types
export type {
  Certificate,
  CertificateAnalytics,
  CourseCompletion,
  CertificateActionHandler,
  CertificateSectionProps,
  CongratulatoryBannerProps
} from '../types/certificate';


