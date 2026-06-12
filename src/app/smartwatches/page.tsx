import CategoryIndex from '@/components/CategoryIndex'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Smartwatch Price Comparison UK',
  description: 'Compare smartwatch prices across every UK retailer. Apple Watch, Samsung, Garmin — every saving layer surfaced.',
  path: '/smartwatches',
})

export default function SmartwatchesPage() {
  return <CategoryIndex category="smartwatch" title="Smartwatches" singular="smartwatch" description="Compare smartwatch prices across every UK retailer. Apple Watch, Samsung, Garmin — every saving layer surfaced." />
}
