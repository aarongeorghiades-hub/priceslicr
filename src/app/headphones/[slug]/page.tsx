import type { Metadata } from 'next'
import ProductPage from '@/components/ProductPage'
import { getProductBySlug, getProductSlugsForCategory } from '@/lib/product'

export async function generateStaticParams() {
  const slugs = await getProductSlugsForCategory('headphones')
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
  return {
    title: `${product.name} — Price Comparison UK`,
    description: `Compare ${product.name} prices across every UK retailer — new, refurbished, and used. Find every available saving: cashback, trade-in, student discounts, price matching, and sale timing. Updated daily.`,
    openGraph: {
      title: `${product.name} — Price Comparison`,
      description: `Find the lowest price on ${product.name} across every UK retailer.`,
      url: `https://priceslicr.com/headphones/${slug}`,
    },
    alternates: {
      canonical: `https://priceslicr.com/headphones/${slug}`,
    },
  }
}

export default async function HeadphonesProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <ProductPage slug={slug} />
}
