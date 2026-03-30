'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/layout/Nav'
import HeroDemoCard from '@/components/HeroDemoCard'

export default function HomePage() {

  const [cd, setCd] = useState({ days: 0, hrs: '00', min: '00', sec: '00' })
  useEffect(() => {
    function tick() {
      const bf = new Date('2026-11-27T00:00:00')
      const diff = bf.getTime() - Date.now()
      if (diff < 0) return
      setCd({
        days: Math.floor(diff / 86400000),
        hrs:  String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
        min:  String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        sec:  String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="dark-section min-h-screen">

      {/* Radar background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[image:linear-gradient(rgba(0,194,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,194,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg,transparent,rgba(0,194,255,0.15) 20%,rgba(0,194,255,0.25) 50%,rgba(0,194,255,0.15) 80%,transparent)',
              animation: `radarSweep 8s linear ${i * -2.67}s infinite`,
            }}
          />
        ))}
      </div>

      <Nav />

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-12 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center min-h-[88vh] overflow-hidden">
        {/* Radial glow behind demo card */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,194,255,0.08) 0%, rgba(0,255,133,0.04) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-white/70 mb-6 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <span className="w-6 h-px bg-[var(--slice)]" />
            UK Electronics Price Intelligence
          </div>
          <h1 className="font-display text-6xl font-extrabold leading-[1.05] tracking-[-2px] text-white mb-5 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            Every saving.<br />
            <span className="text-[var(--slice)]">Sliced open.</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-md mb-9 animate-fade-up" style={{ animationDelay: '0.65s' }}>
            Compare every UK electronics retailer &mdash; new, refurbished, used. We cut through to cashback, trade-in, price matching, student rates, and timing. Automatically.
          </p>
          <div className="flex items-center gap-5 animate-fade-up" style={{ animationDelay: '0.8s' }}>
            <Link
              href="/laptops"
              className="px-8 py-4 bg-[var(--slice)] text-[var(--void)] font-display font-bold text-sm rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_40px_rgba(0,194,255,0.45)]"
              style={{ boxShadow: '0 0 28px rgba(0,194,255,0.28)' }}
            >
              Compare now &rarr;
            </Link>
            <span className="text-xs text-[var(--ink)]">No ads. No cookie tricks. Independent.</span>
          </div>
        </div>

        {/* Demo card */}
        <HeroDemoCard />
      </section>

      {/* Stat counters */}
      <div className="relative z-10 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-12 py-10 grid grid-cols-4">
          {[
            { val: '11',   label: 'Retailers covered' },
            { val: '100+', label: 'Products tracked' },
            { val: '30+',  label: 'Saving layers' },
            { val: '£200+', label: 'Avg saving surfaced' },
          ].map((s, i) => (
            <div key={i} className="text-center border-r border-[var(--border)] last:border-0 px-6">
              <div className="font-mono text-4xl font-medium text-white tracking-tight">
                {s.val}
              </div>
              <div className="text-sm text-white/70 mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Countdown */}
      <div className="relative z-10 max-w-6xl mx-auto px-12 py-16">
        <div className="text-xs uppercase tracking-widest text-[var(--ink)] opacity-80 mb-8">Sale timing intelligence</div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7 grid grid-cols-[1fr_auto] gap-10 items-center">
          <div>
            <div className="font-display text-xl font-extrabold text-white mb-2">Black Friday 2026</div>
            <div className="text-sm text-white/70 mb-4">Historically 20&ndash;60% off electronics. Deepest discounts of the year.</div>
            <div className="inline-flex items-center gap-2 text-xs text-[var(--savings)] bg-[var(--savings-dim)] border border-[rgba(0,255,133,0.18)] px-3 py-1.5 rounded-full">
              &#x2B25; Confirmed: 27 November 2026
            </div>
          </div>
          <div className="flex gap-3">
            {[
              { val: String(cd.days), lbl: 'Days',  green: true },
              { val: cd.hrs,          lbl: 'Hrs',   green: false },
              { val: cd.min,          lbl: 'Min',   green: false },
              { val: cd.sec,          lbl: 'Sec',   green: false },
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
      </div>

      <footer className="relative z-10 border-t border-[var(--border)] px-12 py-7 flex justify-between items-center max-w-6xl mx-auto">
        <div className="font-display text-base font-extrabold">
          <span className="text-white">Price</span><span className="text-[var(--slice)]">/Slicr</span>
        </div>
        <div className="text-xs text-white/70">&copy; 2026 PriceSlicr &middot; priceslicr.com &middot; Independent. No retailer funding.</div>
      </footer>
    </div>
  )
}
