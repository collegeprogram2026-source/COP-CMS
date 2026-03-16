/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/admin/:path*',
        destination: 'http://localhost:5000/api/admin/:path*',
      },
      {
        source: '/api/public/:path*',
        destination: 'http://localhost:5000/api/public/:path*',
      },
    ];
  },
};

export default nextConfig;
