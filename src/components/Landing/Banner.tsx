import React from 'react';
import Link from 'next/link';

interface BannerProps {
  title: {
    line1: string;
    boldWord1?: string;
    line2: string;
    boldWord2?: string;
  };
  buttonText: string;
  buttonLink: string;
}

const Banner: React.FC<BannerProps> = ({ title, buttonText, buttonLink }) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-50">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.2) 80%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.2) 80%, transparent 100%)'
          }}
        />
      </div>

      {/* Glowing Blue Blob */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/6 w-screen h-[800px] pointer-events-none">
        <div 
          className="w-full h-full rounded-full blur-3xl opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(6,128,255,1) 0%, rgba(2,46,210,0.7) 30%, rgba(6,128,255,0.3) 60%, transparent 80%)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0.2) 90%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0.2) 90%, transparent 100%)'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center  mx-auto">
        <h1 className="font-poppins text-white mb-8">
          <div className="text-[25px] md:text-[64px] lg:text-[64px] font-semibold leading-tight mb-2">
            {title.boldWord1 ? (
              <>
                {title.line1.replace(title.boldWord1, '').trim()}{' '}
                <span className="font-bold">{title.boldWord1}</span>
              </>
            ) : (
              title.line1
            )}
          </div>
          <div className="text-[25px] md:text-[64px] lg:text-[64px] font-semibold leading-tight">
            {title.boldWord2 ? (
              <>
                <span className="font-bold">{title.boldWord2}{" "}</span>
                {title.line2.replace(title.boldWord2, '').trim()}
              </>
            ) : (
              title.line2
            )}
          </div>
        </h1>

        <Link 
          href={buttonLink}
          className="inline-block bg-white hover:bg-gray-100 text-black font-poppins font-semibold text-lg px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          {buttonText}
        </Link>
      </div>
    </section>
  );
};

export default Banner;
