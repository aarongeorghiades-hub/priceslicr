import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAmazonAccessToken, searchAmazonUK, AmazonApiError, type AmazonItem } from '@/lib/amazon'
// Reuse the SHARED matcher (eBay & CEX share it). Not modified here — Amazon-only
// strictness is added in guards alongside it.
import { titleMatchesModelTokens } from '@/app/api/sync-listings/route'
import type { Condition, ConditionGrade } from '@/types'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const AMAZON_RETAILER_ID = '75796554-f9a4-448f-9852-9ef1c84328af' // Amazon UK

// ── Amazon-only junk guard (backstop; the model-token + storage guards do the heavy
// lifting). Multi-word/unambiguous accessory & parts tells only. ──
const AMAZON_EXCLUSION_KEYWORDS = [
  'case', 'cover', 'screen protector', 'protector', 'for parts', 'spares',
  'replacement', 'charger', 'cable', 'adapter', 'strap', 'band', 'bands',
  'tempered glass', 'skin', 'stylus', 'stand only', 'mount',
]
const AMAZON_EXCLUSION_RE = new RegExp(
  '\\b(' + AMAZON_EXCLUSION_KEYWORDS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b',
  'i'
)

// Amazon titles write storage spaced ("256 GB") and verbose. Glue "<n> GB/TB" so the
// shared matcher's "256gb" name-token can substring-match, and lowercase for guards.
function normaliseAmazonTitle(title: string): string {
  return (title || '').toLowerCase().replace(/(\d+)\s*(gb|tb)\b/g, '$1$2')
}

// Amazon storage/capacity guard — the product's own storage token MUST be in the title,
// so "iPhone 17 256GB" can never bind to a "64 GB" listing. Storage comes from specs
// (numeric GB) with a slug fallback; products with no storage spec are a no-op.
function productStorageToken(product: ProductRow): string | null {
  const spec = product.specs?.storage ?? product.specs?.capacity
  if (spec != null && /^\d+$/.test(String(spec))) return `${spec}gb`
  const m = (product.slug || '').match(/(\d+)(gb|tb)\b/i)
  return m ? `${m[1]}${m[2].toLowerCase()}` : null
}
function passesAmazonStorageGuard(normTitle: string, product: ProductRow): boolean {
  const tok = productStorageToken(product)
  if (!tok) return true
  return normTitle.includes(tok)
}

// Amazon variant-word guard (ported from the eBay guard; shared fn untouched). Tier
// words must match as a SET so "iPhone 17" never binds "iPhone 17 Pro", "S25" never
// binds "S25 Ultra", etc. `fold`/`flip` are mutually-exclusive foldable form factors —
// a "Z Fold 6" product must never bind a "Z Flip6" listing (and vice-versa).
const VARIANT_WORDS = ['pro', 'plus', 'max', 'ultra', 'lite', 'fe', 'mini', 'se', 'neo', 'fold', 'flip']
function variantWordsIn(text: string): Set<string> {
  const deSpec = (text || '')
    .replace(/\d+\s*GB\s*\+\s*\d+\s*(?:GB|TB)/gi, ' ')
    .replace(/\bultra\s*[579]\b/gi, ' ')
    .replace(/\+\s*(?:GPS|Bluetooth|BT|LTE|Cellular|Cell|Wi-?Fi|WiFi|NFC|Solar)\b/gi, ' ')
  // Split glued letter↔digit runs ("Flip6"→"Flip 6", "Fold6"→"Fold 6") so a tier word
  // fused to a generation number is still detected word-bounded below. Strictly additive
  // — it can only reveal a variant word, never hide one.
  const normalised = deSpec.replace(/\+/g, ' plus ')
    .replace(/([A-Za-z])(\d)/g, '$1 $2')
    .replace(/(\d)([A-Za-z])/g, '$1 $2')
  const found = new Set<string>()
  for (const w of VARIANT_WORDS) {
    if (new RegExp(`\\b${w}\\b`, 'i').test(normalised)) found.add(w)
  }
  return found
}
function passesAmazonVariantGuard(title: string, name: string, category?: string): boolean {
  const titleVariants = variantWordsIn(title)
  const nameVariants = variantWordsIn(name)
  if (category === 'monitor') { titleVariants.delete('ultra'); nameVariants.delete('ultra') }
  if (titleVariants.size !== nameVariants.size) return false
  for (const w of nameVariants) if (!titleVariants.has(w)) return false
  return true
}

