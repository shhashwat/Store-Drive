import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },{
        protocol: "https",
        hostname: "img.freepik.com",
      },{
        protocol: "https",
        hostname: "cloud.appwrite.io",
      }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb", 
    },
  },
};

export default nextConfig;
