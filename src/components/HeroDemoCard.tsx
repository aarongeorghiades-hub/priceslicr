'use client'

import { useState, useEffect, useRef } from 'react'

// ────────────────────────────────────────────────
// THREE DEMO SCENARIOS (auto-played, switchable via dots)
// ────────────────────────────────────────────────
const DEMO_SCENARIOS = [
  {
    label: 'Best laptop saving',
    product: 'MacBook Air 13” M3',
    specs: '8GB · 256GB · John Lewis',
    condition: 'New',
    originalPrice: 1099.00,
    layers: [
      { icon: '↩', name: 'TopCashback', detail: '3% on electronics at John Lewis', saving: 32.97 },
      { icon: '⇆', name: 'Price match to Currys', detail: 'NKU policy — £1,049 at Currys', saving: 50.00 },
      { icon: '◈', name: 'Amex intro cashback', detail: '5% first 5 months, capped £125', saving: 38.50 },
      { icon: '⇆', name: 'Trade-in: iPhone 13 (Good)', detail: 'MusicMagpie — best offer', saving: 120.00 },
    ],
  },
  {
    label: 'Best phone saving',
    product: 'Samsung Galaxy Z Fold 6',
    specs: '256GB · Currys · Foldable',
    condition: 'New',
    originalPrice: 1799.00,
    layers: [
      { icon: '↩', name: 'TopCashback', detail: '4% on electronics at Currys', saving: 71.96 },
      { icon: '✦', name: 'Samsung Youth Store', detail: 'Age 16–26, photo ID only', saving: 180.00 },
      { icon: '◈', name: 'Amex intro cashback', detail: '5% first 5 months, capped £125', saving: 89.95 },
      { icon: '⇆', name: 'Trade-in: Galaxy S23 (Good)', detail: 'Back Market — best offer', saving: 220.00 },
    ],
  },
  {
    label: 'Best TV saving',
    product: 'LG OLED55C4',
    specs: '55” · 4K OLED · John Lewis',
    condition: 'New',
    originalPrice: 1299.00,
    layers: [
      { icon: '↩', name: 'Quidco', detail: '3.5% on electronics at John Lewis', saving: 45.47 },
      { icon: '⇆', name: 'Price match to Currys', detail: 'NKU policy — £1,199 at Currys', saving: 100.00 },
      { icon: '🎁', name: 'HyperJar gift card', detail: '5% on Currys via HyperJar', saving: 59.95 },
      { icon: '◈', name: 'Amex intro cashback', detail: '5% first 5 months, capped £125', saving: 64.95 },
    ],
  },
]

