'use client'

import type { Listing } from '@/types'

const CONDITION_LABELS: Record<string, string> = {
  new: 'New',
  certified_refurbished: 'Certified Refurb',
  refurbished: 'Refurbished',
  used: 'Used',
}

const CONDITION_STYLES: Record<string, string> = {
  new: 'bg-[rgba(79,110,247,0.14)] text-[#8BA5FF] border-[rgba(79,110,247,0.22)]',
  certified_refurbished: 'bg-[var(--savings-dim)] text-[var(--savings)] border-[rgba(0,255,133,0.2)]',
  refurbished: 'bg-[var(--risk-dim)] text-[var(--risk)] border-[rgba(255,181,32,0.2)]',
  used: 'bg-[rgba(90,90,138,0.15)] text-white/70 border-[rgba(90,90,138,0.25)]',
}

function formatGBP(n: number) {
  return '\u00A3' + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function PriceTable({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 text-center">
        <div className="w-10 h-10 rounded-xl bg-[var(--slice-dim)] flex items-center justify-center mx-auto mb-4">
          <span className="text-[var(--slice)] text-lg">&loz;</span>
        </div>
        <div className="font-display font-bold text-white mb-2">Live prices loading</div>
        <div className="text-sm text-white/70 max-w-xs mx-auto">
          We&apos;re pulling prices from 11 UK retailers. Check back shortly, or scroll down to see every saving layer available right now.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
        <div className="font-display font-bold text-white text-sm">Retailer prices</div>
        <div className="text-xs text-white/70">{(() => {
          const pricedCount = listings.filter(l => l.price_gbp > 0).length
          const searchCount = listings.filter(l => l.price_gbp === 0).length
          return <>{pricedCount} price{pricedCount !== 1 ? 's' : ''}{searchCount > 0 ? ` \u00B7 ${searchCount} retailer${searchCount !== 1 ? 's' : ''} to check` : ' \u00B7 sorted by price'}</>
        })()}</div>
      </div>

      {(() => {
        const sortedListings = [...listings].sort((a, b) => {
          if (a.price_gbp === 0 && b.price_gbp > 0) return 1
          if (a.price_gbp > 0 && b.price_gbp === 0) return -1
          return a.price_gbp - b.price_gbp
        })
        const firstUnpricedIndex = sortedListings.findIndex(l => l.price_gbp === 0)

        return sortedListings.map((listing, i) => {
          const retailer = listing.retailer
          const isSearchLink = listing.price_gbp === 0
          const conditionStyle = CONDITION_STYLES[listing.condition] ?? CONDITION_STYLES.used
          return (
            <div key={listing.id}>
              {i === firstUnpricedIndex && firstUnpricedIndex > 0 && (
                <div className="text-[10px] uppercase tracking-widest text-white/40 px-5 py-2 border-t border-white/5">
                  Also available new &mdash; check retailer for price
                </div>
              )}
              <div
                className={`flex items-center gap-4 px-5 py-4 slice-bar transition-colors hover:bg-[rgba(255,255,255,0.02)] ${i < sortedListings.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-[var(--ink)] truncate">
                      {retailer?.name ?? 'Unknown retailer'}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${conditionStyle}`}>
                      {isSearchLink ? 'New' : (CONDITION_LABELS[listing.condition] ?? listing.condition)}
                    </span>
                    {!isSearchLink && listing.condition_grade && (
                      <span className="text-[10px] text-white/70 bg-[var(--surface-2)] border border-[var(--border)] px-2 py-0.5 rounded">
                        Grade {listing.condition_grade.charAt(0).toUpperCase() + listing.condition_grade.slice(1)}
                      </span>
                    )}
                  </div>
                  {isSearchLink ? (
                    <div className="text-xs text-white/50">Check site for current price</div>
                  ) : (
                    retailer?.warranty_years && listing.condition !== 'used' ? (
                      <div className="text-[11px] text-white/70">{retailer.warranty_years}-year warranty</div>
                    ) : null
                  )}
                </div>

                <div className="text-right shrink-0">
                  {isSearchLink ? (
                    <a
                      href={listing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-base font-medium text-[var(--slice)] hover:underline"
                    >
                      Check price &rarr;
                    </a>
                  ) : (
                    <>
                      <div className="font-mono text-xl font-medium text-white">{formatGBP(listing.price_gbp)}</div>
                      <div className="text-[11px] text-white/70 mt-0.5">
                        {new Date(listing.scraped_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                    </>
                  )}
                </div>

                {listing.affiliate_link && !isSearchLink && (
                  <a
                    href={listing.affiliate_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-4 py-2 bg-[var(--slice)] text-[var(--void)] text-xs font-display font-bold rounded-lg hover:opacity-90 transition-opacity"
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
