import React from "react";

interface ProductDescriptionProps {
  description: string;
  className?: string;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
  description,
  className = "",
}) => {
  return (
    <div className={className}>
      <h3 className="text-white text-xl font-semibold mb-3">
        About this course
      </h3>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
};

export default ProductDescription;
