import type { NextConfig } from "next";
import path from "path";

const API_URL = process.env.API_URL || 'http://localhost:4000';

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  outputFileTracingRoot: path.resolve('..'),

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
