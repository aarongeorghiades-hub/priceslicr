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
  // S23 — the one "biggest buying decision" section per category. Informational/
  // factual only (no fabricated testing, ratings or picks — S20 standing rule).
  keyDecision: { heading: string; body: string }
  // S23 — category-real FAQ Q&As (replace the cross-category boilerplate). Combined
  // in BuyingGuide with the live-data-driven cheapest/range/count answers.
  faqs: { q: string; a: string }[]
}

export const GUIDES: GuideConfig[] = [
  {
    category: 'phone', route: 'phones', guidePath: '/best-phones-uk', label: 'Phones', singular: 'phone',
    considerations: [
      { heading: 'Storage and age set the price', body: 'On any given handset, the jump between storage tiers and the model year move the price far more than colour or condition. A one-generation-old flagship is usually the value sweet spot.' },
      { heading: 'New, refurbished or used', body: 'Refurbished phones from graded sellers are tested and typically come with a warranty, sitting between new and used on price. Used (e.g. CEX) is cheapest but graded cosmetically — check the grade before buying.' },
      { heading: 'SIM-free keeps it flexible', body: 'Buying SIM-free and pairing a SIM-only deal almost always beats a bundled contract over two years, and lets you switch networks freely.' },
    ],
    keyDecision: {
      heading: 'The biggest decision: iOS vs Android',
      body: 'Your platform shapes everything else. iPhones run iOS and stay inside Apple’s ecosystem (iMessage, AirDrop, Apple Watch); recent models get roughly five to six years of iOS updates. Android phones (Samsung, Google, Nothing and others) give far more choice of size and price, and current Samsung Galaxy S and Google Pixel flagships now promise up to seven years of OS and security updates. Pick the platform first, then let budget and storage narrow the model.',
    },
    faqs: [
      { q: 'Should I buy SIM-free or on a contract?', a: 'Buying the phone SIM-free and pairing a separate SIM-only deal almost always costs less over two years than a bundled airtime contract, and it lets you switch network whenever you like. The from-prices on this page are all SIM-free.' },
      { q: 'How long will a phone keep getting updates?', a: 'Recent iPhones receive around five to six years of iOS updates from launch; current Samsung Galaxy S and Google Pixel flagships promise up to seven years of Android OS and security updates. Budget handsets get fewer, so a one-generation-old flagship often outlasts a brand-new budget phone on software support.' },
    ],
  },
  {
    category: 'laptop', route: 'laptops', guidePath: '/best-laptops-uk', label: 'Laptops', singular: 'laptop',
    considerations: [
      { heading: 'Chip, RAM and SSD drive cost', body: 'The processor generation, memory and storage are the biggest price levers. For most people 16GB RAM and a 512GB SSD is the comfortable middle; paying for the top chip rarely pays back unless you do sustained heavy work.' },
      { heading: 'Refurbished business laptops punch above their price', body: 'Ex-corporate machines are often refurbished to a high standard and heavily discounted. Refurbished and used options frequently undercut new by a wide margin.' },
    ],
    keyDecision: {
      heading: 'The biggest decision: Windows, Mac or Chromebook',
      body: 'The operating system decides which apps you can run and how much you pay. Windows laptops span the widest range of prices and software; MacBooks (macOS) are strong on battery life and creative apps but start higher; Chromebooks (ChromeOS) are the cheapest and are built around the browser and web apps — ideal for everyday use but limited for specialist desktop software. Decide which apps you must run, then match the OS.',
    },
    faqs: [
      { q: 'How much RAM and storage do I actually need?', a: 'For everyday use and study, 16GB of RAM with a 512GB SSD is the comfortable middle and ages well. 8GB still handles light browsing and documents; pay for 32GB or the top CPU only if you do sustained video, code or 3D work.' },
      { q: 'Are refurbished business laptops a safe buy?', a: 'Ex-corporate machines are often refurbished to a high standard and heavily discounted, and graded refurbished units usually come with a warranty. Check the grade and remaining warranty — refurbished and used options frequently undercut new by a wide margin.' },
    ],
  },
  {
    category: 'tablet', route: 'tablets', guidePath: '/best-tablets-uk', label: 'Tablets', singular: 'tablet',
    considerations: [
      { heading: 'Storage and connectivity', body: 'Storage tier and whether a tablet has cellular (as well as Wi-Fi) are the main price drivers. Wi-Fi-only models are cheaper and suit home use; cellular is worth it only if you need data away from Wi-Fi.' },
      { heading: 'Refurbished is well supported', body: 'Tablets hold up well second-hand. Refurbished and used units can save a lot versus new — check the condition grade and remaining warranty.' },
    ],
    keyDecision: {
      heading: 'The biggest decision: iPadOS vs Android (and the stylus)',
      body: 'iPads run iPadOS with the widest range of tablet-optimised apps and the Apple Pencil for notes and drawing; Android tablets (Samsung Galaxy Tab and others) are often cheaper, support expandable storage, and Samsung’s models include the S Pen. If you plan to draw or take handwritten notes, check stylus support and whether the pen is included before you choose.',
    },
    faqs: [
      { q: 'Do I need a cellular tablet or is Wi-Fi enough?', a: 'Wi-Fi-only tablets are cheaper and suit home, office and travel wherever you have Wi-Fi or can tether your phone. Pay the cellular premium only if you genuinely need always-on data away from Wi-Fi.' },
      { q: 'Is a tablet a good second-hand buy?', a: 'Tablets take less wear than phones, so they hold up well used. Refurbished and used units can save a lot versus new — check the condition grade, battery health and remaining warranty.' },
    ],
  },
  {
    category: 'headphones', route: 'headphones', guidePath: '/best-headphones-uk', label: 'Headphones', singular: 'pair of headphones',
    considerations: [
      { heading: 'Features drive the price', body: 'Active noise cancellation, wireless range and codec support are what separate the tiers. Last-generation flagships often deliver most of the experience for noticeably less.' },
      { heading: 'New, refurbished and used', body: 'Refurbished sets are tested and usually warrantied. With in-ear models in particular, many buyers prefer new or refurbished over used for hygiene reasons — the choice is yours and we surface every condition we can price.' },
    ],
    keyDecision: {
      heading: 'The biggest decision: over-ear vs in-ear (and ANC)',
      body: 'Over-ear headphones generally offer bigger sound, longer battery life and stronger passive isolation, and suit desk and travel use; true-wireless in-ear buds are far more portable and better for exercise and commuting. Active noise cancelling (ANC) blocks low, constant noise like planes and trains and is worth it for frequent travel — but it raises the price, so it matters less if you mostly listen in quiet rooms.',
    },
    faqs: [
      { q: 'Are wireless earbuds worth it over wired?', a: 'For convenience, yes — true-wireless buds dominate for phones and exercise, and most current phones have no headphone jack. Wired sets still offer the best sound per pound and never need charging. Match the form factor to where you listen most.' },
      { q: 'Should I buy headphones used?', a: 'Refurbished sets are tested and usually warrantied. With in-ear models many buyers prefer new or refurbished for hygiene reasons; over-ear ear-pads can be replaced. We surface every condition we can verify a price for.' },
    ],
  },
  {
    category: 'smartwatch', route: 'smartwatches', guidePath: '/best-smartwatches-uk', label: 'Smartwatches', singular: 'smartwatch',
    considerations: [
      { heading: 'Size and connectivity', body: 'Case size and whether the watch has cellular/LTE (versus GPS only) are the main price levers. GPS-only models are cheaper and pair to your phone for notifications.' },
      { heading: 'Check battery health when buying used', body: 'Smartwatch batteries degrade with charge cycles, so on used units it is worth checking the grade and battery condition. Refurbished options are tested and sit between new and used.' },
    ],
    keyDecision: {
      heading: 'The biggest decision: which ecosystem (and health tracking)',
      body: 'Smartwatches are tied to phone ecosystems. The Apple Watch only pairs with an iPhone; Samsung’s Galaxy Watch works best with Android and is fullest on Samsung phones; Garmin and Fitbit work across both iPhone and Android and lead on multi-day battery and sports tracking. Decide based on your phone, then on whether you want everyday smart features or serious fitness and health tracking.',
    },
    faqs: [
      { q: 'Will any smartwatch work with my phone?', a: 'No — fit it to your phone first. Apple Watch needs an iPhone; Samsung Galaxy Watch is built for Android and fullest on Samsung phones; Garmin and Fitbit are cross-platform. Buying the wrong pairing is the most common smartwatch mistake.' },
      { q: 'Do I need the cellular/LTE version?', a: 'GPS-only models are cheaper and lean on your phone for notifications and data. Cellular/LTE lets the watch call and stream without your phone nearby but costs more up front and usually needs a paid plan — worth it mainly for runners and swimmers who leave the phone behind.' },
    ],
  },
  {
    category: 'monitor', route: 'monitors', guidePath: '/best-monitors-uk', label: 'Monitors', singular: 'monitor',
    considerations: [
      { heading: 'Panel, resolution and refresh rate', body: 'Panel type (IPS/VA/OLED), resolution and refresh rate set both the use-case and the price. High-refresh panels suit gaming; colour-accurate IPS/OLED suit creative work; 4K suits detail and desktop space.' },
      { heading: 'Used monitors can be great value', body: 'Monitors last for years, so used and refurbished units are often strong value. When buying used it is worth confirming the panel condition (e.g. dead pixels) and that the stand is included.' },
    ],
    keyDecision: {
      heading: 'The biggest decision: resolution, size and connectivity',
      body: 'Match the panel to the task. 1440p on a 27-inch screen is the sweet spot for general use and gaming; 4K suits detail work and more desktop space; ultrawides suit side-by-side productivity. For gaming, a high refresh rate (144Hz and up) matters more than pixel count. On connectivity, check the inputs: HDMI 2.1 carries 4K at 120Hz for current consoles, while a single USB-C input can power and display from a laptop over one cable.',
    },
    faqs: [
      { q: 'What size and resolution should I get?', a: '27-inch at 1440p is the comfortable default for most desks; step up to 4K for fine detail and more workspace, or an ultrawide for side-by-side windows. Bigger isn’t always better — viewing distance and desk depth matter.' },
      { q: 'Does a used monitor make sense?', a: 'Monitors last for years, so used and refurbished units are often strong value. When buying used, confirm the panel condition (dead pixels, backlight bleed) and that the stand and cables are included.' },
    ],
  },
]

