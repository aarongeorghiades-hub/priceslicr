// Amazon Creators API (catalog/searchItems) client — live UK prices for the
// /api/sync-amazon route. Additive listings source only: this never touches the
// shared price resolver or the shared matcher.
//
// Wire shape verified live (HTTP 200) in the S26 eligibility probe:
//  - LWA token: POST https://api.amazon.co.uk/auth/o2/token, client_credentials,
//    scope creatorsapi::default. The probe used form-encoded and returned a token,
//    so that is the shape used here.
//  - Catalog: POST https://creatorsapi.amazon/catalog/v1/searchItems (BARE .amazon
//    host), Bearer token + x-marketplace header; marketplace set by header/body.

const TOKEN_URL = 'https://api.amazon.co.uk/auth/o2/token'
const CATALOG_URL = 'https://creatorsapi.amazon/catalog/v1/searchItems'

export const AMAZON_MARKETPLACE = process.env.AMAZON_MARKETPLACE || 'www.amazon.co.uk'
export const AMAZON_PARTNER_TAG = process.env.AMAZON_PARTNER_TAG || 'pestproindex2-21'
const SCOPE = 'creatorsapi::default'

// Error carrying the HTTP status so the route can tell an eligibility/auth failure
// (401/403) — abort Amazon cleanly — from a transient per-product error (skip + continue).
export class AmazonApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'AmazonApiError'
    this.status = status
  }
}

// In-process token cache (~55 min; tokens last 1h). Module-scoped so it survives
// across products within a run and across runs on the same warm server instance.
let cachedToken: { token: string; expiresAt: number } | null = null

export async function getAmazonAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.token

  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AMAZON_CREATORS_CLIENT_ID ?? '',
      client_secret: process.env.AMAZON_CREATORS_CLIENT_SECRET ?? '',
      scope: SCOPE,
    }),
  })
  if (!resp.ok) {
    throw new AmazonApiError(resp.status, `Amazon LWA auth failed: ${resp.status}`)
  }
  const data = await resp.json().catch(() => ({}))
  if (!data.access_token) throw new AmazonApiError(resp.status, 'Amazon LWA: no access_token in response')
  cachedToken = { token: data.access_token, expiresAt: Date.now() + 55 * 60 * 1000 }
  return data.access_token
}

// ── Catalog SearchItems ──
export interface AmazonOfferListing {
  conditionValue: string // "New" | "Used"
  subCondition: string // New | LikeNew | VeryGood | Good | Acceptable | Unknown
  conditionNote: string
  inStock: boolean
  isBuyBoxWinner: boolean
  price: number | null // price.money.amount (GBP)
}
export interface AmazonItem {
  asin: string
  title: string
  detailPageURL: string // already carries tag=pestproindex2-21
  listings: AmazonOfferListing[]
}

const SEARCH_RESOURCES = [
  'offersV2.listings.price',
  'offersV2.listings.condition',
  'offersV2.listings.availability',
  'itemInfo.title',
]

export async function searchAmazonUK(keywords: string, token: string): Promise<AmazonItem[]> {
  const resp = await fetch(CATALOG_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-marketplace': AMAZON_MARKETPLACE,
    },
    body: JSON.stringify({
      keywords,
      partnerTag: AMAZON_PARTNER_TAG,
      partnerType: 'Associates',
      marketplace: AMAZON_MARKETPLACE,
      resources: SEARCH_RESOURCES,
    }),
  })

  if (!resp.ok) {
    const body = await resp.text().catch(() => '')
    throw new AmazonApiError(resp.status, `Amazon searchItems ${resp.status}: ${body.slice(0, 300)}`)
  }

  const data = await resp.json().catch(() => ({}))
  const items = data?.searchResult?.items ?? []
  return items.map((it: any): AmazonItem => ({
    asin: it.asin,
    title: it.itemInfo?.title?.displayValue ?? '',
    detailPageURL: it.detailPageURL ?? '',
    listings: (it.offersV2?.listings ?? []).map((l: any): AmazonOfferListing => ({
      conditionValue: l.condition?.value ?? '',
      subCondition: l.condition?.subCondition ?? '',
      conditionNote: l.condition?.conditionNote ?? '',
      inStock: (l.availability?.type ?? '').startsWith('IN_STOCK'),
      isBuyBoxWinner: !!l.isBuyBoxWinner,
      price: typeof l.price?.money?.amount === 'number' ? l.price.money.amount : null,
    })),
  }))
}
