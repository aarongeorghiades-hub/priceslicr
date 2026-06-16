import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazon.com' },
      { protocol: 'https', hostname: '**.currys.co.uk' },
      { protocol: 'https', hostname: '**.backmarket.co.uk' },
      { protocol: 'https', hostname: '**.johnlewis.com' },
    ],
  },
  async redirects() {
    return [
      {
        // Canonical host is www.priceslicr.com — 301 the apex to www.
        source: '/:path*',
        has: [{ type: 'host', value: 'priceslicr.com' }],
        destination: 'https://www.priceslicr.com/:path*',
        permanent: true,
      },
      {
        // Apple Watch Series 10 ships in 42mm/46mm, never 44mm — the original
        // slug was mis-specced and corrected to 42mm. 308 the old URL to the new.
        source: '/smartwatches/apple-watch-series-10-44mm-gps',
        destination: '/smartwatches/apple-watch-series-10-42mm-gps',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
