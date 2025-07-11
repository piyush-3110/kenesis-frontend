'use client';

import React, { useState } from 'react';
import ProductCard from './ProductCard';

const categories = ['All', 'Investment', 'Digital Marketing', 'Sports and Health', 'Beauty'] as const;
type Category = (typeof categories)[number];

interface Product {
  title: string;
  author: string;
  price: string;
  link: string;
}

const mockProducts: Record<Category, Product[]> = {
  All: Array.from({ length: 12 }, (_, i) => ({
    title: `Mastering Web3 #${i + 1}`,
    author: 'Alex Morgan',
    price: '3.2 ETH',
    link: `/course/web3-${i + 1}`,
  })),
  Investment: Array.from({ length: 8 }, (_, i) => ({
    title: `Crypto Investment #${i + 1}`,
    author: 'Eliot Ray',
    price: '1.5 ETH',
    link: `/course/investment-${i + 1}`,
  })),
  'Digital Marketing': Array.from({ length: 6 }, (_, i) => ({
    title: `Funnel Secrets #${i + 1}`,
    author: 'Sara Moe',
    price: '2.0 TRX',
    link: `/course/marketing-${i + 1}`,
  })),
  'Sports and Health': Array.from({ length: 4 }, (_, i) => ({
    title: `Fitness & Diet #${i + 1}`,
    author: 'James Stark',
    price: '0.9 ETH',
    link: `/course/fitness-${i + 1}`,
  })),
  Beauty: Array.from({ length: 3 }, (_, i) => ({
    title: `Skin Glow #${i + 1}`,
    author: 'Ella Grace',
    price: '1.2 TRX',
    link: `/course/beauty-${i + 1}`,
  })),
};

const AllProducts: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  const productsToShow = mockProducts[selectedCategory].slice(0, 8);

  return (
    <section className="max-w-7xl mx-auto px-4 py-20 text-center">
      {/* Heading */}
      <h2 className="font-poppins text-[38px] font-semibold leading-[100%] text-white mb-10">
        All Products
      </h2>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2 rounded-full border text-white font-poppins transition-colors duration-300 ${
              selectedCategory === cat
                ? 'border-[#0680FF] bg-[#01155B]'
                : 'border-white bg-transparent hover:border-[#0680FF]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center mb-10">
        {productsToShow.map((product, index) => (
          <ProductCard
            key={`${product.title}-${index}`}
            title={product.title}
            author={product.author}
            price={product.price}
            link={product.link}
          />
        ))}
      </div>

      {/* See More Button */}
      <a
        href="/marketplace"
        className="inline-block px-6 py-2 rounded-full border border-white text-white font-poppins hover:border-[#0680FF] hover:bg-[#01155B] transition-all duration-300"
      >
        See More
      </a>
    </section>
  );
};

export default AllProducts;
