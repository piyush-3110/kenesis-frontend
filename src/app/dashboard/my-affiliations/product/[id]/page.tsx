"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ExtendedProduct } from "@/types/Review";
import { getAffiliatedProductByProductId } from "../../api/affiliationsApi";
import { AffiliatedProduct } from "../../types";
import ProductDetailView from "@/shared/components/ProductDetailView";
import { CheckCircle, ExternalLink, Copy } from "lucide-react";

const MyAffiliationProductDetailPage: React.FC = () => {
  const params = useParams();
  const [product, setProduct] = useState<ExtendedProduct | null>(null);
  const [affiliatedProduct, setAffiliatedProduct] =
    useState<AffiliatedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        if (params.id) {
          // Find the affiliated product by productId
          const affiliatedProd = await getAffiliatedProductByProductId(
            params.id as string
          );

          if (affiliatedProd) {
            setAffiliatedProduct(affiliatedProd);

            // Convert AffiliatedProduct to ExtendedProduct for the detail view
            const extendedProduct: ExtendedProduct = {
              id: affiliatedProd.productId,
              title: affiliatedProd.title,
              description:
                affiliatedProd.description ||
                `Learn ${affiliatedProd.title} with ${affiliatedProd.author}`,
              author: affiliatedProd.author,
              price: affiliatedProd.price,
              currency: "USD",
              rating: affiliatedProd.rating,
              reviewCount: affiliatedProd.reviewCount,
              image: affiliatedProd.thumbnail,
              category: affiliatedProd.category,
              type: affiliatedProd.type,
              createdAt: affiliatedProd.createdAt,
              topics: affiliatedProd.topics || [
                `Master ${affiliatedProd.category} fundamentals`,
                `Advanced ${affiliatedProd.title
                  .split(" ")[0]
                  .toLowerCase()} techniques`,
                "Industry best practices and trends",
                "Hands-on projects and exercises",
                "Professional certification preparation",
              ],
              purchasedBy: [], // Not relevant for affiliate view
              reviews: [],
              reviewSummary: {
                totalReviews: affiliatedProd.reviewCount,
                averageRating: affiliatedProd.rating,
                ratingDistribution: {
                  5: Math.floor(affiliatedProd.reviewCount * 0.6),
                  4: Math.floor(affiliatedProd.reviewCount * 0.2),
                  3: Math.floor(affiliatedProd.reviewCount * 0.1),
                  2: Math.floor(affiliatedProd.reviewCount * 0.05),
                  1: Math.floor(affiliatedProd.reviewCount * 0.05),
                },
              },
              // For affiliate view, show as if it's not purchased to display topics
              courseAccess: {
                hasAccess: false,
                progress: 0,
                purchaseDate: undefined,
              },
            };
            setProduct(extendedProduct);
          }
        }
      } catch (error) {
        console.error("Failed to load product:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  const handleCopyLink = async () => {
    if (!affiliatedProduct || copying) return;

    setCopying(true);
    try {
      await navigator.clipboard.writeText(affiliatedProduct.affiliateLink);
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy link:", error);
    } finally {
      setCopying(false);
    }
  };

  const handleOpenLink = () => {
    if (affiliatedProduct) {
      window.open(affiliatedProduct.affiliateLink, "_blank");
    }
  };

  const getPrimaryAction = () => {
    if (!affiliatedProduct) return undefined;

    return {
      label: "You already promote this product",
      onClick: () => {}, // No action needed
      loading: false,
      disabled: true,
      icon: <CheckCircle size={20} />,
      variant: "affiliate" as const,
    };
  };

  // Secondary actions are rendered below directly; helper removed to avoid unused-variable error

  if (!product && !loading) {
    return null; // Let ProductDetailView handle the not found state
  }

  return (
    <div>
      <ProductDetailView
        product={product!}
        loading={loading}
        isAffiliate={true}
        backLink="/dashboard/my-affiliations"
        backLabel="Back to My Affiliations"
        primaryAction={getPrimaryAction()}
      />

      {/* Additional affiliate info */}
      {affiliatedProduct && !loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 rounded-xl border border-gray-700/50 p-6">
            <h3 className="text-white text-lg font-semibold mb-4">
              Affiliate Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Commission Rate</p>
                <p className="text-white font-semibold">
                  {affiliatedProduct.commission}%
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Total Clicks</p>
                <p className="text-white font-semibold">
                  {affiliatedProduct.clicks.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Conversions</p>
                <p className="text-white font-semibold">
                  {affiliatedProduct.conversions}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Earnings</p>
                <p className="text-white font-semibold">
                  ${affiliatedProduct.earnings.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopyLink}
                disabled={copying}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Copy size={16} />
                {copying ? "Copying..." : "Copy Affiliate Link"}
              </button>

              <button
                onClick={handleOpenLink}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <ExternalLink size={16} />
                Open Affiliate Link
              </button>
            </div>

            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Affiliate Link:</p>
              <p className="text-gray-300 text-sm font-mono break-all">
                {affiliatedProduct.affiliateLink}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAffiliationProductDetailPage;
