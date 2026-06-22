import { cache } from 'react'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { pageMetadata } from '@/lib/seo'
import { formatGBP } from '@/lib/utils'
import {
  defaultSegment,
  cheapestForSegment,
  availableSegments,
  trustedForHero,
  SEGMENT_LABELS,
  type ConditionSegment,
} from '@/lib/conditionSlices'
import type { Listing, Product } from '@/types'

// Buying-guide hubs are built ONLY for categories with enough live priced data to
// be genuinely useful (helpful-content bar). TVs are intentionally absent: only a
// couple of the tracked sets carry a live price, too thin for a credible "best" hub.
export interface GuideConfig {
  category: string
  route: string // category page route prefix, e.g. 'phones'
  guidePath: string // e.g. '/best-phones-uk'
  label: string // plural, e.g. 'Phones'
  singular: string // e.g. 'phone'
  considerations: { heading: string; body: string }[]
}

export const GUIDES: GuideConfig[] = [
  {
    category: 'phone', route: 'phones', guidePath: '/best-phones-uk', label: 'Phones', singular: 'phone',
    considerations: [
      { heading: 'Storage and age set the price', body: 'On any given handset, the jump between storage tiers and the model year move the price far more than colour or condition. A one-generation-old flagship is usually the value sweet spot.' },
      { heading: 'New, refurbished or used', body: 'Refurbished phones from graded sellers are tested and typically come with a warranty, sitting between new and used on price. Used (e.g. CEX) is cheapest but graded cosmetically — check the grade before buying.' },
      { heading: 'SIM-free keeps it flexible', body: 'Buying SIM-free and pairing a SIM-only deal almost always beats a bundled contract over two years, and lets you switch networks freely.' },
    ],
  },
  {
    category: 'laptop', route: 'laptops', guidePath: '/best-laptops-uk', label: 'Laptops', singular: 'laptop',
    considerations: [
      { heading: 'Chip, RAM and SSD drive cost', body: 'The processor generation, memory and storage are the biggest price levers. For most people 16GB RAM and a 512GB SSD is the comfortable middle; paying for the top chip rarely pays back unless you do sustained heavy work.' },
      { heading: 'Refurbished business laptops punch above their price', body: 'Ex-corporate machines are often refurbished to a high standard and heavily discounted. Refurbished and used options frequently undercut new by a wide margin.' },
    ],
  },
  {
    category: 'tablet', route: 'tablets', guidePath: '/best-tablets-uk', label: 'Tablets', singular: 'tablet',
    considerations: [
      { heading: 'Storage and connectivity', body: 'Storage tier and whether a tablet has cellular (as well as Wi-Fi) are the main price drivers. Wi-Fi-only models are cheaper and suit home use; cellular is worth it only if you need data away from Wi-Fi.' },
      { heading: 'Refurbished is well supported', body: 'Tablets hold up well second-hand. Refurbished and used units can save a lot versus new — check the condition grade and remaining warranty.' },
    ],
  },
  {
    category: 'headphones', route: 'headphones', guidePath: '/best-headphones-uk', label: 'Headphones', singular: 'pair of headphones',
    considerations: [
      { heading: 'Features drive the price', body: 'Active noise cancellation, wireless range and codec support are what separate the tiers. Last-generation flagships often deliver most of the experience for noticeably less.' },
      { heading: 'New, refurbished and used', body: 'Refurbished sets are tested and usually warrantied. With in-ear models in particular, many buyers prefer new or refurbished over used for hygiene reasons — the choice is yours and we surface every condition we can price.' },
    ],
  },
  {
    category: 'smartwatch', route: 'smartwatches', guidePath: '/best-smartwatches-uk', label: 'Smartwatches', singular: 'smartwatch',
    considerations: [
      { heading: 'Size and connectivity', body: 'Case size and whether the watch has cellular/LTE (versus GPS only) are the main price levers. GPS-only models are cheaper and pair to your phone for notifications.' },
      { heading: 'Check battery health when buying used', body: 'Smartwatch batteries degrade with charge cycles, so on used units it is worth checking the grade and battery condition. Refurbished options are tested and sit between new and used.' },
    ],
  },
  {
    category: 'monitor', route: 'monitors', guidePath: '/best-monitors-uk', label: 'Monitors', singular: 'monitor',
    considerations: [
      { heading: 'Panel, resolution and refresh rate', body: 'Panel type (IPS/VA/OLED), resolution and refresh rate set both the use-case and the price. High-refresh panels suit gaming; colour-accurate IPS/OLED suit creative work; 4K suits detail and desktop space.' },
      { heading: 'Used monitors can be great value', body: 'Monitors last for years, so used and refurbished units are often strong value. When buying used it is worth confirming the panel condition (e.g. dead pixels) and that the stand is included.' },
    ],
  },
]

