import CategoryIndex from '@/components/CategoryIndex'

export const metadata = {
  title: 'Tablet Price Comparison UK',
  description: 'Compare tablet prices across every UK retailer — iPad, Samsung, and more. Every saving layer surfaced automatically.',
}

export default function TabletsPage() {
  return <CategoryIndex category="tablet" title="Tablets" singular="tablet" description="Compare tablet prices across every UK retailer — iPad, Samsung, and more. Every saving layer surfaced automatically." />
}
