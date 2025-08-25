import AllProducts from "@/components/Landing/AllProducts";
import Banner from "@/components/Landing/Banner";
import BestSeller from "@/components/Landing/BestSeller";
import Hero from "@/components/Landing/Hero";
import InfoProductsSection from "@/components/Landing/InfoProductsSection";
import MostAccessedContent from "@/components/Landing/MostAccessedContent";
import Skills from "@/components/Landing/Skills";
import TopCreators from "@/components/Landing/TopCreators";
import React from "react";

const page = () => {
  return (
    <div className="min-h-[100vh]">
      <Hero />
      <InfoProductsSection />
      <TopCreators />
      <MostAccessedContent />
      <BestSeller />
      <AllProducts />
      <Banner
        title={{
          line1: "Discover the leading WEB3",
          boldWord1: "WEB3",
          line2: "Marketplace for your sales",
          boldWord2: "Marketplace",
        }}
        buttonText="Start Now"
        buttonLink="/marketplace"
      />
      <Skills />
    </div>
  );
};

export default page;
