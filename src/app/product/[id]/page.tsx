'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ExtendedProduct } from '@/types/Review';
import { fetchExtendedProduct, submitReview, toggleReviewLike, markContentComplete, purchaseCourse } from '@/lib/productApi';
import Navbar from '@/components/Landing/Navbar';
import ReviewsRatings from '@/components/product/ReviewsRatings';
import CourseContentViewer from '@/components/product/CourseContentViewer';
import { ArrowLeft, Star, Award, Play, FileText, ShoppingCart, CheckCircle, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const ProductDetailPage: React.FC = () => {
  const params = useParams();
  const [product, setProduct] = useState<ExtendedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        if (params.id) {
          const extendedProduct = await fetchExtendedProduct(params.id as string);
          setProduct(extendedProduct);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!product) return;
    
    try {
      const newReview = await submitReview(product.id, rating, comment);
      setProduct(prev => {
        if (!prev) return prev;
        const updatedReviews = [newReview, ...prev.reviews];
        return {
          ...prev,
          reviews: updatedReviews,
          reviewSummary: {
            ...prev.reviewSummary,
            totalReviews: updatedReviews.length,
            averageRating: updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length,
          },
        };
      });
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const handleLikeReview = async (reviewId: string) => {
    try {
      const result = await toggleReviewLike(reviewId);
      setProduct(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          reviews: prev.reviews.map(review => 
            review.id === reviewId 
              ? { ...review, likes: result.likes, likedByCurrentUser: result.liked }
              : review
          ),
        };
      });
    } catch (error) {
      console.error('Failed to like review:', error);
    }
  };

  const handleMarkComplete = async (contentId: string) => {
    if (!product) return;
    
    try {
      await markContentComplete(product.id, contentId);
      setProduct(prev => {
        if (!prev?.content) return prev;
        return {
          ...prev,
          content: prev.content.map(item =>
            item.id === contentId ? { ...item, isCompleted: true } : item
          ),
        };
      });
    } catch (error) {
      console.error('Failed to mark content complete:', error);
    }
  };

  const handlePurchase = async () => {
    if (!product || purchasing) return;
    
    setPurchasing(true);
    try {
      const result = await purchaseCourse(product.id);
      if (result.success) {
        // Reload product data to get access
        const updatedProduct = await fetchExtendedProduct(product.id);
        setProduct(updatedProduct);
      }
    } catch (error) {
      console.error('Failed to purchase course:', error);
    } finally {
      setPurchasing(false);
    }
  };

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
        <div className="pt-24 md:pt-28 p-4 sm:p-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-700 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                <div className="h-6 bg-gray-700 rounded w-1/4"></div>
                <div className="h-12 bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A071A]">
        <Navbar />
        <div className="pt-24 md:pt-28 p-4 sm:p-8 text-center">
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
      
      <div className="pt-24 md:pt-28 p-4 sm:p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/marketplace" 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group relative z-10"
        >
          <ArrowLeft size={20} className="group-hover:transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Marketplace</span>
        </Link>

        {/* Product Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-video rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
              <Image
                src={product.image}
                alt={product.title}
                width={600}
                height={400}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            
            {/* Course Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 text-center border border-gray-800">
                <div className="flex items-center justify-center mb-2">
                  {product.type === 'video' ? (
                    <Play size={24} className="text-blue-400" />
                  ) : (
                    <FileText size={24} className="text-orange-400" />
                  )}
                </div>
                <div className="text-white font-semibold">
                  {product.type === 'video' ? 'Video Course' : 'Document Course'}
                </div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 text-center border border-gray-800">
                <Star size={24} className="text-yellow-400 mx-auto mb-2" />
                <div className="text-white font-semibold">{product.rating}/5</div>
                <div className="text-gray-400 text-sm">{product.totalRatings} reviews</div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4 text-center border border-gray-800">
                <Users size={24} className="text-green-400 mx-auto mb-2" />
                <div className="text-white font-semibold">{product.purchasedBy.length}</div>
                <div className="text-gray-400 text-sm">Students</div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-white text-3xl lg:text-4xl font-bold mb-4 animate-fade-in">
                {product.title}
              </h1>
              
              <p className="text-gray-400 text-lg mb-4">by {product.author}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {renderStars(product.rating)}
                </div>
                <span className="text-white font-medium">{product.rating}</span>
                <span className="text-gray-400">({product.totalRatings} reviews)</span>
              </div>
            </div>

            {/* Price and Purchase */}
            <div className="space-y-4">
              <div className="text-white text-4xl font-bold">
                ${product.price.toFixed(2)}
              </div>

              {/* Certificate Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-600/30">
                <Award size={20} />
                <span className="font-medium">Certificate Included</span>
              </div>

              {/* Purchase Status */}
              {product.courseAccess.hasAccess ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-600/20 text-green-400 border border-green-600/30">
                    <CheckCircle size={20} />
                    <span className="font-medium">You own this course</span>
                  </div>
                  
                  {product.courseAccess.progress !== undefined && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white font-medium">{product.courseAccess.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-700"
                          style={{ width: `${product.courseAccess.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  style={{
                    background: purchasing ? '#4a5568' : 'linear-gradient(107.31deg, #00C9FF -30.5%, #4648FF 54.41%, #0D01F6 100%)',
                    color: 'white'
                  }}
                >
                  <ShoppingCart size={20} />
                  {purchasing ? 'Processing...' : 'Purchase Course'}
                </button>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-white text-xl font-semibold mb-3">About this course</h3>
              <p className="text-gray-300 leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Course Content (if user has access) */}
        {product.courseAccess.hasAccess && product.content && (
          <div className="mb-12">
            <CourseContentViewer
              content={product.content}
              progress={product.courseAccess.progress || 0}
              onContentSelect={(contentId) => console.log('Selected content:', contentId)}
              onMarkComplete={handleMarkComplete}
            />
          </div>
        )}

        {/* Reviews and Ratings */}
        <ReviewsRatings
          productId={product.id}
          reviews={product.reviews}
          reviewSummary={product.reviewSummary}
          userCanReview={product.courseAccess.hasAccess}
          onSubmitReview={handleSubmitReview}
          onLikeReview={handleLikeReview}
        />
      </div>
    </div>
  );
};

export default ProductDetailPage;
