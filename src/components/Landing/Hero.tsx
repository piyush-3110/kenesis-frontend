"use client";

import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center px-4 md:px-24 overflow-hidden">
      {/* Grid Background */}
      {/* <div className="absolute inset-0 opacity-60">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            maskImage:
              "radial-gradient(ellipse 90% 70% at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.4) 70%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 70% at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.4) 70%, transparent 100%)",
          }}
        />
      </div> */}

      {/* Glowing Blue Effect */}
      {/* <div className="">
        <div
          className="w-full h-full rounded-full blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(6,128,255,0.8) 0%, rgba(2,46,210,0.5) 40%, rgba(6,128,255,0.2) 70%, transparent 90%)",
          }}
        />
      </div> */}

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Main Content Grid - Text on Left, Image on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Heading */}
            <div className="mb-3">
              <h1
                className="text-white font-poppins font-normal"
                style={{
                  fontSize: "45.79px",
                  lineHeight: "60px",
                  letterSpacing: "-2%",
                  fontWeight: 400,
                }}
              >
                Your upgrade starts here
                <br />
                <span className="italic">with</span>{" "}
                <span
                  className="bg-gradient-to-b from-white to-[#0036F6] bg-clip-text text-transparent"
                  style={{
                    fontSize: "55.79px",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Your Knowledge
                </span>
              </h1>
            </div>

            {/* Subheading Text */}
            <p className="font-poppins font-normal text-[14px] sm:text-[16px] md:text-[20px] text-white/60 max-w-lg mb-8">
              <span className="font-bold text-white">Kenesis</span> puts you in control.{" "}
              <span className="font-bold text-white">Create, sell,</span> and{" "}
              <span className="font-bold text-white">earn</span> from your info
              products—no middlemen, just rewards. Discover topics and find the
              perfect product for you.
            </p>

            {/* Marketplace Link */}
            <div className="flex justify-center lg:justify-start w-full max-w-md">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 group"
                style={{
                  background:
                    "linear-gradient(90deg, #0680FF 0%, #022ED2 100%)",
                  boxShadow: "0 4px 20px rgba(6, 128, 255, 0.3)",
                }}
              >
                <ShoppingBag className="w-5 h-5 text-white group-hover:text-blue-200 transition-colors" />
                <span className="text-white font-medium group-hover:text-blue-200 transition-colors">
                  Marketplace
                </span>
              </Link>
            </div>
          </div>

          {/* Right Side - Girls Image */}
          <div className="flex justify-center mt-16 lg:mt-0 lg:justify-end order-first lg:order-last">
            <Image
              src="/images/landing/girls.png"
              alt="Kenesis Banner Models"
              width={650}
              height={400}
              className="w-full max-w-[500px] lg:max-w-[600px] xl:max-w-[650px] object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
