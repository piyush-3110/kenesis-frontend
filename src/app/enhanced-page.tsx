import AllProducts from "@/components/Landing/AllProducts";
import Banner from "@/components/Landing/Banner";
import BestSeller from "@/components/Landing/BestSeller";
import EnhancedHero from "@/components/Landing/EnhancedHero";
import MostAccessedContent from "@/components/Landing/MostAccessedContent";
import Skills from "@/components/Landing/Skills";
import TopCreators from "@/components/Landing/TopCreators";
import React from "react";

const EnhancedLandingPage = () => {
  return (
    <div className="min-h-[100vh]">
      <EnhancedHero />
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
        buttonLink="/get-started"
      />
      <Skills />

      <Banner
        title={{
          line1: "Infoproducts, rewards, and freedom",
          boldWord1: "freedom",
          line2: "all in one ecosystem with Kenesis",
          boldWord2: "all",
        }}
        buttonText="Start Now"
        buttonLink="/get-started"
      />
    </div>
  );
};

export default EnhancedLandingPage;
