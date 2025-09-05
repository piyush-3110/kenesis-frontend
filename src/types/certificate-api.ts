// API Response Types for Certificates
export interface CertificateApiResponse {
  success: boolean;
  message: string;
  data: {
    certificates: UserCertificate[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface UserCertificate {
  id: string;
  certificateId: string;
  pdfUrl: string;
  issuedAt: string;
  nftId?: string;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
  };
}

export interface GenerateCertificateApiResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    certificateId: string;
    pdfUrl: string;
    issuedAt: string;
    nftId?: string;
    user: {
      _id: string;
      username: string;
    };
    course: {
      _id: string;
      title: string;
    };
  };
}

export interface VerifyCertificateApiResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    certificateId: string;
    issuedAt: string;
    pdfUrl: string;
    nftId?: string;
    user: {
      _id: string;
      username: string;
      walletAddress?: string;
    };
    course: {
      _id: string;
      title: string;
      description: string;
    };
  } | null;
}
