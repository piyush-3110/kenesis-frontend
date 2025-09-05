import React from "react";
import { CheckCircle2, User, Book, Calendar } from "lucide-react";
import { format } from "date-fns";

interface CertificateDetails {
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
}

interface VerificationSuccessProps {
  certificate: CertificateDetails;
}

export const VerificationSuccess: React.FC<VerificationSuccessProps> = ({
  certificate,
}) => (
  <div className="relative overflow-hidden rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 shadow-2xl">
    {/* Header Section with Gradient */}
    <div className="relative p-8 text-center">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'linear-gradient(135deg, rgba(6,128,255,0.3) 0%, rgba(2,46,210,0.2) 50%, transparent 100%)',
        }}
      />
      
      <div className="relative z-10">
        <div className="flex justify-center mb-6">
          <div 
            className="rounded-full p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(6,128,255,0.2) 0%, rgba(2,46,210,0.1) 100%)',
              boxShadow: '0 0 30px rgba(6,128,255,0.3)',
            }}
          >
            <CheckCircle2 className="h-16 w-16 text-[#0680FF]" />
          </div>
        </div>
        
        <h1 className="font-poppins text-3xl md:text-4xl font-bold text-white mb-4">
          Certificate{" "}
          <span 
            className="bg-gradient-to-r from-[#0680FF] to-[#022ED2] bg-clip-text text-transparent"
            style={{
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Verified
          </span>
        </h1>
        
        <p className="font-poppins text-white/70 text-lg mb-4">
          This certificate is authentic and has been successfully verified.
        </p>
        
        <div 
          className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-[#0680FF] border"
          style={{
            background: 'rgba(6,128,255,0.1)',
            borderColor: 'rgba(6,128,255,0.3)',
          }}
        >
          ID: {certificate.certificateId}
        </div>
      </div>
    </div>

    {/* Details Section */}
    <div className="space-y-6 p-8 pt-0">
      <div className="flex items-start space-x-4">
        <div 
          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(6,128,255,0.2) 0%, rgba(2,46,210,0.1) 100%)',
          }}
        >
          <User className="h-6 w-6 text-[#0680FF]" />
        </div>
        <div className="flex-1">
          <p className="font-poppins text-sm font-medium text-white/60 mb-1">RECIPIENT</p>
          <p className="font-poppins text-lg font-semibold text-white">
            {certificate.user.username}
          </p>
          {certificate.user.walletAddress && (
            <p className="font-mono text-sm text-white/50 mt-1 break-all">
              {certificate.user.walletAddress}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-start space-x-4">
        <div 
          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(6,128,255,0.2) 0%, rgba(2,46,210,0.1) 100%)',
          }}
        >
          <Book className="h-6 w-6 text-[#0680FF]" />
        </div>
        <div className="flex-1">
          <p className="font-poppins text-sm font-medium text-white/60 mb-1">COURSE</p>
          <p className="font-poppins text-lg font-semibold text-white">
            {certificate.course.title}
          </p>
          <p className="font-poppins text-sm text-white/70 mt-1">
            {certificate.course.description}
          </p>
        </div>
      </div>
      
      <div className="flex items-start space-x-4">
        <div 
          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(6,128,255,0.2) 0%, rgba(2,46,210,0.1) 100%)',
          }}
        >
          <Calendar className="h-6 w-6 text-[#0680FF]" />
        </div>
        <div className="flex-1">
          <p className="font-poppins text-sm font-medium text-white/60 mb-1">DATE OF ISSUE</p>
          <p className="font-poppins text-lg font-semibold text-white">
            {format(new Date(certificate.issuedAt), "MMMM d, yyyy")}
          </p>
        </div>
      </div>
      
      {certificate.nftId && (
        <div 
          className="rounded-lg p-4 border"
          style={{
            background: 'linear-gradient(135deg, rgba(6,128,255,0.1) 0%, rgba(2,46,210,0.05) 100%)',
            borderColor: 'rgba(6,128,255,0.3)',
          }}
        >
          <p className="font-poppins text-sm font-medium text-[#0680FF] mb-1">NFT Certificate</p>
          <p className="font-poppins text-sm text-white/70">NFT ID: {certificate.nftId}</p>
        </div>
      )}
    </div>
  </div>
);
