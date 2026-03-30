import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const CATEGORY_ROUTES: Record<string, string> = {
  laptop: 'laptops',
  phone: 'phones',
  tablet: 'tablets',
  tv: 'tvs',
  monitor: 'monitors',
  headphones: 'headphones',
  smartwatch: 'smartwatches',
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://priceslicr.com'

  const { data: products } = await supabase
    .from('products')
    .select('slug, category, updated_at')

  const productUrls: MetadataRoute.Sitemap = (products ?? []).map(p => ({
    url: `${base}/${CATEGORY_ROUTES[p.category] ?? p.category}/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const categoryUrls: MetadataRoute.Sitemap = Object.values(CATEGORY_ROUTES).map(route => ({
    url: `${base}/${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  const staticUrls: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${base}/trade-in`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/sale-timing`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/how-it-works`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
  ]

  return [...staticUrls, ...categoryUrls, ...productUrls]
}
