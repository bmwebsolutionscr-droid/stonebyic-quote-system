import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove floating nextjs logo
  devIndicators: {
    buildActivity: false
  }
}

export default nextConfig;
