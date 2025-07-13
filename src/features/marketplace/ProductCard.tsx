'use client';

import { Product } from '@/types/Product';
import Image from 'next/image';
import Link from 'next/link';
import { Star, PlayCircle, FileText } from 'lucide-react';
import { forwardRef } from 'react';

interface ProductCardProps {
  product: Product;
}

const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(({ product }, ref) => {
  return (
    <Link href={`/product/${product.id}`} className="block group">
      <div
        ref={ref}
        className="w-full p-[0.73px] rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group-hover:shadow-blue-500/20 relative"
        style={{
          background: 'linear-gradient(180deg, #0680FF 0%, #022ED2 88.45%)',
          borderRadius: '12px'
        }}
      >
        <div 
          className="w-full h-full rounded-lg p-4"
          style={{
            background: 'linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0.95) 100%)',
            borderRadius: 'calc(12px - 0.73px)'
          }}
        >
          <div className="flex gap-4">
            {/* Product Image */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                sizes="128px"
              />
              {/* Type Badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm">
                {product.type === 'video' ? (
                  <>
                    <PlayCircle size={12} className="text-blue-400" />
                    <span className="text-white text-xs font-medium">Video</span>
                  </>
                ) : (
                  <>
                    <FileText size={12} className="text-green-400" />
                    <span className="text-white text-xs font-medium">Document</span>
                  </>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                {/* Title */}
                <h3 className="text-white font-semibold text-lg line-clamp-2 mb-2 group-hover:text-blue-300 transition-colors">
                  {product.title}
                </h3>

                {/* Author */}
                <p className="text-gray-400 text-sm mb-3">
                  {product.author}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400 fill-current" />
                    <span className="text-white text-sm font-medium">
                      {product.rating}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    ({product.totalRatings})
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Price Section */}
            <div className="flex flex-col justify-center items-end text-right">
              <div className="text-white font-bold text-2xl">
                ${product.price.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
