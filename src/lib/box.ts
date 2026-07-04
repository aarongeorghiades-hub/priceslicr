// Box.co.uk (Awin datafeed) client + Box-LOCAL matching helpers for /api/sync-box.
// Additive listings source only: this never touches the shared price resolver, and it
// uses the SHARED titleMatchesModelTokens UNMODIFIED — all extra strictness is Box-LOCAL
// here (mirrors the Amazon route's Amazon-LOCAL guards, as Box-LOCAL copies).
import zlib from 'node:zlib'
import { parse } from 'csv-parse/sync'

export const BOX_RETAILER_ID = '608daf51-dd5d-4bed-ac91-4e7faf805653'

export interface BoxFeedRow {
  product_name: string
  brand_name: string
  condition: string
  search_price: string
  currency: string
  in_stock: string
  merchant_deep_link: string
  aw_deep_link: string
  category_name: string
  model_number: string
  product_model: string
  [k: string]: string
}

export interface BoxProduct {
  id: string
  name: string
  category: string
  slug: string
  specs: Record<string, string | number> | null
  brand: string | null
  model_identifier: string | null
}

// Fetch the Awin datafeed. The productdata.awin.com URL 302-redirects to an
// internal.productdata.awin.com host; Node fetch follows redirects by default. The body is
// a gzipped CSV (compression is the FILE format, not HTTP transfer-encoding) → gunzip here.
export async function fetchBoxFeed(url: string): Promise<BoxFeedRow[]> {
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`Box feed fetch failed: ${resp.status}`)
  const gz = Buffer.from(await resp.arrayBuffer())
  const csvText = zlib.gunzipSync(gz).toString('utf-8')
  return parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  }) as BoxFeedRow[]
}

// ── Box-LOCAL normalisation (copies of the Amazon-side conventions; shared matcher untouched) ──
function stripOsTokens(s: string): string {
  return (s || '').replace(/\bwindows\s*1[01]\b/gi, ' ').replace(/\bwin\s*1[01]\b/gi, ' ')
}
function foldAccents(s: string): string {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
}
// Strip the feed's leading "Refurbished - " marketing prefix (condition comes from the
// `condition` column, never the title), then lowercase, strip OS tokens, fold accents, and
// glue "<n> GB/TB" so storage/RAM tokens substring-match the product name.
export function normaliseBoxTitle(title: string): string {
  const stripped = (title || '').replace(/^\s*refurbished\s*-\s*/i, '')
  return foldAccents(stripOsTokens(stripped.toLowerCase())).replace(/(\d+)\s*(gb|tb)\b/g, '$1$2')
}

// ── Box-LOCAL brand gate (copy of the Amazon brand gate) ──
export function passesBoxBrandGate(normTitle: string, brand: string | null): boolean {
  const toks = (brand || '').toLowerCase().match(/[a-z0-9]+/g) ?? []
  const sig = toks.filter(t => t.length >= 2)
  if (sig.length === 0) return true
  return sig.every(t => normTitle.includes(t))
}

// ── Box-LOCAL model-identity gate (copy of the Amazon model-identity gate) ──
const IDENTITY_STOP = new Set([
  'usb', 'c', 'wifi', 'wi', 'fi', '5g', '4g', 'lte', 'gps', 'cellular', 'bluetooth',
  'wireless', 'gb', 'tb', 'inch', 'uk', 'version', 'edition', 'the', 'with', 'for', 'and',
])
const splitLD = (s: string) => (s || '').toLowerCase()
  .replace(/([a-z])(\d)/g, '$1 $2').replace(/(\d)([a-z])/g, '$1 $2')
function identityTokens(product: BoxProduct): string[] {
  const brandToks = new Set((product.brand || '').toLowerCase().match(/[a-z0-9]+/g) ?? [])
  const toks = splitLD(product.name).match(/[a-z0-9]+/g) ?? []
  return toks.filter(t => !brandToks.has(t) && !IDENTITY_STOP.has(t))
}
export function passesBoxModelIdentity(normTitle: string, product: BoxProduct): boolean {
  const tWords = splitLD(normTitle).match(/[a-z0-9]+/g) ?? []
  const tset = new Set(tWords)
  for (const tok of identityTokens(product)) {
    const ok = tset.has(tok) || (tok.length >= 3 && tWords.some(w => w.startsWith(tok)))
    if (!ok) return false
  }
  return true
}

// ── Box-LOCAL storage guard: the product's storage (specs.storage_gb) must appear in the
// title, in GB or the equivalent TB form (1024 GB → 1 TB). No-op if no storage spec. ──
export function boxStorageTokens(product: BoxProduct): string[] {
  const gb = product.specs?.storage_gb
  if (gb == null || !/^\d+$/.test(String(gb))) return []
  const n = Number(gb)
  const toks = [`${n}gb`]
  if (n % 1024 === 0) toks.push(`${n / 1024}tb`)
  return toks
}
export function passesBoxStorageGuard(normTitle: string, product: BoxProduct): boolean {
  const toks = boxStorageTokens(product)
  if (toks.length === 0) return true
  return toks.some(t => normTitle.includes(t))
}

// ── Box-LOCAL RAM guard — enforced ONLY where the product NAME or model_identifier itself
// specifies the RAM size (e.g. "MacBook Air … 8GB 256GB"). If RAM is not named, no-op
// (we don't invent a constraint from specs alone). ──
export function boxRamToken(product: BoxProduct): string | null {
  const ram = product.specs?.ram_gb
  if (ram == null || !/^\d+$/.test(String(ram))) return null
  const tok = `${Number(ram)}gb`
  const named = `${product.name} ${product.model_identifier ?? ''}`.toLowerCase().replace(/(\d+)\s*(gb|tb)\b/g, '$1$2')
  return named.includes(tok) ? tok : null
}
export function passesBoxRamGuard(normTitle: string, product: BoxProduct): boolean {
  const tok = boxRamToken(product)
  if (!tok) return true
  return normTitle.includes(tok)
}

// Condition map: feed 'new' → 'new'; 'refurbished' → 'refurbished'; anything else → null (skip).
export function mapBoxCondition(condition: string): 'new' | 'refurbished' | null {
  const c = (condition || '').trim().toLowerCase()
  if (c === 'new') return 'new'
  if (c === 'refurbished') return 'refurbished'
  return null
}
