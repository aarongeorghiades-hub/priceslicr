import CategoryIndex from '@/components/CategoryIndex'

export const metadata = {
  title: 'Headphone Price Comparison UK',
  description: 'Compare headphone prices across every UK retailer. ANC, wireless, premium audio — every saving layer surfaced.',
}

export default function HeadphonesPage() {
  return <CategoryIndex category="headphones" title="Headphones" description="Compare headphone prices across every UK retailer. ANC, wireless, premium audio — every saving layer surfaced." />
}
