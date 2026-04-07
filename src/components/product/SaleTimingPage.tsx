'use client'

import { useState, useEffect } from 'react'
import type { SaleEvent } from '@/types'

function daysUntil(dateString: string): number {
  const target = new Date(dateString)
  const today = new Date()
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const CONFIDENCE_META: Record<string, { label: string; color: string; bg: string; border: string; desc: string }> = {
  confirmed: {
    label: 'Confirmed',
    color: 'text-[var(--savings)]',
    bg: 'bg-[var(--savings-dim)]',
    border: 'border-[rgba(0,255,133,0.2)]',
    desc: 'Date officially announced by retailer or Amazon.',
  },
  expected: {
    label: 'Expected',
    color: 'text-[var(--slice)]',
    bg: 'bg-[var(--slice-dim)]',
    border: 'border-[rgba(0,194,255,0.2)]',
    desc: 'Highly likely based on consistent annual pattern.',
  },
  historical_pattern: {
    label: 'Historical',
    color: 'text-white/70',
    bg: 'bg-[rgba(90,90,138,0.12)]',
    border: 'border-[rgba(90,90,138,0.2)]',
    desc: 'Recurring pattern from previous years, not yet confirmed.',
  },
}

function BuyDecisionHelper({ events }: { events: SaleEvent[] }) {
  const upcoming = events.filter(e => daysUntil(e.expected_start_date) > 0)
  const next = upcoming[0]

  if (!next) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
        <div className="font-display font-bold text-white text-sm mb-2">Should I buy now?</div>
        <div className="text-sm text-white/70">No upcoming confirmed sale events. Prices are stable &mdash; now is a reasonable time to buy.</div>
      </div>
    )
  }

  const days = daysUntil(next.expected_start_date)
  const avgDiscount = Math.round((next.historical_discount_min + next.historical_discount_max) / 2)

  let recommendation: { verdict: string; color: string; rationale: string }

  if (days <= 7) {
    recommendation = {
      verdict: 'Wait \u2014 sale starts imminently',
      color: 'text-[var(--savings)]',
      rationale: `${next.event_name} starts in ${days} day${days !== 1 ? 's' : ''}. Historical discounts of ${next.historical_discount_min}\u2013${next.historical_discount_max}% make waiting worthwhile unless your need is urgent.`,
    }
  } else if (days <= 21) {
    recommendation = {
      verdict: 'Wait if you can',
      color: 'text-[var(--slice)]',
      rationale: `${next.event_name} is ${days} days away. An average saving of ~${avgDiscount}% justifies a short wait if you can hold out.`,
    }
  } else if (days <= 60) {
    recommendation = {
      verdict: 'Your call \u2014 modest wait',
      color: 'text-[var(--risk)]',
      rationale: `${next.event_name} is ${days} days away. If you need to buy now, buy now and stack cashback + trade-in to close most of the gap. If you can wait 2 months, you may save ${next.historical_discount_min}\u2013${next.historical_discount_max}% more.`,
    }
  } else {
    recommendation = {
      verdict: 'Buy now, stack other savings',
      color: 'text-[var(--ink)]',
      rationale: `Next major sale (${next.event_name}) is ${days} days away. That\u2019s too long to wait. Buy now using cashback, trade-in, and price matching to reach your best price today.`,
    }
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
      <div className="text-xs uppercase tracking-widest text-white/70 mb-4 font-medium">
        Should I buy now?
      </div>
      <div className={`font-display text-xl font-extrabold mb-3 ${recommendation.color}`}>
        {recommendation.verdict}
      </div>
      <div className="text-sm text-white/70 leading-relaxed mb-4">
        {recommendation.rationale}
      </div>
      <div className="text-[11px] text-white/70 bg-[rgba(255,255,255,0.03)] border border-[var(--border)] rounded-xl px-4 py-3 leading-relaxed">
        <span className="text-[var(--ink)]">Tip:</span> Whatever you decide, stack your saving layers. Trade-in + portal cashback + price matching can recover 15&ndash;25% of the gap without waiting for a sale.
      </div>
    </div>
  )
}

