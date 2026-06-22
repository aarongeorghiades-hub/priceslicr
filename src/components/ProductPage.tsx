import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/layout/Nav'
import PriceTable from '@/components/product/PriceTable'
import SaleTiming from '@/components/product/SaleTiming'
import Reveal from '@/components/Reveal'
import Footer from '@/components/layout/Footer'
import { ConditionProvider } from '@/components/product/ConditionContext'
import HeroPrice, { type SegmentPrice } from '@/components/product/HeroPrice'
import SavingsColumn from '@/components/product/SavingsColumn'
import {
  getProductBySlug,
  getListingsForProduct,
  getAllDiscountLayers,
  getUpcomingSaleEvents,
} from '@/lib/product'
import {
  availableSegments,
  cheapestForSegment,
  conditionToSegment,
  defaultSegment as resolveDefaultSegment,
  trustedForHero,
  SEGMENT_LABELS,
} from '@/lib/conditionSlices'
import { formatSpec } from '@/lib/specs'
import { getGuide } from '@/lib/guide'

const CATEGORY_ROUTES: Record<string, string> = {
  laptop: 'laptops',
  phone: 'phones',
  tablet: 'tablets',
  tv: 'tvs',
  monitor: 'monitors',
  headphones: 'headphones',
  smartwatch: 'smartwatches',
}

const CATEGORY_LABELS: Record<string, string> = {
  laptop: 'Laptops',
  phone: 'Phones',
  tablet: 'Tablets',
  tv: 'TVs',
  monitor: 'Monitors',
  headphones: 'Headphones',
  smartwatch: 'Smartwatches',
}

// Keep the embedded sale calendar relevant to the product's category, plus
// genuinely cross-category tentpole events. The full 12-event calendar lives on
// /sale-timing only.
const CATEGORY_SYNONYMS: Record<string, string[]> = {
  laptop: ['laptop'],
  phone: ['phone'],
  tablet: ['tablet', 'ipad'],
  tv: ['tv', 'television'],
  monitor: ['monitor'],
  headphones: ['headphone', 'earphone', 'earbud', 'audio'],
  smartwatch: ['watch', 'smartwatch', 'wearable'],
}
const GENERAL_SALE_EVENT_RE =
  /black friday|cyber monday|boxing day|prime day|january|spring|summer sale|deal days|back to school/i

function isSaleEventRelevant(
  event: { event_name: string; category_notes: string },
  category: string
): boolean {
  const name = (event.event_name || '').toLowerCase()
  const notes = (event.category_notes || '').toLowerCase()
  // Tentpole / cross-category events apply everywhere.
  if (GENERAL_SALE_EVENT_RE.test(name)) return true
  const syn = CATEGORY_SYNONYMS[category] ?? [category]
  if (syn.some(s => name.includes(s) || notes.includes(s))) return true
  // If the notes single out no category at all, treat the event as general.
  const anyCategoryMentioned = Object.values(CATEGORY_SYNONYMS)
    .flat()
    .some(s => notes.includes(s))
  return !anyCategoryMentioned
}

