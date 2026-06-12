'use client'

import { useState, useRef, useEffect, useId, useMemo, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSearchIndex } from './SearchProvider'
import { searchProducts, productHref, CATEGORY_LABELS } from '@/lib/search'

const NO_RESULT_CATEGORIES: [string, string][] = [
  ['/laptops', 'Laptops'],
  ['/phones', 'Phones'],
  ['/tablets', 'Tablets'],
  ['/tvs', 'TVs'],
  ['/monitors', 'Monitors'],
  ['/headphones', 'Headphones'],
  ['/smartwatches', 'Smartwatches'],
]

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export default function SearchBox({
  className = '',
  autoFocus = false,
  onNavigate,
}: {
  className?: string
  autoFocus?: boolean
  onNavigate?: () => void
}) {
  const index = useSearchIndex()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const results = useMemo(() => searchProducts(index, query), [index, query])
  const showDropdown = open && query.trim().length > 0

  // Reset highlight whenever the query changes.
  useEffect(() => {
    setSelected(0)
  }, [query])

  // Close on outside click.
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  function closeAfterNav() {
    setOpen(false)
    setQuery('')
    onNavigate?.()
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (!showDropdown || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(s => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(s => Math.max(s - 1, 0))
    } else if (e.key === 'Enter') {
      const target = results[selected]
      if (target) {
        e.preventDefault()
        router.push(productHref(target))
        closeAfterNav()
      }
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <span className="absolute left-3 text-[var(--ink-faint)] pointer-events-none">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="Search products"
          aria-activedescendant={
            showDropdown && results[selected] ? `${listId}-opt-${selected}` : undefined
          }
          placeholder="Search products…"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="w-full bg-[var(--surface-2)] border border-[var(--border)] focus:border-[var(--border-2)] rounded-[10px] pl-9 pr-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] outline-none transition-colors"
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 mt-2 z-50 card overflow-hidden py-1.5">
          {results.length > 0 ? (
            <ul role="listbox" id={listId} aria-label="Search results">
              {results.map((p, i) => (
                <li key={`${p.category}-${p.slug}`} id={`${listId}-opt-${i}`} role="option" aria-selected={i === selected}>
                  <Link
                    href={productHref(p)}
                    onClick={closeAfterNav}
                    onMouseEnter={() => setSelected(i)}
                    className={`flex items-center justify-between gap-3 px-3.5 py-2.5 transition-colors ${
                      i === selected ? 'bg-[var(--slice-dim)]' : 'hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <span className="text-sm font-medium text-[var(--ink)] truncate">{p.name}</span>
                    <span className="text-xs text-[var(--ink-dim)] shrink-0">
                      {CATEGORY_LABELS[p.category] ?? p.category}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3.5 py-3">
              <div className="text-sm text-[var(--ink-dim)] mb-3">No matches — try a model name</div>
              <div className="flex flex-wrap gap-1.5">
                {NO_RESULT_CATEGORIES.map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeAfterNav}
                    className="text-xs text-[var(--ink-dim)] hover:text-[var(--ink)] bg-[var(--surface-2)] border border-[var(--border)] rounded-[var(--radius-pill)] px-2.5 py-1 transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
