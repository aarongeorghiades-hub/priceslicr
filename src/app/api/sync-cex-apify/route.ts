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
  // FIX 2: split letter↔digit transitions in the TITLE only ("Flip5"→"Flip 5",
  // "Book4"→"Book 4") so concatenated model words still satisfy \bword\b. This
  // copy is for name-token matching ONLY; titleMatchesModelTokens keeps the raw
  // title so digit tokens like "256gb" stay intact.
  const splitTitle = (title || '')
    .replace(/([A-Za-z])(\d)/g, '$1 $2')
    .replace(/(\d)([A-Za-z])/g, '$1 $2')
  // FIX H2: also test against a non-alphanumeric-stripped title so a compound model
  // word ("quietcomfort") matches CEX's spaced form ("Quiet Comfort"). ADDITIVE — a
  // token passes via word-boundary on the split title OR substring on the stripped
  // title; it can never remove an existing match.
  const stripped = (title || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  return tokens.every(tok => new RegExp(`\\b${tok}\\b`, 'i').test(splitTitle) || stripped.includes(tok))
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

// FIX H1: reject candidates that ARE the accessory (charging case, ear pads, cover,
// tips, etc.). Most headphones carry no digit token, so accessory-only listings pass
// the model/name/variant gates and, being cheapest, get chosen (e.g. AirPods Pro
// "MagSafe Case Only (No Airpods)" £40). This rejects the listing only when it IS the
// accessory — it does NOT reject a genuine unit that merely INCLUDES one ("(Hard
// Case)", "w/Dongle", "w/Stand"). Tuned against the real recon titles.
function isAccessoryOnly(title: string): boolean {
  const t = (title || '').toLowerCase()
  if (/\bcase only\b/.test(t)) return true
  if (/\bno (airpods|earbuds)\b/.test(t)) return true
  if (/\bbody only\b/.test(t)) return true
  if (/\bempty\b/.test(t)) return true
  if (/\breplacement\b/.test(t)) return true
  // an accessory noun as the listing's subject: "<accessory> for …" / "<accessory> only"
  if (/\b(case|cover|cushion|cushions|ear ?pads?|ear ?tips?|tips|strap|pouch|sleeve)\s+(for|only)\b/.test(t)) return true
  return false
}

// Map CEX letter grade → the DB condition_grade enum (excellent|good|fair|null).
// CEX has no tier matching 'very_good'. Grade F is already excluded upstream.
function mapGrade(grade?: string): 'excellent' | 'good' | 'fair' | null {
  switch ((grade || '').toUpperCase()) {
    case 'A': return 'excellent'
    case 'B': return 'good'
    case 'C': return 'fair'
    default: return null
  }
}

// Variant guard: reject a candidate whose title carries a tier word our
// product name does NOT (e.g. plain "Galaxy Tab S10" must not match
// "Galaxy Tab S10 Lite"; plain "iPhone 15" must not match "15 Pro"/"15 Max").
const VARIANT_WORDS = ['pro', 'plus', 'max', 'ultra', 'lite', 'fe', 'mini', 'se', 'neo']
function variantWordsIn(text: string): Set<string> {
  // FIX 1: strip RAM+storage notation ("8GB+256GB", "12GB + 256GB") BEFORE the
  // +→plus normalisation, so a memory "+" is never read as a "plus" tier word
  // (which was wrongly rejecting Motorola Edge 50 Pro / Nothing 3a / OnePlus 13 /
  // Galaxy A55). Genuine model "+" (e.g. "S25+ 256GB", where + follows a model
  // token and is NOT flanked by GB) is preserved and still normalises to "plus".
  const deSpec = (text || '')
    .replace(/\d+\s*GB\s*\+\s*\d+\s*(?:GB|TB)/gi, ' ')
    // FIX B: drop Intel "Core Ultra 5/7/9" CPU strings so the CPU name doesn't trip
    // the 'ultra' tier word (was wrongly rejecting Dell XPS 13 9340 / Surface Pro 11).
    // A genuine tier "Ultra" (phone "S25 Ultra", tablet "Tab S10 Ultra 5G") is never
    // followed by a bare 5/7/9, so it is preserved — phones/tablets are unaffected.
    .replace(/\bultra\s*[579]\b/gi, ' ')
  // Normalise the "+" plus-tier symbol to the word (e.g. "S10+" → "s10 plus ").
  const normalised = deSpec.replace(/\+/g, ' plus ')
  const found = new Set<string>()
  for (const w of VARIANT_WORDS) {
    if (new RegExp(`\\b${w}\\b`, 'i').test(normalised)) found.add(w)
  }
  return found
}
function passesVariantGuard(title: string, name: string): boolean {
  const titleVariants = variantWordsIn(title)
  const nameVariants = variantWordsIn(name)
  // Symmetric: the tier-word sets must be EQUAL. Reject if either side carries a
  // tier word the other lacks — so "S25+" never matches plain "S25" (either way).
  if (titleVariants.size !== nameVariants.size) return false
  for (const w of nameVariants) {
    if (!titleVariants.has(w)) return false
  }
  return true
}

// FIX 3 (fallback only): a storage-stripped search term, used ONLY as a retry
// when the full-name search returns no candidate. Surfaces genuine handsets that
// the full-name query buries under accessories (e.g. iPhone SE 3rd Gen) WITHOUT
// perturbing products whose full-name search already returns the right unit — a
// blanket cleaned search regressed working phones (lost cheapest grade) and even
// matched "iPhone 16e" to "iPhone 16", so it is gated behind the zero-result case.
function cexSearchTerm(name: string): string {
  return name.replace(/\b\d+\s*(?:GB|TB)\b/gi, '').replace(/\s+/g, ' ').trim()
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

// Device-class guard (PHONE products only): a phone's model number can satisfy a
// different device's screen-size token (e.g. "OnePlus 13" matching "OnePlus Pad 3
// 13\""). Reject a candidate whose title carries a non-phone device-class word.
// Scoped to category 'phone' so iPad / Galaxy Tab / MacBook products are untouched.
const NON_PHONE_CLASS_TOKENS = new Set([
  'tab', 'pad', 'tablet', 'watch', 'book', 'notebook', 'macbook', 'laptop',
  'buds', 'earbuds', 'pen', 'stylus',
])
function hasNonPhoneClassToken(title: string): boolean {
  return (title || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
    .some(tok => NON_PHONE_CLASS_TOKENS.has(tok))
}

// FIX A (laptop screen-size guard): the bare digit-token matcher lets an Apple
// model code like "15,13" satisfy a "13"/"15" size token, so a 15" Mac matches a
// 13" product (and vice-versa) — the only collision class that writes WRONG prices.
// Require the title's EXPLICIT inch marker (NN") to equal the product's screen size
// (specs.display_inches floored to the integer inch class CEX labels with, e.g.
// 13.6→13, 15.3→15). The "NN,NN" model code has no '"' so it never counts. A title
// with no inch marker is unverifiable → not rejected here (other gates still apply).
function laptopScreenMatches(title: string, displayInches: number): boolean {
  const expected = Math.floor(displayInches)
  const titleSizes = [...(title || '').matchAll(/(\d+)(?:\.\d+)?"/g)].map(m => parseInt(m[1], 10))
  if (titleSizes.length === 0) return true
  return titleSizes.includes(expected)
}

// FIX C — per-product required title substrings (case-insensitive), applied ON TOP
// of all other gates for that slug ONLY. CEX never writes the word "Go" for the
// Acer Swift Go — it writes the model-code prefix "SFG" (SFG14-xx / SFG16-xx);
// other Swift lines are SF114 / SF314 / SF514 / SFX14 (no "SFG"). Requiring "sfg"
// means only a genuine Swift Go matches; the 14" screen guard pins it to the 14"
// model. Absent slug / empty list = current behaviour exactly (no other product changes).
const PER_PRODUCT_TITLE_REQUIREMENTS: Record<string, string[]> = {
  'acer-swift-go-14': ['sfg'],
}
function passesPerProductRequirements(title: string, slug: string): boolean {
  const reqs = PER_PRODUCT_TITLE_REQUIREMENTS[slug]
  if (!reqs || reqs.length === 0) return true
  const t = (title || '').toLowerCase()
  return reqs.every(r => t.includes(r.toLowerCase()))
}

// All gates + exclusions in one place (used by the primary search and the fallback).
function selectCandidates(items: CexItem[], name: string, category: string, screenInches?: number, slug?: string): CexItem[] {
  return items.filter(it =>
    !isExcluded(it) &&
    !isAccessoryOnly(it.title || '') &&
    typeof it.sellPrice === 'number' && it.sellPrice > 0 &&
    titleMatchesModelTokens(it.title || '', name) &&
    nameTokenGate(it.title || '', name) &&
    passesVariantGuard(it.title || '', name) &&
    !(category === 'phone' && hasNonPhoneClassToken(it.title || '')) &&
    !(category === 'laptop' && typeof screenInches === 'number' && !laptopScreenMatches(it.title || '', screenInches)) &&
    passesPerProductRequirements(it.title || '', slug || '')
  )
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
      .select('id, name, slug, category, specs')
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
        // Primary: full-name search (unchanged — keeps working phones stable).
        const screenInches = (product.specs as { display_inches?: number } | null)?.display_inches
        let items = await fetchCexItems(product.name)
        let candidates = selectCandidates(items, product.name, product.category, screenInches, product.slug)

        // FIX 3 fallback: only when the full-name search surfaced nothing, retry
        // with the storage-stripped query (recovers buried handsets like the
        // iPhone SE 3rd Gen) — the variant/digit gates still enforce precision.
        if (candidates.length === 0) {
          const alt = cexSearchTerm(product.name)
          if (alt && alt !== product.name) {
            const altItems = await fetchCexItems(alt)
            const altCandidates = selectCandidates(altItems, product.name, product.category, screenInches, product.slug)
            if (altCandidates.length > 0) {
              items = altItems
              candidates = altCandidates
            }
          }
        }

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
          condition_grade: mapGrade(best.grade),
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
