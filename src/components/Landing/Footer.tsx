'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      canvas.style.width = canvas.offsetWidth + 'px';
      canvas.style.height = canvas.offsetHeight + 'px';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    // Initialize particles
    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          color: ['#0680FF', '#022ED2', '#00C9FF', '#4648FF'][Math.floor(Math.random() * 4)]
        });
      }
    };

    const drawWave = (time: number) => {
      ctx.save();
      ctx.globalAlpha = 0.3;
      
      // Create gradient wave
      const gradient = ctx.createLinearGradient(0, 0, canvas.offsetWidth, 0);
      gradient.addColorStop(0, 'rgba(6, 128, 255, 0.1)');
      gradient.addColorStop(0.5, 'rgba(70, 72, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(2, 46, 210, 0.1)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, canvas.offsetHeight);
      
      for (let x = 0; x <= canvas.offsetWidth; x += 10) {
        const y = canvas.offsetHeight - 50 + Math.sin(x * 0.01 + time * 0.001) * 20 + 
                  Math.sin(x * 0.005 + time * 0.002) * 10;
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(canvas.offsetWidth, canvas.offsetHeight);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawParticles = () => {
      particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();

        // Update particle position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Mouse interaction
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100;
          particle.vx += (dx / distance) * force * 0.01;
          particle.vy += (dy / distance) * force * 0.01;
        }

        // Boundary bounce
        if (particle.x < 0 || particle.x > canvas.offsetWidth) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.offsetHeight) particle.vy *= -1;
        
        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.offsetWidth, particle.x));
        particle.y = Math.max(0, Math.min(canvas.offsetHeight, particle.y));
      });
    };

    const drawConnections = () => {
      ctx.save();
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.globalAlpha = (100 - distance) / 100 * 0.3;
            ctx.strokeStyle = '#0680FF';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });
      ctx.restore();
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      drawWave(time);
      drawParticles();
      drawConnections();
      
      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    resizeCanvas();
    initParticles();
    animate(0);
    
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <footer className="relative w-full bg-gradient-to-b from-[#000526] to-[#000315] border-t border-[#022ED2] py-10 px-12 mt-20 overflow-hidden">
      {/* Animated Canvas Background */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Floating Orbs */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-500 rounded-full opacity-15 blur-2xl animate-bounce"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-cyan-400 rounded-full opacity-25 blur-lg animate-ping"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
        {/* Logo and Description */}
        <div className="flex flex-col items-center md:items-start gap-4 max-w-lg group">
          <div className="transform transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/images/landing/logo.png"
              alt="Kenesis Logo"
              width={120}
              height={40}
              className="mb-2 w-40 h-12 filter drop-shadow-lg"
            />
          </div>
          <p className="text-white text-center md:text-left font-poppins text-lg leading-relaxed opacity-80 transition-opacity duration-300 group-hover:opacity-100">
            Kenesis is the only platform on the market specialized in sales and conversion of physical and digital products in the Web3 space.
          </p>
        </div>

        {/* Social and Links */}
        <div className="flex flex-col items-center md:items-end gap-6">
          <div className="flex gap-4 mb-2">
            <Link href="https://twitter.com/" target="_blank" rel="noopener noreferrer" 
                  className="transform transition-all duration-300 hover:scale-125 hover:rotate-12 hover:shadow-lg hover:shadow-blue-500/50">
              <Image src="/images/landing/x.png" alt="Twitter" width={32} height={32} className="filter drop-shadow-md" />
            </Link>
            <Link href="https://instagram.com/" target="_blank" rel="noopener noreferrer"
                  className="transform transition-all duration-300 hover:scale-125 hover:rotate-12 hover:shadow-lg hover:shadow-pink-500/50">
              <Image src="/images/landing/instagram.png" alt="Instagram" width={32} height={32} className="filter drop-shadow-md" />
            </Link>
          </div>
          <div className="flex gap-6 text-white text-lg font-poppins opacity-80">
            <Link href="/terms" className="relative overflow-hidden group">
              <span className="relative z-10 transition-colors duration-300 group-hover:text-blue-300">Terms of Service</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/privacy" className="relative overflow-hidden group">
              <span className="relative z-10 transition-colors duration-300 group-hover:text-blue-300">Privacy Policy</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-8 text-center text-lg text-white opacity-60 font-poppins">
        <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent animate-pulse">
          © 2025 - Kenesis - All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
