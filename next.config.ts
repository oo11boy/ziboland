/** @type {import('next').NextConfig} */
const nextConfig = {
  // فعال‌سازی توربوپک و غیرفعال کردن لاگ‌های اضافی
  turbopack: {
    // تنظیمات جایگزین برای webpack
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.khanoumi.com', pathname: '/**' },
      { protocol: 'https', hostname: 'abzarreza.com', pathname: '/**' },
      { protocol: 'https', hostname: 'storage.khanoumi.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
      { protocol: 'https', hostname: 'encrypted-tbn1.gstatic.com', pathname: '/**' },
      { protocol: 'http', hostname: '91.107.132.39', pathname: '/**' },
      { protocol: 'http', hostname: '87.107.174.37', pathname: '/**' },
      { protocol: 'https', hostname: 'ziboland.co', pathname: '/**' },
      { protocol: 'http', hostname: 'ziboland.co', pathname: '/**' },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // در نسخه ۱۶، کنترل لاگ‌ها به این شکل بهینه شده است
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = nextConfig;