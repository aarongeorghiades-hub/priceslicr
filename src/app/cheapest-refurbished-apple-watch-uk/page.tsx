import type { Metadata } from 'next'
import CheapestAppleWatchArticle from '@/components/CheapestAppleWatchArticle'
import { buildCheapestAppleWatchMetadata } from '@/lib/guide'

export async function generateMetadata(): Promise<Metadata> {
  return buildCheapestAppleWatchMetadata()
}

export default function Page() {
  return <CheapestAppleWatchArticle />
}
