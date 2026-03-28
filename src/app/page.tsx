import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-dark flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-2xl text-white tracking-tight">
            Price<span className="text-brand-primary">Slicr</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/laptops"
            className="text-sm text-brand-muted hover:text-white transition-colors"
          >
            Laptops
          </Link>
          <span className="text-xs bg-brand-primary/20 text-brand-primary px-3 py-1 rounded-full font-medium border border-brand-primary/30">
            Beta
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="animate-fade-up max-w-4xl mx-auto">

          <div className="inline-flex items-center gap-2 bg-white/5 border border-brand-border rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            <span className="text-sm text-brand-muted">
              The honest UK electronics price comparison
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6">
            Slice through every{' '}
            <span className="relative inline-block">
              <span className="text-brand-primary">retailer&apos;s price.</span>
              <span className="absolute bottom-1 left-0 w-full h-0.5 bg-brand-primary/40 rounded-full" />
            </span>
          </h1>

          <p className="text-lg text-brand-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Compare new, refurbished, and used laptop prices across every UK retailer.
            We cut through to every available saving — cashback, trade-in, price matching,
            student rates, and sale timing — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/laptops"
              className="px-8 py-4 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold rounded-xl transition-colors text-lg shadow-lg shadow-brand-primary/20"
            >
              Compare laptops →
            </Link>
            <span className="text-sm text-brand-muted">
              No ads. No cookie manipulation. Just the full picture.
            </span>
          </div>
        </div>
      </section>

      {/* Saving layers strip */}
      <section className="border-t border-brand-border px-6 py-8 bg-brand-surface">
        <p className="text-xs text-brand-muted text-center uppercase tracking-widest mb-6 font-medium">
          Every saving layer — surfaced automatically
        </p>
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-3">
          {[
            'Retailer price',
            '→ Cashback',
            '→ Trade-in value',
            '→ Price match',
            '→ Student / NHS rate',
            '→ New customer offer',
            '→ Sale timing',
            '= True cost',
          ].map((label) => (
            <span
              key={label}
              className={`text-sm px-3 py-1.5 rounded-lg font-medium ${
                label === '= True cost'
                  ? 'bg-brand-green/20 text-brand-green border border-brand-green/30'
                  : label === 'Retailer price'
                  ? 'bg-white/5 text-brand-muted border border-brand-border'
                  : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-brand-border px-6 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Retailers covered', value: '11' },
            { label: 'Laptop models', value: '20' },
            { label: 'Saving layers tracked', value: '7' },
            { label: 'Avg saving surfaced', value: '£180+' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-display text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-brand-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-border px-6 py-6 text-center">
        <p className="text-xs text-brand-muted">
          © 2026 PriceSlicr · priceslicr.com · Independent. No retailer funding.
        </p>
      </footer>

    </main>
  )
}
