import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence custom Webpack config error under Next.js 16 Turbopack
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
