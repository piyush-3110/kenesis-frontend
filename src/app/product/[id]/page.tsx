'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, Users, Clock, Globe, BookOpen, Video, FileText } from 'lucide-react';
import { CourseAPI } from '@/lib/api';

interface ProductPageProps {}

/**
 * Product Detail Page
 * Displays course/product information for potential customers
 */
const ProductPage: React.FC<ProductPageProps> = () => {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProductData();
  }, [productId]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading product data for:', productId);
      
      // Try to fetch course data (assuming products are courses)
      const response = await CourseAPI.getCourse(productId);
      
      if (response.success) {
        console.log('✅ Product data loaded:', response.data);
        setProduct(response.data?.course || response.data);
      } else {
        throw new Error(response.message || 'Product not found');
      }
    } catch (err: any) {
      console.error('❌ Failed to load product data:', err);
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">
            {error || 'Product not found'}
          </div>
          <button
            onClick={() => router.push('/marketplace')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Thumbnail */}
            <div className="lg:w-1/3">
              <img
                src={product.thumbnail || '/images/course-placeholder.png'}
                alt={product.title}
                className="w-full aspect-video object-cover rounded-lg"
              />
            </div>
            
            {/* Info */}
            <div className="lg:w-2/3">
              <h1 className="text-3xl font-bold text-white mb-4">{product.title}</h1>
              <p className="text-gray-300 mb-6">{product.shortDescription || product.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={16} fill="currentColor" />
                  <span>{product.stats?.rating || 0}</span>
                  <span className="text-gray-400">({product.stats?.reviewCount || 0} reviews)</span>
                </div>
                
                <div className="flex items-center gap-1 text-gray-400">
                  <Users size={16} />
                  <span>{product.stats?.enrollmentCount || 0} students</span>
                </div>
                
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock size={16} />
                  <span>{Math.round((product.stats?.duration || 0) / 3600)}h total</span>
                </div>
                
                <div className="flex items-center gap-1 text-gray-400">
                  <Globe size={16} />
                  <span className="capitalize">{product.language || 'English'}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-white">${product.price || 0}</span>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm capitalize">
                  {product.level || 'Beginner'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">About this course</h2>
              <p className="text-gray-300 leading-relaxed">{product.description}</p>
            </div>
            
            {/* Learning Outcomes */}
            {product.metadata?.learningOutcomes && (
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-white mb-4">What you'll learn</h2>
                <ul className="space-y-2">
                  {product.metadata.learningOutcomes.map((outcome: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Requirements */}
            {product.metadata?.requirements && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {product.metadata.requirements.map((requirement: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-4">Course includes:</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-gray-300">
                  <Video size={16} className="text-blue-400" />
                  <span>{product.chapters?.length || 0} chapters</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <BookOpen size={16} className="text-green-400" />
                  <span>Lifetime access</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <FileText size={16} className="text-purple-400" />
                  <span>Downloadable resources</span>
                </li>
              </ul>
              
              <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Enroll Now - ${product.price || 0}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;