import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { searchCex } from '@/lib/cex'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MIN_PRICES: Record<string, number> = {
  laptop: 50,
  phone: 30,
  tablet: 50,
  tv: 50,
  monitor: 30,
  headphones: 10,
  smartwatch: 20,
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get CEX retailer ID
  const { data: retailerRow } = await supabase
    .from('retailers')
    .select('id')
    .eq('slug', 'cex')
    .single()

  if (!retailerRow) {
    return NextResponse.json({ error: 'CEX retailer not found in DB' }, { status: 500 })
  }

  const cexRetailerId = retailerRow.id

  // Get all products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, category, slug')
    .order('category')

  if (!products) {
    return NextResponse.json({ error: 'No products found' }, { status: 500 })
  }

  let totalInserted = 0
  let totalFailed = 0
  const errors: string[] = []

  for (const product of products) {
    try {
      const minPrice = MIN_PRICES[product.category] ?? 10
      const listings = await searchCex(product.name)

      if (listings.length === 0) continue

      // Pick cheapest per condition above min price
      const byCondition: Record<string, { price: number; boxId: string; grade: string; condition: string }> = {}

      for (const listing of listings) {
        if (listing.sellPrice < minPrice) continue
        const cond = listing.condition
        if (!byCondition[cond] || listing.sellPrice < byCondition[cond].price) {
          byCondition[cond] = {
            price: listing.sellPrice,
            boxId: listing.boxId,
            grade: listing.grade,
            condition: cond,
          }
        }
      }

      // Drop used if more expensive than refurbished
      if (byCondition['used'] && byCondition['refurbished'] &&
          byCondition['used'].price >= byCondition['refurbished'].price) {
        delete byCondition['used']
      }

      const validListings = Object.values(byCondition)
      if (validListings.length === 0) continue

      const rows = validListings.map(l => ({
        product_id: product.id,
        retailer_id: cexRetailerId,
        condition: l.condition as 'refurbished' | 'used',
        condition_grade: l.grade,
        price_gbp: l.price,
        url: `https://uk.webuy.com/product-detail?id=${l.boxId}`,
        in_stock: true,
        scraped_at: new Date().toISOString(),
      }))

      const { error } = await supabase.from('listings').upsert(rows, {
        onConflict: 'product_id,retailer_id,condition',
        ignoreDuplicates: false,
      })

      if (error) {
        totalFailed++
        errors.push(`${product.name}: ${error.message}`)
      } else {
        totalInserted += rows.length
      }

      await new Promise(r => setTimeout(r, 300))
    } catch (err: any) {
      totalFailed++
      errors.push(`${product.name}: ${err.message}`)
    }
  }

  return NextResponse.json({
    success: true,
    products: products.length,
    listingsInserted: totalInserted,
    failed: totalFailed,
    errors: errors.slice(0, 10),
  })
}
