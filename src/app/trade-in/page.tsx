import type { Metadata } from 'next'
import Nav from '@/components/layout/Nav'
import TradeInCalculator from '@/components/product/TradeInCalculator'

export const metadata: Metadata = {
  title: 'Trade-In Value Calculator — UK Laptops, Phones & Tablets',
  description: 'Compare trade-in values across MusicMagpie, Back Market, CEX, and Apple Trade In. Find the best offer for your old device and stack the saving on your new laptop.',
}

export default function TradeInPage() {
  return (
    <div className="dark-section min-h-screen">
      {/* Radar background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[image:linear-gradient(rgba(0,194,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,194,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <Nav />

      <div className="relative z-10 max-w-4xl mx-auto px-12 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="text-xs uppercase tracking-widest text-[var(--muted)] mb-3">
            Saving layer &middot; Trade-in
          </div>
          <h1 className="font-display text-5xl font-extrabold text-white leading-tight mb-4">
            What&apos;s your old<br />
            <span className="text-[var(--slice)]">device worth?</span>
          </h1>
          <p className="text-[var(--muted)] text-lg max-w-xl leading-relaxed">
            Compare trade-in values across every major UK platform. Find the best offer, then stack it with cashback, student discounts, and price matching to reach your lowest possible price.
          </p>
        </div>

        {/* How it stacks */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 mb-8">
          <div className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4 font-medium">
            How trade-in fits your saving stack
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Headline price', dim: true },
              { label: '\u2212 Trade-in value', highlight: 'savings' },
              { label: '\u2212 Portal cashback', highlight: 'savings' },
              { label: '\u2212 Student discount', highlight: 'savings' },
              { label: '= Sliced to', highlight: 'result' },
            ].map((item, i) => (
              <span
                key={i}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium border ${
                  item.highlight === 'result'
                    ? 'bg-[var(--savings-dim)] text-[var(--savings)] border-[rgba(0,255,133,0.2)]'
                    : item.highlight === 'savings'
                    ? 'bg-[var(--slice-dim)] text-[var(--slice)] border-[rgba(0,194,255,0.2)]'
                    : 'bg-[rgba(255,255,255,0.04)] text-[var(--muted)] border-[var(--border)]'
                }`}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <TradeInCalculator />

        {/* Platform guide */}
        <div className="mt-8 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
          <div className="font-display font-bold text-white text-sm mb-4">Which platform should I use?</div>
          <div className="space-y-3 text-[11px] text-[var(--muted)] leading-relaxed">
            <div>
              <span className="text-[var(--ink)]">MusicMagpie</span> &mdash; Best for convenience. Free postage, cash in 5 days, no haggling. Reliable rates. Good Awin affiliate commission.
            </div>
            <div>
              <span className="text-[var(--ink)]">Back Market Trade-In</span> &mdash; Often the highest cash offer. Grade criteria are strict &mdash; condition is assessed on arrival. Rates may be revised if condition doesn&apos;t match.
            </div>
            <div>
              <span className="text-[var(--ink)]">CEX Cash</span> &mdash; Instant in-store payment. Useful if you need cash today. In-store condition check on the spot.
            </div>
            <div>
              <span className="text-[var(--ink)]">CEX Voucher</span> &mdash; 10&ndash;20% more than cash, but store credit only. Best if you&apos;re buying something from CEX. Grade B refurb laptops from CEX come with a 5-year warranty &mdash; excellent value.
            </div>
            <div>
              <span className="text-[var(--ink)]">Apple Trade In</span> &mdash; Store credit only, redeemable against any Apple product. Worth using if you&apos;re buying a new Mac. Not competitive if you&apos;re switching brands.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
