import { supabase } from './supabase'
import { createServerSupabaseClient } from './supabase-server'
import type { Product, Listing, DiscountLayer, SaleEvent } from '@/types'

// Uses the plain client — safe for generateStaticParams / generateMetadata (no cookies)
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error || !data) return null
  return data as Product
}

// Uses the plain client — safe for generateStaticParams (no cookies)
export async function getAllProductSlugs(): Promise<string[]> {
  const { data } = await supabase
    .from('products')
    .select('slug')
  return (data ?? []).map((r: { slug: string }) => r.slug)
}

// Uses the plain client — safe for generateStaticParams (no cookies)
export async function getProductSlugsForCategory(category: string): Promise<string[]> {
  const { data } = await supabase
    .from('products')
    .select('slug')
    .eq('category', category)
  return (data ?? []).map((r: { slug: string }) => r.slug)
}

export async function getListingsForProduct(productId: string): Promise<Listing[]> {
  const client = await createServerSupabaseClient()
  const { data } = await client
    .from('listings')
    .select('*, retailer:retailers(*)')
    .eq('product_id', productId)
    .eq('in_stock', true)
    .order('price_gbp', { ascending: true })
  return (data ?? []) as Listing[]
}

export async function getAllDiscountLayers(): Promise<DiscountLayer[]> {
  const client = await createServerSupabaseClient()
  const { data } = await client
    .from('discount_layers')
    .select('*, retailer:retailers(*)')
    .order('value', { ascending: false })
  return (data ?? []) as DiscountLayer[]
}

export async function getUpcomingSaleEvents(): Promise<SaleEvent[]> {
  const client = await createServerSupabaseClient()
  const today = new Date().toISOString().split('T')[0]
  const { data } = await client
    .from('sale_events')
    .select('*')
    .gte('expected_end_date', today)
    .order('expected_start_date', { ascending: true })
  return (data ?? []) as SaleEvent[]
}
