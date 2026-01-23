import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/backend/:path*',
  //       destination: 'http://localhost:3001/:path*', // URL do seu NestJS
  //     },
  //   ]
  // },
};

export default nextConfig;
