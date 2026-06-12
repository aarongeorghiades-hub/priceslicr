'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/layout/Nav'
import HeroDemoCard from '@/components/HeroDemoCard'
import Reveal from '@/components/Reveal'

// Compute the countdown at render time so the server-rendered HTML shows a real,
// resolved value (never zeros). JS takes over live ticking after hydration.
function computeCountdown(targetISO: string) {
  const diff = new Date(targetISO).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hrs: '00', min: '00', sec: '00' }
  return {
    days: Math.floor(diff / 86400000),
    hrs:  String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
    min:  String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
    sec:  String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
  }
}

const BLACK_FRIDAY_2026 = '2026-11-27T00:00:00'

export default function HomePage() {

  const [cd, setCd] = useState(() => computeCountdown(BLACK_FRIDAY_2026))
  useEffect(() => {
    function tick() {
      setCd(computeCountdown(BLACK_FRIDAY_2026))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="dark-section min-h-screen">

      <Nav />

      {/* Hero */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-center min-h-[78vh] py-20">
        <div>
          <div className="eyebrow mb-7">UK Price Comparison — New · Refurb · Used</div>
          <h1 className="heading-hero text-[var(--ink)] mb-6">
            Never overpay<br />for tech again.
          </h1>
          <p className="text-[var(--ink-dim)] text-lg leading-relaxed max-w-[40ch] mb-10">
            We compare prices across major UK retailers and stack every saving —
            cashback, trade-in, price match, timing — to find your real lowest price.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <Link href="/laptops" className="btn-primary inline-flex items-center justify-center px-9 py-4 text-[0.9375rem]">
              Compare prices &rarr;
            </Link>
            <span className="label text-[var(--ink-faint)]">
              Free to use. No ads, no cookie tricks.
            </span>
          </div>
        </div>

        {/* Demo card — the visual anchor, with the viewport's single soft glow behind it */}
        <div className="relative flex md:justify-end">
          <div
            aria-hidden
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(224,32,32,0.10), transparent 65%)',
              filter: 'blur(50px)',
              transform: 'scale(1.1)',
            }}
          />
          <div className="mist relative z-10 w-full flex md:justify-end">
            <HeroDemoCard />
          </div>
        </div>
      </section>

      {/* Stat counters */}
      <section className="relative z-10 border-t border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-16 grid grid-cols-2 md:grid-cols-4 gap-y-10">
          {[
            { val: '11',    label: 'Retailers covered' },
            { val: '100+',  label: 'Products tracked' },
            { val: '30+',   label: 'Saving layers' },
            { val: '£200+', label: 'Avg saving surfaced' },
          ].map((s, i) => (
            <Reveal key={i} delay={Math.min(i * 70, 350)} className="text-center px-6 md:border-r border-[var(--border)] last:border-0">
              <div className="font-display font-semibold text-4xl md:text-5xl tracking-tight text-[var(--ink)]">{s.val}</div>
              <div className="label mt-3">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Countdown */}
      <Reveal as="section" className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 py-24 md:py-32">
        <div className="label mb-5 text-[var(--ink-faint)]">Sale timing intelligence</div>
        <h2 className="heading-section text-[var(--ink)] mb-10 max-w-2xl">
          Buy at the right moment, not just the right price.
        </h2>
        <div className="mist mist-wide"><div className="card p-7 md:p-9 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 items-center">
          <div>
            <div className="heading-card text-[var(--ink)] mb-2.5">Black Friday 2026</div>
            <div className="text-[var(--ink-dim)] leading-relaxed mb-5 max-w-md">
              Historically 20&ndash;60% off electronics. The deepest discounts of the year.
            </div>
            <div className="inline-flex items-center gap-2 label text-[var(--slice-text)] bg-[var(--slice-dim)] border border-[var(--border-2)] px-3 py-1.5 rounded-[var(--radius-pill)]">
              &#x2B25; Confirmed: 27 November 2026
            </div>
          </div>
          <div className="flex gap-3">
            {[
              { val: String(cd.days), lbl: 'Days', accent: true },
              { val: cd.hrs,          lbl: 'Hrs',  accent: false },
              { val: cd.min,          lbl: 'Min',  accent: false },
              { val: cd.sec,          lbl: 'Sec',  accent: false },
            ].map((u, i) => (
              <div key={i} className="text-center bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 md:px-5 py-4 min-w-[64px]">
                <div suppressHydrationWarning className={`price-num text-3xl leading-none ${u.accent ? 'text-[var(--slice-text)] savings-glow' : 'text-[var(--ink)]'}`}>
                  {u.val}
                </div>
                <div className="label mt-2.5 text-xs text-[var(--ink-faint)]">{u.lbl}</div>
              </div>
            ))}
          </div>
        </div></div>
      </Reveal>

      <footer className="relative z-10 border-t border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-9 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="font-display text-base font-bold">
            <span className="text-[var(--ink)]">Price</span><span className="text-[var(--slice-text)]">/Slicr</span>
          </div>
          <div className="label text-[var(--ink-faint)]">
            &copy; 2026 PriceSlicr &middot; priceslicr.com &middot; Free to use. We may earn a commission when you buy through our links &mdash; it never affects the prices you see.
          </div>
        </div>
      </footer>
    </div>
  )
}
