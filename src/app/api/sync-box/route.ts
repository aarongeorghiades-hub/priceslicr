import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
// Reuse the SHARED matcher (eBay & CEX & Amazon share it). Not modified here — Box-only
// strictness is added in Box-LOCAL guards alongside it.
import { titleMatchesModelTokens } from '@/app/api/sync-listings/route'
import {
  fetchBoxFeed,
  normaliseBoxTitle,
  passesBoxBrandGate,
  passesBoxModelIdentity,
  passesBoxStorageGuard,
  passesBoxRamGuard,
  passesBoxCpuGuard,
  mapBoxCondition,
  BOX_RETAILER_ID,
  type BoxProduct,
  type BoxFeedRow,
} from '@/lib/box'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function handle(request: NextRequest) {
  // Guard: secret from ?secret= OR x-sync-secret header (mirrors sync-amazon).
  const secret = request.nextUrl.searchParams.get('secret') ?? request.headers.get('x-sync-secret')
  if (!process.env.SYNC_SECRET || secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Phase B is LAPTOPS ONLY. Any other category is rejected (monitors come in a later task).
  const category = request.nextUrl.searchParams.get('category')
  if (category !== 'laptop') {
    return NextResponse.json(
      { error: "sync-box requires ?category=laptop (Phase B is laptops only)" },
      { status: 400 }
    )
  }

  const feedUrl = process.env.AWIN_BOX_FEED_URL
  if (!feedUrl) {
    return NextResponse.json({ error: 'AWIN_BOX_FEED_URL not configured' }, { status: 500 })
  }

  try {
    // 1) Feed — fetch + gunzip + parse, then filter to Laptops.
    let feed: BoxFeedRow[]
    try {
      feed = await fetchBoxFeed(feedUrl)
    } catch (err) {
      console.warn(`[sync-box] feed fetch failed: ${String(err)}`)
      return NextResponse.json({ success: false, boxAvailable: false, reason: 'feed_failed', error: String(err) }, { status: 502 })
    }
    const laptopRows = feed.filter(r => r.category_name === 'Laptops')

    // Pre-normalise each in-stock, priced, mapped laptop row ONCE (avoids re-normalising per product).
    const prepared = laptopRows
      .map(r => ({
        raw: r,
        nt: normaliseBoxTitle(r.product_name),
        cond: mapBoxCondition(r.condition),
        price: parseFloat(r.search_price),
        inStock: (r.in_stock || '').trim() === '1',
      }))
      .filter(x => x.cond !== null && x.inStock && Number.isFinite(x.price) && x.price > 0)

    // 2) Products — laptops only.
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, category, slug, specs, brand, model_identifier')
      .eq('category', 'laptop')
    if (error || !products) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    const runStart = new Date().toISOString()
    const syncedProductIds: string[] = []
    let matchedProducts = 0
    let totalUpserted = 0
    let totalFailed = 0
    const byCond: Record<string, number> = { new: 0, refurbished: 0 }
    const created: { product: string; condition: string; price_gbp: number; feed_product_name: string; url: string }[] = []
    const errors: string[] = []

    for (const product of products as BoxProduct[]) {
      syncedProductIds.push(product.id)

      // Collect the cheapest matching feed row per condition.
      const cands: Record<string, { price: number; url: string; affiliate: string; feedTitle: string }> = {}
      for (const x of prepared) {
        if (!titleMatchesModelTokens(x.nt, product.name)) continue   // shared matcher (unmodified)
        if (!passesBoxBrandGate(x.nt, product.brand)) continue        // Box-LOCAL brand gate
        if (!passesBoxModelIdentity(x.nt, product)) continue          // Box-LOCAL model-identity gate
        if (!passesBoxStorageGuard(x.nt, product)) continue           // Box-LOCAL storage GB/TB guard
        if (!passesBoxRamGuard(x.nt, product)) continue               // Box-LOCAL RAM guard (spec-authoritative)
        if (!passesBoxCpuGuard(x.nt, product)) continue               // Box-LOCAL CPU-identity guard (spec-authoritative)
        const c = x.cond as string
        if (!cands[c] || x.price < cands[c].price) {
          cands[c] = { price: x.price, url: x.raw.merchant_deep_link, affiliate: x.raw.aw_deep_link, feedTitle: x.raw.product_name }
        }
      }

      const picks = Object.entries(cands)
      if (picks.length === 0) continue
      matchedProducts++

      const rows = picks.map(([cond, c]) => ({
        product_id: product.id,
        retailer_id: BOX_RETAILER_ID,
        condition: cond,
        condition_grade: null,
        price_gbp: c.price,
        url: c.url,
        affiliate_link: c.affiliate,
        in_stock: true,
        scraped_at: new Date().toISOString(),
      }))

      const { error: upsertError } = await supabase
        .from('listings')
        .upsert(rows, { onConflict: 'product_id,retailer_id,condition' })

      if (upsertError) {
        console.error(`[sync-box] upsert failed for ${product.name}:`, upsertError)
        errors.push(`${product.name} upsert: ${JSON.stringify(upsertError)}`)
        totalFailed++
      } else {
        totalUpserted += rows.length
        for (const [cond, c] of picks) {
          byCond[cond] = (byCond[cond] ?? 0) + 1
          created.push({ product: product.name, condition: cond, price_gbp: c.price, feed_product_name: c.feedTitle, url: c.url })
        }
      }
    }

    // 3) Stale sweep — scoped to Box retailer AND laptop products only. Drop priced Box
    // laptop rows this run did not refresh (no longer in feed / no longer matched).
    let staleDeleted = 0
    if (totalFailed === 0 && syncedProductIds.length > 0) {
      const { data: deleted, error: sweepErr } = await supabase
        .from('listings')
        .delete()
        .eq('retailer_id', BOX_RETAILER_ID)
        .gt('price_gbp', 0)
        .lt('scraped_at', runStart)
        .in('product_id', syncedProductIds)
        .select('id')
      if (sweepErr) errors.push(`stale sweep: ${JSON.stringify(sweepErr)}`)
      else staleDeleted = deleted?.length ?? 0
    }

    return NextResponse.json({
      success: true,
      boxAvailable: true,
      category: 'laptop',
      feedRowsTotal: feed.length,
      laptopFeedRows: laptopRows.length,
      productsConsidered: products.length,
      matchedProducts,
      skippedProducts: products.length - matchedProducts,
      listingsUpserted: totalUpserted,
      byCondition: byCond,
      stalePricedDeleted: staleDeleted,
      failed: totalFailed,
      created,
      errors: errors.slice(0, 10),
    })
  } catch (err) {
    console.error('[sync-box] fatal:', err)
    return NextResponse.json({ error: 'Internal error', detail: String(err) }, { status: 500 })
  }
}

export const GET = handle
export const POST = handle
