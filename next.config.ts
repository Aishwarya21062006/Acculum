import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence turbopack warning since we just need simple sqlite externalization
  turbopack: {},
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('better-sqlite3');
      }
    }
    return config;
  },

  images: {
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