export function getGuide(category: string): GuideConfig | undefined {
  return GUIDES.find(g => g.category === category)
}

type GuideListing = Pick<Listing, 'price_gbp' | 'condition' | 'in_stock' | 'retailer_id' | 'scraped_at'>
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
  lastChecked: string | null // ISO — latest scraped_at across the category's priced rows
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
    .select('*, listings(price_gbp, condition, in_stock, retailer_id, scraped_at)')
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
  let lastChecked: string | null = null
  for (const p of products) {
    for (const l of p.listings ?? []) {
      if (l.in_stock && l.price_gbp > 0) {
        if (l.retailer_id) retailers.add(l.retailer_id)
        // Latest real scrape timestamp → honest "Last checked" (no asserted cadence).
        if (l.scraped_at && (lastChecked == null || l.scraped_at > lastChecked)) lastChecked = l.scraped_at
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
    lastChecked,
  }
})

// ── S24: Used & Refurbished cornerstone hub — live price snapshot ──
// Cheapest TRUSTED used-or-refurbished price per category, built from the SAME shared
// resolution primitives (trustedForHero gate + cheapestForSegment), never a parallel
// price path. Skips products that fail the trust gate (counterfeit-suspect / no
// non-eBay anchor) and only counts priced (>0) rows, so it can never emit "From £0".
export interface SnapshotRow {
  category: string
  route: string
  guidePath: string
  label: string
  singular: string
  product: { name: string; slug: string } | null
  price: number | null
  segment: 'refurbished' | 'used' | null
}
export interface UsedRefurbSnapshot {
  rows: SnapshotRow[]
  lastChecked: string | null
  lowest: { label: string; price: number } | null
}

