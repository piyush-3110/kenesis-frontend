"use client";

import { SiweAuthButton } from "@/features/wallet/SiweAuthButton";
import { Search } from "lucide-react";
import Image from "next/image";
import React from "react";

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 md:px-24 overflow-hidden">
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
              "radial-gradient(ellipse 90% 70% at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.4) 70%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 70% at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.4) 70%, transparent 100%)",
          }}
        />
      </div>

      {/* Glowing Blue Effect */}
      <div className="">
        <div
          className="w-full h-full rounded-full blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(6,128,255,0.8) 0%, rgba(2,46,210,0.5) 40%, rgba(6,128,255,0.2) 70%, transparent 90%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Main Content Grid - Text on Left, Image on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Side - Text Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Heading */}
            <div className="mb-6">
              <h1 
                className="text-white font-poppins font-normal"
                style={{
                  fontSize: "45.79px",
                  lineHeight: "75px",
                  letterSpacing: "-2%",
                  fontWeight: 400,
                }}
              >
                Your upgrade starts here<br />
                with{" "}
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
            <p className="font-poppins font-normal text-[14px] sm:text-[16px] md:text-[18px] text-white max-w-lg mb-8">
              <span className="font-normal">Kenesis</span> puts you in control.{" "}
              <span className="font-normal">Create, sell,</span> and{" "}
              <span className="font-normal">earn</span> from your info products—no
              middlemen, just rewards. Discover topics and find the perfect product
              for you.
            </p>

            {/* Search Bar */}
            <div className="flex justify-center lg:justify-start w-full max-w-md">
              <div className="relative w-full">
                <div 
                  className="relative rounded-lg p-[1px]"
                  style={{
                    background: "linear-gradient(90deg, #0680FF 0%, #022ED2 100%)",
                  }}
                >
                  <div className="relative flex items-center bg-black rounded-lg">
                    <Search className="absolute left-4 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-full py-3 pl-12 pr-4 bg-black text-white placeholder-gray-400 rounded-lg border-none outline-none focus:ring-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Girls Image */}
          <div className="flex justify-center lg:justify-end order-first lg:order-last">
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
