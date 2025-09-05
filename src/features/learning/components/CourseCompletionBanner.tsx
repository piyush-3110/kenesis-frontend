import React from "react";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";

interface CourseCompletionBannerProps {
  onDownloadCertificate: () => void;
  isGeneratingCertificate: boolean;
}

export const CourseCompletionBanner: React.FC<CourseCompletionBannerProps> = ({
  onDownloadCertificate,
  isGeneratingCertificate,
}) => {
  return (
    <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 shadow-lg">
      <div className="flex items-center justify-center gap-4 max-w-4xl mx-auto">
        <div className="flex-shrink-0">
          <Award className="h-8 w-8" />
        </div>
        <div className="text-center sm:text-left">
          <h3 className="font-bold text-lg">🎉 Course Completed!</h3>
          <p className="text-green-100">
            Congratulations on completing the course. Download your certificate now!
          </p>
        </div>
        <Button
          onClick={onDownloadCertificate}
          disabled={isGeneratingCertificate}
          variant="secondary"
          className="bg-white text-green-600 hover:bg-green-50 font-semibold"
        >
          {isGeneratingCertificate ? "Generating..." : "Download Certificate"}
        </Button>
      </div>
    </div>
  );
};