export const getUsedRefurbSnapshot = cache(async (): Promise<UsedRefurbSnapshot> => {
  const supabase = await createServerSupabaseClient()
  const cats = GUIDES.map(g => g.category)
  const { data } = await supabase
    .from('products')
    .select('id, name, slug, category, listings(price_gbp, condition, in_stock, retailer_id, scraped_at)')
    .in('category', cats)

  const products = (data ?? []) as GuideProduct[]
  const best: Record<string, { product: { name: string; slug: string }; price: number; segment: 'refurbished' | 'used' }> = {}
  let lastChecked: string | null = null

  for (const p of products) {
    const inStock = (p.listings ?? []).filter(l => l.in_stock) as Listing[]
    for (const l of inStock) {
      if (l.price_gbp > 0 && l.scraped_at && (lastChecked == null || l.scraped_at > lastChecked)) lastChecked = l.scraped_at
    }
    // Trust gate first — never surface an unverifiable / counterfeit-suspect product.
    if (!trustedForHero(inStock, p.category)) continue
    let pick: { price: number; segment: 'refurbished' | 'used' } | null = null
    for (const seg of ['refurbished', 'used'] as const) {
      const c = cheapestForSegment(inStock, seg) // shared: priced-only, drops new-below-used
      if (c && (pick == null || c.price_gbp < pick.price)) pick = { price: c.price_gbp, segment: seg }
    }
    if (pick) {
      const cur = best[p.category]
      if (!cur || pick.price < cur.price) best[p.category] = { product: { name: p.name, slug: p.slug }, ...pick }
    }
  }

  const rows: SnapshotRow[] = GUIDES.map(g => {
    const b = best[g.category]
    return {
      category: g.category, route: g.route, guidePath: g.guidePath, label: g.label, singular: g.singular,
      product: b?.product ?? null, price: b?.price ?? null, segment: b?.segment ?? null,
    }
  })
  const priced = rows.filter(r => r.price != null) as (SnapshotRow & { price: number })[]
  const lowestRow = priced.length ? priced.reduce((a, b) => (b.price < a.price ? b : a)) : null
  return { rows, lastChecked, lowest: lowestRow ? { label: lowestRow.label, price: lowestRow.price } : null }
})

