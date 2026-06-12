'use client'

import type { DiscountLayer, Listing } from '@/types'
import { useCondition } from './ConditionContext'
import { applicableLayers, cheapestForSegment } from '@/lib/conditionSlices'
import SliceGuide from './SliceGuide'
import SavingsStack from './SavingsStack'
import Reveal from '@/components/Reveal'

/**
 * Condition-aware savings column. Slices, the slice-guide totals, and the
 * savings stack all follow the selected condition. When a condition has no
 * applicable slices (common for Used), we show a single quiet line instead of
 * an empty section.
 */
export default function SavingsColumn({
  layers,
  listings,
  productName,
}: {
  layers: DiscountLayer[]
  listings: Listing[]
  productName: string
}) {
  const { segment } = useCondition()

  const applicable = applicableLayers(layers, segment, listings)
  const heroListing = cheapestForSegment(listings, segment)
  const bestPrice = heroListing?.price_gbp ?? null

  if (applicable.length === 0) {
    return (
      <Reveal>
        <div className="card p-5">
          <p className="text-[13px] text-[var(--ink-faint)] leading-relaxed">
            Savings like cashback and price matching apply to new purchases.
          </p>
        </div>
      </Reveal>
    )
  }

  return (
    <>
      <SliceGuide layers={applicable} productName={productName} bestPrice={bestPrice} />
      <Reveal>
        <div className="label mb-2">Savings stack</div>
        <div className="text-[13px] text-[var(--ink-dim)] leading-relaxed">
          Every saving layer available on this product &mdash; stack multiple to reach your lowest price.
        </div>
      </Reveal>
      <div className="mist"><SavingsStack layers={applicable} /></div>
    </>
  )
}
