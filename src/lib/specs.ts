export const SPEC_LABELS: Record<string, (val: string | number) => string> = {
  ram: (v) => `${v}GB RAM`,
  storage: (v) => `${v}GB SSD`,
  screen: (v) => `${v}"`,
  os: (v) => String(v),
  processor: (v) => String(v),
  gpu: (v) => String(v),
  weight: (v) => `${v}kg`,
  battery: (v) => typeof v === 'number' ? `${v}hrs` : String(v),
  resolution: (v) => String(v),
  ports: (v) => String(v),
  chip: (v) => String(v),
  panel: (v) => String(v),
  hdr: (v) => String(v),
  refresh_rate: (v) => String(v),
  connectivity: (v) => String(v),
  type: (v) => String(v),
  anc: (v) => v ? 'ANC' : '',
  wireless: (v) => v ? 'Wireless' : 'Wired',
  usbc: (v) => v ? 'USB-C' : '',
  spatial_audio: (v) => v ? 'Spatial Audio' : '',
}

export function formatSpec(key: string, val: string | number): string {
  const formatter = SPEC_LABELS[key.toLowerCase()]
  if (formatter) return formatter(val)
  return String(val)
}
