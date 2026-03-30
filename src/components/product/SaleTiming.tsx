'use client'

import type { SaleEvent } from '@/types'

function daysUntil(dateString: string): number {
  const target = new Date(dateString)
  const today = new Date()
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

const CONFIDENCE_STYLES: Record<string, string> = {
  confirmed:          'bg-[var(--savings-dim)] text-[var(--savings)] border-[rgba(0,255,133,0.2)]',
  expected:           'bg-[var(--slice-dim)] text-[var(--slice)] border-[rgba(0,194,255,0.2)]',
  historical_pattern: 'bg-[rgba(90,90,138,0.12)] text-[var(--muted)] border-[rgba(90,90,138,0.2)]',
}

const CONFIDENCE_LABELS: Record<string, string> = {
  confirmed:          'Confirmed',
  expected:           'Expected',
  historical_pattern: 'Historical',
}

export default function SaleTiming({ events }: { events: SaleEvent[] }) {
  if (events.length === 0) return null

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <div className="font-display font-bold text-white text-sm">Sale timing intelligence</div>
        <div className="text-xs text-[var(--ink)] opacity-80 mt-1">Upcoming events where prices historically drop</div>
      </div>

      {events.map((event, i) => {
        const days = daysUntil(event.expected_start_date)
        const confStyle = CONFIDENCE_STYLES[event.confidence] ?? CONFIDENCE_STYLES.historical_pattern
        const confLabel = CONFIDENCE_LABELS[event.confidence] ?? event.confidence
        const isActive = days <= 0 && daysUntil(event.expected_end_date) > 0
        const isPast = daysUntil(event.expected_end_date) <= 0

        return (
          <div
            key={event.id}
            className={`px-5 py-4 ${i < events.length - 1 ? 'border-b border-[var(--border)]' : ''} ${isActive ? 'bg-[var(--savings-dim)]' : ''}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-[var(--ink)]">{event.event_name}</span>
                  {isActive && (
                    <span className="text-[10px] font-semibold text-[var(--savings)] bg-[var(--savings-dim)] border border-[rgba(0,255,133,0.2)] px-2 py-0.5 rounded animate-pulse">
                      LIVE NOW
                    </span>
                  )}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${confStyle}`}>
                    {confLabel}
                  </span>
                </div>
                {event.category_notes && (
                  <div className="text-[11px] text-[var(--muted)]">{event.category_notes}</div>
                )}
                <div className="text-[11px] text-[var(--muted)] mt-1">
                  {new Date(event.expected_start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {event.expected_end_date !== event.expected_start_date && (
                    <> &rarr; {new Date(event.expected_end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                {isPast ? (
                  <div className="text-[11px] text-[var(--muted)]">Ended</div>
                ) : isActive ? (
                  <div className="font-mono text-sm text-[var(--savings)] font-medium">Active</div>
                ) : (
                  <>
                    <div className="font-mono text-2xl font-medium text-white">{days}</div>
                    <div className="text-[10px] text-[var(--muted)]">days away</div>
                  </>
                )}
                <div className="text-[11px] text-[var(--muted)] mt-1">
                  {event.historical_discount_min}&ndash;{event.historical_discount_max}% off
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
