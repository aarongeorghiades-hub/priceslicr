import type { Metadata } from 'next'
import UsedRefurbHub from '@/components/UsedRefurbHub'
import { buildUsedRefurbMetadata } from '@/lib/guide'

export async function generateMetadata(): Promise<Metadata> {
  return buildUsedRefurbMetadata()
}

export default function Page() {
  return <UsedRefurbHub />
}
