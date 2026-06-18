import type { Metadata } from 'next'
import CategoryIndex from '@/components/CategoryIndex'
import { buildCategoryMetadata } from '@/lib/seoMeta'

export async function generateMetadata(): Promise<Metadata> {
  return buildCategoryMetadata({ category: 'headphones', label: 'Headphones', path: '/headphones' })
}

export default function HeadphonesPage() {
  return <CategoryIndex category="headphones" title="Headphones" singular="headphone" description="Compare headphone prices across every UK retailer. ANC, wireless, premium audio — every saving layer surfaced." />
}
