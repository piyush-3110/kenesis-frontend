"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Package, Eye, EyeOff, Grid3X3 } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { useMyProductsStore } from "./store/useMyProductsStore";
import ProductCard from "@/shared/components/ProductCard";
import GradientBox from "@/shared/components/GradientBox";

/**
 * MyProductsPage Component
 * Main My Products page within the dashboard
 * Shows product listing with filters, search, and management options
 * Design adapted from profile page's "My Courses" section
 */
const MyProductsPage: React.FC = () => {
  const {
    products,
    stats,
    loading,
    error,
    searchQuery,
    statusFilter,
    typeFilter,
    categoryFilter,
    loadProducts,
    loadStats,
    setSearchQuery,
    setStatusFilter,
    setTypeFilter,
    setCategoryFilter,
    resetFilters,
    resetError,
  } = useMyProductsStore();

  // Load initial data
  useEffect(() => {
    loadProducts();
    loadStats();
  }, [loadProducts, loadStats]);

  // Filter products based on current filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && product.status === "published") ||
      (statusFilter === "draft" && (product.status === "draft" || product.status === "rejected")) ||
      (statusFilter === "submitted" && product.status === "submitted");

    const matchesType = typeFilter === "all" || product.type === typeFilter;

    const matchesCategory =
      !categoryFilter || product.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesType && matchesCategory;
  });

  // Get unique categories for filter dropdown
  const categories = Array.from(
    new Set(products.map((product) => product.category))
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading products...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="My Products"
      subtitle="Manage your created courses and educational content"
    >
      <div className="p-4 sm:p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <GradientBox className="border-red-500/50">
            <div className="p-4 text-red-400 text-center">
              <p className="break-words">{error}</p>
              <button
                onClick={resetError}
                className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors"
              >
                Dismiss
              </button>
            </div>
          </GradientBox>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <GradientBox>
              <div className="p-4 text-center min-h-[120px] flex flex-col justify-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-lg bg-blue-500/20">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white truncate">
                  {stats.totalProducts}
                </p>
                <p className="text-sm text-gray-400 truncate">Total Products</p>
              </div>
            </GradientBox>

            <GradientBox>
              <div className="p-4 text-center min-h-[120px] flex flex-col justify-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-lg bg-green-500/20">
                  <Eye className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white truncate">
                  {stats.publishedProducts}
                </p>
                <p className="text-sm text-gray-400 truncate">Published</p>
              </div>
            </GradientBox>

            <GradientBox>
              <div className="p-4 text-center min-h-[120px] flex flex-col justify-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-lg bg-yellow-500/20">
                  <EyeOff className="w-6 h-6 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-white truncate">
                  {stats.draftProducts}
                </p>
                <p className="text-sm text-gray-400 truncate">Drafts</p>
              </div>
            </GradientBox>

            <GradientBox>
              <div className="p-4 text-center min-h-[120px] flex flex-col justify-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-lg bg-orange-500/20">
                  <Search className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-2xl font-bold text-white truncate">
                  {stats.submittedProducts}
                </p>
                <p className="text-sm text-gray-400 truncate">Submitted</p>
              </div>
            </GradientBox>

            <GradientBox>
              <div className="p-4 text-center min-h-[120px] flex flex-col justify-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-lg bg-purple-500/20">
                  <Grid3X3 className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white truncate">
                  {stats.totalStudents.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400 truncate">Total Students</p>
              </div>
            </GradientBox>
          </div>
        )}

        {/* Products Section */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-white text-xl font-semibold mb-2">
                My Products
              </h2>
              <p className="text-gray-400 text-sm">
                Manage your published and draft courses
              </p>
            </div>

            {/* Product Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative min-w-0">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors w-full sm:w-[200px]"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | "published" | "draft" | "submitted"
                  )
                }
                className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors min-w-0 max-w-[120px] truncate"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as "all" | "video" | "document")
                }
                className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors min-w-0 max-w-[120px] truncate"
              >
                <option value="all">All Types</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors min-w-0 max-w-[120px] truncate"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category} title={category}>
                    {category.length > 15 ? `${category.substring(0, 15)}...` : category}
                  </option>
                ))}
              </select>

              {/* Reset Filters */}
              <button
                onClick={resetFilters}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-colors text-sm whitespace-nowrap"
              >
                Reset
              </button>

              {/* Add Product */}
              <Link
                href="/dashboard/products"
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-medium transition-colors whitespace-nowrap"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">New Product</span>
                <span className="sm:hidden">New</span>
              </Link>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <GradientBox>
              <div className="text-center py-12 px-4">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                {searchQuery ||
                statusFilter !== "all" ||
                typeFilter !== "all" ||
                categoryFilter ? (
                  <>
                    <p className="text-gray-400 text-lg mb-2 break-words">
                      No products found
                    </p>
                    <p className="text-gray-500 text-sm mb-6 break-words max-w-md mx-auto">
                      Try adjusting your filters or search query
                    </p>
                    <button
                      onClick={resetFilters}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-medium transition-colors"
                    >
                      Clear Filters
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-400 text-lg mb-2 break-words">
                      No products yet
                    </p>
                    <p className="text-gray-500 text-sm mb-6 break-words max-w-md mx-auto">
                      Create your first product to start teaching and selling
                    </p>
                    <Link
                      href="/dashboard/products"
                      className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
                    >
                      Create Your First Product
                    </Link>
                  </>
                )}
              </div>
            </GradientBox>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default MyProductsPage;
