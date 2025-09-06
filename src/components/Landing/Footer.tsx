'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LiaApple } from "react-icons/lia";
import { IoLogoGooglePlaystore } from "react-icons/io5";
import { FaXTwitter, FaInstagram, FaLinkedin, FaTelegram, FaThreads } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="relative w-full bg-gradient-to-b from-[#000526] to-[#000315] border-t border-[#022ED2] py-16 px-8 mt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000526] to-[#000315] opacity-90"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-8">
          
          {/* Left Section - Logo and Description */}
          <div className="flex flex-col items-start gap-6 max-w-md">
            {/* Logo - Same as navbar */}
            <div>
              <Image
                src="/images/landing/logo.png"
                alt="Kenesis Logo"
                width={100}
                height={120}
                priority
                className="h-8 w-36"
              />
            </div>
            
            {/* Description with specified typography */}
            <p 
              className="text-white "
              style={{
                fontFamily: 'Inter',
                fontWeight: 400,
                fontSize: '18.11px',
                lineHeight: '35.83px',
                letterSpacing: '-0.01%',
                verticalAlign: 'middle'
              }}
            >
              Kenesis is the only platform on the market specialized in sales and conversion of physical and digital products in the Web3 space.
            </p>
          </div>

          {/* Right Section - App Download and Account Creation */}
          <div className="flex flex-col items-center lg:items-end gap-8 w-full lg:w-auto">
            
            {/* Download Section */}
            <div className="flex flex-col items-center lg:items-end gap-6">
              {/* Download our app text */}
              <h3 className="text-white text-xl font-semibold font-inter">
                Download our app
              </h3>
              
              {/* App Store Buttons */}
              <div className="flex gap-4">
                {/* Google Play Button */}
                <Link 
                  href="#" 
                  className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-7 py-4 rounded-full border border-gray-700 transition-all duration-300 hover:scale-105"
                >
                  <IoLogoGooglePlaystore className="w-6 h-6 text-green-500" />
                  <span className="font-medium">Google Play</span>
                </Link>
                
                {/* App Store Button */}
                <Link 
                  href="#" 
                  className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-7 py-4 rounded-full border border-gray-700 transition-all duration-300 hover:scale-105"
                >
                  <LiaApple className="w-6 h-6 text-white" />
                  <span className="font-medium">App Store</span>
                </Link>
              </div>
            </div>

            {/* Create Account Button */}
            <Link 
              href="/auth/login"
              className="bg-white hover:bg-gray-100 text-black font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg text-lg w-full text-center"
            >
              Create your account →
            </Link>
          </div>
        </div>

        {/* Bottom Section - Social Links and Copyright/Terms */}
        <div className="flex flex-col lg:flex-row justify-between items-center mt-6 gap-6">
          
          {/* Social Links - Bottom Left */}
          <div className="flex flex-col items-center lg:items-start gap-4">
            <div className="flex gap-4">
              <Link 
                href="https://x.com/kenesis_io?s=21&t=iiRYsbGEbXUkxpvkzfIcDQ" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transform transition-all duration-300 hover:scale-110 p-2 rounded-full bg-white/10 hover:bg-white/20"
              >
                <FaXTwitter className="w-5 h-5 text-white hover:text-blue-400 transition-colors" />
              </Link>
              <Link 
                href="https://www.instagram.com/kenesis.io?igsh=NmRqdjNjZDR2c2g3&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transform transition-all duration-300 hover:scale-110 p-2 rounded-full bg-white/10 hover:bg-white/20"
              >
                <FaInstagram className="w-5 h-5 text-white hover:text-pink-400 transition-colors" />
              </Link>
              <Link 
                href="https://www.linkedin.com/company/kenesis-io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transform transition-all duration-300 hover:scale-110 p-2 rounded-full bg-white/10 hover:bg-white/20"
              >
                <FaLinkedin className="w-5 h-5 text-white hover:text-blue-600 transition-colors" />
              </Link>
              <Link 
                href="https://t.me/KenesisOfficial" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transform transition-all duration-300 hover:scale-110 p-2 rounded-full bg-white/10 hover:bg-white/20"
              >
                <FaTelegram className="w-5 h-5 text-white hover:text-blue-500 transition-colors" />
              </Link>
              <Link 
                href="https://www.threads.com/@kenesis.io?igshid=NTc4MTIwNjQ2YQ==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transform transition-all duration-300 hover:scale-110 p-2 rounded-full bg-white/10 hover:bg-white/20"
              >
                <FaThreads className="w-5 h-5 text-white hover:text-gray-300 transition-colors" />
              </Link>
            </div>
            
            {/* Copyright */}
            <p className="text-white text-sm font-inter opacity-60">
              © 2025 - Kenesis - All rights reserved.
            </p>
          </div>

          {/* Terms and Privacy - Right Side */}
          <div className="flex gap-6 text-white text-base font-inter opacity-80">
            <Link href="/terms" className="hover:text-blue-300 transition-colors">
              Terms of Service
            </Link>
            <span>|</span>
            <Link href="/privacy" className="hover:text-blue-300 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
