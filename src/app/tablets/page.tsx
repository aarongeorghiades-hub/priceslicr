import type { Metadata } from 'next'
import CategoryIndex from '@/components/CategoryIndex'
import { buildCategoryMetadata } from '@/lib/seoMeta'

export async function generateMetadata(): Promise<Metadata> {
  return buildCategoryMetadata({ category: 'tablet', label: 'Tablets', path: '/tablets' })
}

export default function TabletsPage() {
  return <CategoryIndex category="tablet" title="Tablets" singular="tablet" description="Compare tablet prices across every UK retailer — iPad, Samsung, and more. Every saving layer surfaced automatically." />
}
