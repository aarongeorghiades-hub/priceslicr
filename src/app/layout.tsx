import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'PriceSlicr — UK Laptop Price Comparison',
    template: '%s | PriceSlicr',
  },
  description:
    'Compare laptop prices across every UK retailer — new, refurbished, and used. Slice through to cashback, trade-in, price matching, student rates, and sale timing.',
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
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  )
}
