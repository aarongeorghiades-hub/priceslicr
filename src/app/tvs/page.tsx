import type { Metadata } from 'next'
import CategoryIndex from '@/components/CategoryIndex'
import { buildCategoryMetadata } from '@/lib/seoMeta'

export async function generateMetadata(): Promise<Metadata> {
  return buildCategoryMetadata({ category: 'tv', label: 'TVs', path: '/tvs' })
}

export default function TVsPage() {
  return <CategoryIndex category="tv" title="TVs" singular="TV" labelOverride="UK TVs COMPARISON" description="Compare TV prices across every UK retailer. OLED, QLED, Mini-LED — every saving layer from cashback to price matching." />
}
