import type { Metadata } from 'next'
import BuyingGuide from '@/components/BuyingGuide'
import { buildGuideMetadata } from '@/lib/guide'

export async function generateMetadata(): Promise<Metadata> {
  return buildGuideMetadata('headphones')
}

export default function Page() {
  return <BuyingGuide category="headphones" />
}
