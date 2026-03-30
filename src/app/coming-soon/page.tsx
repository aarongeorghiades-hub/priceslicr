import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coming Soon — PriceSlicr',
  description: 'PriceSlicr is coming soon. Something sharp is on its way.',
}

export default function ComingSoonPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#07070F' }}
    >
      <div className="text-center">
        <div className="font-display text-4xl font-extrabold tracking-tight mb-8">
          <span style={{ color: '#fff' }}>Price</span>
          <span style={{ color: '#00C2FF' }}>/</span>
          <span style={{ color: '#00C2FF' }}>Slicr</span>
        </div>
        <h1
          className="font-display text-2xl font-bold mb-3"
          style={{ color: '#E8E8F5' }}
        >
          Coming soon.
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>
          Something sharp is on its way.
        </p>
      </div>
    </div>
  )
}