function formatGBP(n: number) {
  return '£' + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function HeroDemoCard() {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(0)        // layers shown so far
  const [dip, setDip] = useState(false)              // brief price-change dip
  const [hovering, setHovering] = useState(false)    // pause while hovered
  const [autoAdvance, setAutoAdvance] = useState(true) // dots disable this permanently
  const [transitioning, setTransitioning] = useState(false)
  const [reduced, setReduced] = useState(false)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const scenario = DEMO_SCENARIOS[index]
  const N = scenario.layers.length

  const sumFirst = (k: number) => scenario.layers.slice(0, k).reduce((s, l) => s + l.saving, 0)
  const totalSaving = sumFirst(revealed)
  const displayPrice = parseFloat((scenario.originalPrice - totalSaving).toFixed(2))
  const savingPct = Math.round((totalSaving / scenario.originalPrice) * 100)

  // Respect reduced-motion: render the first scenario fully resolved, no timeline.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true)
      setRevealed(DEMO_SCENARIOS[0].layers.length)
    }
  }, [])

  // Tick the "Sliced to" price with a brief scale/opacity dip on each reveal.
  useEffect(() => {
    if (revealed === 0) return
    setDip(true)
    const t = setTimeout(() => setDip(false), 200)
    timeoutsRef.current.push(t)
    return () => clearTimeout(t)
  }, [revealed])

  // Main timeline: reveal layers, then hold and advance (loops).
  useEffect(() => {
    if (reduced || hovering) return
    let id: ReturnType<typeof setTimeout> | undefined
    if (revealed < N) {
      id = setTimeout(() => setRevealed(r => r + 1), revealed === 0 ? 650 : 450)
    } else if (autoAdvance) {
      id = setTimeout(() => {
        setTransitioning(true)
        const id2 = setTimeout(() => {
          setIndex(i => (i + 1) % DEMO_SCENARIOS.length)
          setRevealed(0)
          setTransitioning(false)
        }, 350)
        timeoutsRef.current.push(id2)
      }, 4000)
    }
    if (id) timeoutsRef.current.push(id)
    return () => { if (id) clearTimeout(id) }
  }, [revealed, index, hovering, autoAdvance, reduced, N])

  // Clean up every timer on unmount.
  useEffect(() => () => { timeoutsRef.current.forEach(clearTimeout) }, [])

  function jumpTo(i: number) {
    setAutoAdvance(false)            // user has taken control — stop auto-advance permanently
    setTransitioning(false)
    setIndex(i)
    setRevealed(reduced ? DEMO_SCENARIOS[i].layers.length : 0)
  }

  return (
    <div
      className="relative w-full max-w-[480px] animate-fade-up"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Context label + dots */}
      <div className="flex items-center gap-2.5 mb-4">
        <span className="label text-[var(--slice-text)]">{scenario.label}</span>
        <div className="flex gap-1.5 ml-auto">
          {DEMO_SCENARIOS.map((s, i) => (
            <button
              key={i}
              onClick={() => jumpTo(i)}
              aria-label={s.label}
              className="w-1.5 h-1.5 rounded-full transition-all duration-200"
              style={{ background: i === index ? 'var(--slice)' : 'rgba(245,234,234,0.22)' }}
            />
          ))}
        </div>
      </div>

      {/* The card — the single glow element on this view */}
      <div
        className="card glow-slice overflow-hidden"
        style={{
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 350ms ease, transform 350ms ease',
        }}
      >

        {/* Header */}
        <div className="px-7 pt-6 pb-5 border-b border-[var(--border)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="heading-card text-[var(--ink)] truncate">{scenario.product}</div>
              <div className="label mt-1.5 text-[var(--ink-dim)] truncate">{scenario.specs}</div>
            </div>
            <span className="label shrink-0 text-xs text-[var(--ink-dim)] bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-2.5 py-1">
              {scenario.condition}
            </span>
          </div>
        </div>

        {/* Price row */}
        <div className="px-7 py-6 border-b border-[var(--border)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow mb-2">Original price</div>
              <div className="price-num text-lg text-[var(--ink-dim)] line-through decoration-[var(--ink-faint)] decoration-1">
                {formatGBP(scenario.originalPrice)}
              </div>
            </div>
            <div className="text-right">
              <div className="eyebrow text-[var(--slice-text)] mb-2">Sliced to</div>
              <div
                className="price-num text-[2.25rem] leading-none text-[var(--slice-text)] savings-glow"
                style={{
                  opacity: dip ? 0.55 : 1,
                  transform: dip ? 'scale(0.96)' : 'scale(1)',
                  transition: 'opacity 200ms ease, transform 200ms ease',
                }}
              >
                {formatGBP(displayPrice)}
              </div>
              {revealed > 0 && (
                <div className="text-xs text-[var(--slice-text)] mt-2 font-medium">
                  Save {formatGBP(totalSaving)} &middot; {savingPct}% off
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Saving layers */}
        <div>
          {scenario.layers.map((layer, i) => (
            <div
              key={i}
              className={`px-7 py-3.5 flex items-center gap-3.5 ${
                i < scenario.layers.length - 1 ? 'border-b border-[var(--border)]' : ''
              }`}
              style={{
                opacity: i < revealed ? 1 : 0,
                transform: i < revealed ? 'translateY(0)' : 'translateY(6px)',
                transition: 'opacity 400ms ease, transform 400ms ease',
              }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 bg-[var(--slice-dim)] text-[var(--slice-text)]">
                {layer.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--ink)] truncate">{layer.name}</div>
                <div className="text-[12px] text-[var(--ink-dim)] truncate">{layer.detail}</div>
              </div>
              <div className="price-num text-sm text-[var(--slice-text)] shrink-0">
                &minus;{formatGBP(layer.saving)}
              </div>
            </div>
          ))}
        </div>

        {/* Final sliced-to footer */}
        <div className="px-7 py-5 bg-[var(--slice-dim)] border-t border-[var(--border-2)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="heading-card text-[var(--slice-text)] text-base">Sliced to</div>
              {revealed > 0 && (
                <div className="text-[12px] text-[var(--ink-dim)] mt-0.5">
                  You save {formatGBP(totalSaving)} &middot; {savingPct}% off
                </div>
              )}
            </div>
            <div className="price-num text-2xl text-[var(--slice-text)] savings-glow">
              {formatGBP(displayPrice)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
