"use client";

import React from "react";
import { RequireAuth } from "@/features/auth/RequireAuth";
import DashboardLayout from "../components/DashboardLayout";
import { CertificateSection } from "@/features/learning/components/CertificateSection";
import type { Certificate } from "@/features/learning/types/certificate";

// Mock data - replace with real API call
const mockCertificates: Certificate[] = [
  {
    id: "cert-001",
    title: "Complete React Development Bootcamp",
    date: "2024-01-15T10:00:00Z",
    imageUrl: "/images/landing/Certificate.png",
    downloadUrl: "/api/certificates/cert-001/download",
    shareUrl: "https://kenesis.com/certificates/cert-001",
    courseId: "course-123",
    completionRate: 100,
  },
  {
    id: "cert-002",
    title: "Advanced JavaScript Patterns",
    date: "2024-02-20T14:30:00Z",
    imageUrl: "/images/landing/Certificate.png",
    downloadUrl: "/api/certificates/cert-002/download",
    shareUrl: "https://kenesis.com/certificates/cert-002",
    courseId: "course-456",
    completionRate: 95,
  },
];

/**
 * My Achievement Page
 * Dashboard page showing user's certificates and achievements
 */
const MyAchievementPage: React.FC = () => {
  const handleDownload = (certificate: Certificate) => {
    console.log("Downloading certificate:", certificate.title);
    // TODO: Implement real download logic with backend API
  };

  const handleShare = (certificate: Certificate) => {
    console.log("Sharing certificate:", certificate.title);
    // TODO: Implement real share logic (LinkedIn, social media)
  };

  return (
    <RequireAuth>
      <DashboardLayout
        title="My Achievements"
        subtitle="View and manage your course completion certificates"
      >
        <div className="p-4 sm:p-6">
          <CertificateSection
            certificates={mockCertificates}
            onDownload={handleDownload}
            onShare={handleShare}
            className="max-w-7xl mx-auto"
          />
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
};

export default MyAchievementPage;
