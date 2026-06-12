const EBAY_API_BASE = 'https://api.ebay.com'
const EBAY_AUTH_URL = 'https://api.ebay.com/identity/v1/oauth2/token'

// Get OAuth access token using client credentials flow
export async function getEbayAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
  ).toString('base64')

  const response = await fetch(EBAY_AUTH_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
  })

  if (!response.ok) {
    throw new Error(`eBay auth failed: ${response.status} ${await response.text()}`)
  }

  const data = await response.json()
  return data.access_token
}

// Search eBay UK for a product — returns Buy It Now listings only
export async function searchEbayUK(
  query: string,
  accessToken: string,
  limit = 20
): Promise<EbayListing[]> {
  const params = new URLSearchParams({
    q: query,
    filter: 'buyingOptions:{FIXED_PRICE},deliveryCountry:GB',
    limit: String(limit),
    sort: 'price_dsc',
  })

  const response = await fetch(
    `${EBAY_API_BASE}/buy/browse/v1/item_summary/search?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB',
        'X-EBAY-C-ENDUSERCTX': `affiliateCampaignId=${process.env.EBAY_CAMPAIGN_ID}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    console.error(`eBay search failed for "${query}": ${response.status}`)
    return []
  }

  const data = await response.json()
  return (data.itemSummaries ?? []).map((item: any) => ({
    itemId: item.itemId,
    title: item.title,
    price: parseFloat(item.price?.value ?? '0'),
    currency: item.price?.currency ?? 'GBP',
    condition: normaliseCondition(item.condition),
    url: item.itemAffiliateWebUrl ?? item.itemWebUrl,
    imageUrl: item.image?.imageUrl,
    seller: item.seller?.username,
  }))
}

export interface EbayListing {
  itemId: string
  title: string
  price: number
  currency: string
  condition: 'new' | 'refurbished' | 'used'
  url: string
  imageUrl?: string
  seller?: string
}

function normaliseCondition(condition: string | undefined): 'new' | 'refurbished' | 'used' {
  if (!condition) return 'used'
  const c = condition.toLowerCase()
  if (c.includes('new')) return 'new'
  if (c.includes('refurb') || c.includes('excellent') || c.includes('good') || c.includes('very good')) return 'refurbished'
  return 'used'
}

// ── Cross-condition sanity anchor (junk-filter Layer d) ───────────────
// A "New" price far below the second-hand market is almost always junk
// (parts / box-only / network-locked / broken) that slipped layers (a)–(c).
// The anchor is the DEARER of the refurbished/used medians; the caller
// rejects New listings priced below 0.90× it. Each median is only used
// when its condition has >=2 accepted candidates (a single candidate is
// too thin to anchor against). Returns anchor: null when neither median
// is available, signalling the caller to skip the rule for that product.
export function computeSecondhandAnchor(
  candidatesByCondition: Record<string, { price: number }[]>
): { anchor: number | null; refurbishedMedian: number | null; usedMedian: number | null } {
  const medianOf = (cond: string): number | null => {
    const arr = candidatesByCondition[cond]
    if (!arr || arr.length < 2) return null
    const sorted = arr.map(i => i.price).sort((a, b) => a - b)
    return sorted[Math.floor(sorted.length / 2)]
  }
  const refurbishedMedian = medianOf('refurbished')
  const usedMedian = medianOf('used')
  const available = [refurbishedMedian, usedMedian].filter((v): v is number => v != null)
  const anchor = available.length > 0 ? Math.max(...available) : null
  return { anchor, refurbishedMedian, usedMedian }
}
