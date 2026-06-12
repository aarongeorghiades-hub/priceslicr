import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEbayAccessToken, searchEbayUK, computeSecondhandAnchor } from '@/lib/ebay'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── eBay junk-price plausibility filter ──────────────────────────────
// Layer (a): reject accessory / parts / broken / box-only listings by title keyword.
const EBAY_EXCLUSION_KEYWORDS = [
  'case', 'cover', 'screen protector', 'protector', 'box only', 'empty box',
  'parts', 'for parts', 'spares', 'faulty', 'broken', 'cracked', 'damaged',
  'replacement', 'battery', 'cable', 'charger', 'adapter', 'dock', 'stand',
  'skin', 'sticker', 'dummy', 'display model', 'read description',
]
const EBAY_EXCLUSION_RE = new RegExp(
  '\\b(' + EBAY_EXCLUSION_KEYWORDS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b',
  'i'
)
function titleHasExcludedKeyword(title: string): boolean {
  return EBAY_EXCLUSION_RE.test(title || '')
}

// Layer (b): the title must contain every mandatory token from the product name.
// Mandatory = tokens containing a digit (model numbers like "m3"/"s25", storage like
// "128gb"). Pure-word tokens ("apple", "macbook") are optional.
function titleMatchesModelTokens(title: string, productName: string): boolean {
  const t = (title || '').toLowerCase()
  const tokens = productName.toLowerCase().match(/[a-z0-9]+/g) ?? []
  const mandatory = tokens.filter(tok => /[0-9]/.test(tok))
  return mandatory.every(tok => t.includes(tok))
}

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

    // Cross-condition (Layer d) run-level tallies for the rejection summary.
    let crossNewConsidered = 0   // products that had >=1 accepted eBay New candidate pre-rule
    let crossNewSuppressed = 0   // products whose New row was removed entirely by the rule
    const crossRejLines: string[] = []  // one line per rejected New listing

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

        // Layers (a) + (b): drop accessory/parts/broken titles and items that
        // don't match the product's mandatory model/storage tokens.
        const plausible = listings.filter(
          l => !titleHasExcludedKeyword(l.title) && titleMatchesModelTokens(l.title, product.name)
        )

        if (plausible.length === 0) {
          console.log(`No plausible listings after junk filter for: ${product.name}`)
          continue
        }

        // Group plausible items by condition; apply Layer (c) price floor per
        // condition group (median-based) before picking the lowest valid price.
        const grouped: Record<string, typeof listings> = {}
        for (const l of plausible) {
          (grouped[l.condition] ??= []).push(l)
        }

        const byCondition: Record<string, typeof listings[0]> = {}
        const candidatesByCondition: Record<string, typeof listings> = {}
        for (const [cond, items] of Object.entries(grouped)) {
          let candidates = items
          if (items.length >= 3) {
            const sorted = items.map(i => i.price).sort((a, b) => a - b)
            const median = sorted[Math.floor(sorted.length / 2)]
            candidates = items.filter(i => i.price >= 0.4 * median)
          }
          if (candidates.length === 0) continue
          candidatesByCondition[cond] = candidates
          byCondition[cond] = candidates.reduce((best, i) => (i.price < best.price ? i : best))
        }

        // Drop used listing if it costs more than refurbished (likely wrong match)
        if (byCondition['used'] && byCondition['refurbished'] &&
            byCondition['used'].price >= byCondition['refurbished'].price) {
          delete byCondition['used']
        }

        // ── Layer (d): cross-condition sanity ──────────────────────────
        // Reject NEW candidates priced below 0.90× the second-hand anchor
        // (the dearer of the refurbished/used medians). A "new" Z-Fold at
        // £369.99 against a £564.99 refurb market is junk, not a deal.
        // NOTE: we intentionally do NOT suppress refurbished/used prices
        // that sit ABOVE new — legitimate new-stock sales exist, so that
        // asymmetry is a deliberate product decision; do not "fix" it.
        const newCandidates = candidatesByCondition['new']
        if (newCandidates && newCandidates.length > 0) {
          crossNewConsidered++
          const { anchor, refurbishedMedian, usedMedian } = computeSecondhandAnchor(candidatesByCondition)
          if (anchor != null) {
            const threshold = 0.90 * anchor
            const rejected = newCandidates.filter(i => i.price < threshold)
            const survivors = newCandidates.filter(i => i.price >= threshold)
            for (const r of rejected) {
              const line = `[cross-condition] ${product.name} — reject New £${r.price.toFixed(2)} ` +
                `< £${threshold.toFixed(2)} (0.90 × anchor £${anchor.toFixed(2)}; ` +
                `refurb median ${refurbishedMedian != null ? '£' + refurbishedMedian.toFixed(2) : 'n/a'}, ` +
                `used median ${usedMedian != null ? '£' + usedMedian.toFixed(2) : 'n/a'})`
              console.log(line)
              crossRejLines.push(line)
            }
            if (rejected.length > 0) {
              if (survivors.length === 0) {
                delete byCondition['new']
                crossNewSuppressed++
              } else {
                byCondition['new'] = survivors.reduce((best, i) => (i.price < best.price ? i : best))
              }
            }
          }
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

    // Cross-condition (Layer d) run summary — one block, easy to grep in CI logs.
    const crossPct = crossNewConsidered > 0
      ? Math.round((crossNewSuppressed / crossNewConsidered) * 1000) / 10
      : 0
    console.log(
      `[cross-condition] summary: ${crossRejLines.length} New listing(s) rejected; ` +
      `${crossNewSuppressed}/${crossNewConsidered} products with a New eBay pick had it suppressed ` +
      `(${crossPct}% of New listings).`
    )

    // Second pass: insert retailer search links for products with no "new" listing
    const searchLinksInserted = await insertRetailerSearchLinks(products)

    return NextResponse.json({
      success: true,
      products: products.length,
      listingsInserted: totalInserted,
      searchLinksInserted,
      failed: totalFailed,
      crossCondition: {
        newConsidered: crossNewConsidered,
        newSuppressed: crossNewSuppressed,
        rejectedListings: crossRejLines.length,
        pctOfNewSuppressed: crossPct,
        rejections: crossRejLines.slice(0, 50),
      },
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
    { name: 'Amazon UK', searchUrl: (q: string) => `https://www.amazon.co.uk/s?k=${encodeURIComponent(q)}&tag=pestproindex2-21` },
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
