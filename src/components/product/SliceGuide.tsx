'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { DiscountLayer } from '@/types'
import { orderLayersForSliceGuide, type SliceStep } from '@/lib/sliceOrder'

interface SliceGuideProps {
  layers: DiscountLayer[]
  productName: string
  bestPrice: number | null
}

// ── Helpers ──────────────────────────────────────

function calcSaving(layer: DiscountLayer, price: number | null): number {
  if (!price) return 0
  if (layer.value_type === 'percentage') return Math.round((layer.value / 100) * price)
  if (layer.value_type === 'fixed_amount') return layer.value
  return 0
}

function bestLayerForType(layers: DiscountLayer[], type: string, price: number | null): DiscountLayer | null {
  const typed = layers.filter(l => l.discount_type === type)
  if (typed.length === 0) return null
  return typed.reduce((best, l) => calcSaving(l, price) > calcSaving(best, price) ? l : best)
}

function buildSteps(layer: DiscountLayer, step: SliceStep): string[] {
  const steps: string[] = []

  if (step.type === 'cashback') {
    steps.push(`Go to ${layer.cashback_portal_url ? 'the cashback portal' : 'TopCashback or Quidco'}`)
    steps.push('Search for the retailer where you plan to buy and click "Get Cashback"')
    steps.push('In the new tab that opens, add your item to the basket and complete checkout without closing the tab')
  } else if (step.type === 'gift_card') {
    steps.push('Open the HyperJar app on your phone')
    steps.push(`Search for ${layer.retailer?.name ?? 'the retailer'} in the Cashback tab`)
    steps.push('Buy a gift card voucher for exactly the amount you need (cashback lands instantly)')
    steps.push('At checkout, use your HyperJar card \u2014 the gift card applies automatically')
  } else if (step.type === 'card_cashback') {
    steps.push('Make sure you are paying with your Amex Cashback card')
    steps.push('The 5% intro cashback applies automatically \u2014 no code needed')
    steps.push('Cashback posts to your statement within a few days')
  } else if (step.type === 'signup') {
    steps.push('At checkout, find the "Discount code" or "Promo code" field')
    steps.push(`Enter your code: ${layer.conditions ?? 'check your welcome email or the retailer new customer page'}`)
    steps.push('Verify the discount has been applied before completing payment')
  } else if (step.type === 'student' || step.type === 'key_worker') {
    steps.push(`Go to ${layer.verification_platform ?? 'the verification portal'} and get your unique code`)
    steps.push('At checkout, find the discount code field and enter your code')
    steps.push('Verify the discount has been applied before completing payment')
  } else if (step.type === 'trade_in') {
    steps.push(`Go to ${layer.cashback_portal_url ?? 'MusicMagpie, Currys or Back Market'} and get a live quote for your device`)
    steps.push('Complete your new purchase first, then post your old device')
    steps.push('Payment arrives within 5 working days')
  }

  return steps
}

type ModalState = 'closed' | 'intro' | 'complete' | `slice-${number}`

function parseSliceIndex(state: ModalState): number | null {
  if (typeof state === 'string' && state.startsWith('slice-')) {
    return parseInt(state.replace('slice-', ''), 10)
  }
  return null
}

// ── Component ────────────────────────────────────

