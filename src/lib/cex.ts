const CEX_API_BASE = 'https://wss2.cex.uk.webuy.io/v3'

export interface CexListing {
  boxId: string
  boxName: string
  sellPrice: number
  grade: string
  condition: 'refurbished' | 'used'
}

function normaliseCexCondition(grade: string): 'refurbished' | 'used' {
  const g = grade.toUpperCase()
  if (g === 'A' || g.startsWith('A')) return 'refurbished'
  return 'used'
}

export async function searchCex(query: string): Promise<CexListing[]> {
  const params = new URLSearchParams({
    q: query,
    inStock: '1',
    inStockOnline: '1',
    countryCode: 'GB',
    firstRecord: '1',
    count: '10',
    sortOrder: 'asc',
  })

  const res = await fetch(`${CEX_API_BASE}/boxes?${params.toString()}`, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0',
    },
    next: { revalidate: 0 },
  })

  if (!res.ok) return []

  const data = await res.json()
  const boxes = data?.response?.data?.boxes ?? []

  return boxes
    .filter((b: any) => b.sellPrice && b.sellPrice > 0)
    .map((b: any) => ({
      boxId: b.boxId,
      boxName: b.boxName,
      sellPrice: b.sellPrice,
      grade: b.grade ?? 'B',
      condition: normaliseCexCondition(b.grade ?? 'B'),
    }))
}
