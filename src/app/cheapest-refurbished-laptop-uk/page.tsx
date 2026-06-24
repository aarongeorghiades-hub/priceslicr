import type { Metadata } from 'next'
import CheapestLaptopArticle from '@/components/CheapestLaptopArticle'
import { buildCheapestLaptopMetadata } from '@/lib/guide'

export async function generateMetadata(): Promise<Metadata> {
  return buildCheapestLaptopMetadata()
}

export default function Page() {
  return <CheapestLaptopArticle />
}
