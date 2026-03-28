export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <main className="min-h-screen bg-brand-light px-6 py-12">
      <h1 className="font-display text-4xl font-bold text-brand-dark mb-4">
        {slug}
      </h1>
      <p className="text-brand-muted">Product comparison page — building now.</p>
    </main>
  )
}
