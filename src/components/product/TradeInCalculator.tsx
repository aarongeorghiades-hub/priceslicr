'use client'

import { useState, useMemo } from 'react'
import {
  TRADE_IN_DEVICES,
  PLATFORM_META,
  type GradeKey,
  type PlatformKey,
} from '@/lib/trade-in-data'

const GRADE_LABELS: Record<GradeKey, string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor / Faulty',
}

const GRADE_DESCRIPTIONS: Record<GradeKey, string> = {
  excellent: 'Looks and works like new. No scratches, full battery health.',
  good: 'Light wear, fully functional. Minor cosmetic marks only.',
  fair: 'Visible scratches or scuffs. All functions work. Screen intact.',
  poor: 'Cracked screen, heavy damage, or not fully functional.',
}

const CATEGORY_LABELS = {
  laptop: 'Laptops',
  phone: 'Phones',
  tablet: 'Tablets',
}

export default function TradeInCalculator() {
  const [selectedCategory, setSelectedCategory] = useState<'laptop' | 'phone' | 'tablet'>('laptop')
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const [selectedGrade, setSelectedGrade] = useState<GradeKey | ''>('')

  const filteredDevices = useMemo(
    () => TRADE_IN_DEVICES.filter(d => d.category === selectedCategory),
    [selectedCategory]
  )

  const selectedDevice = TRADE_IN_DEVICES.find(d => d.id === selectedDeviceId)
  const gradeValues = selectedDevice && selectedGrade ? selectedDevice.grades[selectedGrade] : null

  const results = gradeValues
    ? (Object.entries(gradeValues) as [PlatformKey, number | null][])
        .filter(([, val]) => val !== null)
        .map(([platform, val]) => ({
          platform,
          meta: PLATFORM_META[platform],
          value: val as number,
        }))
        .sort((a, b) => b.value - a.value)
    : []

  const best = results[0]

  function handleCategoryChange(cat: typeof selectedCategory) {
    setSelectedCategory(cat)
    setSelectedDeviceId('')
    setSelectedGrade('')
  }

  return (
    <div className="space-y-6">

      {/* Step 1 — Category */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
        <div className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4 font-medium">
          1 &middot; What are you trading in?
        </div>
        <div className="flex gap-3">
          {(['laptop', 'phone', 'tablet'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`flex-1 py-3 rounded-xl text-sm font-display font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-[var(--slice)] text-[var(--void)]'
                  : 'bg-[rgba(255,255,255,0.04)] text-[var(--muted)] border border-[var(--border)] hover:border-[var(--slice)] hover:text-[var(--ink)]'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2 — Device */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
        <div className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4 font-medium">
          2 &middot; Select your device
        </div>
        <div className="grid grid-cols-1 gap-2">
          {filteredDevices.map(device => (
            <button
              key={device.id}
              onClick={() => { setSelectedDeviceId(device.id); setSelectedGrade('') }}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all slice-bar ${
                selectedDeviceId === device.id
                  ? 'bg-[var(--slice-dim)] border border-[var(--slice)] text-[var(--ink)]'
                  : 'bg-[rgba(255,255,255,0.02)] border border-[var(--border)] text-[var(--muted)] hover:border-[rgba(0,194,255,0.3)] hover:text-[var(--ink)]'
              }`}
            >
              <span className="text-sm font-medium">{device.name}</span>
              {selectedDeviceId === device.id && (
                <span className="text-[var(--slice)] text-xs">Selected</span>
              )}
            </button>
          ))}
          <p className="text-[11px] text-[var(--muted)] mt-2 px-1">
            Don&apos;t see your device? These are the most commonly traded models. More coming soon.
          </p>
        </div>
      </div>

      {/* Step 3 — Condition */}
      {selectedDeviceId && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
          <div className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4 font-medium">
            3 &middot; What condition is it in?
          </div>
          <div className="space-y-2">
            {(['excellent', 'good', 'fair', 'poor'] as GradeKey[]).map(grade => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`w-full flex items-start gap-4 px-4 py-3 rounded-xl text-left transition-all ${
                  selectedGrade === grade
                    ? 'bg-[var(--slice-dim)] border border-[var(--slice)]'
                    : 'bg-[rgba(255,255,255,0.02)] border border-[var(--border)] hover:border-[rgba(0,194,255,0.3)]'
                }`}
              >
                <div className="flex-1">
                  <div className={`text-sm font-medium mb-0.5 ${selectedGrade === grade ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                    {GRADE_LABELS[grade]}
                  </div>
                  <div className="text-[11px] text-[var(--muted)] leading-relaxed">
                    {GRADE_DESCRIPTIONS[grade]}
                  </div>
                </div>
                {selectedGrade === grade && (
                  <span className="text-[var(--slice)] text-xs shrink-0 mt-0.5">&check;</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display font-bold text-white text-sm mb-1">
                  Trade-in values
                </div>
                <div className="text-[11px] text-[var(--muted)]">
                  {selectedDevice?.name} &middot; {GRADE_LABELS[selectedGrade as GradeKey]} condition &middot; typical ranges
                </div>
              </div>
              {best && (
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-widest text-[var(--muted)] mb-0.5">Best offer</div>
                  <div className="font-mono text-2xl font-medium text-[var(--savings)] savings-glow">
                    &pound;{best.value}
                  </div>
                  <div className="text-[11px] text-[var(--muted)]">{best.meta.name}</div>
                </div>
              )}
            </div>
          </div>

          {results.map((result, i) => (
            <div
              key={result.platform}
              className={`flex items-center gap-4 px-6 py-4 ${i < results.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-[var(--ink)]">{result.meta.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                    result.meta.type === 'cash'
                      ? 'bg-[var(--savings-dim)] text-[var(--savings)] border-[rgba(0,255,133,0.2)]'
                      : result.meta.type === 'voucher'
                      ? 'bg-[var(--risk-dim)] text-[var(--risk)] border-[rgba(255,181,32,0.2)]'
                      : 'bg-[var(--slice-dim)] text-[var(--slice)] border-[rgba(0,194,255,0.2)]'
                  }`}>
                    {result.meta.type === 'cash' ? 'Cash' : result.meta.type === 'voucher' ? 'Voucher' : 'Store credit'}
                  </span>
                  {i === 0 && (
                    <span className="text-[10px] text-[var(--savings)] bg-[var(--savings-dim)] border border-[rgba(0,255,133,0.15)] px-2 py-0.5 rounded">
                      Best
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[var(--muted)] leading-relaxed">
                  {result.meta.note}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className={`font-mono text-xl font-medium ${i === 0 ? 'text-[var(--savings)] savings-glow' : 'text-white'}`}>
                  &pound;{result.value}
                </div>
                <a
                  href={result.meta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[var(--slice)] hover:underline"
                >
                  Get quote &rarr;
                </a>
              </div>
            </div>
          ))}

          {/* Stacking tip */}
          <div className="px-6 py-4 bg-[rgba(0,255,133,0.04)] border-t border-[rgba(0,255,133,0.1)]">
            <div className="text-[11px] text-[var(--savings)] font-medium mb-1">
              &check; Trade-in stacks with everything
            </div>
            <div className="text-[11px] text-[var(--muted)] leading-relaxed">
              Your trade-in value is independent of how you pay for your new laptop. Stack it with portal cashback, a student discount, gift card cashback, or a new customer offer &mdash; they all combine.
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[11px] text-[var(--muted)] leading-relaxed px-1">
        Values shown are typical ranges based on market research and are not guaranteed quotes. Actual offers depend on device condition assessment at the point of trade-in. Always get a live quote before committing.
      </p>
    </div>
  )
}
