import CategoryIndex from '@/components/CategoryIndex'

export const metadata = {
  title: 'Laptop Price Comparison UK',
  description: 'Compare laptop prices across every UK retailer — new, refurbished, and used. Find every saving layer automatically.',
}

export default function LaptopsPage() {
  return <CategoryIndex category="laptop" title="Laptops" description="20 hero products. 11 retailers. Every saving layer — cashback, trade-in, price matching, student rates — surfaced automatically." />
}
