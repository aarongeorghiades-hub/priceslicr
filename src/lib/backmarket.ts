const APIFY_TOKEN = process.env.APIFY_TOKEN!
const ACTOR_ID = 'silentflow~backmarket-scraper'
const APIFY_BASE = 'https://api.apify.com/v2'

export interface BackMarketListing {
  title: string
  price: number
  condition: 'refurbished'
  conditionLabel: string
  url: string
}

function normaliseCondition(label: string): string {
  const l = label.toLowerCase()
  if (l.includes('premium') || l.includes('excellent')) return 'Premium'
  if (l.includes('good')) return 'Good'
  if (l.includes('fair')) return 'Fair'
  return label
}

export async function searchBackMarket(query: string): Promise<BackMarketListing[]> {
  const runRes = await fetch(`${APIFY_BASE}/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ searches: [query], country: 'GB', maxResultsPerSearch: 5 }),
  })
  if (!runRes.ok) { console.error('Apify run failed:', await runRes.text()); return [] }
  const runData = await runRes.json()
  const runId = runData?.data?.id
  if (!runId) return []
  for (let i = 0; i < 12; i++) {
    await new Promise(r => setTimeout(r, 5000))
    const statusRes = await fetch(`${APIFY_BASE}/actor-runs/${runId}?token=${APIFY_TOKEN}`)
    const statusData = await statusRes.json()
    const status = statusData?.data?.status
    if (status === 'SUCCEEDED') break
    if (status === 'FAILED' || status === 'ABORTED') { console.error('Apify run failed:', status); return [] }
  }
  const datasetId = runData?.data?.defaultDatasetId
  if (!datasetId) return []
  const resultsRes = await fetch(`${APIFY_BASE}/datasets/${datasetId}/items?token=${APIFY_TOKEN}&clean=true`)
  if (!resultsRes.ok) return []
  const items = await resultsRes.json()
  return items
    .filter((item: any) => item.price && item.price > 0 && item.url)
    .map((item: any) => ({
      title: item.title ?? item.name ?? '',
      price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')),
      condition: 'refurbished' as const,
      conditionLabel: normaliseCondition(item.grade ?? item.condition ?? 'Good'),
      url: item.url,
    }))
    .filter((item: any) => !isNaN(item.price) && item.price > 0)
}
