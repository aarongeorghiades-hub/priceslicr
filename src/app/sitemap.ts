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
  const base = 'https://www.priceslicr.com'

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

  // Buying-guide hubs (one per category with enough live priced data; TVs omitted
  // — too few priced sets for a credible "best" hub). High-value commercial pages.
  const guideRoutes = [
    'best-phones-uk', 'best-laptops-uk', 'best-tablets-uk',
    'best-headphones-uk', 'best-smartwatches-uk', 'best-monitors-uk',
  ]
  const guideUrls: MetadataRoute.Sitemap = guideRoutes.map(route => ({
    url: `${base}/${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  const staticUrls: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${base}/used-refurbished-tech-uk`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${base}/cheapest-used-refurbished-iphone-uk`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${base}/cheapest-refurbished-laptop-uk`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${base}/cheapest-refurbished-ipad-uk`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${base}/cheapest-refurbished-headphones-uk`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${base}/cheapest-refurbished-apple-watch-uk`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${base}/trade-in`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/sale-timing`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/how-it-works`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  return [...staticUrls, ...guideUrls, ...categoryUrls, ...productUrls]
}
