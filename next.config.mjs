/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporalmente ignorar errores de ESLint durante el build
  },
  typescript: {
    ignoreBuildErrors: true, // Temporalmente ignorar errores de TypeScript durante el build
  }
};

export default nextConfig;