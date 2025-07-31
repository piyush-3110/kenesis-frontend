import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API rewrites for development proxy (following integration.md guidelines)
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/:path*`,
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Image optimization for backend assets
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kenesis-backend.onrender.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
