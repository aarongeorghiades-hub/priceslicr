import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-12 py-5 border-b border-[var(--border)] bg-[rgba(7,7,15,0.92)] backdrop-blur-lg">
      <Link href="/" className="flex items-center font-display text-2xl font-extrabold tracking-tight">
        <span className="text-white">Price</span>
        <span
          className="text-[var(--slice)] animate-slash-drop mx-px"
          style={{ display: 'inline-block', transformOrigin: 'center' }}
        >
          /
        </span>
        <span className="text-[var(--slice)]">Slicr</span>
      </Link>
      <div className="flex items-center gap-8">
        <Link href="/laptops" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
          Laptops
        </Link>
        <Link href="/how-it-works" className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
          How it works
        </Link>
        <span className="text-xs text-[var(--slice)] bg-[var(--slice-dim)] border border-[rgba(0,194,255,0.22)] px-3 py-1 rounded-full">
          Beta
        </span>
      </div>
    </nav>
  )
}
