/** @type {import('next').NextConfig} */
const nextConfig = {
  // When cop-cms is proxied through cop-frontend (frontend.com/admin/*),
  // assets must load from the CMS's own origin so /_next/* paths don't
  // collide with the frontend Next app.
  //   Dev:  localhost:3001 (CMS dev port)
  //   Prod: CMS_PUBLIC_URL (set in Vercel to the CMS's canonical URL)
  assetPrefix:
    process.env.NODE_ENV === "production"
      ? process.env.CMS_PUBLIC_URL || undefined
      : "http://localhost:3001",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

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
