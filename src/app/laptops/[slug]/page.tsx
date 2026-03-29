import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Nav from '@/components/layout/Nav'
import PriceTable from '@/components/product/PriceTable'
import SavingsStack from '@/components/product/SavingsStack'
import SaleTiming from '@/components/product/SaleTiming'
import {
  getProductBySlug,
  getAllProductSlugs,
  getListingsForProduct,
  getAllDiscountLayers,
  getUpcomingSaleEvents,
} from '@/lib/product'

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs()
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return {
    title: `${product.name} — Price Comparison UK`,
    description: `Compare ${product.name} prices across every UK retailer — new, refurbished, and used. Find every available saving: cashback, trade-in, student discounts, price matching, and sale timing. Updated daily.`,
    openGraph: {
      title: `${product.name} — Price Comparison`,
      description: `Find the lowest price on ${product.name} across every UK retailer.`,
      url: `https://priceslicr.com/laptops/${slug}`,
    },
    alternates: {
      canonical: `https://priceslicr.com/laptops/${slug}`,
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

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
    url: `https://priceslicr.com/laptops/${slug}`,
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
        name: 'Laptops',
        item: 'https://priceslicr.com/laptops',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.name,
        item: `https://priceslicr.com/laptops/${slug}`,
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
                <span className="text-xs uppercase tracking-widest text-[var(--muted)]">
                  {product.brand}
                </span>
                <span className="text-[var(--border-2)]">&middot;</span>
                <span className="text-xs text-[var(--muted)]">
                  {product.category}
                </span>
              </div>
              <h1 className="font-display text-4xl font-extrabold text-white leading-tight mb-4">
                {product.name}
              </h1>
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <span
                      key={key}
                      className="text-xs text-[var(--muted)] bg-[rgba(255,255,255,0.04)] border border-[var(--border)] px-3 py-1 rounded-full"
                    >
                      {String(val)}
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
            <div className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4 font-medium">
              Retailer prices
            </div>
            <PriceTable listings={listings} />
          </section>

          {/* Sale timing */}
          {saleEvents.length > 0 && (
            <section>
              <div className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4 font-medium">
                Sale timing
              </div>
              <SaleTiming events={saleEvents} />
            </section>
          )}

          {/* Price match note */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
            <div className="font-display font-bold text-white text-sm mb-3">Price match intelligence</div>
            <div className="space-y-2 text-[11px] text-[var(--muted)] leading-relaxed">
              <div>
                <span className="text-[var(--ink)]">John Lewis NKU policy</span> &mdash; JL will price match to Currys. Buy at JL price, claim Currys price, keep JL&apos;s 2-year guarantee at no extra cost.
              </div>
              <div>
                <span className="text-[var(--ink)]">Currys price match</span> &mdash; Matches any identical in-stock item from a list of approved retailers. Call or chat in-store.
              </div>
              <div>
                <span className="text-[var(--ink)]">Amazon &amp; eBay</span> &mdash; No formal price match policy. Monitor for price drops via camelcamelcamel or eBay saved searches.
              </div>
            </div>
          </div>
        </div>

        {/* Right column — Savings Stack */}
        <aside className="space-y-4 sticky top-24">
          <div className="text-xs uppercase tracking-widest text-[var(--muted)] font-medium">
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
