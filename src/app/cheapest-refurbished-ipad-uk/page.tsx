import type { Metadata } from 'next'
import CheapestIpadArticle from '@/components/CheapestIpadArticle'
import { buildCheapestIpadMetadata } from '@/lib/guide'

export async function generateMetadata(): Promise<Metadata> {
  return buildCheapestIpadMetadata()
}

export default function Page() {
  return <CheapestIpadArticle />
}
