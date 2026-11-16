import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Refetch corrected API data across development refreshes as well.
    serverComponentsHmrCache: false,
  },
};

export default nextConfig;
