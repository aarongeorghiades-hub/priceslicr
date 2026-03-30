import type { Metadata } from 'next'
import Nav from '@/components/layout/Nav'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How It Works — PriceSlicr',
  description: 'PriceSlicr finds every available saving on UK laptops — cashback, trade-in, price matching, student rates, and sale timing — automatically surfaced in one place.',
}

const SAVING_LAYERS = [
  {
    icon: '↩',
    color: 'text-[var(--savings)]',
    bg: 'bg-[var(--savings-dim)]',
    border: 'border-[rgba(0,255,133,0.2)]',
    title: 'Cashback portals',
    description: 'TopCashback and Quidco pay you a percentage of your purchase back in cash. 3–6% at Currys and John Lewis. Activate before you click through — the cookie must be set first.',
    example: 'MacBook Air £1,099 → save £33 via TopCashback at Currys',
    stackable: true,
  },
  {
    icon: '⇆',
    color: 'text-[var(--savings)]',
    bg: 'bg-[var(--savings-dim)]',
    border: 'border-[rgba(0,255,133,0.2)]',
    title: 'Trade-in',
    description: 'Sell your old device to MusicMagpie, Back Market, or CEX before buying. Cash goes toward your new laptop. Always stacks with every other saving layer.',
    example: 'Old MacBook Air (Good condition) → £440 cash from MusicMagpie',
    stackable: true,
  },
  {
    icon: '◈',
    color: 'text-[var(--slice)]',
    bg: 'bg-[var(--slice-dim)]',
    border: 'border-[rgba(0,194,255,0.2)]',
    title: 'Credit card cashback',
    description: 'Amex intro cashback (5% for 5 months, capped £125) stacks with portal cashback. Lloyds Ultra gives 1% uncapped on all Visa purchases — best for retailers that don\'t take Amex.',
    example: 'Amex intro: £1,099 MacBook → save £55 in cashback',
    stackable: true,
  },
  {
    icon: '🎁',
    color: 'text-[var(--savings)]',
    bg: 'bg-[var(--savings-dim)]',
    border: 'border-[rgba(0,255,133,0.2)]',
    title: 'Gift card cashback',
    description: 'HyperJar gives ~5% on Currys gift cards. JamDoughnut gives 2–5% on Currys and is the only cashback route on Apple. Buy the gift card, then use it to pay — instant, no cookie dependency.',
    example: 'Currys £1,099 via HyperJar gift card → save £55 instantly',
    stackable: true,
  },
  {
    icon: '✦',
    color: 'text-[#9A85FF]',
    bg: 'bg-[rgba(154,133,255,0.12)]',
    border: 'border-[rgba(154,133,255,0.2)]',
    title: 'Student & youth discounts',
    description: 'Apple Education pricing (up to 10% off Macs), UNiDAYS codes at Dell and HP, Samsung Youth Store (age 16–26, photo ID only — no enrolment needed). Back Market offers £20 student discount via SheerID.',
    example: 'Samsung Youth Store: 10–30% off Galaxy Book with just photo ID',
    stackable: true,
  },
  {
    icon: '≡',
    color: 'text-[var(--slice)]',
    bg: 'bg-[var(--slice-dim)]',
    border: 'border-[rgba(0,194,255,0.2)]',
    title: 'Price matching',
    description: 'John Lewis will match Currys prices (NKU policy) — buy at JL, claim the Currys price, keep the JL 2-year guarantee for free. Currys matches approved retailers in-store.',
    example: 'MacBook at JL: £1,099 → price matched to Currys £1,049, keep 2-year warranty',
    stackable: true,
  },
  {
    icon: '⏱',
    color: 'text-[var(--risk)]',
    bg: 'bg-[var(--risk-dim)]',
    border: 'border-[rgba(255,181,32,0.2)]',
    title: 'Sale timing',
    description: 'UK laptop prices drop predictably at Black Friday, Prime Day, Back to School, and Boxing Day. Our sale timing page shows exactly how many days until each event and what discounts to expect.',
    example: 'Black Friday: historically 15–25% off laptops at Currys and John Lewis',
    stackable: true,
  },
]

const STACKING_RULES = [
  { a: 'Portal cashback', b: 'Credit card cashback', result: 'YES', ok: true },
  { a: 'Gift card cashback', b: 'Credit card cashback', result: 'YES', ok: true },
  { a: 'Trade-in', b: 'Everything else', result: 'YES — always', ok: true },
  { a: 'Card-linked cashback', b: 'Portal cashback', result: 'YES', ok: true },
  { a: 'Portal cashback', b: 'Gift card cashback', result: 'NO', ok: false },
  { a: 'Student discount', b: 'BLC/Blue Light Card', result: 'NO — one code', ok: false },
]

