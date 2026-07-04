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
// `condition` column, never the title), then lowercase, strip OS tokens, fold accents, strip
// standalone network-band tokens, and glue "<n> GB/TB" so storage/RAM tokens substring-match
// the product name.
//
// Band strip mirrors the Amazon S33 fix: 40/52 Box phone titles carry a trailing "5G"/"4G"/
// "LTE" band. The strip is WORD-BOUNDED and standalone-only, so it is safe — a generation
// digit is never "5g" (Fold 5 / Pixel 5 keep their bare "5"); a band glued into a model has
// no boundary before the digit ("X5G" untouched); and storage/RAM keep their trailing letters
// ("4GB" → g·b, "5GHz" → g·h have no boundary), so \b[45]g\b matches neither.
export function normaliseBoxTitle(title: string): string {
  const stripped = (title || '').replace(/^\s*refurbished\s*-\s*/i, '')
  return foldAccents(stripOsTokens(stripped.toLowerCase()))
    .replace(/\b[45]g\b/gi, ' ')   // standalone 5G / 4G network band
    .replace(/\blte\b/gi, ' ')     // standalone LTE band
    // Apple A-series chip tokens ("A16 Chip", "A16 Bionic Chip", "A18 Chip") collide with
    // iPhone model numbers (A16→"16"), which the shared matcher would read as the generation
    // — mis-binding iPhone 16 to an iPhone 15 (A16) listing. Strip the "A1x …chip/bionic"
    // phrase (only when a chip/bionic word follows, so Samsung Galaxy A16/A36/A55 models —
    // never followed by "chip" — are untouched, and A2x/A3x/A5x are outside the A1x range).
    .replace(/\ba1[0-9]\s+(?:pro\s+|bionic\s+)*chip\b/gi, ' ')
    .replace(/\ba1[0-9]\s+bionic\b/gi, ' ')
    .replace(/(\d+)\s*(gb|tb)\b/g, '$1$2')
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

// ── Box-LOCAL RAM guard — SPEC-AUTHORITATIVE. When specs.ram_gb is present (the truth for
// the config we track), the feed row's own RAM (parsed from its title) MUST equal it, else
// skip — even if RAM is not in the product name. If specs.ram_gb is ABSENT, the previous
// behaviour stands (enforce only a RAM size the product NAME/model_identifier itself names).
export function boxRamToken(product: BoxProduct): string | null {
  const ram = product.specs?.ram_gb
  if (ram == null || !/^\d+$/.test(String(ram))) return null
  const tok = `${Number(ram)}gb`
  const named = `${product.name} ${product.model_identifier ?? ''}`.toLowerCase().replace(/(\d+)\s*(gb|tb)\b/g, '$1$2')
  return named.includes(tok) ? tok : null
}
// Feed RAM, parsed from the (normalised) feed title's "<n>GB RAM" pattern. null if absent.
export function feedRamGb(normTitle: string): number | null {
  const m = normTitle.match(/(\d+)\s*gb\s+ram\b/) || normTitle.match(/\bram\s+(\d+)\s*gb\b/)
  return m ? Number(m[1]) : null
}
export function passesBoxRamGuard(normTitle: string, product: BoxProduct): boolean {
  const ram = product.specs?.ram_gb
  if (ram != null && /^\d+$/.test(String(ram))) {
    const feed = feedRamGb(normTitle)
    if (feed == null) return false          // can't confirm the feed RAM → precision skip
    return feed === Number(ram)             // authoritative: must equal our tracked config
  }
  // specs.ram_gb absent → previous behaviour (only enforce a NAME-specified RAM token).
  const tok = boxRamToken(product)
  if (!tok) return true
  return normTitle.includes(tok)
}

// ── Box-LOCAL CPU-identity guard — SPEC-AUTHORITATIVE via specs.processor (present for
// every laptop we track). Present-then-enforce, mirroring the RAM guard:
//   1) CPU FAMILY exclusivity — if the feed title clearly indicates a different silicon
//      family than the product (Intel vs AMD vs Apple vs Snapdragon), skip. This catches
//      the flagged Intel-config-vs-AMD-listing over-binds.
//   2) Apple chip generation + TIER — M3 must not bind M4/M5, and bare M3 must not bind
//      "M3 Pro/Max/Ultra" (and vice-versa).
//   3) Intel/AMD model code — the product's chip code (e.g. 155h, 13700h, 165u, 7840u,
//      8945hx) must appear in the title when we can extract one from specs.processor.
// If specs.processor is absent, this is a no-op.
type CpuFamily = 'apple' | 'intel' | 'amd' | 'snapdragon' | null
function cpuFamily(s: string): CpuFamily {
  const t = (s || '').toLowerCase()
  if (/\bsnapdragon\b/.test(t)) return 'snapdragon'
  if (/\bamd\b|\bryzen\b/.test(t)) return 'amd'
  if (/\bintel\b/.test(t) || /\bcore\s+(?:ultra|i[3579])\b/.test(t)) return 'intel'
  if (/\bapple\b/.test(t) || /\bm[1-9]\b/.test(t)) return 'apple'
  return null
}
function appleChip(s: string): { n: string; tier: string } | null {
  const t = (s || '').toLowerCase()
  const m = t.match(/\bm([1-9])\b/)
  if (!m) return null
  const tier = new RegExp(`\\bm${m[1]}\\s*(pro|max|ultra)\\b`, 'i').exec(t)
  return { n: m[1], tier: tier ? tier[1].toLowerCase() : '' }
}
// The Apple tier a title carries for chip number n: 'pro'/'max'/'ultra', '' if bare Mn, null if absent.
function titleAppleTier(normTitle: string, n: string): string | null {
  const tiered = new RegExp(`\\bm${n}\\s*(pro|max|ultra)\\b`, 'i').exec(normTitle)
  if (tiered) return tiered[1].toLowerCase()
  if (new RegExp(`\\bm${n}\\b`, 'i').test(normTitle)) return ''
  return null
}
// Intel/AMD mobile chip code: 3–5 digits + a mobile suffix (h/u/hx/hs/hk/p/k/x). Excludes
// storage/RAM ("512gb"/"16gb"/"1tb") by construction (those suffixes aren't in the set).
function cpuModelCode(s: string): string | null {
  const m = (s || '').toLowerCase().match(/\b(\d{3,5}(?:hx|hs|hk|h|u|p|k|x))\b/)
  return m ? m[1] : null
}
export function passesBoxCpuGuard(normTitle: string, product: BoxProduct): boolean {
  const proc = product.specs?.processor
  if (typeof proc !== 'string' || !proc.trim()) return true   // no CPU field → no-op
  const pf = cpuFamily(proc)
  if (!pf) return true
  const tf = cpuFamily(normTitle)
  if (tf && tf !== pf) return false                           // (1) family conflict → skip
  if (pf === 'apple') {                                       // (2) Apple gen + tier
    const chip = appleChip(proc)
    if (chip) {
      const tt = titleAppleTier(normTitle, chip.n)
      if (tt === null || tt !== chip.tier) return false
    }
    return true
  }
  const code = cpuModelCode(proc)                             // (3) Intel/AMD exact chip code
  if (code) return normTitle.includes(code)
  return true
}

// ── Box-LOCAL MONITOR exactness — present-then-enforce on specs.screen (inches),
// specs.resolution and specs.refresh_rate. For each field present in specs, parse the feed
// title: a PARSED value that MISMATCHES the spec → skip (wrong config); a value ABSENT from
// the title → not enforced (feed titles routinely omit refresh, sometimes resolution). This
// is a no-op for products without these keys (laptops carry display_inches, not screen), so
// it is safe in the shared stack. Model-code identity (shared matcher + brand/model-identity
// guards) stays the PRIMARY gate; this only rejects a title that CONTRADICTS the spec.
const RES_SYNONYMS: [RegExp, string][] = [
  [/\b5k\b|\b5120\b/, '5k'],
  [/\b4k\b|\buhd\b|\b3840\b|\b2160p?\b/, '4k'],
  [/\b1440p\b|\bqhd\b|\bwqhd\b|quad\s*hd|\b2560\b|\b3440\b/, '1440p'],
  [/\b1080p\b|\bfhd\b|full\s*hd|\b1920\b/, '1080p'],
]
function resolutionClassFromTitle(nt: string): string | null {
  for (const [re, cls] of RES_SYNONYMS) if (re.test(nt)) return cls
  return null
}
function resolutionClassFromSpec(res: string): string | null {
  const r = (res || '').toLowerCase()
  if (r.includes('5k')) return '5k'
  if (r.includes('4k')) return '4k'
  if (r.includes('1440')) return '1440p'
  if (r.includes('1080')) return '1080p'
  return null
}
function feedInches(nt: string): number | null {
  const m = nt.match(/\b(\d{2}(?:\.\d)?)\s*(?:"|inch|-inch)/)
  const v = m ? Number(m[1]) : null
  return v != null && v >= 17 && v <= 60 ? v : null   // sane monitor range; else treat as absent
}
function feedHz(nt: string): number | null {
  const m = nt.match(/\b(\d{2,3})\s*hz\b/)
  return m ? Number(m[1]) : null
}
export function passesBoxMonitorGuard(normTitle: string, product: BoxProduct): boolean {
  const s = product.specs
  if (!s) return true
  // Screen inches
  if (s.screen != null && /^\d+(?:\.\d+)?$/.test(String(s.screen))) {
    const fi = feedInches(normTitle)
    if (fi != null && Math.round(fi) !== Math.round(Number(s.screen))) return false
  }
  // Resolution class
  if (typeof s.resolution === 'string' && s.resolution.trim()) {
    const spec = resolutionClassFromSpec(s.resolution)
    const feed = resolutionClassFromTitle(normTitle)
    if (spec && feed && spec !== feed) return false
  }
  // Refresh rate (Hz)
  if (s.refresh_rate != null && String(s.refresh_rate).trim()) {
    const m = String(s.refresh_rate).match(/(\d+)/)
    const specHz = m ? Number(m[1]) : null
    const fh = feedHz(normTitle)
    if (specHz && fh && fh !== specHz) return false
  }
  return true
}

// ── Box-LOCAL PHONE variant guard — tier words (pro/plus/max/ultra/fe/mini/se/fold/flip …)
// must match as a SET, so a base "Galaxy S25" never binds "S25 Ultra"/"S25+", "iPhone 15"
// never binds "15 Pro", etc. (model-identity alone lets the base tokens pass a variant title).
// "+" is read as "plus" (S25+ → plus). Category-scoped to phones so laptop/monitor behaviour
// is untouched (laptop OS-edition words like "…11 Pro" would otherwise be misread as a tier).
const PHONE_VARIANT_WORDS = ['pro', 'plus', 'max', 'ultra', 'lite', 'fe', 'mini', 'se', 'neo', 'fold', 'flip']
function phoneVariantWords(text: string): Set<string> {
  const t = (text || '').toLowerCase()
    .replace(/\+/g, ' plus ')
    .replace(/([a-z])(\d)/g, '$1 $2').replace(/(\d)([a-z])/g, '$1 $2')
  const found = new Set<string>()
  for (const w of PHONE_VARIANT_WORDS) if (new RegExp(`\\b${w}\\b`).test(t)) found.add(w)
  return found
}
export function passesBoxPhoneVariantGuard(normTitle: string, product: BoxProduct): boolean {
  if (product.category !== 'phone') return true
  const nameV = phoneVariantWords(product.name)
  const titleV = phoneVariantWords(normTitle)
  if (nameV.size !== titleV.size) return false
  for (const w of nameV) if (!titleV.has(w)) return false
  return true
}

// ── Box-LOCAL PHONE storage guard — phones don't carry specs.storage_gb (they use specs.storage
// and the name/slug), so passesBoxStorageGuard no-ops for them. Derive the tracked storage from
// the product NAME + SLUG; when the feed title states a storage, it must MATCH. Present+match →
// pass; a DIFFERENT capacity stated → skip (contradiction); no storage stated in the feed →
// allow (the shared matcher already carries the name's storage token). Category-scoped to phones
// so laptop/monitor behaviour is untouched. RAM ("<n>GB RAM") is dropped before reading the
// feed's storage so it is never mistaken for the capacity.
export function phoneStorageToken(product: BoxProduct): string | null {
  const src = `${product.name} ${product.slug}`.toLowerCase().replace(/(\d+)\s*(gb|tb)\b/g, '$1$2')
  const m = src.match(/\b(\d+)(gb|tb)\b/)
  return m ? `${m[1]}${m[2]}` : null
}
export function passesBoxPhoneStorageGuard(normTitle: string, product: BoxProduct): boolean {
  if (product.category !== 'phone') return true
  const tok = phoneStorageToken(product)
  if (!tok) return true
  if (normTitle.includes(tok)) return true                        // storage stated and matches
  const t = normTitle.replace(/\b\d+gb\s+ram\b/g, ' ')            // drop RAM so it isn't read as storage
  const feedStorages = [...t.matchAll(/\b(\d+)(gb|tb)\b/g)]
  return feedStorages.length === 0                                // no storage in feed → allow; different → skip
}

// Condition map: feed 'new' → 'new'; 'refurbished' → 'refurbished'; anything else → null (skip).
export function mapBoxCondition(condition: string): 'new' | 'refurbished' | null {
  const c = (condition || '').trim().toLowerCase()
  if (c === 'new') return 'new'
  if (c === 'refurbished') return 'refurbished'
  return null
}
