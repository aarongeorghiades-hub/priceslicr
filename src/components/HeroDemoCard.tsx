'use client'

import { useState, useEffect, useRef } from 'react'

// ────────────────────────────────────────────────
// THREE ROTATING DEMO SCENARIOS
// ────────────────────────────────────────────────
const DEMO_SCENARIOS = [
  {
    label: 'Best laptop saving',
    product: 'MacBook Air 13\u201D M3',
    specs: '8GB \u00B7 256GB \u00B7 John Lewis',
    condition: 'New',
    originalPrice: 1099.00,
    layers: [
      {
        icon: '\u21A9',
        name: 'TopCashback',
        detail: '3% on electronics at John Lewis',
        saving: 32.97,
        color: '#00FF85',
        bg: 'rgba(0,255,133,0.12)',
      },
      {
        icon: '\u21C6',
        name: 'Price match to Currys',
        detail: 'NKU policy \u2014 \u00A31,049 at Currys',
        saving: 50.00,
        color: '#00C2FF',
        bg: 'rgba(0,194,255,0.12)',
      },
      {
        icon: '\u25C8',
        name: 'Amex intro cashback',
        detail: '5% first 5 months, capped \u00A3125',
        saving: 38.50,
        color: '#00C2FF',
        bg: 'rgba(0,194,255,0.12)',
      },
      {
        icon: '\u21C6',
        name: 'Trade-in: iPhone 13 (Good)',
        detail: 'MusicMagpie \u2014 best offer',
        saving: 120.00,
        color: '#00FF85',
        bg: 'rgba(0,255,133,0.12)',
      },
    ],
  },
  {
    label: 'Best phone saving',
    product: 'Samsung Galaxy Z Fold 6',
    specs: '256GB \u00B7 Currys \u00B7 Foldable',
    condition: 'New',
    originalPrice: 1799.00,
    layers: [
      {
        icon: '\u21A9',
        name: 'TopCashback',
        detail: '4% on electronics at Currys',
        saving: 71.96,
        color: '#00FF85',
        bg: 'rgba(0,255,133,0.12)',
      },
      {
        icon: '\u2726',
        name: 'Samsung Youth Store',
        detail: 'Age 16\u201326, photo ID only',
        saving: 180.00,
        color: '#9A85FF',
        bg: 'rgba(154,133,255,0.12)',
      },
      {
        icon: '\u25C8',
        name: 'Amex intro cashback',
        detail: '5% first 5 months, capped \u00A3125',
        saving: 89.95,
        color: '#00C2FF',
        bg: 'rgba(0,194,255,0.12)',
      },
      {
        icon: '\u21C6',
        name: 'Trade-in: Galaxy S23 (Good)',
        detail: 'Back Market \u2014 best offer',
        saving: 220.00,
        color: '#00FF85',
        bg: 'rgba(0,255,133,0.12)',
      },
    ],
  },
  {
    label: 'Best TV saving',
    product: 'LG OLED55C4',
    specs: '55\u201D \u00B7 4K OLED \u00B7 John Lewis',
    condition: 'New',
    originalPrice: 1299.00,
    layers: [
      {
        icon: '\u21A9',
        name: 'Quidco',
        detail: '3.5% on electronics at John Lewis',
        saving: 45.47,
        color: '#00FF85',
        bg: 'rgba(0,255,133,0.12)',
      },
      {
        icon: '\u21C6',
        name: 'Price match to Currys',
        detail: 'NKU policy \u2014 \u00A31,199 at Currys',
        saving: 100.00,
        color: '#00C2FF',
        bg: 'rgba(0,194,255,0.12)',
      },
      {
        icon: '\uD83C\uDF81',
        name: 'HyperJar gift card',
        detail: '5% on Currys via HyperJar',
        saving: 59.95,
        color: '#00FF85',
        bg: 'rgba(0,255,133,0.12)',
      },
      {
        icon: '\u25C8',
        name: 'Amex intro cashback',
        detail: '5% first 5 months, capped \u00A3125',
        saving: 64.95,
        color: '#00C2FF',
        bg: 'rgba(0,194,255,0.12)',
      },
    ],
  },
]

function formatGBP(n: number) {
  return '\u00A3' + n.toFixed(2)
}