export default function SliceGuide({ layers, productName, bestPrice }: SliceGuideProps) {
  const [state, setState] = useState<ModalState>('closed')
  const [showWarning, setShowWarning] = useState(false)
  const [pendingNext, setPendingNext] = useState<ModalState | null>(null)
  const [entering, setEntering] = useState(false)

  // Build the step/layer pairs
  const layerTypes = layers.map(l => l.discount_type)
  const steps = orderLayersForSliceGuide(layerTypes)
  const stepLayers = steps.map(step => ({
    step,
    layer: bestLayerForType(layers, step.type, bestPrice)!,
  })).filter(s => s.layer !== null)

  const totalSaving = stepLayers.reduce((sum, { layer }) => sum + calcSaving(layer, bestPrice), 0)
  const slicedPrice = bestPrice ? bestPrice - totalSaving : null

  // Entrance animation
  useEffect(() => {
    if (state !== 'closed') {
      setEntering(true)
      const t = setTimeout(() => setEntering(false), 250)
      return () => clearTimeout(t)
    }
  }, [state === 'closed']) // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll when open
  useEffect(() => {
    if (state !== 'closed') {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [state])

  // ESC to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setState('closed')
      setShowWarning(false)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  function openGuide() {
    setState('intro')
  }

  function handleDone(currentIndex: number) {
    const nextState: ModalState = currentIndex < stepLayers.length - 1
      ? `slice-${currentIndex + 1}`
      : 'complete'
    setPendingNext(nextState)
    setShowWarning(true)
  }

  function confirmContinue() {
    if (pendingNext) setState(pendingNext)
    setShowWarning(false)
    setPendingNext(null)
  }

  function goBack() {
    setShowWarning(false)
    setPendingNext(null)
  }

  if (stepLayers.length === 0) return null

  const currentSliceIndex = parseSliceIndex(state)
  const progressFraction = currentSliceIndex !== null
    ? (currentSliceIndex + 1) / stepLayers.length
    : 0

  // Saved so far (for running total)
  const savedSoFar = currentSliceIndex !== null
    ? stepLayers.slice(0, currentSliceIndex + 1).reduce((sum, { layer }) => sum + calcSaving(layer, bestPrice), 0)
    : 0

  return (
    <>
      {/* ── Trigger Button ── */}
      <button
        onClick={openGuide}
        className="w-full px-6 py-4 bg-[var(--slice)] text-[var(--void)] font-display font-bold text-sm rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(0,194,255,0.4)] flex items-center justify-center gap-2"
        style={{ boxShadow: '0 0 28px rgba(0,194,255,0.28)' }}
      >
        Start Slicing &rarr;
      </button>

      {/* ── Modal ── */}
      {state !== 'closed' && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-[#07070F] overflow-y-auto"
          style={{
            opacity: entering ? 0 : 1,
            transform: entering ? 'scale(0.97)' : 'scale(1)',
            transition: 'opacity 200ms ease, transform 200ms ease',
          }}
        >
          {/* Radial glow */}
          <div
            className="fixed top-0 right-0 w-[800px] h-[600px] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 80% 0%, rgba(0,194,255,0.08) 0%, transparent 60%)',
            }}
          />

          {/* Progress bar (slice states only) */}
          {state !== 'intro' && state !== 'complete' && currentSliceIndex !== null && (
            <div className="fixed top-0 left-0 right-0 h-[3px] z-[100000] bg-[rgba(255,255,255,0.06)]">
              <div
                className="h-full bg-[var(--slice)] transition-all duration-500 ease-out"
                style={{ width: `${((currentSliceIndex + 1) / stepLayers.length) * 100}%` }}
              />
            </div>
          )}

          {/* Top bar */}
          <div className="sticky top-0 z-[10001] flex items-center justify-between px-8 py-5">
            <div className="font-display text-lg font-extrabold tracking-tight">
              <span className="text-white">Price</span>
              <span className="text-[var(--slice)]">/Slicr</span>
            </div>
            <span className="text-[10px] tracking-[0.3em] text-[var(--slice)] uppercase font-medium">
              Slice Guide
            </span>
            <button
              onClick={() => { setState('closed'); setShowWarning(false) }}
              className="text-white/60 hover:text-[var(--slice)] transition-colors text-xl leading-none"
            >
              &#x2715;
            </button>
          </div>

          {/* ── INTRO ── */}
          {state === 'intro' && (
            <div className="relative max-w-[640px] mx-auto px-6 py-12 flex flex-col items-center text-center min-h-[80vh] justify-center">
              <div className="text-[10px] tracking-[0.25em] text-[var(--slice)] uppercase font-medium mb-6">
                Your saving stack
              </div>
              <h2 className="font-display text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
                Stack every saving.<br />
                <span className="text-[var(--slice)]">In the right order.</span>
              </h2>
              <p className="text-white/60 text-base max-w-[480px] mb-10 leading-relaxed">
                Each saving layer must be activated in sequence. Skip one or do them
                out of order and you&apos;ll lose the saving entirely.
              </p>

              {/* Slice list */}
              <div className="w-full mb-8">
                {stepLayers.map(({ step, layer }, i) => {
                  const saving = calcSaving(layer, bestPrice)
                  return (
                    <div
                      key={step.type}
                      className="flex items-center gap-4 py-3 border-b border-[rgba(255,255,255,0.06)] last:border-0"
                    >
                      <span className="font-mono text-sm text-[var(--slice)] w-8 shrink-0 text-left">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm text-white flex-1 text-left">
                        {step.label}
                      </span>
                      <span className="font-mono text-sm text-[var(--savings)] shrink-0">
                        ~&pound;{saving}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Total saving card */}
              <div className="w-full bg-[var(--savings-dim)] border border-[rgba(0,255,133,0.2)] rounded-xl px-6 py-5 mb-6">
                <div className="text-[10px] tracking-[0.2em] text-[var(--savings)] uppercase font-medium mb-2">
                  Total potential saving
                </div>
                <div className="font-mono text-4xl font-medium text-[var(--savings)] savings-glow">
                  ~&pound;{totalSaving}
                </div>
              </div>

              {/* Warning */}
              <div className="text-sm text-[var(--risk)] mb-8">
                &#x26A0; Order is everything &mdash; follow each step before moving to the next
              </div>

              {/* Begin button */}
              <button
                onClick={() => setState('slice-0')}
                className="px-10 py-4 bg-[var(--slice)] text-[var(--void)] font-display font-bold text-sm rounded-xl transition-all hover:brightness-110 hover:shadow-[0_0_24px_rgba(0,194,255,0.4)] w-full md:w-auto"
              >
                Begin Slicing &rarr;
              </button>
            </div>
          )}

          {/* ── SLICE-N ── */}
          {currentSliceIndex !== null && (() => {
            const { step, layer } = stepLayers[currentSliceIndex]
            const saving = calcSaving(layer, bestPrice)
            const actionSteps = buildSteps(layer, step)
            const isLast = currentSliceIndex === stepLayers.length - 1

            return (
              <div className="relative max-w-5xl mx-auto px-6 md:px-12 py-8 md:py-12">
                {/* Watermark number */}
                <div
                  className="absolute top-0 right-8 text-[180px] font-bold leading-none select-none pointer-events-none font-mono"
                  style={{ color: 'rgba(0,194,255,0.04)' }}
                >
                  {String(currentSliceIndex + 1).padStart(2, '0')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 items-start relative">
                  {/* Left column — steps */}
                  <div>
                    {/* Slice header */}
                    <div className="mb-2">
                      <span className="text-[var(--slice)] font-mono text-sm">
                        Slice {currentSliceIndex + 1} of {stepLayers.length}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl font-extrabold text-white mb-2">
                      {step.label}
                    </h3>
                    <div className="font-mono text-3xl font-medium text-[var(--savings)] savings-glow mb-8">
                      Save ~&pound;{saving}
                    </div>

                    {/* WHAT YOU NEED */}
                    <div className="mb-6">
                      <div className="text-[9px] tracking-[0.3em] uppercase font-medium text-[var(--slice)] mb-3">
                        What you need
                      </div>
                      <div className="border-l-2 border-[var(--slice)] pl-4 py-3 rounded-r-lg" style={{ background: 'rgba(0,194,255,0.04)' }}>
                        <p className="text-sm text-white/80 leading-relaxed">
                          {step.prerequisites}
                        </p>
                      </div>
                    </div>

                    {/* WHAT TO DO */}
                    <div className="mb-6">
                      <div className="text-[9px] tracking-[0.3em] uppercase font-medium text-white mb-3">
                        What to do
                      </div>
                      <div className="space-y-3">
                        {actionSteps.map((s, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[var(--slice-dim)] text-[var(--slice)] text-xs font-mono flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            <p className="text-sm text-white/80 leading-relaxed">{s}</p>
                          </div>
                        ))}
                      </div>
                      {step.type === 'cashback' && layer.cashback_portal_url && (
                        <a
                          href={layer.cashback_portal_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-[var(--slice)] text-[var(--void)] font-display font-bold text-sm hover:brightness-110 transition-all hover:shadow-[0_0_16px_rgba(0,194,255,0.4)]"
                        >
                          Open {layer.description?.includes('TopCashback') ? 'TopCashback' :
                                layer.description?.includes('Quidco') ? 'Quidco' :
                                'Cashback Portal'} &rarr;
                        </a>
                      )}
                    </div>

                    {/* WHY NOW */}
                    <div className="mb-8">
                      <div className="text-[9px] tracking-[0.3em] uppercase font-medium text-[var(--risk)] mb-3">
                        Why now
                      </div>
                      <div className="border-l-2 border-[var(--risk)] pl-4 py-3 rounded-r-lg" style={{ background: 'rgba(255,181,32,0.04)' }}>
                        <p className="text-sm text-white/80 leading-relaxed">
                          {step.whyNow}
                        </p>
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-4">
                      {currentSliceIndex > 0 && (
                        <button
                          onClick={() => setState(`slice-${currentSliceIndex - 1}`)}
                          className="px-6 py-3 border border-[var(--border)] text-white/70 font-display font-bold text-sm rounded-xl hover:border-[var(--slice)] hover:text-white transition-all"
                        >
                          &larr; Back
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (isLast) {
                            setState('complete')
                          } else {
                            handleDone(currentSliceIndex)
                          }
                        }}
                        className="flex-1 px-8 py-4 bg-[var(--slice)] text-[var(--void)] font-display font-bold text-sm rounded-xl transition-all hover:brightness-110 hover:shadow-[0_0_24px_rgba(0,194,255,0.4)]"
                      >
                        {isLast ? 'Complete \u2014 see your savings summary \u2192' : `Done \u2014 Slice ${currentSliceIndex + 2} \u2192`}
                      </button>
                    </div>
                  </div>

                  {/* Right column — saving summary card */}
                  <div className="sticky top-24 space-y-4 hidden md:block">
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
                      <div className="text-[10px] tracking-[0.2em] uppercase text-white/60 mb-3 font-medium">
                        {productName}
                      </div>
                      {bestPrice && (
                        <div className="font-mono text-lg text-white/40 line-through mb-1">
                          &pound;{bestPrice.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                      <div className="text-[10px] text-white/50 mb-4">Original price</div>

                      {/* Breakdown so far */}
                      <div className="space-y-2 mb-4 border-t border-[var(--border)] pt-4">
                        {stepLayers.slice(0, currentSliceIndex + 1).map(({ step: s, layer: l }, i) => {
                          const sv = calcSaving(l, bestPrice)
                          return (
                            <div key={i} className="flex justify-between text-xs">
                              <span className="text-white/60">{s.label}</span>
                              <span className="font-mono text-[var(--savings)]">&minus;&pound;{sv}</span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Saved so far pill */}
                      <div className="bg-[var(--savings-dim)] border border-[rgba(0,255,133,0.15)] px-3 py-2 rounded-full text-center">
                        <span className="text-[var(--savings)] font-mono text-sm">
                          Saved so far: &pound;{savedSoFar}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Running total pill — mobile */}
                <div className="fixed bottom-6 left-6 md:hidden z-[10002]">
                  <div className="bg-[var(--savings-dim)] border border-[rgba(0,255,133,0.15)] px-3 py-1 rounded-full">
                    <span className="text-[var(--savings)] font-mono text-sm">
                      Saved so far: &pound;{savedSoFar}
                    </span>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* ── COMPLETE ── */}
          {state === 'complete' && (
            <div className="relative max-w-[640px] mx-auto px-6 py-12 flex flex-col items-center text-center min-h-[80vh] justify-center">
              <h2 className="font-display text-5xl md:text-6xl font-extrabold text-white leading-tight mb-3">
                You&apos;ve sliced it.
              </h2>
              <p className="text-white/60 text-base mb-10">
                Here&apos;s what you saved on {productName}
              </p>

              {/* Price comparison */}
              {bestPrice && slicedPrice !== null && (
                <div className="flex flex-col items-center gap-3 mb-8">
                  <div className="relative">
                    <span className="font-mono text-3xl text-white/40 line-through" style={{ textDecorationColor: '#FFB520' }}>
                      &pound;{bestPrice.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-white/40 text-lg">&darr;</div>
                  <div className="font-mono text-5xl font-medium text-[var(--savings)] savings-glow">
                    &pound;{slicedPrice.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="bg-[var(--savings-dim)] text-[var(--savings)] border border-[rgba(0,255,133,0.2)] px-4 py-1 rounded-full font-mono text-sm">
                    Save {Math.round((totalSaving / bestPrice) * 100)}%
                  </div>
                </div>
              )}

              {/* Breakdown */}
              <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 mb-8">
                <div className="space-y-3">
                  {stepLayers.map(({ step, layer }, i) => {
                    const saving = calcSaving(layer, bestPrice)
                    return (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-[var(--slice)] w-6">{String(i + 1).padStart(2, '0')}</span>
                          <span className="text-sm text-white/80">{step.label}</span>
                        </div>
                        <span className="font-mono text-sm text-[var(--savings)]">&minus;&pound;{saving}</span>
                      </div>
                    )
                  })}
                  <div className="border-t border-[var(--border)] pt-3 flex justify-between">
                    <span className="text-sm font-bold text-white">Total saved</span>
                    <span className="font-mono text-lg font-medium text-[var(--savings)] savings-glow">&pound;{totalSaving}</span>
                  </div>
                </div>
              </div>

              {/* Action links */}
              <div className="w-full space-y-2 mb-8">
                {stepLayers
                  .filter(({ layer }) => layer.cashback_portal_url)
                  .map(({ step, layer }, i) => {
                    const portalName = step.type === 'cashback'
                      ? (layer.description?.includes('TopCashback') ? 'TopCashback' :
                         layer.description?.includes('Quidco') ? 'Quidco' :
                         'Cashback Portal')
                      : step.label
                    return (
                      <a
                        key={i}
                        href={layer.cashback_portal_url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full px-5 py-3 border border-[var(--slice)] text-[var(--slice)] font-display font-bold text-sm rounded-xl text-center hover:bg-[var(--slice-dim)] transition-colors"
                      >
                        Open {portalName} &rarr;
                      </a>
                    )
                  })}
              </div>

              {/* Bottom buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setState('intro')}
                  className="px-6 py-3 border border-[var(--border)] text-white/60 font-display font-bold text-sm rounded-xl hover:text-white hover:border-[var(--border-2)] transition-all"
                >
                  Start over
                </button>
                <button
                  onClick={() => { setState('closed'); setShowWarning(false) }}
                  className="px-6 py-3 border border-[var(--border)] text-white/60 font-display font-bold text-sm rounded-xl hover:text-white hover:border-[var(--border-2)] transition-all"
                >
                  &#x2715; Close
                </button>
              </div>
            </div>
          )}

          {/* ── Soft Warning Overlay ── */}
          {showWarning && currentSliceIndex !== null && (
            <div className="fixed inset-0 z-[10003] flex items-center justify-center bg-[rgba(7,7,15,0.7)] backdrop-blur-sm">
              <div className="bg-[var(--surface)] border border-[var(--risk)] rounded-2xl p-6 max-w-sm mx-4">
                <div className="text-3xl text-center mb-4">&#x26A0;</div>
                <h4 className="font-display font-bold text-white text-center mb-3">Are you sure?</h4>
                <p className="text-sm text-white/70 text-center mb-6 leading-relaxed">
                  If you haven&apos;t {stepLayers[currentSliceIndex].step.actionVerb.toLowerCase()}d this yet, go back &mdash; skipping this step costs you ~&pound;{calcSaving(stepLayers[currentSliceIndex].layer, bestPrice)}.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={goBack}
                    className="flex-1 px-4 py-3 border border-[var(--border)] text-white font-display font-bold text-sm rounded-xl hover:border-white/30 transition-colors"
                  >
                    Go back
                  </button>
                  <button
                    onClick={confirmContinue}
                    className="flex-1 px-4 py-3 bg-[var(--risk)] text-[var(--void)] font-display font-bold text-sm rounded-xl hover:brightness-110 transition-all"
                  >
                    Yes, continue &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  )
}
