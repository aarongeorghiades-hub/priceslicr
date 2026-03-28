import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.amazon.com' },
      { protocol: 'https', hostname: '**.currys.co.uk' },
      { protocol: 'https', hostname: '**.backmarket.co.uk' },
      { protocol: 'https', hostname: '**.johnlewis.com' },
    ],
  },
}

export default nextConfig
