export type Condition = 'new' | 'certified_refurbished' | 'refurbished' | 'used'
export type ConditionGrade = 'excellent' | 'very_good' | 'good' | 'fair' | null
export type AffiliateNetwork = 'awin' | 'amazon_pa' | 'ebay_pn' | 'none'
export type DiscountType =
  | 'cashback'
  | 'bnpl'
  | 'signup'
  | 'student'
  | 'nhs'
  | 'armed_forces'
  | 'email'
  | 'credit_card'
export type ValueType = 'percentage' | 'fixed_amount' | 'service'
export type SaleConfidence = 'confirmed' | 'expected' | 'historical_pattern'

export interface Product {
  id: string
  name: string
  brand: string
  model_identifier: string
  specs: Record<string, string | number>
  category: string
  image_url: string | null
  slug: string
  created_at: string
  updated_at: string
}

export interface Retailer {
  id: string
  name: string
  slug: string
  logo_url: string | null
  affiliate_network: AffiliateNetwork
  affiliate_id: string | null
  conditions_available: Condition[]
  price_match_policy: Record<string, unknown>
  bnpl_options: Record<string, unknown>
  cashback_rates: Record<string, unknown>
  signup_discount: Record<string, unknown> | null
  warranty_years: number
  section75_eligible: boolean
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  product_id: string
  retailer_id: string
  condition: Condition
  condition_grade: ConditionGrade
  price_gbp: number
  url: string
  in_stock: boolean
  scraped_at: string
  affiliate_link: string | null
  created_at: string
  updated_at: string
  retailer?: Retailer
}

export interface DiscountLayer {
  id: string
  retailer_id: string
  discount_type: DiscountType
  description: string
  value_type: ValueType
  value: number
  min_spend: number | null
  conditions: string
  is_stackable: boolean
  verification_required: boolean
  verification_platform: string | null
  cashback_portal_url: string | null
  valid_from: string | null
  valid_until: string | null
  retailer?: Retailer
}

export interface SaleEvent {
  id: string
  retailer_id: string | null
  event_name: string
  expected_start_date: string
  expected_end_date: string
  historical_discount_min: number
  historical_discount_max: number
  category_notes: string
  confidence: SaleConfidence
  source_url: string | null
}

export interface TradeInValue {
  id: string
  device_name: string
  device_brand: string
  device_model: string
  condition: Condition
  platform: string
  value_gbp: number
  value_type: 'cash' | 'voucher' | 'store_credit'
  scraped_at: string
}

export type ViewMode = 'standard' | 'smart' | 'eligibility' | 'netcost'
export type EligibilityType = 'none' | 'student' | 'nhs' | 'armed_forces'
