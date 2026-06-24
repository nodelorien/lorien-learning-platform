import type { NextConfig } from "next";

const API_URL = process.env.API_URL || 'http://localhost:4000';

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  outputFileTracingRoot: process.env.OUTPUT_FILE_TRACING_ROOT || undefined,

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
