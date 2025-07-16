'use client';

import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react'; // You can replace with another icon library
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';

const Navbar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle show/hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false); // scroll down
      } else {
        setIsVisible(true); // scroll up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={clsx(
        'fixed top-0 left-0 w-full z-50 transition-transform duration-300 ',
        !isVisible && '-translate-y-full'
      )}
    >
      <div
        className="flex items-center justify-between px-4 py-4 md:py-6 md:px-24 bg-[#0A071A]"
        style={{
          borderBottom: '1.2px solid',
          borderImageSource:
            'linear-gradient(90deg, #0A071A 0%, #0036F6 48%, #0A071A 100%)',
          borderImageSlice: 1,
        }}
      >
        {/* Left side: Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/landing/logo.png" // Add your logo to /public/logo.svg
            alt="Kenesis Logo"
            width={100}
            height={120}
            priority
            className='h-6 w-24 md:h-8 md:w-36'
          />
          {/* <span className="text-white font-serif font-semibold px-2 text-xl montserrat-custom">Kenesis</span> */}
        </Link>

        {/* Right side: Login button */}
        <button
          className="flex   items-center space-x-2 text-white font-medium text-sm md:text-lg px-6 py-3 rounded-full transition hover:opacity-90"
          style={{
            background:
              'linear-gradient(107.31deg, #00C9FF -30.5%, #4648FF 54.41%, #0D01F6 100%)',
          }}
        >
          <Wallet size={20} />
          <span>Login</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
