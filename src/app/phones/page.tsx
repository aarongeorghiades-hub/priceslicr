import type { Metadata } from 'next'
import CategoryIndex from '@/components/CategoryIndex'
import { buildCategoryMetadata } from '@/lib/seoMeta'

export async function generateMetadata(): Promise<Metadata> {
  return buildCategoryMetadata({ category: 'phone', label: 'Phones', path: '/phones' })
}

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
