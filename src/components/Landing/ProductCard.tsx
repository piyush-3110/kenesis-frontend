"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ProductCardProps {
  title: string;
  author: string;
  price: string;
  link: string;
  image: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  author,
  price,
  link,
  image,
}) => {
  return (
    <Link href={link} className="block w-full max-w-xs">
      <div
        className="w-full rounded-2xl border border-gray-700 hover:shadow-[0_0_15px_rgba(6,128,255,0.3)] overflow-hidden cursor-pointer"
        style={{
          background:
            "linear-gradient(155.14deg, rgba(0, 0, 0, 0) -2.13%, rgba(255, 255, 255, 0.15) 136.58%)",
        }}
      >
        <div className="overflow-hidden rounded-md transition-all duration-300 hover:scale-105 p-4">
          <Image
            src={image}
            alt="product"
            width={300}
            height={180}
            className="w-full aspect-square rounded-lg object-cover"
          />
        </div>

        <div className="p-6 flex justify-between items-start">
          <div className="flex flex-col items-start  ">
            <h3 className="text-white font-poppins font-semibold text-[17.54px] leading-tight mb-1 truncate w-full">
              {title.length > 15 ? `${title.substring(0, 10)}...` : title}
            </h3>
            <p className="text-white font-poppins font-medium text-[10.36px]">
              {author}
            </p>
          </div>
          <p className="text-white font-poppins font-semibold text-[17.54px] flex-shrink-0">
            {price}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
