'use client'

import { useState, useEffect, useRef } from 'react'

const DEMO_SCENARIO = {
  product: 'MacBook Air 13\u201D M3',
  specs: '8GB \u00B7 256GB \u00B7 John Lewis',
  condition: 'New' as const,
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
}

function formatGBP(n: number) {
  return '\u00A3' + n.toFixed(2)
}

export default function HeroDemoCard() {
  const [visibleLayers, setVisibleLayers] = useState(0)
  const [slashing, setSlashing] = useState(false)
  const [currentPrice, setCurrentPrice] = useState(DEMO_SCENARIO.originalPrice)
  const [isReplaying, setIsReplaying] = useState(false)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const totalSaving = DEMO_SCENARIO.layers
    .slice(0, visibleLayers)
    .reduce((sum, l) => sum + l.saving, 0)

  const savingPct = Math.round((totalSaving / DEMO_SCENARIO.originalPrice) * 100)

  function clearAllTimeouts() {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  function addTimeout(fn: () => void, delay: number) {
    const id = setTimeout(fn, delay)
    timeoutsRef.current.push(id)
    return id
  }

  function runAnimation() {
    setVisibleLayers(0)
    setCurrentPrice(DEMO_SCENARIO.originalPrice)
    setSlashing(false)

    let runningPrice = DEMO_SCENARIO.originalPrice
    let delay = 800

    DEMO_SCENARIO.layers.forEach((layer, i) => {
      // Show the layer
      addTimeout(() => {
        setVisibleLayers(i + 1)
      }, delay)
      delay += 400

      // Trigger slash effect
      addTimeout(() => {
        setSlashing(true)
      }, delay)
      delay += 300

      // Update price and remove slash
      const newPrice = parseFloat((runningPrice - layer.saving).toFixed(2))
      runningPrice = newPrice
      addTimeout(() => {
        setCurrentPrice(newPrice)
        setSlashing(false)
      }, delay)
      delay += 200
    })
  }

  useEffect(() => {
    addTimeout(() => runAnimation(), 1200)
    return clearAllTimeouts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleReplay() {
    if (isReplaying) return
    setIsReplaying(true)
    clearAllTimeouts()
    runAnimation()
    addTimeout(() => setIsReplaying(false), 4000)
  }

  const allLayersVisible = visibleLayers === DEMO_SCENARIO.layers.length

  return (
    <div className="relative w-full">
      {/* Glow behind card */}
      <div className="absolute inset-0 rounded-2xl blur-2xl opacity-20 bg-gradient-to-br from-[var(--slice)] to-[var(--savings)] scale-95" />

      <div className="relative bg-[rgba(13,13,26,0.95)] border border-[rgba(0,194,255,0.2)] rounded-2xl overflow-hidden shadow-2xl">

        {/* Card header */}
        <div className="px-6 pt-5 pb-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-display font-extrabold text-white text-base leading-tight">
                {DEMO_SCENARIO.product}
              </div>
              <div className="text-[11px] text-[var(--muted)] mt-0.5">
                {DEMO_SCENARIO.specs}
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-[rgba(79,110,247,0.2)] text-[#8BA5FF] border border-[rgba(79,110,247,0.3)] px-2 py-0.5 rounded">
              {DEMO_SCENARIO.condition}
            </span>
          </div>
        </div>

        {/* Price section */}
        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-start justify-between">
            <div>
              {/* Original price — always visible, struck through once savings start */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
                  Original price
                </span>
              </div>
              <div className={`font-mono text-lg transition-all duration-300 ${
                visibleLayers > 0
                  ? 'text-[var(--muted)] line-through decoration-[var(--risk)] decoration-2'
                  : 'text-white'
              }`}>
                {formatGBP(DEMO_SCENARIO.originalPrice)}
              </div>
            </div>

            {/* True cost — animated price with slash effect */}
            {visibleLayers > 0 && (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-[var(--savings)] mb-1">
                  True cost
                </div>
                <div className="relative">
                  {/* Slash overlay animation */}
                  {slashing && (
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                      style={{ animation: 'slashAppear 0.3s ease-out forwards' }}
                    >
                      <div
                        className="absolute h-0.5 bg-[var(--slice)] w-full origin-left"
                        style={{ animation: 'slashLine 0.25s ease-out forwards' }}
                      />
                    </div>
                  )}
                  <div
                    className={`font-mono text-3xl font-medium text-[var(--savings)] savings-glow transition-all duration-200 ${
                      slashing ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                    }`}
                  >
                    {formatGBP(currentPrice)}
                  </div>
                </div>
                <div className="text-[10px] text-[var(--savings)] mt-0.5">
                  You save {formatGBP(totalSaving)} &middot; {savingPct}% off
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Saving layers */}
        <div className="divide-y divide-[rgba(255,255,255,0.04)]">
          {DEMO_SCENARIO.layers.map((layer, i) => (
            <div
              key={i}
              className="px-6 py-3 flex items-center gap-3 transition-all duration-500"
              style={{
                opacity: visibleLayers > i ? 1 : 0,
                transform: visibleLayers > i ? 'translateY(0)' : 'translateY(8px)',
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

        {/* Final true cost row */}
        <div
          className="px-6 py-4 bg-[rgba(0,255,133,0.06)] border-t border-[rgba(0,255,133,0.15)] transition-all duration-500"
          style={{
            opacity: allLayersVisible ? 1 : 0,
            transform: allLayersVisible ? 'translateY(0)' : 'translateY(4px)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display font-extrabold text-[var(--savings)] text-sm">
                True cost
              </div>
              <div className="text-[10px] text-[var(--savings)] opacity-70 mt-0.5">
                You save {formatGBP(totalSaving)} &middot; {savingPct}% off
              </div>
            </div>
            <div className="font-mono text-2xl font-medium text-[var(--savings)] savings-glow">
              {formatGBP(currentPrice)}
            </div>
          </div>
        </div>

        {/* Replay button */}
        <button
          onClick={handleReplay}
          className="w-full py-3 text-[11px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors border-t border-[rgba(255,255,255,0.04)]"
        >
          &#x21BA; Replay
        </button>
      </div>
    </div>
  )
}
