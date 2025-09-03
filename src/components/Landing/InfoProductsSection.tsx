"use client";

import React from "react";

/*
  InfoProductsSection
  Matches provided design: single centered two‑line statement on a dark grid background.
  Text (line break at mid phrase):
    Infoproducts, rewards, and freedom
    all in one ecosystem with Kenesis
*/
const InfoProductsSection: React.FC = () => {
  return (
    <section className="relative px-4 md:px-12 lg:px-20 py-20 md:py-28">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px,transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.08) 1px,transparent 1px)`,
          backgroundSize: "70px 70px",
          maskImage:
            "radial-gradient(circle at center, rgba(255,255,255,0.8), transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, rgba(255,255,255,0.8), transparent 75%)",
        }}
      />

      {/* Mild radial glow center */}
      <div className="absolute top-50 inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-[700px] rounded-full bg-[radial-gradient(circle,rgba(34,74,255,0.35)_0%,rgba(7,6,21,0)_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <h2 className="font-poppins font-medium text-white leading-tight tracking-tight text-[26px] sm:text-[34px] md:text-[44px] lg:text-[54px]">
          <span className="block italic font-semibold">
            Infoproducts, rewards, and{" "}
            <span className="not-italic font-semibold">freedom</span>
          </span>
          <span className="block mt-2 italic font-semibold">
            all in{" "}
            <span className="not-italic">one ecosystem with Kenesis</span>
          </span>
        </h2>
      </div>
    </section>
  );
};

export default InfoProductsSection;
