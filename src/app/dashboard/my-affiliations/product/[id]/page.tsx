"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ExtendedProduct } from "@/types/Review";
import {
  getMyAffiliations,
  getMyAffiliateCourseDetail,
} from "../../api/affiliationsApi";
import { MyAffiliateCourse, MyAffiliateCourseDetail } from "../../types";
import ProductDetailView from "@/shared/components/ProductDetailView";
import { CheckCircle } from "lucide-react";
import { useCurrentUser } from "@/features/auth/useCurrentUser";

const MyAffiliationProductDetailPage: React.FC = () => {
  const params = useParams();
  const [product, setProduct] = useState<ExtendedProduct | null>(null);
  const [course, setCourse] = useState<MyAffiliateCourse | null>(null);
  const [detail, setDetail] = useState<MyAffiliateCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: user } = useCurrentUser();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        if (params.id) {
          const raw = String(params.id);
          const isObjectId = /^[a-fA-F0-9]{24}$/.test(raw);
          let targetCourseId: string | null = isObjectId ? raw : null;

          if (!targetCourseId) {
            const list = await getMyAffiliations();
            const match =
              list.find((a) => a.courseSlug === raw || a.courseId === raw) ||
              null;
            setCourse(match || null);
            targetCourseId = match?.courseId || null;
          }

          if (targetCourseId) {
            const d = await getMyAffiliateCourseDetail(targetCourseId, {
              includeStats: true,
            });
            setDetail(d);
            const c = d.course;
            const extendedProduct: ExtendedProduct = {
              id: c.id,
              title: c.title,
              description: `Affiliate program for ${c.title}`,
              author: d.seller?.username || "",
              price: c.price,
              currency: "USD",
              rating: 0,
              reviewCount: 0,
              image: c.thumbnail,
              thumbnail: c.thumbnail,
              category: undefined,
              type: c.type === "document" ? "document" : "video",
              createdAt: d.joinedAt,
              purchasedBy: [],
              reviews: [],
              reviewSummary: {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
              },
              courseAccess: { hasAccess: false, progress: 0 },
              topics: [],
            };
            setProduct(extendedProduct);
          }
        }
      } catch (err) {
        console.error("Failed to load product:", err);
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          if (status === 404) setError("Affiliate course not found.");
          else if (status === 401 || status === 403)
            setError("You are not authorized to view this page.");
          else setError("Failed to load affiliate course. Please try again.");
        } else {
          setError("Failed to load affiliate course. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  const referralLink = useMemo(() => {
    const slug = detail?.course.slug || course?.courseSlug || "";
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "https://kenesis.com");
    const code = detail?.affiliateCode || user?.walletAddress || "";
    const origin = String(base).replace(/\/$/, "");
    const url = slug ? `${origin}/products/${slug}` : origin;
    return code ? `${url}?ref=${encodeURIComponent(code)}` : url;
  }, [
    detail?.course.slug,
    detail?.affiliateCode,
    user?.walletAddress,
    course?.courseSlug,
  ]);

  const handleCopyLink = async () => {
    if (copying || !referralLink) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(referralLink);
    } catch (err) {
      console.error("Failed to copy link:", err);
    } finally {
      setCopying(false);
    }
  };

  const handleOpenLink = () => {
    if (referralLink) window.open(referralLink, "_blank");
  };

  const getPrimaryAction = () => {
    if (!detail && !course) return undefined;
    return {
      label: "You’re in this affiliate program",
      onClick: () => {},
      loading: false,
      disabled: true,
      icon: <CheckCircle size={20} />,
      variant: "affiliate" as const,
    };
  };

  if (!product && !loading) {
    return null;
  }

  return (
    <div>
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="mt-4 rounded-md border border-red-800/40 bg-red-900/20 text-red-200 px-4 py-3">
            {error}
          </div>
        </div>
      )}
      <ProductDetailView
        product={product!}
        loading={loading}
        isAffiliate={true}
        backLink="/dashboard/my-affiliations"
        backLabel="Back to My Affiliations"
        primaryAction={getPrimaryAction()}
        affiliateStats={{
          commissionRate:
            detail?.commissionPercent ?? course?.commissionPercent,
          commissionAmount: detail
            ? detail.course.price * (detail.commissionPercent / 100)
            : undefined,
          recentAffiliateEarnings: detail?.stats?.last30d.earnings,
          recentAffiliateSales: detail?.stats?.last30d.conversions,
          lifetimeEarnings:
            detail?.stats?.lifetime.earnings ?? course?.earnings,
          lifetimeSales: detail?.stats?.lifetime.conversions ?? course?.sales,
        }}
        affiliateMeta={{
          shortDescription: product?.description,
          level: detail?.course.level,
          language: detail?.course.language,
          type: detail?.course.type,
          availableQuantity: detail?.course.availableQuantity,
          soldCount: detail?.course.soldCount,
          tokenToPayWith: detail?.course.tokenToPayWith,
          publishedAt: detail?.course.publishedAt,
          isAvailable: detail?.course.isAvailable,
          status: detail?.status,
          joinedAt: detail?.joinedAt,
          lastSaleAt: detail?.stats?.lastSaleAt ?? null,
        }}
        affiliateActions={{
          onCopyLink: handleCopyLink,
          onOpenLink: handleOpenLink,
          copying,
          link: referralLink,
        }}
      />
    </div>
  );
};

export default MyAffiliationProductDetailPage;
