"use client";
import React from "react";
import clsx from "clsx";

interface PillHeadingProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  gradientClassName?: string; // optional override
}

/**
 * Responsive gradient pill heading that scales typography and padding.
 * - Mobile: tighter padding, smaller font, single or wrapped lines
 * - Larger: larger font + spacing
 */
export function PillHeading({
  children,
  className,
  as: Tag = "h2",
  gradientClassName,
}: PillHeadingProps) {
  return (
    <div
      className={clsx(
        "inline-block rounded-full p-[2px] mb-4 max-w-full",
        gradientClassName ||
          "bg-[linear-gradient(270deg,#0036F6_0%,#FFFFFF_73.61%)]",
        className
      )}
    >
      <Tag
        className={clsx(
          "bg-black rounded-full text-white font-poppins font-medium",
          // Responsive interior spacing
          "px-4 py-2 text-base leading-snug",
          "sm:px-6 sm:py-2.5 sm:text-lg",
          "md:px-8 md:py-3 md:text-2xl md:leading-tight",
          "lg:px-10 lg:py-4 lg:text-[32px] lg:leading-[1.15]",
          "whitespace-pre-wrap break-words text-center"
        )}
      >
        {children}
      </Tag>
    </div>
  );
}

export default PillHeading;
