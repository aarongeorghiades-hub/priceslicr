import type { Metadata } from 'next'

// Shared Open Graph fields. `metadataBase` (set in app/layout.tsx to
// https://www.priceslicr.com) resolves the relative `url` and image paths to
// absolute www URLs — so each page's og:url matches its own canonical.
const OG_BASE = {
  type: 'website' as const,
  locale: 'en_GB',
  siteName: 'PriceSlicr',
  images: [
    { url: '/og-image.png', width: 1200, height: 630, alt: 'PriceSlicr — UK Tech Price Comparison' },
  ],
}

/**
 * Build per-page metadata with a self-referencing canonical and og:url.
 * Pass the route path (e.g. '/phones'); it resolves to the www URL via metadataBase.
 * og:title / og:description default from the page title/description automatically.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...OG_BASE, url: path },
  }
}
