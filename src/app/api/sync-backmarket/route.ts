import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { searchBackMarket } from '@/lib/backmarket'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MIN_PRICES: Record<string, number> = {
  laptop: 50, phone: 30, tablet: 50, tv: 50, monitor: 30, headphones: 10, smartwatch: 20,
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data: retailerRow } = await supabase.from('retailers').select('id').eq('slug', 'back-market').single()
  if (!retailerRow) return NextResponse.json({ error: 'Back Market retailer not found' }, { status: 500 })
  const backMarketRetailerId = retailerRow.id
  const { data: products } = await supabase.from('products').select('id, name, category, slug').order('category')
  if (!products) return NextResponse.json({ error: 'No products found' }, { status: 500 })
  let totalInserted = 0
  let totalFailed = 0
  const errors: string[] = []
  const batchSize = 5
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize)
    for (const product of batch) {
      try {
        const minPrice = MIN_PRICES[product.category] ?? 10
        const listings = await searchBackMarket(product.name)
        if (listings.length === 0) continue
        const validListings = listings.filter(l => l.price >= minPrice).sort((a, b) => a.price - b.price)
        if (validListings.length === 0) continue
        const cheapest = validListings[0]
        const row = {
          product_id: product.id,
          retailer_id: backMarketRetailerId,
          condition: 'refurbished' as const,
          condition_grade: cheapest.conditionLabel,
          price_gbp: cheapest.price,
          url: cheapest.url,
          in_stock: true,
          scraped_at: new Date().toISOString(),
        }
        const { error } = await supabase.from('listings').upsert([row], {
          onConflict: 'product_id,retailer_id,condition',
          ignoreDuplicates: false,
        })
        if (error) { totalFailed++; errors.push(`${product.name}: ${error.message}`) }
        else { totalInserted++ }
      } catch (err: any) { totalFailed++; errors.push(`${product.name}: ${err.message}`) }
    }
    if (i + batchSize < products.length) await new Promise(r => setTimeout(r, 2000))
  }
  return NextResponse.json({ success: true, products: products.length, listingsInserted: totalInserted, failed: totalFailed, errors: errors.slice(0, 10) })
}
