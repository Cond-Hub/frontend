import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
