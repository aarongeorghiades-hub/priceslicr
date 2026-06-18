import type { Metadata } from 'next'
import ProductPage from '@/components/ProductPage'
import { getProductBySlug, getProductSlugsForCategory, getListingsForProduct } from '@/lib/product'
import { buildProductMetadata } from '@/lib/seoMeta'

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
  const listings = await getListingsForProduct(product.id)
  return buildProductMetadata({ name: product.name, path: `/tablets/${slug}`, listings })
}

export default async function TabletProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <ProductPage slug={slug} />
}
