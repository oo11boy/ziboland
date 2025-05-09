/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.khanoumi.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;