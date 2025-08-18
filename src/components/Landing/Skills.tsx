import React from "react";
import { PillHeading } from "./PillHeading";
import Image from "next/image";
import Link from "next/link";

const skillsData = [
  {
    icon: "/images/landing/icon0.png",
    title: "Find the best contents",
    subtitle:
      "We make a varied selection so you can find what you are looking for.",
  },
  {
    icon: "/images/landing/icon1.png",
    title: "Pay with Crypto, Rule the Game",
    subtitle: "Fast, secure, borderless transactions your way.",
  },
  {
    icon: "/images/landing/icon2.png",
    title: "You are protected",
    subtitle: "Not what you expected? Your crypto stays safe — easy refund.",
  },
  {
    icon: "/images/landing/icon3.png",
    title: "Verify Courses",
    subtitle: "Only verified courses will be listed marketplace",
  },
];

const sellCardsData = [
  {
    icon: "/images/landing/icon11.png",
    title: "Choose the best format for the your product",
    subtitle:
      "Share your content in courses online, e-books, podcasts, communities and much more!",
  },
  {
    icon: "/images/landing/icon12.png",
    title: "Reach your audience",
    subtitle:
      "Count on thousands of people promoting your product in exchange for commissions!",
  },
  {
    icon: "/images/landing/icon13.png",
    title: "Increase your sales",
    subtitle:
      "Access reports, track your numbers and improve your strategies to sell more and more!",
  },
];

const Skills = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-16 py-20 text-center">
      {/* Header */}
      <PillHeading>Develop a new skill wherever you are</PillHeading>

      {/* Subheading */}
      <p className="text-white/90 text-sm sm:text-base md:text-lg font-poppins mb-12 max-w-2xl mx-auto leading-relaxed">
        Explore our safe and resourceful environment.
      </p>

      {/* Skills Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {skillsData.map((skill, index) => (
          <div
            key={index}
            className="relative p-[1px] rounded-lg transition-all duration-300 group"
            style={{
              background: "linear-gradient(270deg, #0036F6 0%, #FFFFFF 73.61%)",
            }}
          >
            <div className="bg-[#000526] py-12 rounded-lg p-6 transition-all duration-300 group-hover:bg-[#0147F6] h-full">
              {/* Icons with dotted line */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 flex items-center justify-center">
                  <Image
                    src={skill.icon}
                    alt="skill icon"
                    width={100}
                    height={100}
                    className="object-contain w-48 h-48"
                  />
                </div>

                {/* Dotted line */}
                <div className="mx-4 w-5 border-t-2 border-dotted border-white"></div>

                <div className="w-12 h-12 flex items-center justify-center">
                  <Image
                    src="/images/landing/correct.png"
                    alt="correct icon"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="text-center">
                <h3
                  className="text-white font-inter font-bold text-[18px] leading-[18px] mb-2"
                  style={{ fontWeight: 700 }}
                >
                  {skill.title}
                </h3>
                <p
                  className="text-white font-inter font-normal text-[13px] leading-[15px]"
                  style={{ fontWeight: 400 }}
                >
                  {skill.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* All Products Button */}
      <Link
        href="/marketplace"
        className="inline-block bg-white hover:bg-gray-100 text-black font-poppins font-semibold text-lg px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
      >
        All Products {"->"}
      </Link>

      {/* Sell Section */}
      <div className="mt-20 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Text Section */}
        <div className="lg:col-span-1 text-center lg:text-left">
          <h3
            className="text-white font-inter font-bold text-[20px] leading-[18px] mb-6"
            style={{ fontWeight: 700 }}
          >
            Your Knowledge has value
          </h3>
          <p
            className="text-white font-inter font-normal text-[16px] leading-[25px] mb-6"
            style={{ fontWeight: 400 }}
          >
            Turn what you know into a digital product and sell it to millions of
            people around the world.
          </p>
          <Link
            href="/dashboard/products"
            className="inline-block bg-white hover:bg-gray-100 text-black font-poppins font-semibold text-lg px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            I want to sell
          </Link>
        </div>

        {/* Cards Section */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {sellCardsData.map((card, index) => (
            <div
              key={index}
              className="relative p-[1px]  rounded-lg transition-all duration-300 group"
              style={{
                background:
                  "linear-gradient(270deg, #0036F6 0%, #FFFFFF 73.61%)",
              }}
            >
              <div className="bg-[#000526] rounded-lg p-8 transition-all duration-300 group-hover:bg-[#0147F6] h-full">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 flex items-center justify-center">
                    <Image
                      src={card.icon}
                      alt="sell feature icon"
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Text Content - Left Aligned */}
                <div className="text-left">
                  <h3
                    className="text-white font-inter font-bold text-[18px] leading-[18px] mb-2"
                    style={{ fontWeight: 700 }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-white font-inter font-normal text-[13px] leading-[15px]"
                    style={{ fontWeight: 400 }}
                  >
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
