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

// Honest, data-grounded price position — derived from the live ranking, not a review.
function positionLabel(rank: number, pricedCount: number): string {
  if (rank === 0) return 'Cheapest tracked'
  const q = rank / pricedCount
  if (q < 0.34) return 'Among the lowest priced'
  if (q < 0.67) return 'Mid-range price'
  return 'Premium end'
}

export default async function BuyingGuide({ category }: { category: string }) {
  const g = getGuide(category)
  if (!g) notFound()
  const d = await getGuideData(category)
  if (d.priced === 0) notFound() // guard: never ship a hollow guide

  const cheapest = d.cheapest!
  const lowStr = d.low != null ? formatGBP(Math.round(d.low)) : ''
  const highStr = d.high != null ? formatGBP(Math.round(d.high)) : ''
  const segWords = d.segmentsPresent.map(s => SEGMENT_LABELS[s].toLowerCase()).join(', ')
  const pricedEntries = d.entries.filter(e => e.fromPrice != null)

  // ── FAQ (rendered + FAQPage schema, same source) ──
  const faqs: { q: string; a: string }[] = [
    {
      q: `What's the cheapest ${g.singular} right now?`,
      a: `The cheapest ${g.label.toLowerCase()} we currently track is the ${cheapest.product.name} from ${formatGBP(Math.round(cheapest.fromPrice!))} (${SEGMENT_LABELS[cheapest.segment!].toLowerCase()}). Live prices are refreshed daily, so the leader can change — check the guide for today's figure.`,
    },
    {
      q: `How much do ${g.label.toLowerCase()} cost in the UK?`,
      a: `Across the ${d.priced} ${g.label.toLowerCase()} we currently price, live prices run from ${lowStr} to ${highStr}, drawn from ${d.retailerCount} UK retailers in ${segWords} condition.`,
    },
    {
      q: `Is a refurbished ${g.singular} worth it?`,
      a: d.segmentsPresent.includes('refurbished')
        ? `Refurbished units are tested and usually come with a warranty, sitting between new and used on price — often a strong middle option. We surface refurbished prices alongside new and used wherever a retailer lists them.`
        : `Refurbished stock comes and goes; when a retailer lists a refurbished unit we surface it next to the new and used prices so you can compare the trade-off directly.`,
    },
    {
      q: `When do ${g.label.toLowerCase()} prices drop?`,
      a: `The biggest drops cluster around the major UK sale events — Black Friday, Boxing Day, Prime Day and back-to-school. Our sale-timing guide tracks each event with its typical discount window so you can judge whether to buy now or wait.`,
    },
    {
      q: `How often are these prices updated?`,
      a: `Every listing is refreshed daily from live UK retailer data, so the prices and the cheapest-option ranking on this page reflect current availability rather than a stale snapshot.`,
    },
    {
      q: `How many ${g.label.toLowerCase()} do you compare?`,
      a: `We track ${d.tracked} ${g.label.toLowerCase()} and currently hold a live price on ${d.priced} of them across ${d.retailerCount} retailers, comparing ${segWords} condition side by side.`,
    },
  ]

  // ── JSON-LD: ItemList + FAQPage + BreadcrumbList ──
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best & Cheapest ${g.label} UK 2026`,
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
      { '@type': 'ListItem', position: 2, name: `Best & Cheapest ${g.label} UK 2026`, item: `${BASE}${g.guidePath}` },
    ],
  }

  return (
    <div className="dark-section min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Nav />

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Hero — led by live data */}
        <div className="mb-12">
          <div className="eyebrow mb-4">UK {g.label.toUpperCase()} BUYING GUIDE · 2026</div>
          <h1 className="heading-section text-[var(--ink)]">
            Best &amp; Cheapest {g.label}<br />
            <span className="text-[var(--slice-text)]">in the UK.</span>
          </h1>
          <p className="text-[var(--ink-dim)] text-lg mt-5 max-w-2xl leading-relaxed">
            The cheapest {g.label.toLowerCase()} we track right now is the{' '}
            <Link href={`/${g.route}/${cheapest.product.slug}`} className="text-[var(--slice-text)] hover:underline">
              {cheapest.product.name}
            </Link>{' '}
            from <span className="price-num text-[var(--ink)]">{formatGBP(Math.round(cheapest.fromPrice!))}</span>{' '}
            ({SEGMENT_LABELS[cheapest.segment!].toLowerCase()}). Across {d.priced} live-priced{' '}
            {g.label.toLowerCase()}, prices run from{' '}
            <span className="price-num text-[var(--ink)]">{lowStr}</span> to{' '}
            <span className="price-num text-[var(--ink)]">{highStr}</span> across {d.retailerCount} UK retailers,
            in {segWords} condition. Prices are refreshed daily.
          </p>
          <div className="mt-6">
            <Link href={`/${g.route}`} className="meta text-[var(--slice-text)] hover:underline">
              Compare all {d.tracked} {g.label.toLowerCase()} &rarr;
            </Link>
          </div>
        </div>

        {/* Rundown — every priced product, cheapest first */}
        <Reveal className="mist">
          <h2 className="font-display text-xl md:text-2xl font-semibold text-[var(--ink)] mb-2">
            Cheapest {g.label.toLowerCase()} ranked
          </h2>
          <p className="meta text-[var(--ink-dim)] mb-5">Every {g.label.toLowerCase()} we hold a live price on, lowest first.</p>
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
                    {positionLabel(i, pricedEntries.length)} · {conditionNote(e)}
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

        {/* Buying considerations */}
        <Reveal className="mist mist-high mt-12">
          <h2 className="font-display text-xl md:text-2xl font-semibold text-[var(--ink)] mb-5">
            What to weigh up when buying a {g.singular}
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
        <Reveal className="mist mist-wide mt-12">
          <h2 className="font-display text-xl md:text-2xl font-semibold text-[var(--ink)] mb-5">
            {g.label} price FAQ
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
            See all {g.label.toLowerCase()} prices &rarr;
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
