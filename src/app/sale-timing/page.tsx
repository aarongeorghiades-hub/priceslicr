import type { Metadata } from 'next'
import Nav from '@/components/layout/Nav'
import SaleTimingPage from '@/components/product/SaleTimingPage'
import { getUpcomingSaleEvents } from '@/lib/product'

export const metadata: Metadata = {
  alternates: { canonical: '/sale-timing' },
  title: 'When to Buy Tech UK | Sale Timing Guide',
  description: 'Know exactly when UK electronics prices drop. Track Black Friday, Prime Day, Back to School and more — with historical discount ranges and countdown timers.',
}

export default async function SaleTimingRoute() {
  const events = await getUpcomingSaleEvents()

  return (
    <div className="dark-section min-h-screen">
      <Nav />

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-16">

        {/* Header */}
        <div className="mb-12">
          <div className="eyebrow mb-4">
            Saving layer &middot; Sale timing
          </div>
          <h1 className="heading-section text-[var(--ink)] mb-5">
            Buy at the right<br />
            <span className="text-[var(--slice-text)]">moment.</span>
          </h1>
          <p className="text-[var(--ink-dim)] text-lg max-w-xl leading-relaxed">
            UK electronics prices drop predictably at the same events every year. We track every confirmed and expected sale &mdash; with historical discount ranges &mdash; so you know whether to buy now or wait.
          </p>
        </div>

        <SaleTimingPage events={events} />

      </div>
    </div>
  )
}
