'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SearchBox from '@/components/search/SearchBox'

const CATEGORIES = [
  { label: 'Laptops', href: '/laptops' },
  { label: 'Phones', href: '/phones' },
  { label: 'Tablets', href: '/tablets' },
  { label: 'TVs', href: '/tvs' },
  { label: 'Monitors', href: '/monitors' },
  { label: 'Headphones & Earphones', href: '/headphones' },
  { label: 'Smartwatches', href: '/smartwatches' },
]

const LINKS = [
  { label: 'Trade-in', href: '/trade-in' },
  { label: 'Sale timing', href: '/sale-timing' },
  { label: 'How it works', href: '/how-it-works' },
]

function Wordmark() {
  return (
    <Link href="/" className="flex items-center font-display text-2xl md:text-3xl font-bold tracking-tight">
      <span className="text-[var(--ink)]">Price</span>
      <span className="text-[var(--slice-text)]">/</span>
      <span className="text-[var(--ink)]">Slicr</span>
    </Link>
  )
}

export default function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const isActive = (href: string) => pathname === href
  const productsActive = CATEGORIES.some(c => pathname?.startsWith(c.href))

  // Single accent device: an underline on the active item.
  const linkBase =
    'relative text-sm font-medium transition-colors duration-150 after:absolute after:left-0 after:-bottom-1.5 after:h-px after:bg-[var(--slice)] after:transition-all after:duration-200'
  const linkActive = 'text-[var(--ink)] after:w-full'
  const linkIdle = 'text-[var(--ink-dim)] hover:text-[var(--ink)] after:w-0'

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[rgba(10,7,7,0.8)] backdrop-blur-xl">
      <div className="max-w-[1200px] mx-auto flex items-center gap-3 px-6 md:px-12 h-20">
        <Wordmark />

        {/* Desktop search — flexible width, shrinks to fit */}
        <div className="hidden md:flex flex-1 min-w-0 justify-center px-2 lg:px-4">
          <SearchBox className="w-full max-w-[260px]" />
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 shrink-0">
          {/* Products dropdown */}
          <div className="relative group">
            <button
              className={`${linkBase} ${productsActive ? linkActive : linkIdle} flex items-center gap-1.5`}
            >
              Products
              <span className="text-[9px] opacity-50">&#x25BE;</span>
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-56 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-150 z-50">
              <div className="card overflow-hidden p-1.5">
                {CATEGORIES.map(cat => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className={`block px-3 py-2.5 text-sm rounded-[10px] transition-colors ${
                      pathname?.startsWith(cat.href)
                        ? 'text-[var(--ink)] bg-[var(--surface-2)]'
                        : 'text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`${linkBase} ${isActive(link.href) ? linkActive : linkIdle}`}
            >
              {link.label}
            </Link>
          ))}

          <span className="label text-xs text-[var(--ink-faint)] border border-[var(--border)] rounded-[var(--radius-pill)] px-3 py-1">
            Beta
          </span>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-1 ml-auto -mr-2">
          <button
            onClick={() => { setSearchOpen(v => !v); setOpen(false) }}
            aria-label={searchOpen ? 'Close search' : 'Open search'}
            aria-expanded={searchOpen}
            className="p-2 text-[var(--ink-dim)] hover:text-[var(--ink)] transition-colors"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
          <button
            onClick={() => { setOpen(v => !v); setSearchOpen(false) }}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex flex-col gap-1.5 p-2"
          >
            <span
              className="block w-5 h-px bg-[var(--ink)] transition-transform duration-200"
              style={{ transform: open ? 'translateY(3px) rotate(45deg)' : 'none' }}
            />
            <span
              className="block w-5 h-px bg-[var(--ink)] transition-transform duration-200"
              style={{ transform: open ? 'translateY(-3px) rotate(-45deg)' : 'none' }}
            />
          </button>
        </div>
      </div>

      {/* Mobile search panel */}
      {searchOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] px-6 py-4">
          <SearchBox className="w-full" autoFocus onNavigate={() => setSearchOpen(false)} />
        </div>
      )}

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="px-6 py-5 flex flex-col gap-1">
            <div className="label mb-2 text-[var(--ink-faint)]">Products</div>
            {CATEGORIES.map(cat => (
              <Link
                key={cat.href}
                href={cat.href}
                onClick={() => setOpen(false)}
                className={`py-2.5 text-base ${
                  pathname?.startsWith(cat.href) ? 'text-[var(--ink)]' : 'text-[var(--ink-dim)]'
                }`}
              >
                {cat.label}
              </Link>
            ))}
            <div className="h-px bg-[var(--border)] my-3" />
            {LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`py-2.5 text-base ${
                  isActive(link.href) ? 'text-[var(--ink)]' : 'text-[var(--ink-dim)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
