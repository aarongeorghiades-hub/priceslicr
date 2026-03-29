import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        // Block aggressive scrapers and price-check bots
        userAgent: [
          'GPTBot',
          'CCBot',
          'anthropic-ai',
          'Claude-Web',
          'Bytespider',
          'PetalBot',
          'SemrushBot',
          'AhrefsBot',
          'MJ12bot',
          'DotBot',
        ],
        disallow: '/',
      },
    ],
    sitemap: 'https://priceslicr.com/sitemap.xml',
    host: 'https://priceslicr.com',
  }
}
