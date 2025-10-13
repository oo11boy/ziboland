/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.khanoumi.com', pathname: '/**' },
      { protocol: 'https', hostname: 'abzarreza.com', pathname: '/**' },
      { protocol: 'https', hostname: 'storage.khanoumi.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
      { protocol: 'https', hostname: 'encrypted-tbn1.gstatic.com', pathname: '/**' },
      { protocol: 'http', hostname: '91.107.132.39', pathname: '/**' },
    ],
  },

  eslint: {
    // از نمایش و شکست build بخاطر warning جلوگیری می‌کند
    ignoreDuringBuilds: true,
  },

  webpack(config: { infrastructureLogging: { level: string; }; stats: string; }) {
    // فقط ارورها را در خروجی build نمایش می‌دهد
    config.infrastructureLogging = { level: 'error' };
    config.stats = 'errors-only';
    return config;
  },
};

module.exports = nextConfig;
