import CategoryIndex from '@/components/CategoryIndex'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Phone Price Comparison UK',
  description: 'Compare outright phone prices across every UK retailer — new and refurbished. Every saving layer: cashback, trade-in, student rates, and price matching.',
  path: '/phones',
})

export default function PhonesPage() {
  return (
    <CategoryIndex
      category="phone"
      title="Phones"
      singular="SIM-free phone"
      description="Compare outright phone prices across every UK retailer — new and refurbished. Every saving layer: cashback, trade-in, student rates, and price matching. Pairs with any SIM-only contract."
      headlineOverride={
        <h1 className="heading-section text-[var(--ink)]">
          SIM-Free Phones.<br />
          <span className="text-[var(--slice-text)]">Every Saving.</span>
        </h1>
      }
    />
  )
}