// Amazon generation guard (ported): every standalone numeric token in the product name
// (Watch 7→7, Series 10→10) must appear word-bounded in the title.
function passesAmazonGenerationGuard(title: string, name: string): boolean {
  const genTokens = (name.match(/\b\d+\b/g) ?? [])
  if (genTokens.length === 0) return true
  const splitTitle = (title || '')
    .replace(/([A-Za-z])(\d)/g, '$1 $2')
    .replace(/(\d)([A-Za-z])/g, '$1 $2')
  return genTokens.every(tok => new RegExp(`\\b${tok}\\b`).test(splitTitle))
}

// Amazon model-suffix exactness — a bare generation number must not be a letter-suffixed
// model: product "iPhone 16" must NOT bind "iPhone 16e", "iPhone 16 Plus" must not bind
// "16e" either. Checks the ORIGINAL title for "<gen><letter>" the name doesn't have.
function passesAmazonModelExactness(title: string, name: string): boolean {
  const genTokens = (name.match(/\b\d+\b/g) ?? [])
  for (const n of genTokens) {
    const suffixed = new RegExp(`\\b${n}[a-z]`, 'i')
    if (suffixed.test(title) && !suffixed.test(name)) return false
  }
  return true
}

// ── Honest condition mapping ──
// "(Renewed)" in the TITLE is Amazon Renewed → certified_refurbished, even when the
// condition field reads "New". The title tell overrides the field. Used (Warehouse) →
// used. Genuine New (value New, not Renewed) → new (benchmark only — the shared
// resolver excludes new from used/refurb anchors, so it is never crowned cheapest).
function mapCondition(title: string, conditionValue: string): Condition {
  if (/\(renewed\)/i.test(title)) return 'certified_refurbished'
  if (conditionValue.toLowerCase() === 'used') return 'used'
  return 'new'
}
const SUBCONDITION_GRADE: Record<string, ConditionGrade> = {
  likenew: 'excellent',
  verygood: 'very_good',
  good: 'good',
  acceptable: 'fair',
}
function mapGrade(subCondition: string): ConditionGrade {
  return SUBCONDITION_GRADE[(subCondition || '').toLowerCase()] ?? null
}

// Category price floors (mirror the eBay route) — backstop against a stray cheap match.
function getMinPrice(category: string): number {
  const floors: Record<string, number> = {
    tv: 100, laptop: 150, phone: 50, tablet: 80, monitor: 80, headphones: 20, smartwatch: 50,
  }
  return floors[category] ?? 20
}

