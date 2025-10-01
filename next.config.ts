/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.khanoumi.com',
        pathname: '/**',
      },
    
        {
          protocol: 'https',
          hostname: 'abzarreza.com',
          pathname: '/**',
        },
        
        {
          protocol: 'https',
          hostname: 'storage.khanoumi.com',
          pathname: '/**',
        },
           {
          protocol: 'https',
          hostname: 'picsum.photos',
          pathname: '/**',
        },
          {
          protocol: 'http',
          hostname: 'localhost',
          pathname: '/**',
        },
           {
          protocol: 'https',
          hostname: 'encrypted-tbn1.gstatic.com',
          pathname: '/**',
        },
          {
          protocol: 'http',
          hostname: '91.107.132.39',
          pathname: '/**',
        },
  
    ],
  },
};

module.exports = nextConfig;