'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Product } from '@/types/Product';
import { fetchProducts } from '@/lib/marketplaceApi';
import Navbar from '@/components/Landing/Navbar';
import { ArrowLeft, Star, Award } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const ProductDetailPage: React.FC = () => {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetchProducts();
        const foundProduct = response.data.find((p: Product) => p.id === params.id);
        setProduct(foundProduct || null);
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A071A]">
        <Navbar />
        <div className="pt-20 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-700 rounded mb-6"></div>
            <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A071A]">
        <Navbar />
        <div className="pt-20 p-8 text-center">
          <h1 className="text-white text-2xl mb-4">Product not found</h1>
          <Link href="/marketplace" className="text-blue-400 hover:text-blue-300">
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A071A]">
      <Navbar />
      
      <div className="pt-20 p-8 max-w-6xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/marketplace" 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>Back to Marketplace</span>
        </Link>

        {/* Product Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <div className="aspect-square rounded-lg overflow-hidden">
              <Image
                src={product.image}
                alt={product.title}
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-white text-3xl font-bold mb-4">{product.title}</h1>
            
            <p className="text-gray-400 text-lg mb-4">by {product.author}</p>
            
            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {renderStars(product.rating)}
              </div>
              <span className="text-white font-medium">{product.rating}</span>
              <span className="text-gray-400">({product.totalRatings} reviews)</span>
            </div>

            {/* Price */}
            <div className="text-white text-4xl font-bold mb-6">
              ${product.price.toFixed(2)}
            </div>

            {/* Certificate Badge - All courses include certificates */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white mb-6">
              <Award size={20} />
              <span className="font-medium">Certificate Included</span>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-white text-xl font-semibold mb-3">About this course</h3>
              <p className="text-gray-300 leading-relaxed">{product.description}</p>
            </div>

            {/* Purchase Button */}
            <button
              className="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-opacity hover:opacity-90"
              style={{
                background: 'linear-gradient(107.31deg, #00C9FF -30.5%, #4648FF 54.41%, #0D01F6 100%)',
                color: 'white'
              }}
            >
              Purchase Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
