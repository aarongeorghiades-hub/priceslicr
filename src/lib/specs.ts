export const SPEC_LABELS: Record<string, (val: string | number) => string> = {
  ram: (v) => `${v}GB RAM`,
  storage: (v) => `${v}GB SSD`,
  screen: (v) => `${v}"`,
  os: (v) => String(v),
  processor: (v) => String(v),
  chip: (v) => String(v),
  gpu: (v) => String(v),
  weight: (v) => `${v}kg`,
  battery: (v) => `${v}Wh`,
  resolution: (v) => String(v),
  ports: (v) => String(v),
  panel: (v) => String(v),
  hdr: (v) => String(v),
  refresh_rate: (v) => String(v),
  connectivity: (v) => String(v),
  anc: () => 'Active Noise Cancelling',
  wireless: () => 'Wireless',
  spatial_audio: () => 'Spatial Audio',
  type: (v) => String(v),
}

// Returns null for values that should be hidden (booleans, empty strings, etc.)
export function formatSpec(key: string, val: unknown): string | null {
  // Hide boolean true/false — these are flags not display values
  if (typeof val === 'boolean') {
    if (!val) return null
    // Boolean true — use key-based label if available
    const formatter = SPEC_LABELS[key.toLowerCase()]
    if (formatter) return formatter(1)
    return null
  }

  if (val === null || val === undefined || val === '') return null

  const formatter = SPEC_LABELS[key.toLowerCase()]
  if (formatter) return formatter(val as string | number)

  // Fallback — return the value as string
  return String(val)
}
