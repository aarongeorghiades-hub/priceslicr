export type SliceStep = {
  type: string
  order: number
  label: string
  whyNow: string
  prerequisites: string
  actionVerb: string
}

export const SLICE_ORDER: SliceStep[] = [
  {
    type: 'cashback',
    order: 1,
    label: 'Cashback Portal',
    whyNow: 'This must be first. The cashback portal drops a tracking cookie when you click through. If you open the retailer any other way first, the cookie is lost and you get nothing.',
    prerequisites: 'A free account with TopCashback or Quidco (takes 2 minutes to create).',
    actionVerb: 'Activate',
  },
  {
    type: 'gift_card',
    order: 2,
    label: 'Gift Card Cashback',
    whyNow: 'Buy the gift card before you reach checkout. The cashback loads instantly into your HyperJar wallet and the card is ready to use immediately.',
    prerequisites: 'The HyperJar app installed on your phone (free). You\'ll need to load funds equal to your purchase amount.',
    actionVerb: 'Buy',
  },
  {
    type: 'card_cashback',
    order: 3,
    label: 'Card Cashback',
    whyNow: 'Decide now which card you\'ll pay with \u2014 you\'ll need it at checkout. Amex intro cashback applies automatically to your statement after purchase.',
    prerequisites: 'An Amex Cashback or Amex Platinum Cashback card. New cardmembers only \u2014 if you\'ve held an Amex in the past 24 months, skip this slice.',
    actionVerb: 'Confirm card',
  },
  {
    type: 'price_match',
    order: 4,
    label: 'Price Match',
    whyNow: 'Check the competitor price before adding to basket. John Lewis will price match at point of purchase \u2014 much easier than claiming after.',
    prerequisites: 'The competitor URL showing the lower price open in another tab, ready to show the retailer.',
    actionVerb: 'Check',
  },
  {
    type: 'signup',
    order: 5,
    label: 'New Customer Offer',
    whyNow: 'Apply the code at checkout. Only one discount code per order \u2014 if you have a student or key worker code, use that instead (they\'re typically higher value).',
    prerequisites: 'The discount code from your welcome email, or access to the retailer\'s new customer offer page.',
    actionVerb: 'Apply',
  },
  {
    type: 'student',
    order: 5,
    label: 'Student Discount',
    whyNow: 'Apply at checkout via Student Beans or UNiDAYS. Only one code per order \u2014 this replaces any new customer offer.',
    prerequisites: 'A verified Student Beans or UNiDAYS account linked to your university email.',
    actionVerb: 'Apply',
  },
  {
    type: 'key_worker',
    order: 5,
    label: 'Key Worker Discount',
    whyNow: 'Apply at checkout via Blue Light Card or Health Service Discounts. Only one code per order.',
    prerequisites: 'An active Blue Light Card membership or Health Service Discounts account.',
    actionVerb: 'Apply',
  },
  {
    type: 'trade_in',
    order: 6,
    label: 'Trade-In',
    whyNow: 'Arrange this separately \u2014 your trade-in value is independent of how you pay. It stacks with everything above.',
    prerequisites: 'Your old device, in the condition you\'ll quote. Get a live quote from MusicMagpie, Currys or Back Market before committing.',
    actionVerb: 'Arrange',
  },
]

// Returns steps sorted by slice order, filtering to only types present in the data
export function orderLayersForSliceGuide(layerTypes: string[]): SliceStep[] {
  const uniqueTypes = [...new Set(layerTypes)]
  return SLICE_ORDER
    .filter(step => uniqueTypes.includes(step.type))
    .sort((a, b) => a.order - b.order)
}
