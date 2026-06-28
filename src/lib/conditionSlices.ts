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

// eBay UK retailer id — referenced by the S22d headphones trust-gate.
export const EBAY_RETAILER_ID = '88f4bd85-b743-4750-966f-4a937045fe5e'

// S22d — headphones trust-gate (TRUST/DISPLAY layer, NOT a price test). A
// counterfeit-as-genuine eBay listing (e.g. the £68 AirPods Pro 2) is uncatchable
// by any matcher/price signal, and for some headphones there is no CEX/retailer row
// to anchor against at all. DECISION: in category 'headphones' ONLY, an eBay row may
// not set a product's hero / headline "from" price unless the product ALSO has a
// TRUSTED ANCHOR — any priced (price_gbp > 0) listing from a non-eBay retailer (a CEX
// row counts; a retailer row counts; a price-0 search-link row does NOT). With no such
// anchor, return [] so all hero/from-price resolution yields unpriced (guides/cards/
// meta already render unpriced gracefully — never "From £0"). BINARY anchor-EXISTENCE
// test — no price comparison, ratio, or threshold. Other categories pass through
// untouched. Call this ONLY at hero/headline resolution sites — never on the product
// page's own retailer table, where eBay rows must still show with their labels.
export function trustedForHero(
  listings: Pick<Listing, 'price_gbp' | 'retailer_id'>[],
  category: string
): boolean {
  if (category !== 'headphones') return true
  return listings.some(l => l.price_gbp > 0 && l.retailer_id !== EBAY_RETAILER_ID)
}

// S21 Fix 3 — "new can't be below used" backstop. A genuine NEW unit cannot be
// cheaper than the SAME product in used/refurbished condition; a `new` row that
// is means the matcher attached an accessory or a wrong item (e.g. the eBay
// £77.58 "new" Apple Watch Ultra 2 against a £315 used market). Drop any priced
// `new` listing below the cheapest priced second-hand price for that product, so
// it can neither set the from-price nor force defaultSegment='new'. Applied
// inside the shared helpers below → every surface (cards, product pages, meta,
// guides) is protected by one path. Filters by item-identity/condition logic,
// never a raw price ratio, so genuine-but-cheap used units are untouched.
function dropInvalidNewListings(listings: Listing[]): Listing[] {
  const secondhand = listings.filter(
    l => l.price_gbp > 0 && conditionToSegment(l.condition) !== 'new'
  )
  if (secondhand.length === 0) return listings // nothing to anchor against
  const cheapestSecondhand = Math.min(...secondhand.map(l => l.price_gbp))
  return listings.filter(
    l => !(conditionToSegment(l.condition) === 'new' && l.price_gbp > 0 && l.price_gbp < cheapestSecondhand)
  )
}

// A listing counts toward a segment's toggle presence only if it is PRICED
// (price_gbp > 0). Search-link rows (price 0) never define a segment.
export function availableSegments(listings: Listing[]): ConditionSegment[] {
  const valid = dropInvalidNewListings(listings)
  const present = new Set<ConditionSegment>()
  for (const l of valid) {
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
    dropInvalidNewListings(listings)
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
  signup:        { conditions: ALL,      flagged: false }, // intro / new-customer — applies on used/refurb too
  email:         { conditions: NEW_ONLY, flagged: false }, // voucher / email signup
  credit_card:   { conditions: NEW_ONLY, flagged: false }, // card offer (e.g. Amex intro)
  card_linked:   { conditions: NEW_ONLY, flagged: false }, // card offer
  card_cashback: { conditions: ALL,      flagged: false }, // card offer — your card earns on any condition
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
