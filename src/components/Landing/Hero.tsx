'use client';

import Image from 'next/image';
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="flex flex-col items-center text-center px-4 pt-28 sm:pt-32 md:pt-40 max-w-screen-xl mx-auto">
      {/* Heading */}
      
      <div className="mb-6">
        <h1 className="text-white font-poppins text-[32px] sm:text-[48px] md:text-[64px] lg:text-[90px] leading-none font-normal">
          Your upgrade starts here
        </h1>
        <h2 className="font-poppins text-[32px] sm:text-[48px] md:text-[64px] lg:text-[90px] leading-none font-normal">
          with{' '}
          <span
            className="bg-gradient-to-b from-white to-[#0036F6] bg-clip-text text-transparent"
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Your Knowledge
          </span>
        </h2>
      </div>

      {/* Subheading Text */}
      <p className="font-poppins font-normal text-[14px] sm:text-[16px] md:text-[18px] text-white leading-[140%] max-w-3xl mb-6">
        <span className="font-normal">Kenesis</span> puts you in control.{' '}
        <span className="font-normal">Create, sell,</span> and <span className="font-normal">earn</span> from your
        info products—no middlemen, just rewards. Discover topics and find the perfect product for you.
      </p>

      {/* Connect Wallet Button */}
      <button
        className="rounded-md text-white text-sm sm:text-base px-6 py-3 font-medium transition hover:opacity-90 mb-12"
        style={{
          background:
            'linear-gradient(105.96deg, #00C9FF 0%, #4648FF 65.07%, #0D01F6 100%), linear-gradient(360deg, #0C0A27 -118.58%, #0036F6 100.06%)',
        }}
      >
        Connect Wallet
      </button>

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
    </section>
  );
};

export default Hero;
