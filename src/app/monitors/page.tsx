import CategoryIndex from '@/components/CategoryIndex'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Monitor Price Comparison UK',
  description: 'Compare monitor prices across every UK retailer. 4K, ultrawide, OLED gaming — every saving layer surfaced.',
  path: '/monitors',
})

export default function MonitorsPage() {
  return <CategoryIndex category="monitor" title="Monitors" singular="monitor" description="Compare monitor prices across every UK retailer. 4K, ultrawide, OLED gaming — every saving layer surfaced." />
}
