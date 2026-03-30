import CategoryIndex from '@/components/CategoryIndex'

export const metadata = {
  title: 'Monitor Price Comparison UK',
  description: 'Compare monitor prices across every UK retailer. 4K, ultrawide, OLED gaming — every saving layer surfaced.',
}

export default function MonitorsPage() {
  return <CategoryIndex category="monitor" title="Monitors" description="Compare monitor prices across every UK retailer. 4K, ultrawide, OLED gaming — every saving layer surfaced." />
}
