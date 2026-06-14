import { createServerSupabaseClient } from '@/lib/supabase-server'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import type { Product, Listing } from '@/types'
import { formatSpec } from '@/lib/specs'
import { defaultSegment, cheapestForSegment } from '@/lib/conditionSlices'
import { formatGBP } from '@/lib/utils'
import Reveal from '@/components/Reveal'

// Category cards pull only the listing fields the pricing helpers read.
type CardListing = Pick<Listing, 'price_gbp' | 'condition' | 'in_stock'>
type ProductWithListings = Product & { listings: CardListing[] }

const CATEGORY_ROUTES: Record<string, string> = {
  laptop: 'laptops',
  phone: 'phones',
  tablet: 'tablets',
  tv: 'tvs',
  monitor: 'monitors',
  headphones: 'headphones',
  smartwatch: 'smartwatches',
}

interface CategoryIndexProps {
  category: string
  title: string
  singular?: string
  description: string
  labelOverride?: string
  headlineOverride?: React.ReactNode
}

export default async function CategoryIndex({ category, title, singular, description, labelOverride, headlineOverride }: CategoryIndexProps) {
  const supabase = await createServerSupabaseClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, listings(price_gbp, condition, in_stock)')
    .eq('category', category)
    .order('brand', { ascending: true })

  const grouped = (products ?? []).reduce<Record<string, ProductWithListings[]>>((acc, p) => {
    const prod = p as ProductWithListings
    if (!acc[prod.brand]) acc[prod.brand] = []
    acc[prod.brand].push(prod)
    return acc
  }, {})

  const routePrefix = CATEGORY_ROUTES[category] ?? category + 's'

  return (
    <div className="dark-section min-h-screen">
      <Nav />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 py-12 md:py-16">
        <div className="mb-12">
          <div className="eyebrow mb-4">{labelOverride ?? `UK ${title.toUpperCase()} COMPARISON`}</div>
          {headlineOverride ?? (
            <h1 className="heading-section text-[var(--ink)]">
              Every {singular ?? title.toLowerCase()}.<br />
              <span className="text-[var(--slice-text)]">Every saving.</span>
            </h1>
          )}
          <p className="text-[var(--ink-dim)] text-lg mt-5 max-w-xl leading-relaxed">{description}</p>
        </div>

        <div className="space-y-10">
          {Object.entries(grouped).map(([brand, brandProducts], gi) => (
            <Reveal key={brand} delay={Math.min(gi * 70, 350)} className={['mist', 'mist mist-high', 'mist mist-wide'][gi % 3]}>
              <div className="label text-[var(--ink-dim)] mb-4 border-b border-[var(--border)] pb-3">
                {brand}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {brandProducts.map(product => {
                  // Mirror the detail page: defaultSegment() then cheapest in that
                  // segment. Only in-stock listings; helpers exclude price_gbp = 0.
                  const inStockListings = (product.listings ?? []).filter(l => l.in_stock)
                  const seg = defaultSegment(inStockListings as Listing[])
                  const fromPrice = seg
                    ? cheapestForSegment(inStockListings as Listing[], seg)?.price_gbp ?? null
                    : null
                  return (
                  <Link
                    key={product.id}
                    href={`/${routePrefix}/${product.slug}`}
                    className="group card card-interactive p-4 slice-bar"
                  >
                    <div className="font-display font-semibold tracking-wide text-[var(--ink)] text-sm mb-2 group-hover:text-[var(--slice-text)] transition-colors">
                      {product.name}
                    </div>
                    {product.specs && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(product.specs)
                          .map(([key, val]) => ({ key, label: formatSpec(key, val) }))
                          .filter((s): s is { key: string; label: string } => s.label !== null)
                          .slice(0, 3)
                          .map(({ key, label }) => (
                            <span key={key} className="meta text-[var(--ink-dim)] bg-[rgba(255,255,255,0.03)] border border-[var(--border-2)] px-2 py-0.5 rounded">
                              {label}
                            </span>
                          ))}
                      </div>
                    )}
                    {fromPrice != null && (
                      <div className="mt-3">
                        <span className="meta">from </span>
                        <span className="price-num text-base text-[var(--ink)]">{formatGBP(Math.round(fromPrice))}</span>
                        {seg && seg !== 'new' && <span className="meta">{' · '}{seg}</span>}
                      </div>
                    )}
                    <div className="meta text-[var(--slice-text)] mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      Compare prices &rarr;
                    </div>
                  </Link>
                  )
                })}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
