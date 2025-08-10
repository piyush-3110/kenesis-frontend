import React from "react";
import { Star } from "lucide-react";

interface ProductHeaderProps {
  title: string;
  author: string;
  rating: number;
  totalRatings: number;
  className?: string;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  title,
  author,
  rating,
  totalRatings,
  className = "",
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={
          index < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-600"
        }
      />
    ));
  };

  return (
    <div className={className}>
      <h1 className="text-white text-3xl lg:text-4xl font-bold mb-4 animate-fade-in">
        {title}
      </h1>

      <p className="text-gray-400 text-lg mb-4">by {author}</p>

      {/* Rating */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-1">{renderStars(rating)}</div>
        <span className="text-white font-medium">{rating}</span>
        <span className="text-gray-400">({totalRatings} reviews)</span>
      </div>
    </div>
  );
};

export default ProductHeader;
