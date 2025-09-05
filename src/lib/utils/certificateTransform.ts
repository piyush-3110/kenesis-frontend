import type { Certificate } from '@/features/learning/types/certificate';
import type { UserCertificate } from '@/types/certificate-api';

export const transformCertificateData = (apiCertificates: UserCertificate[]): Certificate[] => {
  return apiCertificates.map(cert => ({
    id: cert.certificateId,
    title: cert.course.title,
    date: cert.issuedAt,
    courseId: cert.course.id,
    imageUrl: cert.course.thumbnail || "/images/landing/Certificate.png",
    downloadUrl: cert.pdfUrl,
    shareUrl: `/verify/${cert.certificateId}`, // This creates the verification URL
    completionRate: 100, // All certificates are 100% complete
  }));
};
