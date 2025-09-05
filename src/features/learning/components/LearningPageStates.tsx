import React from "react";
import { Lock } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading course..." 
}) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center text-white">
      <div className="h-12 w-12 border-b-2 border-blue-500 rounded-full animate-spin mx-auto mb-4" />
      {message}
    </div>
  </div>
);

export const AccessRequiredState: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center p-6">
    <div className="text-center max-w-sm">
      <Lock className="mx-auto mb-4 text-red-400" size={48} />
      <h2 className="text-xl font-semibold text-white mb-3">
        Access Required
      </h2>
      <p className="text-gray-400 text-sm">
        You don&apos;t have access to this course.
      </p>
    </div>
  </div>
);
