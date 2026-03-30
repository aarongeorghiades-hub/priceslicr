export const SPEC_LABELS: Record<string, (val: string | number) => string> = {
  ram: (v) => `${v}GB RAM`,
  storage: (v) => `${v}GB SSD`,
  screen: (v) => `${v}"`,
  os: (v) => String(v),
  processor: (v) => String(v),
  gpu: (v) => String(v),
  weight: (v) => `${v}kg`,
  battery: (v) => `${v}Wh`,
  resolution: (v) => String(v),
  ports: (v) => String(v),
}

export function formatSpec(key: string, val: string | number): string {
  const formatter = SPEC_LABELS[key.toLowerCase()]
  if (formatter) return formatter(val)
  return String(val)
}
