/** @type {import('next').NextConfig} */

// Backend origin for API rewrites (server-side, not exposed to browser)
const backendApiUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

// Backend origin for image optimisation (split into parts for remotePatterns)
const backendHostname = process.env.NEXT_PUBLIC_BACKEND_HOSTNAME || "127.0.0.1";
const backendPort = process.env.NEXT_PUBLIC_BACKEND_PORT || "8000";
const backendProtocol = process.env.NEXT_PUBLIC_BACKEND_PROTOCOL || "http";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendApiUrl}/api/:path*/`,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: true,
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      // Local development
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
      // Production backend (Render) — set NEXT_PUBLIC_BACKEND_* on Vercel
      {
        protocol: backendProtocol,
        hostname: backendHostname,
        ...(backendPort ? { port: backendPort } : {}),
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

module.exports = nextConfig;
