import type { Metadata } from 'next'
import CategoryIndex from '@/components/CategoryIndex'
import { buildCategoryMetadata } from '@/lib/seoMeta'

export async function generateMetadata(): Promise<Metadata> {
  return buildCategoryMetadata({ category: 'laptop', label: 'Laptops', path: '/laptops' })
}

export default function LaptopsPage() {
  return <CategoryIndex category="laptop" title="Laptops" singular="laptop" description="20 hero products. 11 retailers. Every saving layer — cashback, trade-in, price matching, student rates — surfaced automatically." />
}