export default function HowItWorksPage() {
  return (
    <div className="dark-section min-h-screen">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[image:linear-gradient(rgba(0,194,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,194,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <Nav />

      <div className="relative z-10 max-w-4xl mx-auto px-12 py-10">

        {/* Header */}
        <div className="mb-12">
          <div className="text-xs uppercase tracking-widest text-[var(--muted)] mb-3">
            How it works
          </div>
          <h1 className="font-display text-5xl font-extrabold text-white leading-tight mb-4">
            Every saving.<br />
            <span className="text-[var(--slice)]">Automatically.</span>
          </h1>
          <p className="text-[var(--muted)] text-lg max-w-2xl leading-relaxed">
            Most UK laptop buyers overpay by 15–40% because they only check the headline price. PriceSlicr surfaces every available saving layer — cashback, trade-in, price matching, student rates, and sale timing — so you can stack them.
          </p>
        </div>

        {/* How stacking works */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 mb-10">
          <div className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4 font-medium">
            The stacking principle
          </div>
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-5">
            Most saving layers are independent of each other. A portal cashback cookie doesn&apos;t know about your credit card reward. Your trade-in cash is separate from any discount. Stack them all and the savings compound.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Headline price', dim: true },
              { label: '− Trade-in', green: true },
              { label: '− Portal cashback', green: true },
              { label: '− Credit card cashback', green: true },
              { label: '− Student discount', green: true },
              { label: '= Sliced to', result: true },
            ].map((item, i) => (
              <span
                key={i}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium border ${
                  item.result
                    ? 'bg-[var(--savings-dim)] text-[var(--savings)] border-[rgba(0,255,133,0.2)]'
                    : item.green
                    ? 'bg-[var(--slice-dim)] text-[var(--slice)] border-[rgba(0,194,255,0.2)]'
                    : 'bg-[rgba(255,255,255,0.04)] text-[var(--muted)] border-[var(--border)]'
                }`}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Saving layers */}
        <div className="mb-10">
          <div className="text-xs uppercase tracking-widest text-[var(--muted)] mb-6 font-medium">
            The 7 saving layers
          </div>
          <div className="space-y-4">
            {SAVING_LAYERS.map((layer, i) => (
              <div
                key={i}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${layer.bg} ${layer.color} border ${layer.border}`}>
                    {layer.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-display font-bold text-white text-sm">{layer.title}</span>
                      <span className="text-[10px] text-[var(--savings)] bg-[var(--savings-dim)] border border-[rgba(0,255,133,0.15)] px-2 py-0.5 rounded">
                        ✓ Stackable
                      </span>
                    </div>
                    <p className="text-sm text-[var(--muted)] leading-relaxed mb-3">
                      {layer.description}
                    </p>
                    <div className="text-[11px] text-[var(--slice)] bg-[var(--slice-dim)] border border-[rgba(0,194,255,0.15)] px-3 py-2 rounded-lg">
                      Example: {layer.example}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stacking rules */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 mb-10">
          <div className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4 font-medium">
            What stacks with what
          </div>
          <div className="space-y-3">
            {STACKING_RULES.map((rule, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <span className="text-sm text-[var(--muted)]">
                  <span className="text-[var(--ink)]">{rule.a}</span>
                  {' + '}
                  <span className="text-[var(--ink)]">{rule.b}</span>
                </span>
                <span className={`text-[10px] font-semibold px-3 py-1 rounded shrink-0 border ${
                  rule.ok
                    ? 'bg-[var(--savings-dim)] text-[var(--savings)] border-[rgba(0,255,133,0.2)]'
                    : 'bg-[var(--risk-dim)] text-[var(--risk)] border-[rgba(255,181,32,0.2)]'
                }`}>
                  {rule.result}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* About PriceSlicr */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 mb-10">
          <div className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4 font-medium">
            About PriceSlicr
          </div>
          <div className="space-y-3 text-sm text-[var(--muted)] leading-relaxed">
            <p>
              PriceSlicr is an independent UK price comparison tool. We earn a small commission when you click through to a retailer and make a purchase — this never affects our recommendations or the prices you see.
            </p>
            <p>
              We never link cashback portal visits through our own affiliate tracking. Doing so would overwrite the portal&apos;s cookie and destroy your cashback. When we link to TopCashback or Quidco, we link directly to their retailer page.
            </p>
            <p>
              Currently covering 20 hero laptop products across 11 UK retailers. Prices update daily. More products coming soon.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-4">
          <Link
            href="/laptops"
            className="px-6 py-3 bg-[var(--slice)] text-[var(--void)] font-display font-bold text-sm rounded-xl hover:opacity-90 transition-opacity"
          >
            Compare laptops →
          </Link>
          <Link
            href="/trade-in"
            className="px-6 py-3 bg-[rgba(255,255,255,0.06)] text-[var(--ink)] font-display font-bold text-sm rounded-xl border border-[var(--border)] hover:border-[var(--slice)] transition-colors"
          >
            Check trade-in value
          </Link>
        </div>

      </div>
    </div>
  )
}
