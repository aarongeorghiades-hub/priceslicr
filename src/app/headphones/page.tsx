import CategoryIndex from '@/components/CategoryIndex'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Headphone Price Comparison UK',
  description: 'Compare headphone prices across every UK retailer. ANC, wireless, premium audio — every saving layer surfaced.',
  path: '/headphones',
})

export default function HeadphonesPage() {
  return <CategoryIndex category="headphones" title="Headphones" singular="headphone" description="Compare headphone prices across every UK retailer. ANC, wireless, premium audio — every saving layer surfaced." />
}
