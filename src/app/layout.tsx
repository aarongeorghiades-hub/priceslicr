import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'PriceSlicr — UK Laptop Price Comparison',
    template: '%s | PriceSlicr',
  },
  description:
    'Compare laptop prices across every UK retailer — new, refurbished, and used. Slice through the headline price to find every available saving: cashback, trade-in, student discounts, price matching, and timing intelligence.',
  keywords: [
    'laptop price comparison UK',
    'refurbished laptop UK',
    'Back Market UK',
    'cashback electronics UK',
    'price match UK laptop',
    'best laptop deals UK',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'PriceSlicr',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen bg-brand-light">
        {children}
      </body>
    </html>
  )
}
