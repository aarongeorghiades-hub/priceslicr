import type { Metadata } from 'next'
import CheapestIphoneArticle from '@/components/CheapestIphoneArticle'
import { buildCheapestIphoneMetadata } from '@/lib/guide'

export async function generateMetadata(): Promise<Metadata> {
  return buildCheapestIphoneMetadata()
}

export default function Page() {
  return <CheapestIphoneArticle />
}
