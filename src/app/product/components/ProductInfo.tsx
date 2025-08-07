import React from "react";
import ProductHeader from "./ProductHeader";
import PurchaseSection from "./PurchaseSection";
import ProductDescription from "./ProductDescription";
import { UsePurchaseFlowReturn } from "../hooks/usePurchaseFlow";

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
  productId: string;
  purchaseFlow: UsePurchaseFlowReturn;
  className?: string;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  title,
  author,
  rating,
  totalRatings,
  price,
  description,
  courseAccess,
  productId,
  purchaseFlow,
  className = "",
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <ProductHeader
        title={title}
        author={author}
        rating={rating}
        totalRatings={totalRatings}
      />

      <PurchaseSection
        price={price}
        courseAccess={courseAccess}
        productId={productId}
        purchaseFlow={purchaseFlow}
      />

      <ProductDescription description={description} />
    </div>
  );
};

export default ProductInfo;
