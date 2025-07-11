import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const skillsData = [
  {
    icon: '/images/landing/icon0.png',
    title: 'Web Development',
    subtitle: 'Learn modern web technologies'
  },
  {
    icon: '/images/landing/icon1.png',
    title: 'Mobile Apps',
    subtitle: 'Build native and cross-platform apps'
  },
  {
    icon: '/images/landing/icon2.png',
    title: 'Data Science',
    subtitle: 'Analyze data and build ML models'
  },
  {
    icon: '/images/landing/icon3.png',
    title: 'UI/UX Design',
    subtitle: 'Create beautiful user experiences'
  }
];

const Skills = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20 text-center">
      {/* Header */}
      <div
  className="inline-block p-[2.07px] rounded-full mb-4"
  style={{
    backgroundImage: 'linear-gradient(270deg, #0036F6 0%, #FFFFFF 73.61%)',
  }}
>
  <h2 className="bg-black rounded-full px-6 py-2 font-poppins text-[25px] font-medium leading-[53.87px] text-white">
   Develop a new skill wherever you are
  </h2>
</div>
      
      {/* Subheading */}
      <p className="text-white text-lg font-poppins mb-12">
        Explore our safe and resourceful environment.
      </p>

      {/* Skills Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {skillsData.map((skill, index) => (
          <div
            key={index}
            className="relative p-[1px] rounded-lg transition-all duration-300 group"
            style={{
              background: 'linear-gradient(270deg, #0036F6 0%, #FFFFFF 73.61%)',
            }}
          >
            <div className="bg-[#000526] rounded-lg p-6 transition-all duration-300 group-hover:bg-[#0147F6] h-full">
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
                <div className="mx-4 w-8 border-t-2 border-dotted border-white"></div>
                
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
                  className="text-white font-inter font-bold text-[15px] leading-[18px] mb-2"
                  style={{ fontWeight: 700 }}
                >
                  {skill.title}
                </h3>
                <p 
                  className="text-white font-inter font-normal text-[11px] leading-[15px]"
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
        href="/all-products"
        className="inline-block bg-white hover:bg-gray-100 text-black font-poppins font-semibold text-lg px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
      >
        All Products {"->"}
      </Link>
    </section>
  );
};

export default Skills;
