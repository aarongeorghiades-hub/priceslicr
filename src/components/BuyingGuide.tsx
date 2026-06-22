import Link from 'next/link'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Reveal from '@/components/Reveal'
import { formatGBP } from '@/lib/utils'
import { SEGMENT_LABELS } from '@/lib/conditionSlices'
import { getGuide, getGuideData, type GuideEntry } from '@/lib/guide'
import { notFound } from 'next/navigation'

const BASE = 'https://www.priceslicr.com'

function conditionNote(e: GuideEntry): string {
  return e.segmentsPresent.map(s => SEGMENT_LABELS[s]).join(' · ')
}

export default async function BuyingGuide({ category }: { category: string }) {
  const g = getGuide(category)
  if (!g) notFound()
  const d = await getGuideData(category)
  if (d.priced === 0) notFound() // guard: never ship a hollow guide

  const cheapest = d.cheapest!
  const lowStr = d.low != null ? formatGBP(Math.round(d.low)) : ''
  const highStr = d.high != null ? formatGBP(Math.round(d.high)) : ''
  const segLabels = d.segmentsPresent.map(s => SEGMENT_LABELS[s].toLowerCase())
  const segWords = segLabels.length > 1
    ? `${segLabels.slice(0, -1).join(', ')} and ${segLabels[segLabels.length - 1]}`
    : segLabels.join('')
  const pricedEntries = d.entries.filter(e => e.fromPrice != null)
  const labelLc = g.label.toLowerCase()
  // Honest "Last checked" from real data (latest scraped_at) — never an asserted cadence.
  const lastChecked = d.lastChecked
    ? new Date(d.lastChecked).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  // One honest, same-sourced sentence carrying BOTH metrics so they can never drift:
  // tracked (every model on this page) and priced (those with a verified live price).
  const coverageLine = `Tracking ${d.tracked} ${labelLc}, ${d.priced} with a live price`
  // Reframed page name reused by H1 / ItemList / breadcrumb (URL unchanged).
  const pageName = `Cheapest ${g.label} UK — Live Prices (2026)`

  // ── FAQ: live-data answers + category-real Q&As (no cross-category boilerplate) ──
  const faqs: { q: string; a: string }[] = [
    {
      q: `What's the cheapest ${g.singular} right now?`,
      a: `The cheapest ${g.singular} with a live price is the ${cheapest.product.name} from ${formatGBP(Math.round(cheapest.fromPrice!))} (${SEGMENT_LABELS[cheapest.segment!].toLowerCase()}). Prices move as retailers update stock, so the leader can change between checks${lastChecked ? `; last checked ${lastChecked}` : ''}.`,
    },
    {
      q: `How much do ${labelLc} cost in the UK?`,
      a: `Across the ${d.priced} ${labelLc} we currently hold a live price on, prices run from ${lowStr} to ${highStr}, drawn from ${d.retailerCount} UK retailers in ${segWords} condition.`,
    },
    ...g.faqs,
    {
      q: `How many ${labelLc} does this page track?`,
      a: `We track ${d.tracked} ${labelLc} and currently hold a verified live price on ${d.priced} of them across ${d.retailerCount} retailers. We only headline a price we can verify, so a model without a trusted live price is listed without one rather than shown a guess.`,
    },
  ]

  // ── JSON-LD: ItemList + FAQPage + BreadcrumbList ──
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: pageName,
    url: `${BASE}${g.guidePath}`,
    numberOfItems: pricedEntries.length,
    itemListElement: pricedEntries.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: e.product.name,
        url: `${BASE}/${g.route}/${e.product.slug}`,
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'GBP',
          lowPrice: e.fromPrice,
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  }
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: g.label, item: `${BASE}/${g.route}` },
      { '@type': 'ListItem', position: 2, name: pageName, item: `${BASE}${g.guidePath}` },
    ],
  }

  return (
    <div className="dark-section min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Nav />

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Hero — honest live-price tracker, led by data */}
        <div className="mb-12">
          <div className="eyebrow mb-4">{`UK ${g.label.toUpperCase()} · LIVE PRICE TRACKER · 2026`}</div>
          <h1 className="heading-section text-[var(--ink)]">
            {`Cheapest ${g.label} UK`}<br />
            <span className="text-[var(--slice-text)]">Live Prices · 2026.</span>
          </h1>
          <p className="text-[var(--ink-dim)] text-lg mt-5 max-w-2xl leading-relaxed">
            {`A live price tracker, not a review — we check UK retailer prices for ${labelLc} and rank them cheapest first. Right now the lowest is the `}
            <Link href={`/${g.route}/${cheapest.product.slug}`} className="text-[var(--slice-text)] hover:underline">
              {cheapest.product.name}
            </Link>
            {' from '}
            <span className="price-num text-[var(--ink)]">{formatGBP(Math.round(cheapest.fromPrice!))}</span>
            {` (${SEGMENT_LABELS[cheapest.segment!].toLowerCase()}). Across the ${d.priced} ${labelLc} we hold a live price on, prices run from `}
            <span className="price-num text-[var(--ink)]">{lowStr}</span>
            {' to '}
            <span className="price-num text-[var(--ink)]">{highStr}</span>
            {` across ${d.retailerCount} UK retailers, in ${segWords} condition.`}
          </p>
          <p className="meta text-[var(--ink-faint)] mt-4">
            {lastChecked ? `Last checked: ${lastChecked} · ${coverageLine}.` : `${coverageLine}.`}
          </p>
          <div className="mt-6">
            <Link href={`/${g.route}`} className="meta text-[var(--slice-text)] hover:underline">
              {`See all ${d.tracked} ${labelLc} →`}
            </Link>
          </div>
        </div>

        {/* Rundown — every priced product, cheapest first (factual, no quality verdicts) */}
        <Reveal className="mist">
          <h2 className="font-display text-xl md:text-2xl font-semibold text-[var(--ink)] mb-2">
            {`Cheapest ${labelLc} ranked`}
          </h2>
          <p className="meta text-[var(--ink-dim)] mb-5">{`Every ${g.singular} we hold a live price on, lowest first.`}</p>
          <div className="space-y-2">
            {pricedEntries.map((e, i) => (
              <Link
                key={e.product.id}
                href={`/${g.route}/${e.product.slug}`}
                className="group card card-interactive p-4 slice-bar flex items-baseline justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="font-display font-semibold text-[var(--ink)] text-sm group-hover:text-[var(--slice-text)] transition-colors truncate">
                    {e.product.name}
                  </div>
                  <div className="meta text-[var(--ink-dim)] mt-1">
                    {i === 0 ? `Lowest live price · ${conditionNote(e)}` : conditionNote(e)}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="meta">from </span>
                  <span className="price-num text-base text-[var(--ink)]">{formatGBP(Math.round(e.fromPrice!))}</span>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>

        {/* Biggest buying decision — factual, informational (no fabricated testing/picks) */}
        <Reveal className="mist mist-high mt-12">
          <h2 className="font-display text-xl md:text-2xl font-semibold text-[var(--ink)] mb-3">
            {g.keyDecision.heading}
          </h2>
          <p className="text-[var(--ink-dim)] text-base leading-relaxed max-w-3xl">{g.keyDecision.body}</p>
        </Reveal>

        {/* Buying considerations */}
        <Reveal className="mist mist-wide mt-12">
          <h2 className="font-display text-xl md:text-2xl font-semibold text-[var(--ink)] mb-5">
            {`What else moves the price on a ${g.singular}`}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {g.considerations.map(c => (
              <div key={c.heading} className="card p-5">
                <div className="font-display font-semibold text-[var(--ink)] text-sm mb-2">{c.heading}</div>
                <p className="text-[var(--ink-dim)] text-sm leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* FAQ */}
        <Reveal className="mist mt-12">
          <h2 className="font-display text-xl md:text-2xl font-semibold text-[var(--ink)] mb-5">
            {`${g.label} price FAQ`}
          </h2>
          <div className="space-y-3">
            {faqs.map(f => (
              <details key={f.q} className="card p-5">
                <summary className="font-display font-semibold text-[var(--ink)] text-sm cursor-pointer">{f.q}</summary>
                <p className="text-[var(--ink-dim)] text-sm leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>

        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <Link href={`/${g.route}`} className="meta text-[var(--slice-text)] hover:underline">
            {`See all ${labelLc} prices →`}
          </Link>
          <span className="meta text-[var(--ink-dim)]">{'  ·  '}</span>
          <Link href="/sale-timing" className="meta text-[var(--slice-text)] hover:underline">
            When to buy: UK sale timing &rarr;
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
