import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface CertificateErrorProps {
  error: string;
  onRetry?: () => void;
}

export const CertificateError: React.FC<CertificateErrorProps> = ({
  error,
  onRetry,
}) => (
  <div className="py-12 text-center">
    <div className="flex flex-col items-center">
      <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">
        Error Loading Certificates
      </h3>
      <p className="text-gray-400 mb-4 max-w-md">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  </div>
);
