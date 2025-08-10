import React, { useState } from "react";
import Image from "next/image";
import { Play, Image as ImageIcon } from "lucide-react";
import CourseStats from "./CourseStats";

interface ProductImageProps {
  image: string;
  title: string;
  type: "video" | "document";
  rating: number;
  totalRatings: number;
  studentsCount: number;
  previewVideo?: string; // URL to the course preview video
  className?: string;
}

/**
 * ProductImage Component
 *
 * Displays the course thumbnail image with an optional preview video.
 * When a preview video is available and the course type is "video",
 * users can click to toggle between the image and video.
 * The video includes play/pause controls and error fallback.
 */
const ProductImage: React.FC<ProductImageProps> = ({
  image,
  title,
  type,
  rating,
  totalRatings,
  studentsCount,
  previewVideo,
  className = "",
}) => {
  const [showVideo, setShowVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Show video if available and user has chosen to view it, or if no preview video, show image
  const hasPreviewVideo = previewVideo && type === "video";

  const handleToggleView = () => {
    if (hasPreviewVideo) {
      setShowVideo(!showVideo);
      setVideoError(false);
    }
  };

  const handleVideoError = () => {
    setVideoError(true);
    setShowVideo(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
        {showVideo && hasPreviewVideo && !videoError ? (
          // Preview Video
          <div className="relative">
            <video
              src={previewVideo}
              controls
              poster={image}
              className="w-full h-full object-cover"
              onError={handleVideoError}
              preload="metadata"
              aria-label={`Preview video for ${title}`}
            >
              <source src={previewVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Video overlay for better UX */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs">
              Course Preview
            </div>
          </div>
        ) : (
          // Thumbnail Image with Play Overlay for video courses
          <div
            className={`relative ${hasPreviewVideo ? "cursor-pointer" : ""}`}
            onClick={hasPreviewVideo ? handleToggleView : undefined}
          >
            <Image
              src={image}
              alt={title}
              width={600}
              height={400}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />

            {/* Play button overlay for video courses with preview */}
            {hasPreviewVideo && !showVideo && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="bg-blue-600/90 backdrop-blur-sm text-white p-4 rounded-full hover:bg-blue-600 transition-colors">
                  <Play size={24} fill="currentColor" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Toggle Button - only show for video courses with preview */}
        {hasPreviewVideo && (
          <button
            onClick={handleToggleView}
            className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg hover:bg-black/80 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            {showVideo ? (
              <>
                <ImageIcon size={16} />
                View Thumbnail
              </>
            ) : (
              <>
                <Play size={16} />
                Watch Preview
              </>
            )}
          </button>
        )}

        {/* Video Error Message */}
        {videoError && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <p className="mb-2">Failed to load preview video</p>
              <button
                onClick={() => setShowVideo(false)}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                View thumbnail instead
              </button>
            </div>
          </div>
        )}
      </div>

      <CourseStats
        type={type}
        rating={rating}
        totalRatings={totalRatings}
        studentsCount={studentsCount}
      />
    </div>
  );
};

export default ProductImage;
