import CategoryIndex from '@/components/CategoryIndex'

export const metadata = {
  title: 'Smartwatch Price Comparison UK',
  description: 'Compare smartwatch prices across every UK retailer. Apple Watch, Samsung, Garmin — every saving layer surfaced.',
}

export default function SmartwatchesPage() {
  return <CategoryIndex category="smartwatch" title="Smartwatches" singular="smartwatch" description="Compare smartwatch prices across every UK retailer. Apple Watch, Samsung, Garmin — every saving layer surfaced." />
}
