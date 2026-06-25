import type { Metadata } from 'next'
import CheapestHeadphonesArticle from '@/components/CheapestHeadphonesArticle'
import { buildCheapestHeadphonesMetadata } from '@/lib/guide'

export async function generateMetadata(): Promise<Metadata> {
  return buildCheapestHeadphonesMetadata()
}

export default function Page() {
  return <CheapestHeadphonesArticle />
}
