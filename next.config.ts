import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true, // Add trailing slashes for better file system compatibility
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "shreethemes.net",
        pathname: "/geotrip-2.0/geotrip/**",
      },
      {
        protocol: "https",
        hostname: "cdn.getyourguide.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "localhost",
      },
    ],
  },
  // Use webpack instead of Turbopack for builds to avoid font resolution issues
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Explicitly configure Turbopack (empty config to allow webpack for builds)
  turbopack: {},
};

export default nextConfig;
