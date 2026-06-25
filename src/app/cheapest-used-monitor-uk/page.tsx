import type { Metadata } from 'next'
import CheapestMonitorArticle from '@/components/CheapestMonitorArticle'
import { buildCheapestMonitorMetadata } from '@/lib/guide'

export async function generateMetadata(): Promise<Metadata> {
  return buildCheapestMonitorMetadata()
}

export default function Page() {
  return <CheapestMonitorArticle />
}
