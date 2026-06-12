import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/coming-soon' },
  title: 'Coming Soon — PriceSlicr',
  description: 'PriceSlicr is coming soon. Something sharp is on its way.',
}

export default function ComingSoonPage() {
  return (
    <div className="dark-section min-h-screen flex flex-col items-center justify-center px-6">
      <div className="relative z-10 text-center">
        <div className="font-display text-4xl font-bold tracking-tight mb-8">
          <span className="text-[var(--ink)]">Price</span>
          <span className="text-[var(--slice-text)]">/</span>
          <span className="text-[var(--ink)]">Slicr</span>
        </div>
        <h1 className="heading-section text-[var(--ink)] mb-3">
          Coming soon.
        </h1>
        <p className="text-[var(--ink-dim)] text-lg">
          Something sharp is on its way.
        </p>
      </div>
    </div>
  )
}
