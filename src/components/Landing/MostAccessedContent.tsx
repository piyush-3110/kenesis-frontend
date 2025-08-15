"use client";

import React from "react";
import AccessedContentCard from "./AccessedContentCard";
import { PillHeading } from "./PillHeading";

const contentTopics = [
  "Investment",
  "Digital Marketing",
  "Health and Sports",
  "Aesthetics",
  "Entrepreneurship",
  "Languages",
];

const MostAccessedContent: React.FC = () => {
  return (
    <section className="py-20 px-4 max-w-7xl mx-auto text-center">
      {/* Heading */}
      <PillHeading>Most Accessed Content</PillHeading>

      {/* Subheading */}
      <p className="font-poppins text-sm sm:text-base md:text-xl lg:text-2xl font-normal leading-relaxed md:leading-[1.35] text-white/90 mb-12 max-w-3xl mx-auto tracking-wide">
        THE WORLD&apos;S LARGEST WEB3 PLATFORM FOR DIGITAL PRODUCTS
      </p>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
        {contentTopics.map((topic, idx) => (
          <AccessedContentCard key={idx} title={topic} />
        ))}
      </div>
    </section>
  );
};

export default MostAccessedContent;
