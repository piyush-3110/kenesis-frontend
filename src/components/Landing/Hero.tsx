"use client";

import Image from "next/image";
import { EnhancedWalletConnectButton } from "@/components/wallet/EnhancedWalletConnectButton";
import React from "react";

const Hero: React.FC = () => {
  return (
    <section className="relative flex flex-col items-center text-center px-4 pt-28 sm:pt-40 md:pt-40 max-w-screen-xl mx-auto overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-60">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.2) 80%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.2) 80%, transparent 100%)",
          }}
        />
      </div>

      {/* Glowing Blue Effect */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4 w-[1000px] h-[600px] pointer-events-none">
        <div
          className="w-full h-full rounded-full blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(6,128,255,0.8) 0%, rgba(2,46,210,0.5) 40%, rgba(6,128,255,0.2) 70%, transparent 90%)",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.3) 80%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.3) 80%, transparent 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Heading */}

        <div className="mb-6">
          <h1 className="text-white font-poppins text-[32px] sm:text-[48px] md:text-[64px] lg:text-[90px] leading-none font-normal">
            Your upgrade starts here
          </h1>
          <h2 className="font-poppins text-[32px] sm:text-[48px] md:text-[64px] lg:text-[90px] leading-none font-normal">
            with{" "}
            <span
              className="bg-gradient-to-b from-white to-[#0036F6] bg-clip-text text-transparent"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Your Knowledge
            </span>
          </h2>
        </div>

        {/* Subheading Text */}
        <p className="font-poppins font-normal mx-auto text-[14px] sm:text-[16px] md:text-[18px] text-white  max-w-3xl text-center mb-6">
          <span className="font-normal">Kenesis</span> puts you in control.{" "}
          <span className="font-normal">Create, sell,</span> and{" "}
          <span className="font-normal">earn</span> from your info products—no
          middlemen, just rewards. Discover topics and find the perfect product
          for you.
        </p>

        {/* Connect Wallet Button (enhanced, unified auth flow) */}
        <div className="mb-12 flex justify-center items-center">
          <EnhancedWalletConnectButton variant="default" />
        </div>

        {/* Girls Image */}
        <div className="w-full flex justify-center px-4">
          <Image
            src="/images/landing/girls.png"
            alt="Kenesis Banner Models"
            width={650}
            height={400}
            className="w-full  max-w-[650px] object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
