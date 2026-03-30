import CategoryIndex from '@/components/CategoryIndex'

export const metadata = {
  title: 'Phone Price Comparison UK',
  description: 'Compare outright phone prices across every UK retailer — new and refurbished. Every saving layer: cashback, trade-in, student rates, and price matching.',
}

export default function PhonesPage() {
  return (
    <CategoryIndex
      category="phone"
      title="Phones"
      singular="SIM-free phone"
      description="Compare outright phone prices across every UK retailer — new and refurbished. Every saving layer: cashback, trade-in, student rates, and price matching. Pairs with any SIM-only contract."
      headlineOverride={
        <h1 className="font-display text-5xl font-extrabold text-white leading-tight">
          SIM-Free Phones.<br />
          <span className="text-[var(--slice)]">Every Saving.</span>
        </h1>
      }
    />
  )
}
