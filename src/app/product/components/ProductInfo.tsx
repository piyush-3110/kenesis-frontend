import React from "react";
import ProductHeader from "./ProductHeader";
import BlockchainPurchaseSection from "./BlockchainPurchaseSection";
import ProductDescription from "./ProductDescription";
import type { CourseResponse } from "@/lib/api/courseApi";

interface CourseAccess {
  hasAccess: boolean;
  progress?: number;
}

interface ProductInfoProps {
  title: string;
  author: string;
  rating: number;
  totalRatings: number;
  price: number;
  description: string;
  courseAccess: CourseAccess;
  course: CourseResponse; // Full course data for NFT creation
  accessLoading?: boolean; // Loading state for course access check
  tokenToPayWith?: string[]; // Available payment tokens
  className?: string;
  onSuccess?: () => void; // Success callback for purchase
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  title,
  author,
  rating,
  totalRatings,
  price,
  description,
  courseAccess,
  course,
  accessLoading = false,
  tokenToPayWith = [],
  className = "",
  onSuccess,
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <ProductHeader
        title={title}
        author={author}
        rating={rating}
        totalRatings={totalRatings}
      />

      <BlockchainPurchaseSection
        price={price}
        courseAccess={courseAccess}
        course={course}
        accessLoading={accessLoading}
        tokenToPayWith={tokenToPayWith}
        onSuccess={onSuccess}
      />

      <ProductDescription description={description} />
    </div>
  );
};

export default ProductInfo;
