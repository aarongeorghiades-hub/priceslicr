'use client'

import { useState } from 'react'

// ────────────────────────────────────────────────
// THREE DEMO SCENARIOS (switchable via dots)
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
  const scenario = DEMO_SCENARIOS[index]

  const totalSaving = scenario.layers.reduce((sum, l) => sum + l.saving, 0)
  const slicedPrice = parseFloat((scenario.originalPrice - totalSaving).toFixed(2))
  const savingPct = Math.round((totalSaving / scenario.originalPrice) * 100)

  return (
    <div className="relative w-full max-w-[480px] animate-fade-up">
      {/* Context label + dots */}
      <div className="flex items-center gap-2.5 mb-4">
        <span className="eyebrow text-[var(--slice)]">{scenario.label}</span>
        <div className="flex gap-1.5 ml-auto">
          {DEMO_SCENARIOS.map((s, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={s.label}
              className="w-1.5 h-1.5 rounded-full transition-all duration-200"
              style={{ background: i === index ? 'var(--slice)' : 'rgba(245,234,234,0.18)' }}
            />
          ))}
        </div>
      </div>

      {/* The card — the single glow element on this view */}
      <div className="card glow-slice overflow-hidden">

        {/* Header */}
        <div className="px-7 pt-6 pb-5 border-b border-[var(--border)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="heading-card text-[var(--ink)] truncate">{scenario.product}</div>
              <div className="eyebrow mt-1.5 normal-case tracking-normal text-[var(--ink-faint)] font-mono">
                {scenario.specs}
              </div>
            </div>
            <span className="eyebrow shrink-0 text-[var(--ink-dim)] bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-2.5 py-1">
              {scenario.condition}
            </span>
          </div>
        </div>

        {/* Price row */}
        <div className="px-7 py-6 border-b border-[var(--border)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow mb-2">Original price</div>
              <div className="price-num text-lg text-[var(--muted)] line-through decoration-[var(--muted-2)] decoration-1">
                {formatGBP(scenario.originalPrice)}
              </div>
            </div>
            <div className="text-right">
              <div className="eyebrow text-[var(--slice)] mb-2">Sliced to</div>
              <div className="price-num text-[2.25rem] leading-none text-[var(--slice)] savings-glow">
                {formatGBP(slicedPrice)}
              </div>
              <div className="text-xs text-[var(--slice)] mt-2 font-medium">
                Save {formatGBP(totalSaving)} &middot; {savingPct}% off
              </div>
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
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 bg-[var(--slice-dim)] text-[var(--slice)]">
                {layer.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--ink)] truncate">{layer.name}</div>
                <div className="text-[11px] text-[var(--ink-faint)] truncate">{layer.detail}</div>
              </div>
              <div className="price-num text-sm text-[var(--slice)] shrink-0">
                &minus;{formatGBP(layer.saving)}
              </div>
            </div>
          ))}
        </div>

        {/* Final sliced-to footer */}
        <div className="px-7 py-5 bg-[var(--slice-dim)] border-t border-[var(--border-2)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="heading-card text-[var(--slice)] text-base">Sliced to</div>
              <div className="text-[11px] text-[var(--ink-dim)] mt-0.5">
                You save {formatGBP(totalSaving)} &middot; {savingPct}% off
              </div>
            </div>
            <div className="price-num text-2xl text-[var(--slice)] savings-glow">
              {formatGBP(slicedPrice)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
