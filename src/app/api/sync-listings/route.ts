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

    function getMinPrice(category: string): number {
      const floors: Record<string, number> = {
        tv: 100,
        laptop: 150,
        phone: 50,
        tablet: 80,
        monitor: 80,
        headphones: 20,
        smartwatch: 50,
      }
      return floors[category] ?? 20
    }

    // Process each product
    for (const product of products) {
      try {
        const query = buildEbayQuery(product.name)
        console.log(`Searching eBay for: "${query}" (product: ${product.name})`)
        const minPrice = getMinPrice(product.category)
        const listings = await searchEbayUK(query, accessToken)

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

        // Drop used listing if it costs more than refurbished (likely wrong match)
        if (byCondition['used'] && byCondition['refurbished'] &&
            byCondition['used'].price >= byCondition['refurbished'].price) {
          delete byCondition['used']
        }

        // Filter out implausibly low prices (accessories, parts, warranties)
        const validListings = Object.values(byCondition).filter(l => l.price >= minPrice)

        if (validListings.length === 0) {
          console.log(`No valid-priced listings for: ${product.name} (min: £${minPrice})`)
          continue
        }

        // Upsert to listings table
        const rows = validListings.map(listing => ({
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

    // Second pass: insert retailer search links for products with no "new" listing
    const searchLinksInserted = await insertRetailerSearchLinks(products)

    return NextResponse.json({
      success: true,
      products: products.length,
      listingsInserted: totalInserted,
      searchLinksInserted,
      failed: totalFailed,
      errors: errors.slice(0, 10),
    })

  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// Insert "new" search-link listings for products that have no new-condition listing
async function insertRetailerSearchLinks(
  products: { id: string; name: string; category: string }[]
): Promise<number> {
  const retailers = [
    { name: 'Amazon UK', searchUrl: (q: string) => `https://www.amazon.co.uk/s?k=${encodeURIComponent(q)}` },
    { name: 'Currys', searchUrl: (q: string) => `https://www.currys.co.uk/search?q=${encodeURIComponent(q)}` },
    { name: 'John Lewis', searchUrl: (q: string) => `https://www.johnlewis.com/search?search-term=${encodeURIComponent(q)}` },
  ]

  const { data: retailerRows } = await supabase
    .from('retailers')
    .select('id, name')
    .in('name', retailers.map(r => r.name))

  if (!retailerRows) return 0

  const retailerMap = Object.fromEntries(retailerRows.map((r: any) => [r.name, r.id]))
  let count = 0

  for (const product of products) {
    const { data: existing } = await supabase
      .from('listings')
      .select('id')
      .eq('product_id', product.id)
      .eq('condition', 'new')
      .limit(1)

    if (existing && existing.length > 0) continue

    const rows = retailers
      .filter(r => retailerMap[r.name])
      .map(r => ({
        product_id: product.id,
        retailer_id: retailerMap[r.name],
        condition: 'new' as const,
        price_gbp: 0,
        url: r.searchUrl(product.name),
        in_stock: true,
        scraped_at: new Date().toISOString(),
      }))

    if (rows.length > 0) {
      const { error } = await supabase.from('listings').upsert(rows, {
        onConflict: 'product_id,retailer_id,condition',
        ignoreDuplicates: true,
      })
      if (!error) count += rows.length
    }
  }

  return count
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
