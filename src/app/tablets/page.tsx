import CategoryIndex from '@/components/CategoryIndex'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Tablet Price Comparison UK',
  description: 'Compare tablet prices across every UK retailer — iPad, Samsung, and more. Every saving layer surfaced automatically.',
  path: '/tablets',
})

export default function TabletsPage() {
  return <CategoryIndex category="tablet" title="Tablets" singular="tablet" description="Compare tablet prices across every UK retailer — iPad, Samsung, and more. Every saving layer surfaced automatically." />
}