export default async function ProductPage({ slug }: { slug: string }) {
  const [product, layers, saleEvents] = await Promise.all([
    getProductBySlug(slug),
    getAllDiscountLayers(),
    getUpcomingSaleEvents(),
  ])

  if (!product) notFound()

  const listings = await getListingsForProduct(product.id)

  const retailerIds = new Set(listings.map(l => l.retailer_id))

  const relevantLayers = layers.filter(
    layer => layer.retailer_id === null || retailerIds.has(layer.retailer_id) || listings.length === 0
  )

  // S22d trust-gate: for headphones with no non-eBay anchor, the HERO + JSON-LD must
  // not headline an (unverifiable) eBay price. Gate ONLY the headline path — the
  // retailer PriceTable / SavingsColumn below keep the full ungated `listings`, so
  // eBay rows still show with their condition labels (data not hidden, just not headlined).
  const heroTrusted = trustedForHero(listings, product.category)
  const heroListings = heroTrusted ? listings : []
  // Same single source of truth drives the PriceTable: when the hero is unpriced
  // (trust-gated), the table must not crown a winner or show a hard price either.
  const heroUnpriced = !heroTrusted

  // Condition segments present on this product (priced rows only).
  const segments = availableSegments(heroListings)
  const defaultSeg = resolveDefaultSegment(heroListings)
  const segmentPrices: SegmentPrice[] = segments.map(s => ({
    segment: s,
    label: SEGMENT_LABELS[s],
    price: cheapestForSegment(heroListings, s)!.price_gbp,
  }))

  // Default condition fully resolved server-side — drives the hero price and JSON-LD.
  const defaultHero = defaultSeg ? cheapestForSegment(heroListings, defaultSeg) : null
  const defaultSegListings = defaultSeg
    ? heroListings
        .filter(l => l.price_gbp > 0 && conditionToSegment(l.condition) === defaultSeg)
        .sort((a, b) => a.price_gbp - b.price_gbp)
    : []

  const routePrefix = CATEGORY_ROUTES[product.category] ?? product.category + 's'
  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category
  const guide = getGuide(product.category)

  // Category-relevant sale events, capped at 4 (full calendar is on /sale-timing).
  const relevantSaleEvents = saleEvents
    .filter(e => isSaleEventRelevant(e, product.category))
    .slice(0, 4)

  // Build JSON-LD Product schema
  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    category: product.category,
    url: `https://www.priceslicr.com/${routePrefix}/${slug}`,
    description: `Compare ${product.name} prices across every UK retailer. New, refurbished, and used options with cashback, trade-in, and price match intelligence.`,
  }

  // JSON-LD reflects the DEFAULT condition — its price must match the hero price.
  if (defaultSegListings.length > 0) {
    // priceValidUntil: an HONEST short window tied to the daily price refresh.
    // Take the freshest scraped_at across the shown offers and add 3 days (covers a
    // refresh gap / weekend) — never a hardcoded distant date. Date form (YYYY-MM-DD).
    const latestScraped = defaultSegListings.reduce(
      (max, l) => (l.scraped_at > max ? l.scraped_at : max),
      defaultSegListings[0].scraped_at
    )
    const priceValidUntil = new Date(new Date(latestScraped).getTime() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
    // availability mapped from the listing's in_stock boolean (these rows are already
    // in-stock-filtered upstream, but we map truthfully rather than asserting InStock).
    const availabilityOf = (inStock: boolean) =>
      inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'

    productSchema.offers = {
      '@type': 'AggregateOffer',
      priceCurrency: 'GBP',
      lowPrice: defaultSegListings[0]?.price_gbp,
      highPrice: defaultSegListings[defaultSegListings.length - 1]?.price_gbp,
      offerCount: defaultSegListings.length,
      priceValidUntil,
      availability: availabilityOf(defaultSegListings.some(l => l.in_stock)),
      offers: defaultSegListings.slice(0, 5).map(l => ({
        '@type': 'Offer',
        priceCurrency: 'GBP',
        price: l.price_gbp,
        priceValidUntil,
        itemCondition:
          l.condition === 'new'
            ? 'https://schema.org/NewCondition'
            : l.condition === 'certified_refurbished'
            ? 'https://schema.org/RefurbishedCondition'
            : 'https://schema.org/UsedCondition',
        availability: availabilityOf(l.in_stock),
        seller: {
          '@type': 'Organization',
          name: l.retailer?.name ?? 'UK Retailer',
        },
        url: l.url,
      })),
    }
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: categoryLabel,
        item: `https://www.priceslicr.com/${routePrefix}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.name,
        item: `https://www.priceslicr.com/${routePrefix}/${slug}`,
      },
    ],
  }

  return (
    <div className="dark-section min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Nav />

      <ConditionProvider defaultSegment={defaultSeg ?? 'new'}>

      {/* Product header */}
      <div className="relative z-10 border-b border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div>
              <div className="label mb-4 text-[var(--ink-faint)]">
                {product.brand} &middot; {categoryLabel}
              </div>
              <h1 className="heading-section text-[var(--ink)] mb-5">
                {product.name}
              </h1>
              {guide && (
                <div className="mb-5">
                  <Link href={guide.guidePath} className="meta text-[var(--slice-text)] hover:underline">
                    Best &amp; Cheapest {guide.label} UK 2026 &rarr;
                  </Link>
                </div>
              )}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(product.specs)
                    .map(([key, val]) => ({ key, label: formatSpec(key, val) }))
                    .filter((s): s is { key: string; label: string } => s.label !== null)
                    .map(({ key, label }) => (
                      <span
                        key={key}
                        className="text-xs font-medium text-[var(--ink)] bg-[var(--surface-2)] border border-[var(--border-2)] px-3 py-1 rounded-[var(--radius-pill)]"
                      >
                        {label}
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Price summary — the single glow element on this page */}
            <div className="shrink-0">
              {defaultHero ? (
                <HeroPrice segments={segmentPrices} />
              ) : (
                // S22f — server-rendered/no-store, so a null hero is FINAL, not loading.
                // Honest copy for the deliberately-suppressed (S22d) / genuinely-unpriced
                // state; retailer search-links still render in the PriceTable below.
                <div className="label text-[var(--ink-dim)]">No verified price yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-10 items-start">

        {/* Left column */}
        <div className="space-y-10">

          {/* Price comparison table */}
          <Reveal as="section">
            <div className="label mb-4">Retailer prices</div>
            <div className="mist"><PriceTable listings={listings} gated={heroUnpriced} /></div>
            <div className="label text-[var(--ink-dim)] mt-3">
              We may earn a commission when you buy through our links &mdash; it never affects the prices you see.
            </div>
          </Reveal>

          {/* Sale timing */}
          {relevantSaleEvents.length > 0 && (
            <Reveal as="section">
              <div className="label mb-4">Sale timing</div>
              <div className="mist mist-high"><SaleTiming events={relevantSaleEvents} /></div>
            </Reveal>
          )}

          {/* Price match note */}
          <Reveal className="mist mist-wide"><div className="card p-7">
            <div className="heading-card text-[var(--ink)] mb-4">Price match intelligence</div>
            <div className="space-y-3 text-sm text-[var(--ink-dim)] leading-relaxed">
              <div>
                <span className="text-[var(--ink)] font-medium">John Lewis price match</span> &mdash; JL will price match to major UK retailers including Currys. Buy at JL, claim the lower price, keep JL&apos;s 2-year guarantee at no extra cost.
              </div>
              <div>
                <span className="text-[var(--ink)] font-medium">Currys price match</span> &mdash; Matches any identical in-stock item from approved retailers. Request in-store, via chat, or by phone.
              </div>
              <div>
                <span className="text-[var(--ink)] font-medium">Amazon &amp; eBay</span> &mdash; No formal price match policy. Monitor for price drops via camelcamelcamel (Amazon) or eBay saved searches.
              </div>
            </div>
          </div></Reveal>
        </div>

        {/* Right column — Savings Stack */}
        <aside className="space-y-5 lg:sticky lg:top-24">
          <SavingsColumn
            layers={relevantLayers}
            listings={listings}
            productName={product.name}
          />
        </aside>
      </div>

      </ConditionProvider>
      <Footer />
    </div>
  )
}
