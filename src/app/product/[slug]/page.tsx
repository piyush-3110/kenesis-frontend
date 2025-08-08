"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCourse } from "@/hooks/useCourseQuery";
import { useCourseAccess } from "@/hooks/useCourseAccess";
import ReviewsRatings from "@/components/product/ReviewsRatings";
import { CourseAccessBanner } from "../components/CourseAccessStatus";
// import CourseContentViewer from "@/components/product/CourseContentViewer";
import {
  ProductImage,
  ProductInfo,
  ProductPageLoading,
  ProductPageError,
  CourseChapters,
  CourseDetails,
  useProductActions,
} from "../components";

const ProductDetailPage: React.FC = () => {
  const params = useParams();
  const slug = params.slug as string;

  // Use React Query to fetch course data
  const { data: product, isLoading: loading, error, refetch } = useCourse(slug);

  // Check if user has access to the course (only after course data is loaded)
  // This determines whether to show purchase button or "You own this course" message
  const {
    data: accessData,
    isLoading: accessLoading,
    error: accessError,
    refetchAccess,
  } = useCourseAccess(product?.id || null, !!product?.id);

  // Custom hooks for business logic
  const productActions = useProductActions(refetch);

  // Loading state - show loading if either course or access is loading
  if (loading || (product?.id && accessLoading)) {
    return <ProductPageLoading />;
  }

  // Error state
  if (error || !product) {
    return <ProductPageError error={error} onRetry={() => refetch()} />;
  }

  // Determine course access - default to false if access check failed or is still loading
  const courseAccess = {
    hasAccess: accessData?.hasAccess || false,
    // You can add progress here if available from another API
    // progress: userProgress?.progress
  };

  // User can review if they have access to the course
  const userCanReview = courseAccess.hasAccess;

  return (
    <div className="min-h-screen bg-[#0A071A] mt-8">

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

        {/* Course Access Status Banner */}
        <CourseAccessBanner
          hasAccess={courseAccess.hasAccess}
          isLoading={accessLoading}
          error={accessError}
          courseTitle={product.title}
          className="mb-8"
        />

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
            previewVideo={product.previewVideo}
          />

          {/* Product Info */}
          <ProductInfo
            title={product.title}
            author={product.instructor.username}
            rating={product.stats.rating}
            totalRatings={product.stats.reviewCount}
            price={product.price}
            description={product.description}
            courseAccess={courseAccess}
            course={product}
            accessLoading={accessLoading}
            tokenToPayWith={product.tokenToPayWith}
            onSuccess={() => {
              // Refetch both course data and access status when purchase is successful
              console.log(
                "🎉 Purchase successful, refetching course access..."
              );
              refetch(); // Refetch course data
              refetchAccess(); // Refetch access status
            }}
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
          userCanReview={userCanReview}
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