function LiveCountdown({ event }: { event: SaleEvent }) {
  const [cd, setCd] = useState({ days: 0, hrs: '00', min: '00', sec: '00' })

  useEffect(() => {
    function tick() {
      const target = new Date(event.expected_start_date)
      const diff = target.getTime() - Date.now()
      if (diff <= 0) return
      setCd({
        days: Math.floor(diff / 86400000),
        hrs: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
        min: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        sec: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [event.expected_start_date])

  const conf = CONFIDENCE_META[event.confidence] ?? CONFIDENCE_META.historical_pattern

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7 grid grid-cols-[1fr_auto] gap-10 items-center">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${conf.bg} ${conf.color} ${conf.border}`}>
            {conf.label}
          </span>
        </div>
        <div className="font-display text-2xl font-extrabold text-white mb-2">
          {event.event_name}
        </div>
        <div className="text-sm text-white/70 mb-3 leading-relaxed">
          {event.category_notes || 'Major UK tech sale event.'}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[11px] text-white/70">
            {formatDate(event.expected_start_date)}
            {event.expected_end_date !== event.expected_start_date && (
              <> &rarr; {formatDate(event.expected_end_date)}</>
            )}
          </div>
          <div className={`text-[11px] font-semibold ${conf.color}`}>
            {event.historical_discount_min}&ndash;{event.historical_discount_max}% off historically
          </div>
        </div>
      </div>
      <div className="flex gap-3 shrink-0">
        {[
          { val: String(cd.days), lbl: 'Days', green: true },
          { val: cd.hrs, lbl: 'Hrs', green: false },
          { val: cd.min, lbl: 'Min', green: false },
          { val: cd.sec, lbl: 'Sec', green: false },
        ].map((u, i) => (
          <div key={i} className="text-center bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-5 py-4 min-w-[68px]">
            <div className={`font-mono text-3xl font-medium leading-none ${u.green ? 'text-[var(--savings)] savings-glow' : 'text-white'}`}>
              {u.val}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-white/70 mt-2">{u.lbl}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SaleTimingPage({ events }: { events: SaleEvent[] }) {
  const now = new Date()
  const active = events.filter(e => {
    const start = new Date(e.expected_start_date)
    const end = new Date(e.expected_end_date)
    return start <= now && end >= now
  })
  const upcoming = events.filter(e => new Date(e.expected_start_date) > now)
  const nextEvent = upcoming[0]

  return (
    <div className="space-y-8">

      {/* Active sales */}
      {active.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-widest text-[var(--savings)] mb-4 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--savings)] animate-pulse" />
            Live right now
          </div>
          <div className="space-y-3">
            {active.map(event => {
              const daysLeft = daysUntil(event.expected_end_date)
              const conf = CONFIDENCE_META[event.confidence] ?? CONFIDENCE_META.historical_pattern
              return (
                <div key={event.id} className="bg-[var(--savings-dim)] border border-[rgba(0,255,133,0.2)] rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-display font-extrabold text-[var(--savings)] text-lg mb-1">{event.event_name}</div>
                      {event.category_notes && (
                        <div className="text-sm text-white/70 mb-2">{event.category_notes}</div>
                      )}
                      <div className="text-[11px] text-white/70">
                        Ends {formatDate(event.expected_end_date)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-2xl font-medium text-[var(--savings)] savings-glow">{daysLeft}d left</div>
                      <div className="text-[11px] text-white/70 mt-1">{event.historical_discount_min}&ndash;{event.historical_discount_max}% off</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Countdown to next event */}
      {nextEvent && (
        <div>
          <div className="text-xs uppercase tracking-widest text-white/70 mb-4 font-medium">
            Next sale event
          </div>
          <LiveCountdown event={nextEvent} />
        </div>
      )}

      {/* Buy decision helper */}
      <BuyDecisionHelper events={events} />

      {/* Full calendar */}
      <div>
        <div className="text-xs uppercase tracking-widest text-white/70 mb-4 font-medium">
          Full sale calendar
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)] grid grid-cols-[1fr_auto_auto_auto] gap-4 text-[10px] uppercase tracking-widest text-white/70 font-medium">
            <span>Event</span>
            <span className="text-right">Date</span>
            <span className="text-right hidden md:block">Discount range</span>
            <span className="text-right">Confidence</span>
          </div>
          {events.map((event, i) => {
            const days = daysUntil(event.expected_start_date)
            const isPast = daysUntil(event.expected_end_date) <= 0
            const isActive = days <= 0 && !isPast
            const conf = CONFIDENCE_META[event.confidence] ?? CONFIDENCE_META.historical_pattern

            return (
              <div
                key={event.id}
                className={`px-5 py-4 grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center ${
                  i < events.length - 1 ? 'border-b border-[var(--border)]' : ''
                } ${isActive ? 'bg-[var(--savings-dim)]' : isPast ? 'opacity-50' : ''}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isActive ? 'text-[var(--savings)]' : 'text-[var(--ink)]'}`}>
                      {event.event_name}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-semibold text-[var(--savings)] bg-[var(--savings-dim)] border border-[rgba(0,255,133,0.2)] px-2 py-0.5 rounded animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>
                  {event.category_notes && (
                    <div className="text-[11px] text-white/70 mt-0.5 leading-relaxed">
                      {event.category_notes}
                    </div>
                  )}
                  {event.source_url && (
                    <a
                      href={event.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[var(--slice)] hover:underline mt-0.5 block"
                    >
                      Source &rarr;
                    </a>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-[var(--ink)]">
                    {formatDate(event.expected_start_date)}
                  </div>
                  {event.expected_end_date !== event.expected_start_date && (
                    <div className="text-[10px] text-white/70">
                      &rarr; {formatDate(event.expected_end_date)}
                    </div>
                  )}
                  {!isPast && !isActive && (
                    <div className="text-[10px] text-white/70 mt-0.5">
                      {days}d away
                    </div>
                  )}
                  {isPast && (
                    <div className="text-[10px] text-white/70 mt-0.5">Ended</div>
                  )}
                </div>

                <div className="text-right shrink-0 hidden md:block">
                  <div className="font-mono text-sm text-[var(--ink)]">
                    {event.historical_discount_min}&ndash;{event.historical_discount_max}%
                  </div>
                  <div className="text-[10px] text-white/70">off tech</div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${conf.bg} ${conf.color} ${conf.border}`}>
                    {conf.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Confidence legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          {Object.entries(CONFIDENCE_META).map(([key, meta]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${meta.bg} ${meta.color} ${meta.border}`}>
                {meta.label}
              </span>
              <span className="text-[11px] text-white/70">{meta.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stacking reminder */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
        <div className="font-display font-bold text-white text-sm mb-3">
          Can&apos;t wait? Stack these layers now
        </div>
        <div className="grid grid-cols-2 gap-3 text-[11px] text-white/70 leading-relaxed">
          <div>
            <span className="text-[var(--ink)]">TopCashback / Quidco</span> &mdash; 3&ndash;6% back at Currys and John Lewis. Activate before you buy.
          </div>
          <div>
            <span className="text-[var(--ink)]">Trade-in</span> &mdash; Always stacks. Get a quote from MusicMagpie or Back Market before you buy.
          </div>
          <div>
            <span className="text-[var(--ink)]">John Lewis NKU</span> &mdash; Price match to Currys, keep 2-year guarantee. Recovers ~5% on most models.
          </div>
          <div>
            <span className="text-[var(--ink)]">Amex intro cashback</span> &mdash; 5% for 5 months, capped &pound;125. Pairs with portal cashback at JL and Currys.
          </div>
        </div>
      </div>

    </div>
  )
}
