import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Disable experimental compiler to fix hydration errors
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
