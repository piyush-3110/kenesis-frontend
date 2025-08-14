"use client";

import React from "react";

const InfoProductsSection: React.FC = () => {
  return (
    <section className="relative py-16 md:py-24 px-4 md:px-24 overflow-hidden bg-gradient-to-b from-[#0A071A] to-[#1A0D2E]">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        {/* Main Heading */}
        <div className="mb-8">
          <h2 className="text-white font-poppins text-[28px] sm:text-[36px] md:text-[48px] lg:text-[64px] leading-tight font-normal mb-4">
            <span className="text-white">Infoproducts, rewards,</span>{" "}
            <span className="text-white">and</span>{" "}
            <span
              className="bg-gradient-to-b from-white to-[#0036F6] bg-clip-text text-transparent font-bold"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              freedom
            </span>
          </h2>
          <h3 className="text-white font-poppins text-[28px] sm:text-[36px] md:text-[48px] lg:text-[64px] leading-tight font-normal">
            <span
              className="bg-gradient-to-b from-white to-[#0036F6] bg-clip-text text-transparent font-bold"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              all
            </span>{" "}
            <span className="text-white">in</span>{" "}
            <span
              className="bg-gradient-to-r from-[#00C9FF] to-[#4648FF] bg-clip-text text-transparent font-bold"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              one ecosystem
            </span>{" "}
            <span className="text-white">with</span>{" "}
            <span
              className="bg-gradient-to-r from-[#00C9FF] to-[#4648FF] bg-clip-text text-transparent font-bold"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Kenesis
            </span>
          </h3>
        </div>

        {/* Glowing Effects */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none">
          <div
            className="w-full h-full rounded-full blur-3xl opacity-30"
            style={{
              background:
                "radial-gradient(circle, rgba(6,128,255,0.6) 0%, rgba(70,72,255,0.4) 40%, rgba(0,54,246,0.2) 70%, transparent 90%)",
            }}
          />
        </div>

        {/* Secondary Glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[300px] pointer-events-none">
          <div
            className="w-full h-full rounded-full blur-3xl opacity-20"
            style={{
              background:
                "radial-gradient(circle, rgba(0,201,255,0.5) 0%, rgba(70,72,255,0.3) 60%, transparent 90%)",
            }}
          />
        </div>

        {/* Bottom left accent */}
        <div className="absolute bottom-0 left-0 w-[400px] h-[200px] pointer-events-none">
          <div
            className="w-full h-full rounded-full blur-3xl opacity-15"
            style={{
              background:
                "radial-gradient(circle, rgba(0,54,246,0.4) 0%, rgba(26,13,46,0.2) 70%, transparent 90%)",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default InfoProductsSection;
