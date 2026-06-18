import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { getGuideData } from '@/lib/guide'
import { formatGBP } from '@/lib/utils'
import {
  defaultSegment,
  cheapestForSegment,
  availableSegments,
  SEGMENT_LABELS,
  type ConditionSegment,
} from '@/lib/conditionSlices'
import type { Listing } from '@/types'

// Natural-language list join: ["new","used"] -> "new and used".
function andList(words: string[]): string {
  if (words.length <= 1) return words.join('')
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`
}

function conditionWords(segments: ConditionSegment[]): string[] {
  return segments.map(s => SEGMENT_LABELS[s].toLowerCase())
}

// ── Product page metadata ──
// Enriches title/description with the live cheapest "from £X" (same resolution as
// the category cards / Pass-1 ItemList / Pass-2 guides: defaultSegment → cheapest in
// that segment, over in-stock priced listings). NEVER injects retailer/offer count —
// coverage is thin and the count reads weak. Graceful, clean fallback when unpriced.
export function buildProductMetadata({
  name,
  path,
  listings,
}: {
  name: string
  path: string
  listings: Listing[] // in-stock listings (as returned by getListingsForProduct)
}): Metadata {
  const seg = defaultSegment(listings)
  const fromPrice = seg ? cheapestForSegment(listings, seg)?.price_gbp ?? null : null
  const segWords = conditionWords(availableSegments(listings))

  const title =
    fromPrice != null
      ? `${name} Price UK — From ${formatGBP(Math.round(fromPrice))}`
      : `${name} Price Comparison UK`

  const description =
    fromPrice != null
      ? `Compare ${name} prices across UK retailers — cheapest from ${formatGBP(Math.round(fromPrice))}, available ${segWords.length ? andList(segWords) : 'new, refurbished and used'}. Prices updated daily.`
      : `Compare ${name} prices across every UK retailer — new, refurbished and used options. Prices updated daily.`

  return pageMetadata({ title, description, path })
}

// ── Category page metadata ──
// Reuses the cached getGuideData aggregate (same price path) for the category's live
// cheapest and the condition breadth actually present. Lightly enriched with
// commercial modifiers; no retailer/offer count.
export async function buildCategoryMetadata({
  category,
  label,
  path,
}: {
  category: string
  label: string // plural, e.g. 'Phones'
  path: string
}): Promise<Metadata> {
  const d = await getGuideData(category)
  const cheap = d.cheapest?.fromPrice ?? null
  const condWords = d.segmentsPresent.length ? andList(conditionWords(d.segmentsPresent)) : 'new, refurbished and used'
  const labelLc = label.toLowerCase()

  const title = `${label} Price Comparison UK — Cheapest Deals`
  const description =
    cheap != null
      ? `Compare the cheapest ${labelLc} in the UK — deals from ${formatGBP(Math.round(cheap))}, ${condWords}. Prices updated daily.`
      : `Compare the cheapest ${labelLc} in the UK — ${condWords}. Prices updated daily.`

  return pageMetadata({ title, description, path })
}