export function getGuide(category: string): GuideConfig | undefined {
  return GUIDES.find(g => g.category === category)
}

type GuideListing = Pick<Listing, 'price_gbp' | 'condition' | 'in_stock' | 'retailer_id'>
type GuideProduct = Product & { listings: GuideListing[] }

export interface GuideEntry {
  product: GuideProduct
  fromPrice: number | null
  segment: ConditionSegment | null
  segmentsPresent: ConditionSegment[]
}

export interface GuideData {
  entries: GuideEntry[] // sorted: priced ascending, then unpriced
  cheapest: GuideEntry | null
  low: number | null
  high: number | null
  tracked: number
  priced: number
  retailerCount: number
  segmentsPresent: ConditionSegment[]
}

// Same price resolution as the category cards / Pass-1 ItemList — one path only.
function resolve(product: GuideProduct): GuideEntry {
  const inStock = (product.listings ?? []).filter(l => l.in_stock) as Listing[]
  // S22d trust-gate: a headphones product with no non-eBay anchor never headlines a
  // price (hero, ranked list, category meta all read this) — resolves to unpriced.
  const trusted = trustedForHero(inStock, product.category)
  const segment = trusted ? defaultSegment(inStock) : null
  const fromPrice = segment ? cheapestForSegment(inStock, segment)?.price_gbp ?? null : null
  return { product, fromPrice, segment, segmentsPresent: availableSegments(inStock) }
}

export const getGuideData = cache(async (category: string): Promise<GuideData> => {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('products')
    .select('*, listings(price_gbp, condition, in_stock, retailer_id)')
    .eq('category', category)

  const products = (data ?? []) as GuideProduct[]
  const entries = products.map(resolve).sort((a, b) => {
    if (a.fromPrice == null && b.fromPrice == null) return a.product.name.localeCompare(b.product.name)
    if (a.fromPrice == null) return 1
    if (b.fromPrice == null) return -1
    return a.fromPrice - b.fromPrice
  })

  const pricedEntries = entries.filter(e => e.fromPrice != null)
  const prices = pricedEntries.map(e => e.fromPrice!) as number[]
  const retailers = new Set<string>()
  const segs = new Set<ConditionSegment>()
  for (const p of products) {
    for (const l of p.listings ?? []) {
      if (l.in_stock && l.price_gbp > 0) {
        if (l.retailer_id) retailers.add(l.retailer_id)
      }
    }
    for (const s of resolve(p).segmentsPresent) segs.add(s)
  }

  return {
    entries,
    cheapest: pricedEntries[0] ?? null,
    low: prices.length ? Math.min(...prices) : null,
    high: prices.length ? Math.max(...prices) : null,
    tracked: products.length,
    priced: pricedEntries.length,
    retailerCount: retailers.size,
    segmentsPresent: (['new', 'refurbished', 'used'] as ConditionSegment[]).filter(s => segs.has(s)),
  }
})

export async function buildGuideMetadata(category: string): Promise<Metadata> {
  const g = getGuide(category)
  if (!g) return {}
  const d = await getGuideData(category)
  const cheapestLine = d.cheapest?.fromPrice != null ? `cheapest from ${formatGBP(Math.round(d.cheapest.fromPrice))}, ` : ''
  return pageMetadata({
    title: `Best & Cheapest ${g.label} UK 2026`,
    description: `Compare the best and cheapest ${g.label.toLowerCase()} in the UK — ${cheapestLine}${d.priced} tracked across ${d.retailerCount} retailers, new, refurbished and used. Live prices, updated daily.`,
    path: g.guidePath,
  })
}
