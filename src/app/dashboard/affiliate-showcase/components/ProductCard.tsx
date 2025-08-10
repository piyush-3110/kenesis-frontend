'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, TrendingUp, Loader2, CheckCircle } from 'lucide-react';
import { AffiliateProduct } from '../types';
import { useAffiliateShowcaseStore } from '../store/useAffiliateShowcaseStore';
import { useToastStore } from '../store/useToastStore';
import { AFFILIATE_COLORS } from '../constants';

interface ProductCardProps {
  product: AffiliateProduct;
}

/**
 * ProductCard Component
 * Individual product card with promotion functionality
 */
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { promoteProduct } = useAffiliateShowcaseStore();
  const { addToast } = useToastStore();
  const [isPromoting, setIsPromoting] = useState(false);
  const [isPromoted, setIsPromoted] = useState(false);

  const handlePromote = async () => {
    setIsPromoting(true);
    
    try {
      const success = await promoteProduct(product.id);
      if (success) {
        setIsPromoted(true);
        
        // Show success toast
        addToast({
          type: 'success',
          title: 'Affiliate Link Created!',
          message: `Commission: 30% • Ready to promote "${product.title}"`,
          duration: 4000,
        });
        
        // Auto-hide success state after 2 seconds
        setTimeout(() => {
          setIsPromoted(false);
        }, 2000);
      } else {
        // Error is handled by the store, but we can show a generic error toast
        addToast({
          type: 'error',
          title: 'Failed to Create Link',
          message: 'Please try again or contact support if the issue persists.',
        });
      }
    } catch (error) {
      console.error('Error promoting product:', error);
      addToast({
        type: 'error',
        title: 'Unexpected Error',
        message: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <div className="group relative">
      {/* Card container with gradient border */}
      <div 
        className="rounded-xl p-[1px] transition-all duration-300 hover:scale-105"
        style={{
          background: AFFILIATE_COLORS.PRIMARY_BORDER,
        }}
      >
        <div 
          className="rounded-xl p-4 h-full flex flex-col"
          style={{
            background: AFFILIATE_COLORS.CARD_BG,
          }}
        >
          {/* Product Image - Clickable */}
          <Link href={`/dashboard/affiliate-showcase/product/${product.id}`}>
            <div className="relative mb-4 cursor-pointer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.thumbnail}
                alt={product.title}
                className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
              />
              
              {/* Type indicator */}
              <div className="absolute top-2 right-2">
                <span
                  className="px-2 py-1 text-xs rounded-full"
                  style={{
                    background: AFFILIATE_COLORS.BUTTON_BG,
                    color: AFFILIATE_COLORS.TEXT_PRIMARY,
                    fontFamily: 'CircularXX, Inter, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  {product.type.toUpperCase()}
                </span>
              </div>
            </div>
          </Link>

          {/* Product Info - Clickable */}
          <Link href={`/dashboard/affiliate-showcase/product/${product.id}`}>
            <div className="flex-1 space-y-3 cursor-pointer hover:opacity-90 transition-opacity">
              {/* Rating and Review Count */}
              <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star 
                  size={16} 
                  className="text-yellow-400 fill-current" 
                />
                <span
                  style={{
                    color: AFFILIATE_COLORS.TEXT_PRIMARY,
                    fontFamily: 'CircularXX, Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 450,
                  }}
                >
                  {product.rating}
                </span>
              </div>
              <span
                style={{
                  color: AFFILIATE_COLORS.TEXT_SECONDARY,
                  fontFamily: 'CircularXX, Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 450,
                }}
              >
                {product.reviewCount.toLocaleString()}
              </span>
            </div>

            {/* Title */}
            <h3
              className="line-clamp-2"
              style={{
                color: AFFILIATE_COLORS.TEXT_PRIMARY,
                fontFamily: 'CircularXX, Inter, sans-serif',
                fontSize: '18px',
                fontWeight: 500,
                lineHeight: '140%',
              }}
            >
              {product.title}
            </h3>

            {/* Author */}
            <p
              style={{
                color: AFFILIATE_COLORS.TEXT_MUTED,
                fontFamily: 'CircularXX, Inter, sans-serif',
                fontSize: '16.4px',
                fontWeight: 450,
                lineHeight: '140%',
              }}
            >
              {product.author}
            </p>

            {/* Category */}
            <p
              style={{
                color: AFFILIATE_COLORS.TEXT_SECONDARY,
                fontFamily: 'CircularXX, Inter, sans-serif',
                fontSize: '16.4px',
                fontWeight: 450,
                lineHeight: '140%',
              }}
            >
              {product.category}
            </p>

            {/* Price and Commission */}
            <div className="space-y-1">
              <p
                style={{
                  color: AFFILIATE_COLORS.TEXT_PRIMARY,
                  fontFamily: 'CircularXX, Inter, sans-serif',
                  fontSize: '16.4px',
                  fontWeight: 450,
                  lineHeight: '140%',
                }}
              >
                ${product.price.toFixed(2)}
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp size={14} className="text-green-400" />
                <span
                  style={{
                    color: AFFILIATE_COLORS.TEXT_SECONDARY,
                    fontFamily: 'CircularXX, Inter, sans-serif',
                    fontSize: '16.4px',
                    fontWeight: 450,
                    lineHeight: '140%',
                  }}
                >
                  Com. Commission: {product.commission}%
                </span>
              </div>
            </div>
            </div>
          </Link>

          {/* CTA Button */}
          <button
            onClick={handlePromote}
            disabled={isPromoting || isPromoted}
            className="w-full mt-4 py-3 rounded-lg font-medium text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: isPromoted 
                ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)' 
                : AFFILIATE_COLORS.BUTTON_BG,
              fontFamily: 'CircularXX, Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
            }}
          >
            <div className="flex items-center justify-center gap-2">
              {isPromoting && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {isPromoted && (
                <CheckCircle size={16} />
              )}
              <span>
                {isPromoting 
                  ? 'Creating Link...' 
                  : isPromoted 
                    ? 'Link Created!' 
                    : 'Promote this product'
                }
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
