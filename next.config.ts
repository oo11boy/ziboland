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
       
    ],
  },
};

module.exports = nextConfig;