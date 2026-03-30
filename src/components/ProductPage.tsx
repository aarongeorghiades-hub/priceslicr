import { notFound } from 'next/navigation'
import Nav from '@/components/layout/Nav'
import PriceTable from '@/components/product/PriceTable'
import SavingsStack from '@/components/product/SavingsStack'
import SaleTiming from '@/components/product/SaleTiming'
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

  const cheapestNew = listings.find(l => l.condition === 'new')
  const cheapestRefurb = listings.find(l => l.condition !== 'new')

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

      {/* Radar background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[image:linear-gradient(rgba(0,194,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,194,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <Nav />

      {/* Product header */}
      <div className="relative z-10 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-12 py-10">
          <div className="flex items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs uppercase tracking-widest text-[var(--ink)] opacity-80">
                  {product.brand}
                </span>
                <span className="text-[var(--border-2)]">&middot;</span>
                <span className="text-xs text-[var(--ink)] opacity-80">
                  {categoryLabel}
                </span>
              </div>
              <h1 className="font-display text-4xl font-extrabold text-white leading-tight mb-4">
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
                        className="text-xs text-[var(--muted)] bg-[rgba(255,255,255,0.04)] border border-[var(--border)] px-3 py-1 rounded-full"
                      >
                        {label}
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Price summary */}
            <div className="shrink-0 text-right">
              {cheapestNew && (
                <div className="mb-2">
                  <div className="text-[10px] uppercase tracking-widest text-[var(--muted)] mb-1">From (new)</div>
                  <div className="font-mono text-3xl font-medium text-white">
                    &pound;{cheapestNew.price_gbp.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              )}
              {cheapestRefurb && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[var(--muted)] mb-1">From (refurb)</div>
                  <div className="font-mono text-xl font-medium text-[var(--risk)]">
                    &pound;{cheapestRefurb.price_gbp.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              )}
              {listings.length === 0 && (
                <div className="text-sm text-[var(--muted)]">Prices loading</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-12 py-10 grid grid-cols-[1fr_380px] gap-8 items-start">

        {/* Left column */}
        <div className="space-y-6">

          {/* Price comparison table */}
          <section>
            <div className="text-xs uppercase tracking-widest text-[var(--ink)] opacity-80 mb-4 font-medium">
              Retailer prices
            </div>
            <PriceTable listings={listings} />
          </section>

          {/* Sale timing */}
          {saleEvents.length > 0 && (
            <section>
              <div className="text-xs uppercase tracking-widest text-[var(--ink)] opacity-80 mb-4 font-medium">
                Sale timing
              </div>
              <SaleTiming events={saleEvents} />
            </section>
          )}

          {/* Price match note */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
            <div className="font-display font-bold text-white text-sm mb-3">Price match intelligence</div>
            <div className="space-y-2 text-[11px] text-[var(--ink)] opacity-80 leading-relaxed">
              <div>
                <span className="text-white">John Lewis price match</span> &mdash; JL will price match to major UK retailers including Currys. Buy at JL, claim the lower price, keep JL&apos;s 2-year guarantee at no extra cost.
              </div>
              <div>
                <span className="text-white">Currys price match</span> &mdash; Matches any identical in-stock item from approved retailers. Request in-store, via chat, or by phone.
              </div>
              <div>
                <span className="text-white">Amazon &amp; eBay</span> &mdash; No formal price match policy. Monitor for price drops via camelcamelcamel (Amazon) or eBay saved searches.
              </div>
            </div>
          </div>
        </div>

        {/* Right column — Savings Stack */}
        <aside className="space-y-4 sticky top-24">
          <div className="text-xs uppercase tracking-widest text-[var(--ink)] opacity-80 font-medium">
            Savings stack
          </div>
          <div className="text-[11px] text-[var(--muted)] -mt-2 mb-2 leading-relaxed">
            Every saving layer available on this product &mdash; stack multiple to reach your lowest price.
          </div>
          <SavingsStack layers={relevantLayers} />
        </aside>
      </div>
    </div>
  )
}
