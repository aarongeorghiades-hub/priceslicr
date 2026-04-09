import Link from 'next/link'

const CATEGORIES = [
  { label: 'Laptops', href: '/laptops' },
  { label: 'Phones', href: '/phones' },
  { label: 'Tablets', href: '/tablets' },
  { label: 'TVs', href: '/tvs' },
  { label: 'Monitors', href: '/monitors' },
  { label: 'Headphones & Earphones', href: '/headphones' },
  { label: 'Smartwatches', href: '/smartwatches' },
]

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-12 py-5 border-b border-[var(--border)] bg-[rgba(7,7,15,0.92)] backdrop-blur-lg">
      <Link href="/" className="flex items-center font-display text-2xl font-extrabold tracking-tight">
        <span className="text-white font-bold">Price</span>
        <span
          className="text-[var(--slice)] animate-slash-drop mx-px font-bold"
          style={{ display: 'inline-block', transformOrigin: 'center' }}
        >
          /
        </span>
        <span className="text-[var(--slice)] font-bold">Slicr</span>
      </Link>
      <div className="flex items-center gap-8">
        {/* Products dropdown */}
        <div className="relative group">
          <button className="text-sm font-bold text-white/70 hover:text-[var(--ink)] transition-colors flex items-center gap-1">
            Products
            <span className="text-[10px] opacity-60">&#x25BE;</span>
          </button>
          <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.href}
                href={cat.href}
                className="block px-4 py-2.5 text-sm text-white/70 hover:text-[var(--ink)] hover:bg-[rgba(255,255,255,0.04)] first:rounded-t-xl last:rounded-b-xl transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
        <Link href="/trade-in" className="text-sm font-bold text-white/70 hover:text-[var(--ink)] transition-colors">
          Trade-in
        </Link>
        <Link href="/sale-timing" className="text-sm font-bold text-white/70 hover:text-[var(--ink)] transition-colors">
          Sale timing
        </Link>
        <Link href="/how-it-works" className="text-sm font-bold text-white/70 hover:text-[var(--ink)] transition-colors">
          How it works
        </Link>
        <span className="text-xs font-bold text-[var(--slice)] bg-[var(--slice-dim)] border border-[rgba(0,194,255,0.22)] px-3 py-1 rounded-full">
          Beta
        </span>
      </div>
    </nav>
  )
}
