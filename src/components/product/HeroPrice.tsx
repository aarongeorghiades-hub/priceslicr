'use client'

import { useCondition } from './ConditionContext'
import { SEGMENT_LABELS, type ConditionSegment } from '@/lib/conditionSlices'

export interface SegmentPrice {
  segment: ConditionSegment
  label: string
  price: number
}

function formatGBP(n: number) {
  return n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Segmented control. Renders only the conditions present on this product.
// One condition → a static chip (the existing pill treatment), not a toggle.
function ConditionToggle({ segments }: { segments: SegmentPrice[] }) {
  const { segment, setSegment } = useCondition()

  if (segments.length <= 1) {
    const only = segments[0]
    if (!only) return null
    return (
      <span className="label text-xs text-[var(--ink-dim)] bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-2 py-0.5">
        {only.label}
      </span>
    )
  }

  const idx = segments.findIndex(s => s.segment === segment)

  function move(delta: number) {
    const next = segments[(idx + delta + segments.length) % segments.length]
    setSegment(next.segment)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      move(1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      move(-1)
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Condition"
      onKeyDown={onKeyDown}
      className="inline-flex gap-1 p-1 rounded-[var(--radius-pill)] bg-[var(--surface-2)] border border-[var(--border)]"
    >
      {segments.map(s => {
        const selected = s.segment === segment
        return (
          <button
            key={s.segment}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => setSegment(s.segment)}
            className={`font-body text-xs font-medium px-3 py-1 rounded-[var(--radius-pill)] transition-colors ${
              selected
                ? 'bg-[var(--slice-dim)] text-[var(--slice-text)]'
                : 'text-[var(--ink-dim)] hover:text-[var(--ink)]'
            }`}
          >
            {s.label}
          </button>
        )
      })}
    </div>
  )
}

export default function HeroPrice({ segments }: { segments: SegmentPrice[] }) {
  const { segment, setSegment } = useCondition()

  const current = segments.find(s => s.segment === segment) ?? segments[0]
  if (!current) return null

  // Quiet discovery line: only when viewing New and a cheaper other condition exists.
  const newPrice = segments.find(s => s.segment === 'new')?.price
  const cheaperOther =
    segment === 'new' && newPrice !== undefined
      ? segments
          .filter(s => s.segment !== 'new' && s.price < newPrice)
          .sort((a, b) => a.price - b.price)[0]
      : undefined

  return (
    <div className="flex flex-col items-end gap-3">
      <ConditionToggle segments={segments} />
      <div className="card glow-slice px-7 py-5 text-right min-w-[200px]">
        <div className="eyebrow mb-2">From</div>
        <div className="price-num text-[2.5rem] leading-none text-[var(--slice-text)] savings-glow">
          &pound;{formatGBP(current.price)}
        </div>
        {cheaperOther && (
          <button
            type="button"
            onClick={() => setSegment(cheaperOther.segment)}
            className="font-body text-xs text-[var(--ink-dim)] hover:text-[var(--ink)] transition-colors mt-2"
          >
            from &pound;{Math.round(cheaperOther.price).toLocaleString('en-GB')}{' '}
            {SEGMENT_LABELS[cheaperOther.segment].toLowerCase()}
          </button>
        )}
      </div>
    </div>
  )
}
