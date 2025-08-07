import React from "react";
import Image from "next/image";
import CourseStats from "./CourseStats";

interface ProductImageProps {
  image: string;
  title: string;
  type: "video" | "document";
  rating: number;
  totalRatings: number;
  studentsCount: number;
  className?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({
  image,
  title,
  type,
  rating,
  totalRatings,
  studentsCount,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="aspect-video rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
        <Image
          src={image}
          alt={title}
          width={600}
          height={400}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
        />
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
