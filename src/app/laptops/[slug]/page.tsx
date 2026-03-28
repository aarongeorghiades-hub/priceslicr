export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <main className="min-h-screen px-12 py-16">
      <h1 className="font-display text-4xl font-bold mb-4">{slug}</h1>
      <p className="text-[var(--muted)]">Product comparison page — coming soon.</p>
    </main>
  )
}
