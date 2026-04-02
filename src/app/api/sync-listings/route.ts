import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEbayAccessToken, searchEbayUK } from '@/lib/ebay'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  // Verify secret
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    // Fetch all products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, category, slug')
      .order('category')

    if (error || !products) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // Get eBay access token
    const accessToken = await getEbayAccessToken()

    const retailerId = await getEbayRetailerId()

    let totalInserted = 0
    let totalFailed = 0

    // Process each product
    for (const product of products) {
      try {
        const listings = await searchEbayUK(product.name, accessToken, 5)

        if (listings.length === 0) {
          console.log(`No listings found for: ${product.name}`)
          continue
        }

        // Pick best listing per condition
        const byCondition: Record<string, typeof listings[0]> = {}
        for (const listing of listings) {
          if (!byCondition[listing.condition] || listing.price < byCondition[listing.condition].price) {
            byCondition[listing.condition] = listing
          }
        }

        // Upsert to listings table
        const rows = Object.values(byCondition).map(listing => ({
          product_id: product.id,
          retailer_id: retailerId,
          price_gbp: listing.price,
          condition: listing.condition,
          url: listing.url,
          in_stock: true,
          scraped_at: new Date().toISOString(),
        }))

        const { error: upsertError } = await supabase
          .from('listings')
          .upsert(rows, { onConflict: 'product_id,retailer_id,condition' })

        if (upsertError) {
          console.error(`Failed to upsert listings for ${product.name}:`, upsertError)
          totalFailed++
        } else {
          totalInserted += rows.length
        }

        // Rate limit — 5 requests per second max
        await new Promise(resolve => setTimeout(resolve, 200))

      } catch (err) {
        console.error(`Error processing ${product.name}:`, err)
        totalFailed++
      }
    }

    return NextResponse.json({
      success: true,
      products: products.length,
      listingsInserted: totalInserted,
      failed: totalFailed,
    })

  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// Get the eBay UK retailer ID from the retailers table
async function getEbayRetailerId(): Promise<string> {
  const { data } = await supabase
    .from('retailers')
    .select('id')
    .eq('name', 'eBay UK')
    .single()

  if (!data) throw new Error('eBay UK retailer not found in retailers table')
  return data.id
}
