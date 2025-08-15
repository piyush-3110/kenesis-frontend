"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "./ProductCard";
import Link from "next/link";
import { fetchProducts } from "@/lib/marketplaceApi";
import { CourseForMarketplacePage } from "@/types/Product";

interface LandingProductCardProps {
  id: string;
  title: string;
  author: string;
  price: string;
  link: string;
  thumbnail: string;
}

// Placeholder products to ensure we always show 8 products
const createPlaceholderProducts = (
  count: number
): LandingProductCardProps[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `placeholder-${i}`,
    title: `Course ${i + 1}`,
    author: "Coming Soon",
    price: "$0",
    link: "/marketplace",
    thumbnail: "/images/landing/product.png",
  }));
};

const AllProducts: React.FC = () => {
  // Fetch products from the backend API
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["landing-products"],
    queryFn: () => fetchProducts({}, 1, 20), // Fetch more than 8 to have variety
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Transform backend products to landing card format and ensure 8 products
  const productsToShow = useMemo((): LandingProductCardProps[] => {
    const backendProducts = productsData?.data || [];

    // Map backend products to landing card format
    const mappedProducts: LandingProductCardProps[] = backendProducts.map(
      (product: CourseForMarketplacePage) => ({
        id: product.id,
        title: product.title,
        author: product.instructor.username,
        price: `$${product.price}`,
        link: `/product/${product.slug}`,
        thumbnail: product.thumbnail,
      })
    );

    // Ensure we have exactly 8 products
    if (mappedProducts.length >= 8) {
      return mappedProducts.slice(0, 8);
    } else {
      const placeholdersNeeded = 8 - mappedProducts.length;
      return [
        ...mappedProducts,
        ...createPlaceholderProducts(placeholdersNeeded),
      ];
    }
  }, [productsData]);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-20 py-20 text-center">
      {/* Heading */}
      <h2 className="font-poppins text-[38px] font-semibold leading-[100%] text-white mb-10">
        All Products
      </h2>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-10">
          <p className="text-red-400 mb-4">Failed to load products</p>
          <p className="text-gray-400 text-sm">Showing placeholder content</p>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center mb-10">
          {productsToShow.map((product, index) => (
            <ProductCard
              key={`${product.id}-${index}`}
              title={product.title}
              author={product.author}
              price={product.price}
              link={product.link}
              image={product.thumbnail}
            />
          ))}
        </div>
      )}

      {/* See More Button */}
      <Link
        href="/marketplace"
        className="inline-block px-6 py-2 rounded-full border border-white text-white font-poppins hover:border-[#0680FF] hover:bg-[#01155B] transition-all duration-300"
      >
        See More
      </Link>
    </section>
  );
};

export default AllProducts;
