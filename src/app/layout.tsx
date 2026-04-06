import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'PriceSlicr — UK Electronics Price Comparison',
    template: '%s | PriceSlicr',
  },
  description:
    'Compare UK electronics prices — laptops, phones, tablets, TVs and more. Find every saving: cashback, trade-in, price matching, student discounts, and sale timing. Updated daily.',
  keywords: [
    'laptop price comparison UK',
    'refurbished laptop UK',
    'Back Market UK',
    'cashback electronics UK',
    'price match laptop UK',
    'best laptop deals UK',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'PriceSlicr',
    url: 'https://priceslicr.com',
    images: [
      {
        url: 'https://priceslicr.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PriceSlicr — UK Laptop Price Comparison',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@priceslicr',
  },
  verification: {
    google: 'RIPaCaOfnFV1hLeGHUt73BHflfaxRB5vzn8wwU3Theg',
  },
  robots: { index: true, follow: true },
  metadataBase: new URL('https://priceslicr.com'),
  alternates: {
    canonical: 'https://priceslicr.com',
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'PriceSlicr',
  url: 'https://priceslicr.com',
  description:
    'UK laptop price comparison — slice through to every available saving: cashback, trade-in, price matching, student rates, and sale timing.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://priceslicr.com/laptops?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PriceSlicr',
  url: 'https://priceslicr.com',
  description: 'Independent UK laptop price comparison and savings intelligence.',
  foundingDate: '2026',
  areaServed: 'GB',
  knowsAbout: [
    'laptop price comparison',
    'cashback',
    'price matching',
    'electronics deals',
    'refurbished laptops',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
      </body>
    </html>
  )
}
