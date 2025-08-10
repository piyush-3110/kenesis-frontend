"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ExtendedProduct } from "@/types/Review";
import { useToastStore } from "@/app/dashboard/affiliate-showcase/store/useToastStore";
import ProductDetailView from "@/shared/components/ProductDetailView";
import { Link2 } from "lucide-react";
import { AffiliateAPI } from "@/features/affiliate/api";
import type { AvailableCourseDetail } from "@/features/affiliate/types";
import { useJoinAffiliate } from "@/features/affiliate/hooks";
import { useCurrentUser } from "@/features/auth/useCurrentUser";

const AffiliateProductDetailPage: React.FC = () => {
  const params = useParams();
  const [product, setProduct] = useState<ExtendedProduct | null>(null);
  const [courseDetail, setCourseDetail] =
    useState<AvailableCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const { addToast } = useToastStore();
  const { data: user } = useCurrentUser();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        if (params.id) {
          const res = await AffiliateAPI.getAvailableCourse(String(params.id), {
            includeStats: true,
          });
          const data = res.data;
          if (!data.success || !data.data) {
            throw new Error(data.message || "Course not found");
          }

          const course: AvailableCourseDetail = data.data;

          // Map backend course detail to ExtendedProduct for UI reuse
          const extendedProduct: ExtendedProduct = {
            id: course.id,
            title: course.title,
            author: course.instructor?.username || "Unknown",
            price: course.price,
            currency: "USD",
            rating: course.stats?.averageRating ?? 0,
            reviewCount: course.stats?.reviewCount ?? 0,
            image: course.thumbnail,
            thumbnail: course.thumbnail,
            description: undefined,
            createdAt: new Date().toISOString(),
            category: undefined,
            type: "video",
            isPurchased: false,
            purchasedBy: [],
            reviews: [],
            reviewSummary: {
              averageRating: course.stats?.averageRating ?? 0,
              totalReviews: course.stats?.reviewCount ?? 0,
              ratingDistribution: {
                5: Math.floor((course.stats?.reviewCount ?? 0) * 0.6),
                4: Math.floor((course.stats?.reviewCount ?? 0) * 0.2),
                3: Math.floor((course.stats?.reviewCount ?? 0) * 0.1),
                2: Math.floor((course.stats?.reviewCount ?? 0) * 0.05),
                1: Math.floor((course.stats?.reviewCount ?? 0) * 0.05),
              },
            },
            courseAccess: { hasAccess: false },
          };

          setCourseDetail(course);
          setProduct(extendedProduct);
          // stats and commission preview passed separately via props below
        }
      } catch (error) {
        console.error("Failed to load product:", error);
        addToast({
          title: "Error",
          message: "Failed to load product details",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id, addToast]);

  const joinMutation = useJoinAffiliate(String(params.id || ""));

  const handleJoinAffiliate = async () => {
    if (!product || joining) return;
    setJoining(true);
    try {
      if (!user?.walletAddress) {
        addToast({
          title: "Wallet Required",
          message:
            "Connect your wallet in Settings to join affiliate programs.",
          type: "error",
        });
        return;
      }

      const res = await joinMutation.mutateAsync();
      addToast({
        title: res.message.includes("rejoined")
          ? "Rejoined Program"
          : "Joined Program",
        message: `You can now promote "${product.title}" and earn commissions.`,
        type: "success",
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      addToast({
        title: "Join Failed",
        message: err?.message || "Please try again.",
        type: "error",
      });
    } finally {
      setJoining(false);
    }
  };

  const getPrimaryAction = () => {
    if (!product) return undefined;

    return {
      label:
        joining || joinMutation.isPending
          ? "Joining..."
          : "Join Affiliate Program",
      onClick: handleJoinAffiliate,
      loading: joining || joinMutation.isPending,
      disabled: joining || joinMutation.isPending,
      icon: <Link2 size={20} />, // Use a better icon later (Handshake)
      variant: "affiliate" as const,
    };
  };

  if (!product && !loading) {
    return null; // Let ProductDetailView handle the not found state
  }

  return (
    <ProductDetailView
      product={product!}
      loading={loading}
      isAffiliate={true}
      backLink="/dashboard/affiliate-showcase"
      backLabel="Back to Affiliate Showcase"
      affiliateStats={
        courseDetail
          ? {
              commissionRate: courseDetail.commissionPreview?.commissionRate,
              commissionAmount:
                courseDetail.commissionPreview?.commissionAmount,
              activeAffiliates: courseDetail.stats?.activeAffiliates,
              recentAffiliateSales: courseDetail.stats?.recentAffiliateSales,
              recentAffiliateEarnings:
                courseDetail.stats?.recentAffiliateEarnings,
            }
          : undefined
      }
      affiliateMeta={
        courseDetail
          ? {
              shortDescription: courseDetail.shortDescription,
              level: courseDetail.level,
              language: courseDetail.language,
              type: courseDetail.type,
              totalDuration: courseDetail.totalDuration,
              totalPages: courseDetail.totalPages,
              availableQuantity: courseDetail.availableQuantity,
              soldCount: courseDetail.soldCount,
              tokenToPayWith: courseDetail.tokenToPayWith,
              publishedAt: courseDetail.publishedAt,
              isAvailable: courseDetail.isAvailable,
            }
          : undefined
      }
      primaryAction={getPrimaryAction()}
    />
  );
};

export default AffiliateProductDetailPage;
