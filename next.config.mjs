/** @type {import('next').NextConfig} */
const nextConfig = {
  // When cop-cms is proxied through cop-frontend (port 3000),
  // assets must load directly from cop-cms (port 3001) to avoid
  // /_next/ path conflicts between the two Next.js apps.
  assetPrefix: process.env.NODE_ENV === "production" ? "" : "http://localhost:3001",

  async rewrites() {
    return [
      {
        source: "/api/admin/:path*",
        destination: "http://localhost:5000/api/admin/:path*",
      },
      {
        source: "/api/public/:path*",
        destination: "http://localhost:5000/api/public/:path*",
      },
    ];
  },
};

export default nextConfig;
