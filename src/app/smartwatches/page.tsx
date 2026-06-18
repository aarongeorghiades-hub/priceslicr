import type { Metadata } from 'next'
import CategoryIndex from '@/components/CategoryIndex'
import { buildCategoryMetadata } from '@/lib/seoMeta'

export async function generateMetadata(): Promise<Metadata> {
  return buildCategoryMetadata({ category: 'smartwatch', label: 'Smartwatches', path: '/smartwatches' })
}

export default function SmartwatchesPage() {
  return <CategoryIndex category="smartwatch" title="Smartwatches" singular="smartwatch" description="Compare smartwatch prices across every UK retailer. Apple Watch, Samsung, Garmin — every saving layer surfaced." />
}
