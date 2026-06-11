import { notFound } from 'next/navigation'
import Nav from '@/components/layout/Nav'
import PriceTable from '@/components/product/PriceTable'
import SavingsStack from '@/components/product/SavingsStack'
import SaleTiming from '@/components/product/SaleTiming'
import SliceGuide from '@/components/product/SliceGuide'
import Reveal from '@/components/Reveal'
import {
  getProductBySlug,
  getListingsForProduct,
  getAllDiscountLayers,
  getUpcomingSaleEvents,
} from '@/lib/product'
import { formatSpec } from '@/lib/specs'

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

  const cheapestNew = listings.find(l => l.condition === 'new' && l.price_gbp > 0)
  const cheapestRefurb = listings.find(l => l.condition === 'refurbished' && l.price_gbp > 0)
  const cheapestUsed = listings.find(l => l.condition === 'used' && l.price_gbp > 0)

  const routePrefix = CATEGORY_ROUTES[product.category] ?? product.category + 's'
  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category

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
    url: `https://priceslicr.com/${routePrefix}/${slug}`,
    description: `Compare ${product.name} prices across every UK retailer. New, refurbished, and used options with cashback, trade-in, and price match intelligence.`,
  }

  if (listings.length > 0) {
    productSchema.offers = {
      '@type': 'AggregateOffer',
      priceCurrency: 'GBP',
      lowPrice: listings[0]?.price_gbp,
      highPrice: listings[listings.length - 1]?.price_gbp,
      offerCount: listings.length,
      availability: 'https://schema.org/InStock',
      offers: listings.slice(0, 5).map(l => ({
        '@type': 'Offer',
        priceCurrency: 'GBP',
        price: l.price_gbp,
        itemCondition:
          l.condition === 'new'
            ? 'https://schema.org/NewCondition'
            : l.condition === 'certified_refurbished'
            ? 'https://schema.org/RefurbishedCondition'
            : 'https://schema.org/UsedCondition',
        availability: 'https://schema.org/InStock',
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
        item: `https://priceslicr.com/${routePrefix}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.name,
        item: `https://priceslicr.com/${routePrefix}/${slug}`,
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
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(product.specs)
                    .map(([key, val]) => ({ key, label: formatSpec(key, val) }))
                    .filter((s): s is { key: string; label: string } => s.label !== null)
                    .map(({ key, label }) => (
                      <span
                        key={key}
                        className="text-xs text-[var(--ink-dim)] bg-[var(--surface-2)] border border-[var(--border)] px-3 py-1 rounded-[var(--radius-pill)]"
                      >
                        {label}
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Price summary — the single glow element on this page */}
            <div className="shrink-0">
              {(() => {
                const heroListing = [cheapestNew, cheapestRefurb, cheapestUsed]
                  .filter(Boolean)
                  .sort((a, b) => (a?.price_gbp ?? 0) - (b?.price_gbp ?? 0))[0] ?? null
                const heroLabel = heroListing?.condition === 'new' ? 'From (new)'
                  : heroListing?.condition === 'refurbished' ? 'From (refurb)'
                  : heroListing?.condition === 'used' ? 'From (used)'
                  : null
                const conditionPill = heroListing?.condition === 'new' ? 'New'
                  : heroListing?.condition === 'refurbished' ? 'Refurbished'
                  : heroListing?.condition === 'used' ? 'Used'
                  : null
                return heroListing && heroLabel ? (
                  <div className="card glow-slice px-7 py-5 text-right min-w-[200px]">
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <span className="eyebrow">From</span>
                      {conditionPill && (
                        <span className="label text-xs text-[var(--ink-dim)] bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-2 py-0.5">
                          {conditionPill}
                        </span>
                      )}
                    </div>
                    <div className="price-num text-[2.5rem] leading-none text-[var(--slice-text)] savings-glow">
                      &pound;{heroListing.price_gbp.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ) : null
              })()}
              {listings.length === 0 && (
                <div className="label text-[var(--ink-dim)]">Prices loading</div>
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
            <div className="mist"><PriceTable listings={listings} /></div>
          </Reveal>

          {/* Sale timing */}
          {saleEvents.length > 0 && (
            <Reveal as="section">
              <div className="label mb-4">Sale timing</div>
              <div className="mist mist-high"><SaleTiming events={saleEvents} /></div>
            </Reveal>
          )}

          {/* Price match note */}
          <Reveal className="mist mist-wide"><div className="card p-7">
            <div className="heading-card text-[var(--ink)] mb-4">Price match intelligence</div>
            <div className="space-y-3 text-[13px] text-[var(--ink-dim)] leading-relaxed">
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
          <SliceGuide
            layers={relevantLayers}
            productName={product.name}
            bestPrice={cheapestNew?.price_gbp ?? cheapestRefurb?.price_gbp ?? listings[0]?.price_gbp ?? null}
          />
          <Reveal>
            <div className="label mb-2">Savings stack</div>
            <div className="text-[13px] text-[var(--ink-dim)] leading-relaxed">
              Every saving layer available on this product &mdash; stack multiple to reach your lowest price.
            </div>
          </Reveal>
          <div className="mist"><SavingsStack layers={relevantLayers} /></div>
        </aside>
      </div>
    </div>
  )
}
