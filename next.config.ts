import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/bill',
        destination: '/bills',
        permanent: false,
      },
      {
        source: '/transaction',
        destination: '/transactions',
        permanent: false,
      },
      {
        source: '/goal',
        destination: '/goals',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