// ── S25 spoke-1: cheapest used/refurbished iPhone — live trusted prices ──
// Per iPhone model, the cheapest TRUSTED price (any condition, honest raw label) via
// the SAME shared primitives (trustedForHero gate + cheapestForSegment). Also surfaces
// the cheapest REFURBISHED iPhone separately, so the article never blurs used vs
// refurbished. Priced-only, trust-gated, never "From £0".
export interface IphoneRow {
  name: string
  slug: string
  price: number
  condition: string // raw DB condition: new | certified_refurbished | refurbished | used
  retailerId: string | null
}
export interface CheapestIphones {
  rows: IphoneRow[] // cheapest-first; trusted-priced only
  count: number
  lastChecked: string | null
  cheapestOverall: IphoneRow | null
  cheapestRefurb: { name: string; slug: string; price: number; condition: string } | null
}

export const getCheapestIphones = cache(async (): Promise<CheapestIphones> => {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('products')
    .select('name, slug, brand, category, listings(price_gbp, condition, in_stock, retailer_id, scraped_at)')
    .eq('category', 'phone')

  const products = (data ?? []) as (GuideProduct & { brand?: string })[]
  const isIphone = (p: { name: string; brand?: string }) => /iphone/i.test(p.name) || p.brand === 'Apple'

  let lastChecked: string | null = null
  let cheapestRefurb: { name: string; slug: string; price: number; condition: string } | null = null
  const rows: IphoneRow[] = []

  for (const p of products) {
    if (!isIphone(p)) continue
    const inStock = (p.listings ?? []).filter(l => l.in_stock) as Listing[]
    for (const l of inStock) {
      if (l.price_gbp > 0 && l.scraped_at && (lastChecked == null || l.scraped_at > lastChecked)) lastChecked = l.scraped_at
    }
    if (!trustedForHero(inStock, p.category)) continue
    let best: Listing | null = null
    for (const seg of ['new', 'refurbished', 'used'] as ConditionSegment[]) {
      const c = cheapestForSegment(inStock, seg)
      if (c && (best == null || c.price_gbp < best.price_gbp)) best = c
    }
    if (best) rows.push({ name: p.name, slug: p.slug, price: best.price_gbp, condition: best.condition, retailerId: best.retailer_id ?? null })
    const refurb = cheapestForSegment(inStock, 'refurbished')
    if (refurb && (cheapestRefurb == null || refurb.price_gbp < cheapestRefurb.price)) {
      cheapestRefurb = { name: p.name, slug: p.slug, price: refurb.price_gbp, condition: refurb.condition }
    }
  }
  rows.sort((a, b) => a.price - b.price)
  return { rows, count: rows.length, lastChecked, cheapestOverall: rows[0] ?? null, cheapestRefurb }
})

