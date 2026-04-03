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
    const errors: string[] = []

    function buildEbayQuery(productName: string): string {
      // Remove storage/RAM specs that confuse eBay search
      const cleaned = productName
        .replace(/\b\d+GB\b/gi, '')
        .replace(/\b\d+TB\b/gi, '')
        .replace(/\b\d+-inch\b/gi, '')
        .replace(/\b\d+"\b/gi, '')
        .trim()

      const words = cleaned.split(' ').filter(w => w.length > 1)

      // Find model code — alphanumeric word with both letters and digits, length > 3
      const modelCode = words.find(w => /[a-zA-Z]/.test(w) && /[0-9]/.test(w) && w.length > 3)

      if (modelCode) {
        const brand = words[0]
        // Include the word before the model code too (e.g. "Galaxy S25")
        const modelIdx = words.indexOf(modelCode)
        const prevWord = modelIdx > 1 ? words[modelIdx - 1] : ''
        return prevWord ? `${brand} ${prevWord} ${modelCode}` : `${brand} ${modelCode}`
      }

      // Fallback: first 3 meaningful words
      return words.slice(0, 3).join(' ')
    }

    // Process each product
    for (const product of products) {
      try {
        const query = buildEbayQuery(product.name)
        console.log(`Searching eBay for: "${query}" (product: ${product.name})`)
        const listings = await searchEbayUK(query, accessToken, 5)

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
          errors.push(`${product.name} upsert: ${JSON.stringify(upsertError)}`)
          totalFailed++
        } else {
          totalInserted += rows.length
        }

        // Rate limit — 5 requests per second max
        await new Promise(resolve => setTimeout(resolve, 200))

      } catch (err) {
        console.error(`Error processing ${product.name}:`, err)
        errors.push(`${product.name}: ${String(err)}`)
        totalFailed++
      }
    }

    return NextResponse.json({
      success: true,
      products: products.length,
      listingsInserted: totalInserted,
      failed: totalFailed,
      errors: errors.slice(0, 10),
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
