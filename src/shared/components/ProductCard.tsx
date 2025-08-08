'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Users, Star, Eye, EyeOff, BookOpen, Video, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import GradientBox from './GradientBox';
import { Product } from '@/app/dashboard/my-products/types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

/**
 * ProductCard Component
 * Displays product information with gradient border and proper styling
 * Adapted from CourseCard for My Products section
 */
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className
}) => {
  const formatPrice = (price: number): string => `$${price.toFixed(2)}`;
  
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const getLevelColor = (level: string): string => {
    const normalizedLevel = level.toLowerCase();
    switch (normalizedLevel) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video size={12} />;
      case 'document':
        return <FileText size={12} />;
      default:
        return <BookOpen size={12} />;
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'video':
        return 'bg-purple-500 text-white border-purple-500';
      case 'document':
        return 'bg-blue-500 text-white border-blue-500';
      default:
        return 'bg-gray-500 text-white border-gray-500';
    }
  };

  return (
    <div className={cn("group", className)}>
      <GradientBox className="h-full transition-transform duration-200 group-hover:scale-[1.02]">
        <div className="p-0 h-full flex flex-col">
          {/* Thumbnail */}
          <div className="relative h-48 rounded-t-lg overflow-hidden">
            <img
              src={product.thumbnail || '/images/landing/product.png'}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            
            {/* Status overlay */}
            <div className="absolute top-3 right-3">
              {product.isPublished ? (
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30">
                  <Eye size={12} />
                  <span>Published</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-500/20 text-gray-400 text-xs font-medium border border-gray-500/30">
                  <EyeOff size={12} />
                  <span className="capitalize">{product.status}</span>
                </div>
              )}
            </div>

            {/* Type badge */}
            <div className="absolute top-3 left-3">
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border",
                getTypeColor(product.type)
              )}>
                {getTypeIcon(product.type)}
                <span className="capitalize">{product.type}</span>
              </div>
            </div>

            {/* Discount badge */}
            {/* Removed: discount logic not available in My Courses API */}
          </div>

          {/* Content */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Category and Level */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-400 text-xs font-medium uppercase tracking-wide truncate">
                {product.category}
              </span>
              <span className={cn(
                "px-2 py-1 rounded text-xs font-medium border flex-shrink-0",
                getLevelColor(product.level)
              )}>
                {product.level.charAt(0).toUpperCase() + product.level.slice(1)}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-white text-lg font-semibold mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors overflow-hidden">
              {product.title}
            </h3>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1 overflow-hidden">
              {product.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {product.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 rounded bg-gray-700/50 text-gray-300 text-xs truncate max-w-[80px]"
                  title={tag}
                >
                  {tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="px-2 py-1 rounded bg-gray-700/50 text-gray-400 text-xs flex-shrink-0">
                  +{product.tags.length - 3} more
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4 text-xs">
              <div className="flex items-center gap-1 text-gray-400 overflow-hidden">
                <Star size={12} className="text-yellow-400 flex-shrink-0" />
                <span className="truncate">{product.stats.rating}</span>
                <span className="truncate">({formatNumber(product.stats.reviewCount)})</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400 overflow-hidden">
                <Users size={12} className="flex-shrink-0" />
                <span className="truncate">{formatNumber(product.studentCount)}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400 overflow-hidden">
                <Clock size={12} className="flex-shrink-0" />
                <span className="truncate">{product.duration}</span>
              </div>
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-white text-lg font-bold truncate">
                  {formatPrice(product.price)}
                </span>
              </div>
              
              <Link 
                href={`/dashboard/my-products/${product.id}`}
                className="px-3 py-1.5 rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors flex-shrink-0"
              >
                Manage
              </Link>
            </div>
          </div>
        </div>
      </GradientBox>
    </div>
  );
};

export default ProductCard;