export async function buildCheapestIphoneMetadata(): Promise<Metadata> {
  const d = await getCheapestIphones()
  const usedLine = d.cheapestOverall ? `Cheapest right now: ${d.cheapestOverall.name} from ${formatGBP(Math.round(d.cheapestOverall.price))} (${d.cheapestOverall.condition === 'used' ? 'used' : d.cheapestOverall.condition.replace('_', ' ')}).` : ''
  const refurbLine = d.cheapestRefurb ? ` Cheapest refurbished: ${d.cheapestRefurb.name} from ${formatGBP(Math.round(d.cheapestRefurb.price))}.` : ''
  return pageMetadata({
    title: 'Cheapest Used or Refurbished iPhone UK 2026 — Live Prices',
    description: `Live UK prices for used and refurbished iPhones, cheapest first, with the used-vs-refurbished difference explained honestly. ${usedLine}${refurbLine}`.trim(),
    path: '/cheapest-used-refurbished-iphone-uk',
  })
}

export async function buildUsedRefurbMetadata(): Promise<Metadata> {
  const s = await getUsedRefurbSnapshot()
  const fromLine = s.lowest ? ` Cheapest tracked right now: ${s.lowest.label.toLowerCase()} from ${formatGBP(Math.round(s.lowest.price))}.` : ''
  return pageMetadata({
    title: 'Used & Refurbished Tech UK 2026 — Live Prices & Buying Guide',
    description: `How to buy used and refurbished tech in the UK without overpaying or getting burned — CEX grades, eBay conditions and counterfeit risk, used vs refurbished explained, plus the live cheapest verified second-hand price for phones, laptops, tablets, headphones, smartwatches and monitors.${fromLine}`,
    path: '/used-refurbished-tech-uk',
  })
}

export async function buildGuideMetadata(category: string): Promise<Metadata> {
  const g = getGuide(category)
  if (!g) return {}
  const d = await getGuideData(category)
  const cheapestLine = d.cheapest?.fromPrice != null ? `cheapest from ${formatGBP(Math.round(d.cheapest.fromPrice))}, ` : ''
  return pageMetadata({
    title: `Cheapest ${g.label} UK 2026 — Live Prices`,
    description: `Live UK prices for ${g.label.toLowerCase()}, cheapest first — ${cheapestLine}${d.priced} with a live price across ${d.retailerCount} retailers, new, refurbished and used. A price tracker, not a review.`,
    path: g.guidePath,
  })
}
