'use client'

import type { Listing } from '@/types'
import { useCondition } from './ConditionContext'
import { conditionToSegment } from '@/lib/conditionSlices'

const CONDITION_LABELS: Record<string, string> = {
  new: 'New',
  certified_refurbished: 'Certified Refurb',
  refurbished: 'Refurbished',
  used: 'Used',
}

// Single neutral pill treatment — crimson is reserved as the sole accent.
const CONDITION_PILL =
  'label text-xs text-[var(--ink)] bg-[var(--surface-2)] border border-[var(--border-2)] rounded-md px-2 py-0.5'

function formatGBP(n: number) {
  return '£' + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// `gated` mirrors the hero's trust-gate state (S22d trustedForHero) — passed down
// from ProductPage so the table and hero can NEVER disagree. When true, the product
// has no verified (non-eBay-anchored) price: the table must not crown a winner or
// show a hard figure; every row becomes a neutral "check the listing" pointer.
export default function PriceTable({ listings, gated = false }: { listings: Listing[]; gated?: boolean }) {
  const { segment } = useCondition()

  // Priced rows filter to the selected condition. Search-link rows
  // (price_gbp === 0, "Check price →") always remain visible.
  const visible = listings.filter(
    l => l.price_gbp === 0 || conditionToSegment(l.condition) === segment
  )

  if (listings.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="w-11 h-11 rounded-xl bg-[var(--slice-dim)] flex items-center justify-center mx-auto mb-4">
          <span className="text-[var(--slice-text)] text-lg">&loz;</span>
        </div>
        <div className="heading-card text-[var(--ink)] mb-2">Live prices loading</div>
        <div className="text-sm text-[var(--ink-dim)] max-w-xs mx-auto leading-relaxed">
          We&apos;re pulling prices from 11 UK retailers. Check back shortly, or scroll down to see every saving layer available right now.
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
        <div className="heading-card text-[var(--ink)] text-base">Retailer prices</div>
        <div className="label text-[var(--ink-faint)]">{(() => {
          // Trust-gated: no verified price is presented, so claim none. Every visible
          // row (the unverifiable eBay row + search-links) is a "to check" pointer.
          if (gated) {
            const checkCount = visible.length
            return <>{checkCount} retailer{checkCount !== 1 ? 's' : ''} to check</>
          }
          const pricedCount = visible.filter(l => l.price_gbp > 0).length
          const searchCount = visible.filter(l => l.price_gbp === 0).length
          return <>{pricedCount} price{pricedCount !== 1 ? 's' : ''}{searchCount > 0 ? ` · ${searchCount} retailer${searchCount !== 1 ? 's' : ''} to check` : ' · sorted by price'}</>
        })()}</div>
      </div>

      {(() => {
        const sortedListings = [...visible].sort((a, b) => {
          if (a.price_gbp === 0 && b.price_gbp > 0) return 1
          if (a.price_gbp > 0 && b.price_gbp === 0) return -1
          return a.price_gbp - b.price_gbp
        })
        const firstUnpricedIndex = sortedListings.findIndex(l => l.price_gbp === 0)

        return sortedListings.map((listing, i) => {
          const retailer = listing.retailer
          const isSearchLink = listing.price_gbp === 0
          // On a trust-gated product the priced eBay row(s) are the unverifiable rows
          // the gate exists to suppress: show them like a search-link (neutral, no
          // price, no crown), but keep the outbound listing link.
          const priceSuppressed = gated && !isSearchLink
          const asCheck = isSearchLink || priceSuppressed
          const isBest = i === 0 && !isSearchLink && !gated
          return (
            <div key={listing.id}>
              {i === firstUnpricedIndex && firstUnpricedIndex > 0 && (
                <div className="flex items-center gap-3 px-6 py-3 border-t border-[var(--border)]">
                  <span className="h-px flex-1 bg-[var(--border)]" />
                  <span className="eyebrow text-[var(--ink-faint)] whitespace-nowrap">More retailers — check live price</span>
                  <span className="h-px flex-1 bg-[var(--border)]" />
                </div>
              )}
              <div
                className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                  isBest
                    ? 'bg-[var(--slice-dim)] border-l-2 border-l-[var(--slice)]'
                    : 'slice-bar hover:bg-[var(--surface-2)]'
                } ${i < sortedListings.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium truncate ${isSearchLink ? 'text-[var(--ink-dim)]' : 'text-[var(--ink)]'}`}>
                      {retailer?.name ?? 'Unknown retailer'}
                    </span>
                    <span className={CONDITION_PILL}>
                      {isSearchLink ? 'New' : (CONDITION_LABELS[listing.condition] ?? listing.condition)}
                    </span>
                    {!isSearchLink && listing.condition_grade && (
                      <span className={CONDITION_PILL}>
                        Grade {listing.condition_grade.charAt(0).toUpperCase() + listing.condition_grade.slice(1)}
                      </span>
                    )}
                    {isBest && (
                      <span className="label text-xs text-[var(--slice-text)]">Best price</span>
                    )}
                  </div>
                  {asCheck ? (
                    <div className="meta text-[var(--ink-faint)]">
                      {isSearchLink ? 'Check site for current price' : 'Check the listing for current price'}
                    </div>
                  ) : (
                    retailer?.warranty_years && listing.condition !== 'used' ? (
                      <div className="meta text-[var(--ink-dim)]">{retailer.warranty_years}-year warranty</div>
                    ) : null
                  )}
                </div>

                <div className="text-right shrink-0">
                  {asCheck ? (
                    <a
                      href={priceSuppressed ? (listing.affiliate_link ?? listing.url) : listing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="price-num text-sm text-[var(--ink-dim)] hover:text-[var(--ink)] transition-colors"
                    >
                      {priceSuppressed ? 'Check the listing' : 'Check price'} &rarr;
                    </a>
                  ) : (
                    <>
                      <div className={`price-num text-xl ${isBest ? 'text-[var(--slice-text)]' : 'text-[var(--ink)]'}`}>{formatGBP(listing.price_gbp)}</div>
                      <div className="meta text-[var(--ink-faint)] mt-0.5">
                        {new Date(listing.scraped_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                    </>
                  )}
                </div>

                {listing.affiliate_link && !asCheck && (
                  <a
                    href={listing.affiliate_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary shrink-0 px-4 py-2 text-xs"
                  >
                    Buy &rarr;
                  </a>
                )}
              </div>
            </div>
          )
        })
      })()}
    </div>
  )
}
