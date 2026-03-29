import type { Metadata } from 'next'
import Nav from '@/components/layout/Nav'
import SaleTimingPage from '@/components/product/SaleTimingPage'
import { getUpcomingSaleEvents } from '@/lib/product'

export const metadata: Metadata = {
  title: 'Sale Timing Intelligence — When to Buy a Laptop UK',
  description: 'Know exactly when UK laptop prices drop. Track Black Friday, Prime Day, Back to School and more — with historical discount ranges and countdown timers.',
}

export default async function SaleTimingRoute() {
  const events = await getUpcomingSaleEvents()

  return (
    <div className="dark-section min-h-screen">
      {/* Radar background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[image:linear-gradient(rgba(0,194,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,194,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <Nav />

      <div className="relative z-10 max-w-5xl mx-auto px-12 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="text-xs uppercase tracking-widest text-[var(--muted)] mb-3">
            Saving layer &middot; Sale timing
          </div>
          <h1 className="font-display text-5xl font-extrabold text-white leading-tight mb-4">
            Buy at the right<br />
            <span className="text-[var(--slice)]">moment.</span>
          </h1>
          <p className="text-[var(--muted)] text-lg max-w-xl leading-relaxed">
            UK laptop prices drop predictably at the same events every year. We track every confirmed and expected sale &mdash; with historical discount ranges &mdash; so you know whether to buy now or wait.
          </p>
        </div>

        <SaleTimingPage events={events} />

      </div>
    </div>
  )
}