// Keywords for SearchItems: brand + model, storage/RAM/inch stripped (mirrors eBay).
function buildAmazonKeywords(productName: string): string {
  const cleaned = productName
    .replace(/\b\d+GB\b/gi, '').replace(/\b\d+TB\b/gi, '')
    .replace(/\b\d+-inch\b/gi, '').replace(/\b\d+"\b/gi, '')
    .replace(/\s+/g, ' ').trim()
  return cleaned || productName
}

interface ProductRow {
  id: string
  name: string
  category: string
  slug: string
  specs: Record<string, string | number> | null
}

async function handle(request: NextRequest) {
  // Guard: secret from ?secret= (like /api/sync-listings) OR x-sync-secret header.
  const secret = request.nextUrl.searchParams.get('secret') ?? request.headers.get('x-sync-secret')
  if (!process.env.SYNC_SECRET || secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const slugsParam = request.nextUrl.searchParams.get('slugs')
  const category = request.nextUrl.searchParams.get('category')

  try {
    let query = supabase.from('products').select('id, name, category, slug, specs').order('category')
    // ?slugs= bounds a run to a small batch (mirrors the CEX route) so each request
    // finishes under Railway's ~100s gateway limit; takes precedence over ?category=.
    if (slugsParam) {
      const slugs = slugsParam.split(',').map(s => s.trim()).filter(Boolean)
      query = query.in('slug', slugs)
    } else if (category) {
      query = query.eq('category', category)
    }
    const { data: products, error } = await query
    if (error || !products) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // Token first. If auth/eligibility fails, leave eBay/CEX untouched and return a
    // graceful, honest no-op so the site renders exactly as before.
    let token: string
    try {
      token = await getAmazonAccessToken()
    } catch (err) {
      const status = err instanceof AmazonApiError ? err.status : 0
      console.warn(`[sync-amazon] token failed (${status}) — Amazon unavailable, skipping run cleanly`)
      return NextResponse.json({
        success: true, amazonAvailable: false, reason: 'token_failed', status,
        products: products.length, listingsUpserted: 0,
      })
    }

    const runStart = new Date().toISOString()
    const syncedProductIds: string[] = []
    let totalUpserted = 0
    let totalFailed = 0
    let matchedProducts = 0
    let aborted = false
    const errors: string[] = []
    const byCond: Record<string, number> = { new: 0, certified_refurbished: 0, used: 0 }
    const samples: string[] = []

    for (const product of products as ProductRow[]) {
      syncedProductIds.push(product.id)
      let items: AmazonItem[]
      try {
        items = await searchAmazonUK(buildAmazonKeywords(product.name), token)
      } catch (err) {
        const status = err instanceof AmazonApiError ? err.status : 0
        // 401/403/eligibility → abort Amazon cleanly (don't hammer); else skip product.
        if (status === 401 || status === 403) {
          console.warn(`[sync-amazon] auth/eligibility ${status} on "${product.name}" — aborting Amazon run cleanly`)
          aborted = true
          break
        }
        console.warn(`[sync-amazon] search error on "${product.name}": ${String(err)}`)
        errors.push(`${product.name}: ${String(err)}`)
        await sleep(1000)
        continue
      }

      // Collect candidate priced, in-stock listings across all matched ASINs, by mapped condition.
      const minPrice = getMinPrice(product.category)
      const candidates: Record<Condition, { price: number; grade: ConditionGrade; url: string; asin: string; title: string }> = {} as any

      for (const item of items) {
        const normTitle = normaliseAmazonTitle(item.title)
        const ok =
          !AMAZON_EXCLUSION_RE.test(item.title) &&
          titleMatchesModelTokens(normTitle, product.name) &&
          passesAmazonStorageGuard(normTitle, product) &&
          passesAmazonVariantGuard(item.title, product.name, product.category) &&
          passesAmazonGenerationGuard(item.title, product.name) &&
          passesAmazonModelExactness(item.title, product.name)
        if (!ok) continue

        for (const l of item.listings) {
          if (!l.inStock || l.price == null || l.price < minPrice) continue
          const cond = mapCondition(item.title, l.conditionValue)
          const cur = candidates[cond]
          if (!cur || l.price < cur.price) {
            candidates[cond] = { price: l.price, grade: mapGrade(l.subCondition), url: item.detailPageURL, asin: item.asin, title: item.title }
          }
        }
      }

      const picks = Object.entries(candidates) as [Condition, typeof candidates[Condition]][]
      if (picks.length === 0) { await sleep(1000); continue }
      matchedProducts++

      const rows = picks.map(([cond, c]) => ({
        product_id: product.id,
        retailer_id: AMAZON_RETAILER_ID,
        condition: cond,
        condition_grade: c.grade,
        price_gbp: c.price,
        url: c.url,
        affiliate_link: c.url, // detailPageURL already carries tag=pestproindex2-21
        in_stock: true,
        scraped_at: new Date().toISOString(),
      }))

      const { error: upsertError } = await supabase
        .from('listings')
        .upsert(rows, { onConflict: 'product_id,retailer_id,condition' })

      if (upsertError) {
        console.error(`[sync-amazon] upsert failed for ${product.name}:`, upsertError)
        errors.push(`${product.name} upsert: ${JSON.stringify(upsertError)}`)
        totalFailed++
      } else {
        totalUpserted += rows.length
        for (const [cond, c] of picks) {
          byCond[cond] = (byCond[cond] ?? 0) + 1
          if (samples.length < 8) samples.push(`${product.name} → ${c.title} (${c.asin}) → ${cond} → £${c.price}`)
        }
      }

      await sleep(1000) // ~1 req/sec throttle
    }

    // Stale-price sweep: on a clean, non-aborted run, drop PRICED Amazon rows for the
    // synced products that this run did not refresh (no longer matched) so we never
    // serve an Amazon price older than today. Price-0 search-link rows are left intact
    // (the existing search-link mechanism owns those); other retailers untouched.
    let staleDeleted = 0
    if (!aborted && totalFailed === 0 && syncedProductIds.length > 0) {
      const { data: deleted, error: sweepErr } = await supabase
        .from('listings')
        .delete()
        .eq('retailer_id', AMAZON_RETAILER_ID)
        .gt('price_gbp', 0)
        .lt('scraped_at', runStart)
        .in('product_id', syncedProductIds)
        .select('id')
      if (sweepErr) errors.push(`stale sweep: ${JSON.stringify(sweepErr)}`)
      else staleDeleted = deleted?.length ?? 0
    }

    return NextResponse.json({
      success: true,
      amazonAvailable: true,
      aborted,
      scope: slugsParam ? `slugs(${(products as ProductRow[]).length})` : (category ?? 'all'),
      products: products.length,
      matchedProducts,
      listingsUpserted: totalUpserted,
      byCondition: byCond,
      stalePricedDeleted: staleDeleted,
      failed: totalFailed,
      samples,
      errors: errors.slice(0, 10),
    })
  } catch (err) {
    console.error('[sync-amazon] fatal:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

export const GET = handle
export const POST = handle
