import type { Condition, DiscountLayer, Listing } from '@/types'

// The product page collapses the 4 DB conditions into 3 user-facing segments.
// certified_refurbished and refurbished both present as "Refurbished".
export type ConditionSegment = 'new' | 'refurbished' | 'used'

export const SEGMENT_LABELS: Record<ConditionSegment, string> = {
  new: 'New',
  refurbished: 'Refurbished',
  used: 'Used',
}

// Order segments always render in: New, Refurbished, Used.
const SEGMENT_ORDER: ConditionSegment[] = ['new', 'refurbished', 'used']

export function conditionToSegment(condition: Condition): ConditionSegment {
  if (condition === 'new') return 'new'
  if (condition === 'used') return 'used'
  return 'refurbished' // refurbished | certified_refurbished
}

// A listing counts toward a segment's toggle presence only if it is PRICED
// (price_gbp > 0). Search-link rows (price 0) never define a segment.
export function availableSegments(listings: Listing[]): ConditionSegment[] {
  const present = new Set<ConditionSegment>()
  for (const l of listings) {
    if (l.price_gbp > 0) present.add(conditionToSegment(l.condition))
  }
  return SEGMENT_ORDER.filter(s => present.has(s))
}

// Cheapest priced listing within a segment.
export function cheapestForSegment(
  listings: Listing[],
  segment: ConditionSegment
): Listing | null {
  return (
    listings
      .filter(l => l.price_gbp > 0 && conditionToSegment(l.condition) === segment)
      .sort((a, b) => a.price_gbp - b.price_gbp)[0] ?? null
  )
}

// Default selection: New if a New price exists; otherwise the cheapest
// available condition (the segment whose lowest price is lowest overall).
export function defaultSegment(listings: Listing[]): ConditionSegment | null {
  const segments = availableSegments(listings)
  if (segments.length === 0) return null
  if (segments.includes('new')) return 'new'
  return segments
    .map(s => ({ s, price: cheapestForSegment(listings, s)!.price_gbp }))
    .sort((a, b) => a.price - b.price)[0].s
}

// ── Slice → condition applicability (Session 12 spec) ────────────────
//
// trade-in applies to every condition; everything else is New-only.
// `flagged` marks slice types NOT explicitly enumerated in the spec — they are
// defaulted to New-only and surfaced for PM review.
export interface SliceApplicability {
  conditions: ConditionSegment[]
  flagged: boolean
}

const ALL: ConditionSegment[] = ['new', 'refurbished', 'used']
const NEW_ONLY: ConditionSegment[] = ['new']

export const SLICE_APPLICABILITY: Record<string, SliceApplicability> = {
  // Explicitly mapped in the spec
  trade_in:      { conditions: ALL,      flagged: false }, // all conditions
  cashback:      { conditions: NEW_ONLY, flagged: false }, // + retailer New-presence check
  price_match:   { conditions: NEW_ONLY, flagged: false },
  student:       { conditions: NEW_ONLY, flagged: false }, // student/intro/voucher
  signup:        { conditions: NEW_ONLY, flagged: false }, // intro / new-customer
  email:         { conditions: NEW_ONLY, flagged: false }, // voucher / email signup
  credit_card:   { conditions: NEW_ONLY, flagged: false }, // card offer (e.g. Amex intro)
  card_linked:   { conditions: NEW_ONLY, flagged: false }, // card offer
  card_cashback: { conditions: NEW_ONLY, flagged: false }, // card offer
  // Eligibility discounts behave like student discount → New-only
  nhs:           { conditions: NEW_ONLY, flagged: false },
  armed_forces:  { conditions: NEW_ONLY, flagged: false },
  youth_discount:{ conditions: NEW_ONLY, flagged: false },
  key_worker:    { conditions: NEW_ONLY, flagged: false },
  // ── NOT in the spec's explicit list → defaulted New-only + FLAGGED ──
  gift_card:        { conditions: NEW_ONLY, flagged: true }, // gift-card cashback variant
  bnpl:             { conditions: NEW_ONLY, flagged: true }, // buy-now-pay-later financing
  salary_sacrifice: { conditions: NEW_ONLY, flagged: true },
  refurbished:      { conditions: NEW_ONLY, flagged: true }, // "refurbished deal" discount
}

export function sliceApplicability(type: string): SliceApplicability {
  return SLICE_APPLICABILITY[type] ?? { conditions: NEW_ONLY, flagged: true }
}

// Layers that apply to the selected segment.
// Cashback additionally requires the layer's retailer to have a New
// priced/linked presence on this product.
export function applicableLayers(
  layers: DiscountLayer[],
  segment: ConditionSegment,
  listings: Listing[]
): DiscountLayer[] {
  return layers.filter(layer => {
    const app = sliceApplicability(layer.discount_type)
    if (!app.conditions.includes(segment)) return false
    if (layer.discount_type === 'cashback' && layer.retailer_id) {
      const hasNewPresence = listings.some(
        l => l.retailer_id === layer.retailer_id && l.condition === 'new'
      )
      if (!hasNewPresence) return false
    }
    return true
  })
}