// ────────────────────────────────────────────────
// SINGLE SCENARIO ANIMATION
// ────────────────────────────────────────────────
function ScenarioCard({
  scenario,
  onComplete,
}: {
  scenario: typeof DEMO_SCENARIOS[0]
  onComplete: () => void
}) {
  const [visibleLayers, setVisibleLayers] = useState(0)
  const [slashing, setSlashing] = useState(false)
  const [currentPrice, setCurrentPrice] = useState(scenario.originalPrice)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const totalSaving = scenario.layers
    .slice(0, visibleLayers)
    .reduce((sum, l) => sum + l.saving, 0)

  const trueCost = parseFloat((scenario.originalPrice - totalSaving).toFixed(2))
  const savingPct = Math.round((totalSaving / scenario.originalPrice) * 100)
  const allLayersVisible = visibleLayers === scenario.layers.length

  function addTimeout(fn: () => void, delay: number) {
    const id = setTimeout(fn, delay)
    timeoutsRef.current.push(id)
  }

  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    setVisibleLayers(0)
    setCurrentPrice(scenario.originalPrice)
    setSlashing(false)
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    let delay = 600

    scenario.layers.forEach((layer, i) => {
      addTimeout(() => setVisibleLayers(i + 1), delay)
      delay += 350

      addTimeout(() => setSlashing(true), delay)
      delay += 250

      const runningTotal = scenario.layers.slice(0, i + 1).reduce((s, l) => s + l.saving, 0)
      const newPrice = parseFloat((scenario.originalPrice - runningTotal).toFixed(2))
      addTimeout(() => {
        setCurrentPrice(newPrice)
        setSlashing(false)
      }, delay)
      delay += 200
    })

    // Trigger onComplete after 7 seconds total
    addTimeout(onComplete, 7000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario])

  return (
    <div className="bg-[rgba(13,13,26,0.95)] border border-[rgba(0,194,255,0.2)] rounded-2xl overflow-hidden shadow-2xl w-full">

      {/* Card header */}
      <div className="px-6 pt-5 pb-4 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-display font-extrabold text-white text-base leading-tight">
              {scenario.product}
            </div>
            <div className="text-[11px] text-[var(--muted)] mt-0.5">
              {scenario.specs}
            </div>
          </div>
          <span className="text-[10px] font-semibold bg-[rgba(79,110,247,0.2)] text-[#8BA5FF] border border-[rgba(79,110,247,0.3)] px-2 py-0.5 rounded shrink-0">
            {scenario.condition}
          </span>
        </div>
      </div>

      {/* Price row */}
      <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-start justify-between gap-4">
          {/* Original price */}
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[var(--muted)] mb-1">
              Original price
            </div>
            <div
              className="font-mono text-lg transition-all duration-300"
              style={{
                color: visibleLayers > 0 ? 'var(--muted)' : 'white',
                textDecoration: visibleLayers > 0 ? 'line-through' : 'none',
                textDecorationColor: '#FFB520',
                textDecorationThickness: '1px',
              }}
            >
              {formatGBP(scenario.originalPrice)}
            </div>
          </div>

          {/* Sliced to */}
          {visibleLayers > 0 && (
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-[var(--savings)] mb-1">
                Sliced to
              </div>
              <div className="relative">
                {slashing && (
                  <div className="absolute inset-0 flex items-center pointer-events-none z-10 overflow-hidden">
                    <div
                      className="h-px bg-[var(--slice)] w-full origin-left"
                      style={{ animation: 'slashLine 0.2s ease-out forwards' }}
                    />
                  </div>
                )}
                <div
                  className="font-mono text-3xl font-medium text-[var(--savings)] savings-glow transition-all duration-150"
                  style={{
                    opacity: slashing ? 0.5 : 1,
                    transform: slashing ? 'scale(0.96)' : 'scale(1)',
                  }}
                >
                  {formatGBP(currentPrice)}
                </div>
              </div>
              <div className="text-[10px] text-[var(--savings)] mt-0.5 opacity-80">
                Save {formatGBP(totalSaving)} &middot; {savingPct}% off
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saving layers */}
      <div className="divide-y divide-[rgba(255,255,255,0.04)]">
        {scenario.layers.map((layer, i) => (
          <div
            key={i}
            className="px-6 py-3 flex items-center gap-3"
            style={{
              opacity: visibleLayers > i ? 1 : 0,
              transform: visibleLayers > i ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
              style={{ background: layer.bg, color: layer.color }}
            >
              {layer.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--ink)] truncate">
                {layer.name}
              </div>
              <div className="text-[10px] text-[var(--muted)] truncate">
                {layer.detail}
              </div>
            </div>
            <div
              className="font-mono text-sm font-medium shrink-0"
              style={{ color: layer.color }}
            >
              &minus; {formatGBP(layer.saving)}
            </div>
          </div>
        ))}
      </div>

      {/* Final sliced to row */}
      {allLayersVisible && (
        <div className="px-6 py-4 bg-[rgba(0,255,133,0.06)] border-t border-[rgba(0,255,133,0.15)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display font-extrabold text-[var(--savings)] text-sm">
                Sliced to
              </div>
              <div className="text-[10px] text-[var(--savings)] opacity-70 mt-0.5">
                You save {formatGBP(totalSaving)} &middot; {savingPct}% off
              </div>
            </div>
            <div className="font-mono text-2xl font-medium text-[var(--savings)] savings-glow">
              {formatGBP(trueCost)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────
// MAIN ROTATING CARD
// ────────────────────────────────────────────────
export default function HeroDemoCard() {
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  function handleScenarioComplete() {
    setTransitioning(true)
    setTimeout(() => {
      setScenarioIndex(prev => (prev + 1) % DEMO_SCENARIOS.length)
      setTransitioning(false)
    }, 400)
  }

  function jumpToScenario(i: number) {
    if (i === scenarioIndex) return
    setTransitioning(true)
    setTimeout(() => {
      setScenarioIndex(i)
      setTransitioning(false)
    }, 300)
  }

  const current = DEMO_SCENARIOS[scenarioIndex]

  return (
    <div className="relative w-full max-w-[480px]">
      {/* Glow */}
      <div className="absolute inset-0 rounded-2xl blur-2xl opacity-20 bg-gradient-to-br from-[var(--slice)] to-[var(--savings)] scale-95 pointer-events-none" />

      <div
        className="relative"
        style={{
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(6px)' : 'translateY(0)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
        }}
      >
        {/* Context label */}
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--savings)] animate-pulse shrink-0" />
          <span className="text-[10px] uppercase tracking-widest text-[var(--savings)]">
            {current.label}
          </span>
          {/* Scenario dots */}
          <div className="flex gap-1.5 ml-auto">
            {DEMO_SCENARIOS.map((_, i) => (
              <button
                key={i}
                onClick={() => jumpToScenario(i)}
                className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                style={{
                  background: i === scenarioIndex ? 'var(--savings)' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
        </div>

        <ScenarioCard
          key={scenarioIndex}
          scenario={current}
          onComplete={handleScenarioComplete}
        />
      </div>
    </div>
  )
}
