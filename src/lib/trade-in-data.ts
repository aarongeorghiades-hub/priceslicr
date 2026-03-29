export interface TradeInDevice {
  id: string
  name: string
  brand: string
  category: 'laptop' | 'phone' | 'tablet'
  grades: {
    excellent: TradeInPlatformValues
    good: TradeInPlatformValues
    fair: TradeInPlatformValues
    poor: TradeInPlatformValues
  }
}

export interface TradeInPlatformValues {
  musicmagpie: number | null
  backmarket: number | null
  cex_cash: number | null
  cex_voucher: number | null
  apple_trade: number | null
}

export const TRADE_IN_DEVICES: TradeInDevice[] = [
  {
    id: 'macbook-air-m2-8-256',
    name: 'MacBook Air 13" M2 8GB 256GB',
    brand: 'Apple',
    category: 'laptop',
    grades: {
      excellent: { musicmagpie: 520, backmarket: 580, cex_cash: 500, cex_voucher: 575, apple_trade: 480 },
      good:      { musicmagpie: 440, backmarket: 500, cex_cash: 420, cex_voucher: 490, apple_trade: 380 },
      fair:      { musicmagpie: 340, backmarket: 390, cex_cash: 320, cex_voucher: 375, apple_trade: 280 },
      poor:      { musicmagpie: 200, backmarket: null, cex_cash: 180, cex_voucher: 210, apple_trade: null },
    },
  },
  {
    id: 'macbook-air-m3-8-256',
    name: 'MacBook Air 13" M3 8GB 256GB',
    brand: 'Apple',
    category: 'laptop',
    grades: {
      excellent: { musicmagpie: 680, backmarket: 740, cex_cash: 650, cex_voucher: 750, apple_trade: 620 },
      good:      { musicmagpie: 590, backmarket: 650, cex_cash: 560, cex_voucher: 645, apple_trade: 510 },
      fair:      { musicmagpie: 460, backmarket: 510, cex_cash: 430, cex_voucher: 500, apple_trade: 380 },
      poor:      { musicmagpie: 280, backmarket: null, cex_cash: 250, cex_voucher: 290, apple_trade: null },
    },
  },
  {
    id: 'macbook-pro-m3-14',
    name: 'MacBook Pro 14" M3',
    brand: 'Apple',
    category: 'laptop',
    grades: {
      excellent: { musicmagpie: 980, backmarket: 1050, cex_cash: 940, cex_voucher: 1080, apple_trade: 900 },
      good:      { musicmagpie: 840, backmarket: 910, cex_cash: 800, cex_voucher: 920, apple_trade: 750 },
      fair:      { musicmagpie: 650, backmarket: 710, cex_cash: 620, cex_voucher: 715, apple_trade: 560 },
      poor:      { musicmagpie: 390, backmarket: null, cex_cash: 360, cex_voucher: 415, apple_trade: null },
    },
  },
  {
    id: 'dell-xps-13-9340',
    name: 'Dell XPS 13 9340',
    brand: 'Dell',
    category: 'laptop',
    grades: {
      excellent: { musicmagpie: 380, backmarket: 420, cex_cash: 360, cex_voucher: 415, apple_trade: null },
      good:      { musicmagpie: 300, backmarket: 340, cex_cash: 280, cex_voucher: 325, apple_trade: null },
      fair:      { musicmagpie: 200, backmarket: 230, cex_cash: 185, cex_voucher: 215, apple_trade: null },
      poor:      { musicmagpie: 100, backmarket: null, cex_cash: 90,  cex_voucher: 105, apple_trade: null },
    },
  },
  {
    id: 'lenovo-thinkpad-x1-gen12',
    name: 'Lenovo ThinkPad X1 Carbon Gen 12',
    brand: 'Lenovo',
    category: 'laptop',
    grades: {
      excellent: { musicmagpie: 420, backmarket: 460, cex_cash: 400, cex_voucher: 460, apple_trade: null },
      good:      { musicmagpie: 340, backmarket: 375, cex_cash: 320, cex_voucher: 370, apple_trade: null },
      fair:      { musicmagpie: 230, backmarket: 260, cex_cash: 215, cex_voucher: 250, apple_trade: null },
      poor:      { musicmagpie: 120, backmarket: null, cex_cash: 110, cex_voucher: 128, apple_trade: null },
    },
  },
  {
    id: 'iphone-15-pro-128',
    name: 'iPhone 15 Pro 128GB',
    brand: 'Apple',
    category: 'phone',
    grades: {
      excellent: { musicmagpie: 520, backmarket: 570, cex_cash: 495, cex_voucher: 570, apple_trade: 480 },
      good:      { musicmagpie: 440, backmarket: 490, cex_cash: 415, cex_voucher: 480, apple_trade: 390 },
      fair:      { musicmagpie: 330, backmarket: 370, cex_cash: 310, cex_voucher: 360, apple_trade: 270 },
      poor:      { musicmagpie: 190, backmarket: null, cex_cash: 175, cex_voucher: 202, apple_trade: null },
    },
  },
  {
    id: 'iphone-14-128',
    name: 'iPhone 14 128GB',
    brand: 'Apple',
    category: 'phone',
    grades: {
      excellent: { musicmagpie: 310, backmarket: 350, cex_cash: 295, cex_voucher: 340, apple_trade: 280 },
      good:      { musicmagpie: 260, backmarket: 295, cex_cash: 245, cex_voucher: 283, apple_trade: 220 },
      fair:      { musicmagpie: 185, backmarket: 215, cex_cash: 175, cex_voucher: 202, apple_trade: 150 },
      poor:      { musicmagpie: 100, backmarket: null, cex_cash: 92,  cex_voucher: 106, apple_trade: null },
    },
  },
  {
    id: 'samsung-s24-128',
    name: 'Samsung Galaxy S24 128GB',
    brand: 'Samsung',
    category: 'phone',
    grades: {
      excellent: { musicmagpie: 280, backmarket: 315, cex_cash: 265, cex_voucher: 305, apple_trade: null },
      good:      { musicmagpie: 225, backmarket: 255, cex_cash: 210, cex_voucher: 242, apple_trade: null },
      fair:      { musicmagpie: 155, backmarket: 180, cex_cash: 145, cex_voucher: 167, apple_trade: null },
      poor:      { musicmagpie: 80,  backmarket: null, cex_cash: 74,  cex_voucher: 85,  apple_trade: null },
    },
  },
  {
    id: 'ipad-air-m1',
    name: 'iPad Air M1 64GB WiFi',
    brand: 'Apple',
    category: 'tablet',
    grades: {
      excellent: { musicmagpie: 240, backmarket: 270, cex_cash: 228, cex_voucher: 263, apple_trade: 220 },
      good:      { musicmagpie: 190, backmarket: 218, cex_cash: 180, cex_voucher: 207, apple_trade: 170 },
      fair:      { musicmagpie: 130, backmarket: 152, cex_cash: 123, cex_voucher: 142, apple_trade: 110 },
      poor:      { musicmagpie: 70,  backmarket: null, cex_cash: 65,  cex_voucher: 75,  apple_trade: null },
    },
  },
]

