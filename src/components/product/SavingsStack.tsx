'use client'

import { useState } from 'react'
import type { DiscountLayer } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  cashback:        'Cashback portal',
  gift_card:       'Gift card cashback',
  card_linked:     'Card-linked cashback',
  credit_card:     'Credit card',
  card_cashback:   'Card cashback',
  student:         'Student discount',
  youth_discount:  'Youth discount',
  nhs:             'NHS / public sector',
  key_worker:      'Key worker discount',
  bnpl:            'Buy now pay later',
  signup:          'New customer offer',
  refurbished:     'Refurbished deal',
  trade_in:        'Trade-in',
  salary_sacrifice:'Salary sacrifice',
  armed_forces:    'Armed forces',
  email:           'Email signup',
}

const TYPE_ICON: Record<string, string> = {
  cashback:        '\u21A9',
  gift_card:       '\uD83C\uDF81',
  card_linked:     '\u2B21',
  credit_card:     '\u25C8',
  card_cashback:   '\u25C8',
  student:         '\u2726',
  youth_discount:  '\u2726',
  nhs:             '\u2726',
  key_worker:      '\u2726',
  bnpl:            '\u29D6',
  signup:          '\u2709',
  refurbished:     '\u27F3',
  trade_in:        '\u21C6',
  salary_sacrifice:'\u25CE',
}

const TYPE_COLOR: Record<string, { bg: string; text: string }> = {
  cashback:        { bg: 'bg-[var(--slice-dim)]', text: 'text-[var(--slice-text)]' },
  gift_card:       { bg: 'bg-[var(--slice-dim)]', text: 'text-[var(--slice-text)]' },
  card_linked:     { bg: 'bg-[var(--slice-dim)]',   text: 'text-[var(--slice-text)]' },
  credit_card:     { bg: 'bg-[var(--slice-dim)]',   text: 'text-[var(--slice-text)]' },
  card_cashback:   { bg: 'bg-[var(--slice-dim)]',   text: 'text-[var(--slice-text)]' },
  student:         { bg: 'bg-[rgba(224,32,32,0.12)]', text: 'text-[var(--slice-text)]' },
  youth_discount:  { bg: 'bg-[rgba(224,32,32,0.12)]', text: 'text-[var(--slice-text)]' },
  nhs:             { bg: 'bg-[rgba(224,32,32,0.12)]', text: 'text-[var(--slice-text)]' },
  key_worker:      { bg: 'bg-[rgba(224,32,32,0.12)]', text: 'text-[var(--slice-text)]' },
  bnpl:            { bg: 'bg-[var(--risk-dim)]',    text: 'text-[var(--risk)]' },
  signup:          { bg: 'bg-[var(--slice-dim)]',   text: 'text-[var(--slice-text)]' },
  refurbished:     { bg: 'bg-[var(--risk-dim)]',    text: 'text-[var(--risk)]' },
  trade_in:        { bg: 'bg-[var(--slice-dim)]', text: 'text-[var(--slice-text)]' },
  salary_sacrifice:{ bg: 'bg-[rgba(90,90,138,0.15)]', text: 'text-[var(--ink-dim)]' },
}

function formatValue(layer: DiscountLayer): string {
  if (layer.value_type === 'percentage') return `${layer.value}%`
  if (layer.value_type === 'fixed_amount') return `\u00A3${layer.value}`
  return layer.description
}

function getCashbackPortalUrl(layer: DiscountLayer): string | null {
  // Always link to the portal's own retailer page — never through PriceSlicr affiliate
  if (layer.cashback_portal_url) return layer.cashback_portal_url
  if (layer.discount_type === 'cashback' && layer.retailer) {
    const slug = layer.retailer.slug
    if (layer.description.toLowerCase().includes('topcashback')) {
      return `https://www.topcashback.co.uk/${slug}/`
    }
    if (layer.description.toLowerCase().includes('quidco')) {
      return `https://www.quidco.com/shop/${slug}/`
    }
  }
  return null
}

