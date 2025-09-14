import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Allow production builds to proceed even if ESLint finds issues.
    // This is helpful when unrelated lint errors block builds during refactors.
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Security headers
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "X-Frame-Options",
                        value: "DENY",
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                ],
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "ik.imagekit.io",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "kenesis-lms.sa-east-1.amazonaws.com",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