export const PLATFORM_META = {
  musicmagpie: {
    name: 'MusicMagpie',
    type: 'cash' as const,
    note: 'Cash paid within 5 days. Free postage. Best for speed.',
    url: 'https://www.musicmagpie.co.uk/sell',
    awin: true,
  },
  backmarket: {
    name: 'Back Market',
    type: 'cash' as const,
    note: 'Cash. Competitive rates. Device must meet grade criteria.',
    url: 'https://www.backmarket.co.uk/en-gb/trade-in',
    awin: true,
  },
  cex_cash: {
    name: 'CEX (Cash)',
    type: 'cash' as const,
    note: 'Instant in-store cash payment. Rate subject to condition check.',
    url: 'https://uk.webuy.com',
    awin: false,
  },
  cex_voucher: {
    name: 'CEX (Voucher)',
    type: 'voucher' as const,
    note: 'In-store voucher. 10\u201320% more than cash. Use toward any CEX purchase.',
    url: 'https://uk.webuy.com',
    awin: false,
  },
  apple_trade: {
    name: 'Apple Trade In',
    type: 'credit' as const,
    note: 'Apple Store credit only. Best if buying new Apple hardware.',
    url: 'https://www.apple.com/uk/trade-in/',
    awin: false,
  },
}

export type GradeKey = 'excellent' | 'good' | 'fair' | 'poor'
export type PlatformKey = keyof TradeInPlatformValues
