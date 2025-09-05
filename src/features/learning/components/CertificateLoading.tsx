import React from "react";
import { Loader2 } from "lucide-react";

export const CertificateLoading: React.FC = () => (
  <div className="py-12 text-center">
    <div className="flex flex-col items-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-400 mb-4" />
      <p className="text-gray-300">Loading your certificates...</p>
    </div>
  </div>
);
