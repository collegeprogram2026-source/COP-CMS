/** @type {import('next').NextConfig} */
const nextConfig = {
  // When cop-cms is proxied through cop-frontend (port 3000),
  // assets must load directly from cop-cms (port 3001) to avoid
  // /_next/ path conflicts between the two Next.js apps.
  assetPrefix: process.env.NODE_ENV === "production" ? "" : "http://localhost:3001",

  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    return [
      {
        source: "/api/admin/:path*",
        destination: `${backendUrl}/api/admin/:path*`,
      },
      {
        source: "/api/public/:path*",
        destination: `${backendUrl}/api/public/:path*`,
      },
    ];
  },
};

export default nextConfig;
