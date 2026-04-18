import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tckhzquklzptybofowyk.supabase.co",
      },
    ],
  },
};

export default nextConfig;
