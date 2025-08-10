"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ExtendedProduct } from "@/types/Review";
import { getNonAffiliatedProducts } from "@/app/dashboard/affiliate-showcase/api/affiliateApi";
import { useToastStore } from "@/app/dashboard/affiliate-showcase/store/useToastStore";
import { AffiliateProduct } from "@/app/dashboard/affiliate-showcase/types";
import ProductDetailView from "@/shared/components/ProductDetailView";
import { Link2 } from "lucide-react";

const AffiliateProductDetailPage: React.FC = () => {
  const params = useParams();
  const [product, setProduct] = useState<ExtendedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        if (params.id) {
          const response = await getNonAffiliatedProducts();
          const foundProduct = response.data.find(
            (p: AffiliateProduct) => p.id === params.id
          );

          if (foundProduct) {
            // Convert AffiliateProduct to ExtendedProduct for the detail view
            const extendedProduct: ExtendedProduct = {
              ...foundProduct,
              currency: "USD",
              createdAt: new Date().toISOString(),
              description:
                foundProduct.description ||
                `Learn ${foundProduct.title} with ${foundProduct.author}`,
              // reviewCount is already on the base product; no separate totalRatings in ExtendedProduct
              purchasedBy: [], // Not relevant for affiliate view
              reviews: [],
              reviewSummary: {
                totalReviews: foundProduct.reviewCount,
                averageRating: foundProduct.rating,
                ratingDistribution: {
                  5: Math.floor(foundProduct.reviewCount * 0.6),
                  4: Math.floor(foundProduct.reviewCount * 0.2),
                  3: Math.floor(foundProduct.reviewCount * 0.1),
                  2: Math.floor(foundProduct.reviewCount * 0.05),
                  1: Math.floor(foundProduct.reviewCount * 0.05),
                },
              },
              // For affiliate view, show as if it's not purchased to display topics
              courseAccess: {
                hasAccess: false,
                progress: 0,
                purchaseDate: undefined,
              },
              // Add mock topics for affiliate products
              topics: [
                `Master ${foundProduct.category} fundamentals`,
                `Advanced ${foundProduct.title
                  .split(" ")[0]
                  .toLowerCase()} techniques`,
                "Industry best practices and trends",
                "Hands-on projects and exercises",
                "Professional certification preparation",
              ],
              image: foundProduct.thumbnail,
            };
            setProduct(extendedProduct);
          }
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

  const handleGenerateReferralLink = async () => {
    if (!product || generating) return;

    setGenerating(true);
    try {
      // Simulate API call to generate referral link
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const referralLink = `https://kenesis.com/ref/${product.id}?affiliate=user123`;

      // Copy to clipboard
      await navigator.clipboard.writeText(referralLink);

      addToast({
        title: "Success",
        message: "Referral link copied to clipboard!",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to generate referral link:", error);
      addToast({
        title: "Error",
        message: "Failed to generate referral link",
        type: "error",
      });
    } finally {
      setGenerating(false);
    }
  };

  const getPrimaryAction = () => {
    if (!product) return undefined;

    return {
      label: generating ? "Generating..." : "Generate Referral Link",
      onClick: handleGenerateReferralLink,
      loading: generating,
      disabled: generating,
      icon: <Link2 size={20} />,
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
      primaryAction={getPrimaryAction()}
    />
  );
};

export default AffiliateProductDetailPage;
