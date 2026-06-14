import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
// REUSE the eBay digit-token matcher as-is (shared, not rewritten).
import { titleMatchesModelTokens } from '../sync-listings/route'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CEX_RETAILER_ID = 'c3ed9435-2a3e-40e1-a84a-b14830ece774'
const APIFY_ACTOR = 'sync-network~cex-product-scraper-uk-webuy-com'

// Plural route name → products.category value (for ?category=phones).
const CATEGORY_PARAM: Record<string, string> = {
  phones: 'phone', laptops: 'laptop', tablets: 'tablet', tvs: 'tv',
  monitors: 'monitor', headphones: 'headphones', smartwatches: 'smartwatch',
}

// ── Name-token gate (replaces the stored-brand gate) ──────────────────
// CEX Mac titles say "MacBook", never "Apple", so a stored-brand gate
// rejects every MacBook. Instead require the product NAME's own alphabetic
// word tokens (≥3 chars, minus a spec stop-list) to appear in the title.
const NAME_TOKEN_STOPLIST = new Set(['inch', 'wifi', 'gen', 'cellular', 'unlocked', 'ram', 'ssd'])
function nameTokenGate(title: string, name: string): boolean {
  const tokens = (name.toLowerCase().match(/[a-z]+/g) ?? [])
    .filter(t => t.length >= 3 && !NAME_TOKEN_STOPLIST.has(t))
  if (tokens.length === 0) return true // nothing to gate on → rely on digit-token matcher
  return tokens.every(tok => new RegExp(`\\b${tok}\\b`, 'i').test(title || ''))
}

interface CexItem {
  title?: string
  sellPrice?: number
  grade?: string
  in_stock?: boolean
  productUrl?: string
  boxId?: string
}

// Drop broken / non-UK / out-of-stock candidates.
function isExcluded(item: CexItem): boolean {
  const title = (item.title || '').toLowerCase()
  if ((item.grade || '').toUpperCase() === 'F') return true
  if (title.includes('non working') || title.includes('non-working')) return true
  if (title.includes('qwertz') || title.includes('azerty')) return true
  if (item.in_stock !== true) return true
  return false
}

async function fetchCexItems(searchInput: string): Promise<CexItem[]> {
  const url = `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${process.env.APIFY_TOKEN}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ search_input: searchInput, max_items: 8 }),
  })
  if (!res.ok) throw new Error(`Apify ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  return Array.isArray(data) ? (data as CexItem[]) : []
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get('secret') !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const runStart = new Date().toISOString()
  const sp = request.nextUrl.searchParams
  const slugsParam = sp.get('slugs')
  const categoryParam = sp.get('category')
  const limitParam = sp.get('limit')

  try {
    let query = supabase
      .from('products')
      .select('id, name, slug, category')
      .order('brand', { ascending: true })

    if (slugsParam) {
      const slugs = slugsParam.split(',').map(s => s.trim()).filter(Boolean)
      query = query.in('slug', slugs)
    } else if (categoryParam) {
      query = query.eq('category', CATEGORY_PARAM[categoryParam] ?? categoryParam)
    }

    const { data: products, error } = await query
    if (error || !products) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    let scoped = products
    if (limitParam) {
      const n = parseInt(limitParam, 10)
      if (Number.isFinite(n) && n > 0) scoped = scoped.slice(0, n)
    }

    const processedIds: string[] = []
    const written: Array<{ slug: string; price_gbp: number; grade: string | null; title: string }> = []
    const skipped: Array<{ slug?: string; reason: string; returned?: number }> = []
    let totalWritten = 0
    let failedCount = 0

    for (const product of scoped) {
      processedIds.push(product.id)
      try {
        const items = await fetchCexItems(product.name)
        const candidates = items.filter(it =>
          !isExcluded(it) &&
          typeof it.sellPrice === 'number' && it.sellPrice > 0 &&
          titleMatchesModelTokens(it.title || '', product.name) &&
          nameTokenGate(it.title || '', product.name)
        )

        if (candidates.length === 0) {
          skipped.push({
            slug: product.slug,
            reason: items.length === 0 ? 'no CEX results' : 'no candidate survived gates/exclusions',
            returned: items.length,
          })
          continue
        }

        const best = candidates.reduce((a, b) => (b.sellPrice! < a.sellPrice! ? b : a))
        const row = {
          product_id: product.id,
          retailer_id: CEX_RETAILER_ID,
          price_gbp: best.sellPrice!,
          condition: 'used' as const,
          condition_grade: best.grade ?? null,
          url: encodeURI(best.productUrl || ''),
          in_stock: true,
          scraped_at: runStart,
        }
        const { error: upErr } = await supabase
          .from('listings')
          .upsert(row, { onConflict: 'product_id,retailer_id,condition' })

        if (upErr) {
          failedCount++
          skipped.push({ slug: product.slug, reason: 'upsert error: ' + JSON.stringify(upErr) })
        } else {
          totalWritten++
          written.push({ slug: product.slug, price_gbp: best.sellPrice!, grade: best.grade ?? null, title: best.title ?? '' })
        }
      } catch (err) {
        failedCount++
        skipped.push({ slug: product.slug, reason: 'fetch/processing error: ' + String(err) })
      }
      // gentle pacing between actor calls
      await new Promise(r => setTimeout(r, 200))
    }

    // ── Stale-row sweep — scoped to processed products only, guarded ──
    // Mirror the eBay sweep: only after a clean, non-empty run, and never
    // beyond the products this run actually touched (so a scoped/limited
    // run can't wipe CEX rows for products it didn't process).
    let staleRowsDeleted = 0
    if (failedCount === 0 && totalWritten > 0 && processedIds.length > 0) {
      const { data: deleted, error: sweepError } = await supabase
        .from('listings')
        .delete()
        .eq('retailer_id', CEX_RETAILER_ID)
        .in('product_id', processedIds)
        .lt('scraped_at', runStart)
        .select('id')
      if (sweepError) {
        skipped.push({ reason: 'stale sweep error: ' + JSON.stringify(sweepError) })
      } else {
        staleRowsDeleted = deleted?.length ?? 0
      }
    }

    return NextResponse.json({
      success: true,
      productsProcessed: scoped.length,
      rowsWritten: totalWritten,
      failed: failedCount,
      staleRowsDeleted,
      written,
      skipped,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