export default function SavingsStack({ layers }: { layers: DiscountLayer[] }) {
  const [expandedType, setExpandedType] = useState<string | null>(null)

  // Group by discount_type
  const grouped = layers.reduce<Record<string, DiscountLayer[]>>((acc, layer) => {
    const key = layer.discount_type
    if (!acc[key]) acc[key] = []
    acc[key].push(layer)
    return acc
  }, {})

  const typeOrder = [
    'cashback', 'gift_card', 'card_cashback', 'card_linked', 'credit_card',
    'student', 'youth_discount', 'nhs', 'key_worker', 'trade_in', 'signup',
    'refurbished', 'bnpl', 'salary_sacrifice', 'armed_forces', 'email',
  ]

  const sortedTypes = Object.keys(grouped).sort(
    (a, b) => (typeOrder.indexOf(a) ?? 99) - (typeOrder.indexOf(b) ?? 99)
  )

  if (layers.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-sm text-[var(--ink-dim)]">No saving layers found.</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">

      {/* Stacking guide */}
      <div className="card p-5">
        <div className="text-xs uppercase tracking-widest text-[var(--ink-dim)] mb-4 font-medium">Key stacking rules</div>
        <div className="space-y-2">
          {[
            { rule: 'Cashback portal + credit card', result: 'YES \u2014 can stack', ok: true },
            { rule: 'Gift card discount + cashback portal', result: 'NO \u2014 use one or the other per purchase', ok: false },
            { rule: 'Gift card discount + card rewards', result: 'YES \u2014 your card still earns on gift card purchases', ok: true },
            { rule: 'Card-linked offer + cashback portal', result: 'YES \u2014 they track separately', ok: true },
            { rule: 'Trade-in + everything else', result: 'YES \u2014 always stacks', ok: true },
            { rule: 'Key worker discount + student discount', result: 'NO \u2014 retailers only accept one discount code', ok: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-[var(--ink-dim)]">{item.rule}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded shrink-0 ${
                item.ok
                  ? 'bg-[var(--slice-dim)] text-[var(--slice-text)] border border-[rgba(224,32,32,0.2)]'
                  : 'bg-[var(--risk-dim)] text-[var(--risk)] border border-[rgba(255,181,32,0.2)]'
              }`}>
                {item.result}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Layers by type */}
      {sortedTypes.map(type => {
        const typeLayers = grouped[type]
        const color = TYPE_COLOR[type] ?? { bg: 'bg-[rgba(90,90,138,0.15)]', text: 'text-[var(--ink-dim)]' }
        const icon = TYPE_ICON[type] ?? '\u25C6'
        const label = TYPE_LABELS[type] ?? type
        const isExpanded = expandedType === type
        const isRisk = type === 'bnpl'

        return (
          <div key={type} className="card overflow-hidden">
            <button
              onClick={() => setExpandedType(isExpanded ? null : type)}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors text-left"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${color.bg} ${color.text}`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--ink)]">{label}</span>
                  {isRisk && (
                    <span className="text-xs font-semibold text-[var(--risk)] bg-[var(--risk-dim)] border border-[rgba(255,181,32,0.2)] px-2 py-0.5 rounded">
                      Interest risk
                    </span>
                  )}
                </div>
                <div className="meta text-[var(--ink-dim)] mt-0.5">
                  {typeLayers.length} option{typeLayers.length !== 1 ? 's' : ''} &middot; best: {formatValue(typeLayers[0])}
                </div>
              </div>
              <span className={`text-[var(--ink-dim)] text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>&darr;</span>
            </button>

            {isExpanded && (
              <div className="border-t border-[var(--border)]">
                {typeLayers.map((layer, i) => {
                  const portalUrl = getCashbackPortalUrl(layer)
                  return (
                    <div
                      key={layer.id}
                      className={`px-5 py-4 ${i < typeLayers.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-[var(--ink)] mb-1">{layer.description}</div>
                          {layer.conditions && (
                            <div className="meta text-[var(--ink-dim)] leading-relaxed">{layer.conditions}</div>
                          )}
                          {layer.valid_until && (
                            <div className="meta text-[var(--risk)] mt-1">
                              Expires {new Date(layer.valid_until).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`font-mono text-lg font-medium ${color.text}`}>
                            {layer.value_type === 'percentage' ? `${layer.value}%` : `\u00A3${layer.value}`}
                          </div>
                          {layer.min_spend && (
                            <div className="meta text-[var(--ink-dim)]">min \u00A3{layer.min_spend}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        {layer.is_stackable && (
                          <span className="text-xs font-semibold text-[var(--slice-text)] bg-[var(--slice-dim)] border border-[rgba(224,32,32,0.15)] px-2 py-0.5 rounded">
                            &check; Stackable
                          </span>
                        )}
                        {layer.verification_required && layer.verification_platform && (
                          <span className="text-xs font-semibold text-[var(--ink-dim)] bg-[rgba(90,90,138,0.12)] border border-[rgba(90,90,138,0.2)] px-2 py-0.5 rounded">
                            Verify: {layer.verification_platform}
                          </span>
                        )}
                        {layer.retailer && (
                          <span className="meta text-[var(--ink-dim)]">
                            @ {layer.retailer.name}
                          </span>
                        )}
                        {portalUrl && (
                          <a
                            href={portalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto meta text-[var(--slice-text)] hover:underline shrink-0"
                          >
                            Activate via portal &rarr;
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
