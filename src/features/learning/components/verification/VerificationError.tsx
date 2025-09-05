import React from "react";
import { XCircle } from "lucide-react";

interface VerificationErrorProps {
  message: string;
}

export const VerificationError: React.FC<VerificationErrorProps> = ({
  message,
}) => (
  <div className="relative overflow-hidden rounded-xl bg-black/40 backdrop-blur-sm border border-red-500/20 shadow-2xl">
    {/* Background Gradient */}
    <div 
      className="absolute inset-0 opacity-10"
      style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.3) 0%, rgba(127,29,29,0.2) 50%, transparent 100%)',
      }}
    />
    
    <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center">
      <div 
        className="rounded-full p-4 mb-6"
        style={{
          background: 'rgba(239,68,68,0.1)',
          boxShadow: '0 0 20px rgba(239,68,68,0.2)',
        }}
      >
        <XCircle className="h-16 w-16 text-red-400" />
      </div>
      
      <h2 className="font-poppins text-2xl md:text-3xl font-bold text-white mb-4">
        Verification{" "}
        <span className="text-red-400">Failed</span>
      </h2>
      
      <p className="font-poppins text-white/70 text-lg max-w-md leading-relaxed">
        {message}
      </p>
      
      <div 
        className="mt-6 px-4 py-2 rounded-lg border border-red-500/30"
        style={{
          background: 'rgba(239,68,68,0.1)',
        }}
      >
        <p className="font-poppins text-sm text-red-300">
          Please verify the certificate ID and try again
        </p>
      </div>
    </div>
  </div>
);
