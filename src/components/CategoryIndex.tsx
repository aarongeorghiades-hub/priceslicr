import { createServerSupabaseClient } from '@/lib/supabase-server'
import Nav from '@/components/layout/Nav'
import Link from 'next/link'
import type { Product } from '@/types'
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

interface CategoryIndexProps {
  category: string
  title: string
  singular?: string
  description: string
  labelOverride?: string
}

export default async function CategoryIndex({ category, title, singular, description, labelOverride }: CategoryIndexProps) {
  const supabase = await createServerSupabaseClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('brand', { ascending: true })

  const grouped = (products ?? []).reduce<Record<string, Product[]>>((acc, p) => {
    if (!acc[p.brand]) acc[p.brand] = []
    acc[p.brand].push(p as Product)
    return acc
  }, {})

  const routePrefix = CATEGORY_ROUTES[category] ?? category + 's'

  return (
    <div className="dark-section min-h-screen">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[image:linear-gradient(rgba(0,194,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,194,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <Nav />

      <div className="relative z-10 max-w-6xl mx-auto px-12 py-10">
        <div className="mb-10">
          <div className="text-xs tracking-widest text-[var(--ink)] opacity-80 mb-3">{labelOverride ?? `UK ${title.toUpperCase()} COMPARISON`}</div>
          <h1 className="font-display text-5xl font-extrabold text-white leading-tight">
            Every {singular ?? title.toLowerCase()}.<br />
            <span className="text-[var(--slice)]">Every saving.</span>
          </h1>
          <p className="text-[var(--ink)] opacity-80 text-lg mt-4 max-w-xl">{description}</p>
        </div>

        <div className="space-y-8">
          {Object.entries(grouped).map(([brand, brandProducts]) => (
            <div key={brand}>
              <div className="text-xs uppercase tracking-widest text-[var(--ink)] opacity-80 mb-4 font-medium border-b border-[var(--border)] pb-3">
                {brand}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {brandProducts.map(product => (
                  <Link
                    key={product.id}
                    href={`/${routePrefix}/${product.slug}`}
                    className="group bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--slice)] hover:-translate-y-1 transition-all duration-200 slice-bar"
                  >
                    <div className="font-display font-semibold tracking-wide text-white text-sm mb-2 group-hover:text-[var(--slice)] transition-colors">
                      {product.name}
                    </div>
                    {product.specs && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(product.specs)
                          .map(([key, val]) => ({ key, label: formatSpec(key, val) }))
                          .filter((s): s is { key: string; label: string } => s.label !== null)
                          .slice(0, 3)
                          .map(({ key, label }) => (
                            <span key={key} className="text-[10px] text-[var(--muted)] bg-[rgba(255,255,255,0.03)] border border-[var(--border)] px-2 py-0.5 rounded">
                              {label}
                            </span>
                          ))}
                      </div>
                    )}
                    <div className="text-[11px] text-[var(--slice)] mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      Compare prices &rarr;
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
