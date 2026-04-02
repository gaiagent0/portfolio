import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable Turbopack for build to avoid http2 font loading issues
    // Use webpack for production builds
  },
};

export default nextConfig;