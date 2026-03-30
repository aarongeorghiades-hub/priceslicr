import CategoryIndex from '@/components/CategoryIndex'

export const metadata = {
  title: 'TV Price Comparison UK',
  description: 'Compare TV prices across every UK retailer. OLED, QLED, Mini-LED — every saving layer from cashback to price matching.',
}

export default function TVsPage() {
  return <CategoryIndex category="tv" title="TVs" singular="TV" description="Compare TV prices across every UK retailer. OLED, QLED, Mini-LED — every saving layer from cashback to price matching." />
}
