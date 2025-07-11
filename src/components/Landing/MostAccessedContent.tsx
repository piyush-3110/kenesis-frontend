'use client';

import React from 'react';
import AccessedContentCard from './AccessedContentCard';

const contentTopics = [
  'Investment',
  'Digital Marketing',
  'Health and Sports',
  'Aesthetics',
  'Entrepreneurship',
  'Languages',
];

const MostAccessedContent: React.FC = () => {
  return (
    <section className="py-20 px-4 max-w-7xl mx-auto text-center">
      {/* Heading */}
     <div
  className="inline-block p-[2.07px] rounded-full mb-4"
  style={{
    backgroundImage: 'linear-gradient(270deg, #0036F6 0%, #FFFFFF 73.61%)',
  }}
>
  <h2 className="bg-black rounded-full px-6 py-2 font-poppins text-[25px] font-medium leading-[53.87px] text-white">
    Most Accessed Content
  </h2>
</div>


      {/* Subheading */}
      <p className="font-poppins text-[20px] sm:text-[16px] md:text-[24px] font-normal leading-[45.6px] text-white mb-12">
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
