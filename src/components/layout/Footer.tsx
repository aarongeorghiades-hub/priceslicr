import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--border)]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-10 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="font-display text-base font-bold">
            <span className="text-[var(--ink)]">Price</span><span className="text-[var(--slice-text)]">/Slicr</span>
          </div>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/used-refurbished-tech-uk" className="label text-[13px] text-[var(--ink-faint)] hover:text-[var(--ink-dim)] transition-colors">
              Used &amp; Refurbished
            </Link>
            <Link href="/privacy" className="label text-[13px] text-[var(--ink-faint)] hover:text-[var(--ink-dim)] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="label text-[13px] text-[var(--ink-faint)] hover:text-[var(--ink-dim)] transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="label text-[13px] text-[var(--ink-faint)] hover:text-[var(--ink-dim)] transition-colors">
              Contact
            </Link>
          </nav>
        </div>

        <div className="label text-[13px] text-[var(--ink-faint)] leading-relaxed max-w-3xl">
          PriceSlicr is operated by ENA Enterprises Ltd, registered in England and Wales (company no. 17257845).
        </div>
        <div className="label text-[13px] text-[var(--ink-faint)] leading-relaxed max-w-3xl">
          We may earn a commission when you buy through our links &mdash; it never affects the prices you see.
        </div>
        <div className="label text-[13px] text-[var(--ink-faint)]">
          &copy; 2026 PriceSlicr &middot; priceslicr.com
        </div>
      </div>
    </footer>
  )
}
