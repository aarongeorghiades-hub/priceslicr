import type { Metadata } from 'next'
import ProductPage from '@/components/ProductPage'
import { getProductBySlug, getProductSlugsForCategory } from '@/lib/product'
import { pageMetadata } from '@/lib/seo'

export async function generateStaticParams() {
  const slugs = await getProductSlugsForCategory('tablet')
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return pageMetadata({
    title: `${product.name} — Price Comparison UK`,
    description: `Compare ${product.name} prices across every UK retailer — new, refurbished, and used. Find every available saving: cashback, trade-in, student discounts, price matching, and sale timing. Updated daily.`,
    path: `/tablets/${slug}`,
  })
}

export default async function TabletProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <ProductPage slug={slug} />
}
