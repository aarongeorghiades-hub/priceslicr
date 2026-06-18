import type { Metadata } from 'next'
import CategoryIndex from '@/components/CategoryIndex'
import { buildCategoryMetadata } from '@/lib/seoMeta'

export async function generateMetadata(): Promise<Metadata> {
  return buildCategoryMetadata({ category: 'monitor', label: 'Monitors', path: '/monitors' })
}

export default function MonitorsPage() {
  return <CategoryIndex category="monitor" title="Monitors" singular="monitor" description="Compare monitor prices across every UK retailer. 4K, ultrawide, OLED gaming — every saving layer surfaced." />
}
