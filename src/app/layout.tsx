import type { Metadata } from 'next'
import './globals.css'
import { supabase } from '@/lib/supabase'
import { SearchProvider } from '@/components/search/SearchProvider'
import type { SearchProduct } from '@/lib/search'

export const metadata: Metadata = {
  title: {
    default: 'PriceSlicr — UK Electronics Price Comparison',
    template: '%s | PriceSlicr',
  },
  description:
    'Compare UK electronics prices — laptops, phones, tablets, TVs and more. Find every saving: cashback, trade-in, price matching, student discounts, and sale timing. Updated daily.',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'PriceSlicr',
    url: 'https://www.priceslicr.com',
    images: [
      {
        url: 'https://www.priceslicr.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PriceSlicr — UK Tech Price Comparison',
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
  metadataBase: new URL('https://www.priceslicr.com'),
  alternates: {
    canonical: '/',
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'PriceSlicr',
  url: 'https://www.priceslicr.com',
  description:
    'UK laptop price comparison — slice through to every available saving: cashback, trade-in, price matching, student rates, and sale timing.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://www.priceslicr.com/laptops?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PriceSlicr',
  url: 'https://www.priceslicr.com',
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Lightweight product index for the header search (name, slug, category, brand only).
  const { data } = await supabase
    .from('products')
    .select('name, slug, category, brand')
    .order('name', { ascending: true })
  const searchIndex = (data ?? []) as SearchProduct[]

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
        <SearchProvider products={searchIndex}>{children}</SearchProvider>
      </body>
    </html>
  )
}
