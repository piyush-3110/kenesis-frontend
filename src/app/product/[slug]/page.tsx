"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCourse } from "@/hooks/useCourseQuery";
import Navbar from "@/components/Landing/Navbar";
import ReviewsRatings from "@/components/product/ReviewsRatings";
// import CourseContentViewer from "@/components/product/CourseContentViewer";
import {
  ProductImage,
  ProductInfo,
  ProductPageLoading,
  ProductPageError,
  CourseChapters,
  CourseDetails,
  usePurchaseFlow,
  useProductActions,
} from "../components";

const ProductDetailPage: React.FC = () => {
  const params = useParams();
  const slug = params.slug as string;

  // Use React Query to fetch course data
  const { data: product, isLoading: loading, error, refetch } = useCourse(slug);

  // Custom hooks for business logic
  const purchaseFlow = usePurchaseFlow(refetch);
  const productActions = useProductActions(refetch);

  // Loading state
  if (loading) {
    return <ProductPageLoading />;
  }

  // Error state
  if (error || !product) {
    return <ProductPageError error={error} onRetry={() => refetch()} />;
  }

  return (
    <div className="min-h-screen bg-[#0A071A] mt-8">
      <Navbar />

      <div className="pt-24 md:pt-28 p-4 sm:p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/marketplace"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group relative z-10"
        >
          <ArrowLeft
            size={20}
            className="group-hover:transform group-hover:-translate-x-1 transition-transform"
          />
          <span>Back to Marketplace</span>
        </Link>

        {/* Product Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <ProductImage
            image={product.thumbnail}
            title={product.title}
            type={product.type}
            rating={product.stats.rating}
            totalRatings={product.stats.reviewCount}
            studentsCount={product.soldCount}
          />

          {/* Product Info */}
          <ProductInfo
            title={product.title}
            author={product.instructor.username}
            rating={product.stats.rating}
            totalRatings={product.stats.reviewCount}
            price={product.price}
            description={product.description}
            courseAccess={{ hasAccess: false }}
            productId={product.id}
            purchaseFlow={purchaseFlow}
          />
        </div>

        {/* Course Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Course Chapters */}
          <div className="lg:col-span-2">
            <CourseChapters chapters={product.chapters} courseId={product.id} />
          </div>

          {/* Course Details */}
          <div>
            <CourseDetails
              availableQuantity={product.availableQuantity}
              accessDuration={product.accessDuration}
              metadata={product.metadata}
              soldCount={product.soldCount}
            />
          </div>
        </div>

        {/* Course Content (if user has access)
        {product.courseAccess.hasAccess && product.content && (
          <div className="mb-12">
            <CourseContentViewer
              content={product.content}
              progress={product.courseAccess.progress || 0}
              onContentSelect={(contentId) =>
                console.log("Selected content:", contentId)
              }
              onMarkComplete={(contentId) =>
                productActions.handleMarkComplete(product.id, contentId)
              }
            />
          </div>
        )} */}

        {/* Reviews and Ratings */}
        <ReviewsRatings
          productId={product.id}
          reviews={[]}
          reviewSummary={{
            averageRating: product.stats.rating,
            totalReviews: product.stats.reviewCount,
            ratingDistribution: {
              "1": 0,
              "2": 0,
              "3": 0,
              "4": 0,
              "5": 0,
            },
          }}
          userCanReview={false}
          onSubmitReview={(rating, comment) =>
            productActions.handleSubmitReview(product.id, rating, comment)
          }
          onLikeReview={productActions.handleLikeReview}
        />
      </div>
    </div>
  );
};

export default ProductDetailPage;
