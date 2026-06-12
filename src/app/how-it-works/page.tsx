import type { Metadata } from 'next'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Reveal from '@/components/Reveal'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'How PriceSlicr Works | UK Tech Price Comparison',
  description: 'PriceSlicr finds every available saving on UK electronics — cashback, trade-in, price matching, student rates, and sale timing — automatically surfaced in one place.',
  path: '/how-it-works',
})

const SAVING_LAYERS = [
  {
    icon: '↩',
    color: 'text-[var(--slice-text)]',
    bg: 'bg-[var(--slice-dim)]',
    border: 'border-[rgba(224,32,32,0.2)]',
    title: 'Cashback portals',
    description: 'TopCashback and Quidco pay you a percentage of your purchase back in cash. 3–6% at Currys and John Lewis. Activate before you click through — the cookie must be set first.',
    example: 'MacBook Air £1,099 → save £33 via TopCashback at Currys',
    stackable: true,
  },
  {
    icon: '⇆',
    color: 'text-[var(--slice-text)]',
    bg: 'bg-[var(--slice-dim)]',
    border: 'border-[rgba(224,32,32,0.2)]',
    title: 'Trade-in',
    description: 'Sell your old device to MusicMagpie, Back Market, or CEX before buying. Cash goes toward your new laptop. Always stacks with every other saving layer.',
    example: 'Old MacBook Air (Good condition) → £440 cash from MusicMagpie',
    stackable: true,
  },
  {
    icon: '◈',
    color: 'text-[var(--slice-text)]',
    bg: 'bg-[var(--slice-dim)]',
    border: 'border-[rgba(224,32,32,0.2)]',
    title: 'Credit card cashback',
    description: 'Amex intro cashback (5% for 5 months, capped £125) stacks with portal cashback. Lloyds Ultra gives 1% uncapped on all Visa purchases — best for retailers that don\'t take Amex.',
    example: 'Amex intro: £1,099 MacBook → save £55 in cashback',
    stackable: true,
  },
  {
    icon: '🎁',
    color: 'text-[var(--slice-text)]',
    bg: 'bg-[var(--slice-dim)]',
    border: 'border-[rgba(224,32,32,0.2)]',
    title: 'Gift card cashback',
    description: 'HyperJar gives ~5% on Currys gift cards. JamDoughnut gives 2–5% on Currys and is the only cashback route on Apple. Buy the gift card, then use it to pay — instant, no cookie dependency.',
    example: 'Currys £1,099 via HyperJar gift card → save £55 instantly',
    stackable: true,
  },
  {
    icon: '✦',
    color: 'text-[var(--slice-text)]',
    bg: 'bg-[rgba(224,32,32,0.12)]',
    border: 'border-[rgba(224,32,32,0.2)]',
    title: 'Student & youth discounts',
    description: 'Apple Education pricing (up to 10% off Macs), UNiDAYS codes at Dell and HP, Samsung Youth Store (age 16–26, photo ID only — no enrolment needed). Back Market offers £20 student discount via SheerID.',
    example: 'Samsung Youth Store: 10–30% off Galaxy Book with just photo ID',
    stackable: true,
  },
  {
    icon: '≡',
    color: 'text-[var(--slice-text)]',
    bg: 'bg-[var(--slice-dim)]',
    border: 'border-[rgba(224,32,32,0.2)]',
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
      <Nav />

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-12 md:py-16">

        {/* Header */}
        <div className="mb-14">
          <div className="eyebrow mb-4">
            How it works
          </div>
          <h1 className="heading-section text-[var(--ink)] mb-5">
            Every saving.<br />
            <span className="text-[var(--slice-text)]">Automatically.</span>
          </h1>
          <p className="text-[var(--ink-dim)] text-lg max-w-2xl leading-relaxed">
            Most UK laptop buyers overpay by 15–40% because they only check the headline price. PriceSlicr surfaces every available saving layer — cashback, trade-in, price matching, student rates, and sale timing — so you can stack them.
          </p>
        </div>

        {/* How stacking works */}
        <Reveal className="mist mb-10"><div className="card p-6">
          <div className="label text-[var(--ink-faint)] mb-4">
            The stacking principle
          </div>
          <p className="text-sm text-white/70 leading-relaxed mb-5">
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
                    ? 'bg-[var(--slice-dim)] text-[var(--slice-text)] border-[rgba(224,32,32,0.2)]'
                    : item.green
                    ? 'bg-[var(--slice-dim)] text-[var(--slice-text)] border-[rgba(224,32,32,0.2)]'
                    : 'bg-[rgba(255,255,255,0.04)] text-white/70 border-[var(--border)]'
                }`}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div></Reveal>

        {/* Saving layers */}
        <Reveal className="mb-10">
          <div className="label text-[var(--ink-faint)] mb-6">
            The 7 saving layers
          </div>
          <div className="space-y-4">
            {SAVING_LAYERS.map((layer, i) => (
              <Reveal
                key={i}
                delay={Math.min(i * 70, 350)}
                className="card p-6"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${layer.bg} ${layer.color} border ${layer.border}`}>
                    {layer.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-display font-bold text-white text-sm">{layer.title}</span>
                      <span className="text-[10px] text-[var(--slice-text)] bg-[var(--slice-dim)] border border-[rgba(224,32,32,0.15)] px-2 py-0.5 rounded">
                        ✓ Stackable
                      </span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed mb-3">
                      {layer.description}
                    </p>
                    <div className="text-[11px] text-[var(--slice-text)] bg-[var(--slice-dim)] border border-[rgba(224,32,32,0.15)] px-3 py-2 rounded-lg">
                      Example: {layer.example}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        {/* Stacking rules */}
        <Reveal className="mist mist-high mb-10"><div className="card p-6">
          <div className="label text-[var(--ink-faint)] mb-4">
            What stacks with what
          </div>
          <div className="space-y-3">
            {STACKING_RULES.map((rule, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <span className="text-sm text-white/70">
                  <span className="text-[var(--ink)]">{rule.a}</span>
                  {' + '}
                  <span className="text-[var(--ink)]">{rule.b}</span>
                </span>
                <span className={`text-[10px] font-semibold px-3 py-1 rounded shrink-0 border ${
                  rule.ok
                    ? 'bg-[var(--slice-dim)] text-[var(--slice-text)] border-[rgba(224,32,32,0.2)]'
                    : 'bg-[var(--risk-dim)] text-[var(--risk)] border-[rgba(255,181,32,0.2)]'
                }`}>
                  {rule.result}
                </span>
              </div>
            ))}
          </div>
        </div></Reveal>

        {/* About PriceSlicr */}
        <Reveal className="mist mist-wide mb-10"><div className="card p-6">
          <div className="label text-[var(--ink-faint)] mb-4">
            About PriceSlicr
          </div>
          <div className="space-y-3 text-sm text-white/70 leading-relaxed">
            <p>
              PriceSlicr is an independent UK price comparison tool. We earn a small commission when you click through to a retailer and make a purchase — this never affects our recommendations or the prices you see.
            </p>
            <p>
              We never link cashback portal visits through our own affiliate tracking. Doing so would overwrite the portal&apos;s cookie and destroy your cashback. When we link to TopCashback or Quidco, we link directly to their retailer page.
            </p>
            <p>
              Currently covering 102 products across 7 categories &mdash; laptops, phones, tablets, TVs, monitors, headphones, and smartwatches &mdash; from 11 UK retailers. Prices update every 6 hours.
            </p>
          </div>
        </div></Reveal>

        {/* CTA */}
        <div className="mt-12 border-t border-[var(--border)] pt-10">
          <div className="label text-[var(--ink-faint)] mb-6">Browse by category</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <a href="/laptops" className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-white transition-colors text-center">Laptops &rarr;</a>
            <a href="/phones" className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-white transition-colors text-center">Phones &rarr;</a>
            <a href="/tablets" className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-white transition-colors text-center">Tablets &rarr;</a>
            <a href="/tvs" className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-white transition-colors text-center">TVs &rarr;</a>
            <a href="/monitors" className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-white transition-colors text-center">Monitors &rarr;</a>
            <a href="/headphones" className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-white transition-colors text-center">Headphones &rarr;</a>
            <a href="/smartwatches" className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-white transition-colors text-center">Smartwatches &rarr;</a>
            <a href="/trade-in" className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-[var(--slice-text)] transition-colors text-center">Trade-in &rarr;</a>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  )
}
