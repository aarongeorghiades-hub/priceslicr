import CategoryIndex from '@/components/CategoryIndex'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'TV Price Comparison UK',
  description: 'Compare TV prices across every UK retailer. OLED, QLED, Mini-LED — every saving layer from cashback to price matching.',
  path: '/tvs',
})

export default function TVsPage() {
  return <CategoryIndex category="tv" title="TVs" singular="TV" labelOverride="UK TVs COMPARISON" description="Compare TV prices across every UK retailer. OLED, QLED, Mini-LED — every saving layer from cashback to price matching." />
}
