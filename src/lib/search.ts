// Lightweight client-side product search over the ~102-product catalogue.
// Index entries carry only what the UI needs — no prices, descriptions, or listings.

export type SearchProduct = {
  name: string
  slug: string
  category: string
  brand: string
}

export const CATEGORY_ROUTES: Record<string, string> = {
  laptop: 'laptops',
  phone: 'phones',
  tablet: 'tablets',
  tv: 'tvs',
  monitor: 'monitors',
  headphones: 'headphones',
  smartwatch: 'smartwatches',
}

export const CATEGORY_LABELS: Record<string, string> = {
  laptop: 'Laptops',
  phone: 'Phones',
  tablet: 'Tablets',
  tv: 'TVs',
  monitor: 'Monitors',
  headphones: 'Headphones',
  smartwatch: 'Smartwatches',
}

export function productHref(p: SearchProduct): string {
  return `/${CATEGORY_ROUTES[p.category] ?? p.category}/${p.slug}`
}

/**
 * Case-insensitive match: every typed token must appear as a substring across
 * name + brand + category combined. Ranking: exact name-prefix first, then name
 * substring, then brand/category-only matches. Visible results capped at `limit`.
 */
export function searchProducts(index: SearchProduct[], query: string, limit = 8): SearchProduct[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const tokens = q.split(/\s+/).filter(Boolean)

  const scored: { p: SearchProduct; rank: number }[] = []
  for (const p of index) {
    const nameLower = p.name.toLowerCase()
    const haystack = `${nameLower} ${p.brand.toLowerCase()} ${p.category.toLowerCase()}`
    if (!tokens.every(t => haystack.includes(t))) continue

    let rank: number
    if (nameLower.startsWith(q)) rank = 0
    else if (tokens.every(t => nameLower.includes(t))) rank = 1
    else rank = 2

    scored.push({ p, rank })
  }

  scored.sort(
    (a, b) =>
      a.rank - b.rank ||
      a.p.name.length - b.p.name.length ||
      a.p.name.localeCompare(b.p.name)
  )

  return scored.slice(0, limit).map(s => s.p)
}
