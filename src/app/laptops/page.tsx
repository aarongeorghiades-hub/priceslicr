import CategoryIndex from '@/components/CategoryIndex'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Laptop Price Comparison UK',
  description: 'Compare laptop prices across every UK retailer — new, refurbished, and used. Find every saving layer automatically.',
  path: '/laptops',
})

export default function LaptopsPage() {
  return <CategoryIndex category="laptop" title="Laptops" singular="laptop" description="20 hero products. 11 retailers. Every saving layer — cashback, trade-in, price matching, student rates — surfaced automatically." />
}
