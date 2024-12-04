import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },{
        protocol: "https",
        hostname: "cloud.appwrite.io",
      }
    ]
  }
};

export default nextConfig;
