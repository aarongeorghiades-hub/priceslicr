import Link from 'next/link'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { formatGBP } from '@/lib/utils'
import { getCheapestForCategory } from '@/lib/guide'

const BASE = 'https://www.priceslicr.com'
const PATH = '/cheapest-refurbished-ipad-uk'
const ROUTE = 'tablets'
const PUBLISHED = '2026-06-25'

const CONDITION_LABEL: Record<string, string> = {
  new: 'New',
  certified_refurbished: 'Certified refurbished',
  refurbished: 'Refurbished',
  used: 'Used',
}
const RETAILER: Record<string, string> = {
  'c3ed9435-2a3e-40e1-a84a-b14830ece774': 'CEX',
  '88f4bd85-b743-4750-966f-4a937045fe5e': 'eBay',
}
const isRefurbCondition = (c: string) => c === 'refurbished' || c === 'certified_refurbished'
const isIpad = (name: string) => /ipad/i.test(name)

export default async function CheapestIpadArticle() {
  const d = await getCheapestForCategory('tablet')
  const lastChecked = d.lastChecked
    ? new Date(d.lastChecked).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  // Anchors are filtered FROM the rendered rows (cheapest-first already), so every prose
  // figure is a visible table row. iPad-led framing, but non-iPad tablets are never mislabelled.
  const ipadRows = d.rows.filter(r => isIpad(r.name))
  const otherTabletCount = d.rows.length - ipadRows.length
  const cheapestIpad = ipadRows[0] ?? null
  const cheapestRefurbIpad = ipadRows.find(r => isRefurbCondition(r.condition)) ?? null
  const ipadStr = cheapestIpad ? formatGBP(Math.round(cheapestIpad.price)) : null
  const refurbStr = cheapestRefurbIpad ? formatGBP(Math.round(cheapestRefurbIpad.price)) : null
  const ipadIsRefurb = cheapestIpad ? isRefurbCondition(cheapestIpad.condition) : false
  const refurbIsDistinct = !!(cheapestRefurbIpad && cheapestIpad && cheapestRefurbIpad.slug !== cheapestIpad.slug)

  const faqs: { q: string; a: string }[] = [
    {
      q: 'Is it safe to buy a used iPad?',
      a: 'Yes, with checks. A graded used iPad from CEX is tested and warrantied. From a private eBay seller, the single most important check is that Activation Lock (iCloud) is OFF — an iCloud-locked iPad is useless. Also confirm the battery still holds a charge, the glass and screen are sound (no cracks or dead pixels), and the storage and Wi-Fi/cellular spec match the title.',
    },
    {
      q: 'How much do you save buying refurbished instead of new?',
      a: `Often a meaningful amount, and more on older models — a one-generation-old base iPad or iPad Air is the value sweet spot.${refurbStr ? ` Right now the cheapest refurbished iPad we hold a live price on is the ${cheapestRefurbIpad!.name} from ${refurbStr}.` : ''} Used drops the price further, trading the warranty for the saving.`,
    },
    {
      q: 'Do refurbished iPads come with a warranty?',
      a: 'Usually, yes. Certified refurbished and graded-seller refurbished iPads (including CEX) typically include a warranty, often 12 months. Private used listings on eBay generally do not — that warranty, plus testing and a confirmed unlocked, working unit, is what the refurbished premium buys you.',
    },
    {
      q: 'How do I check Activation Lock is off before buying?',
      a: 'Ask the seller to confirm the iPad has been signed out of iCloud and Find My, and erased (Settings → General → Transfer or Reset). On collection, a genuinely reset iPad boots to the “Hello” setup screen and does not ask for a previous owner’s Apple ID. If it asks for an Apple ID password you don’t have, it is Activation Locked — walk away.',
    },
    {
      q: 'Where is the cheapest place to buy a refurbished iPad in the UK?',
      a: `It depends on how much assurance you want. CEX is strong for graded, warrantied refurbished and used stock with easy returns; eBay (including Apple’s certified refurbished and reseller outlets) often has the lowest outright price, but assurance varies by seller. This page tracks the live cheapest verified price${ipadStr ? ` — currently from ${ipadStr}` : ''}, and we leave out listings that look too cheap to be real.`,
    },
  ]

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Cheapest Refurbished iPad UK: Live Prices (2026)',
    description: 'Live UK prices for refurbished and used iPads, cheapest first, with the used-vs-refurbished difference explained honestly.',
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE}${PATH}` },
    datePublished: PUBLISHED,
    dateModified: d.lastChecked ? d.lastChecked.slice(0, 10) : PUBLISHED,
    author: { '@type': 'Organization', name: 'PriceSlicr' },
    publisher: { '@type': 'Organization', name: 'PriceSlicr', url: BASE },
  }
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Used & Refurbished Tech UK', item: `${BASE}/used-refurbished-tech-uk` },
      { '@type': 'ListItem', position: 3, name: 'Cheapest Refurbished iPad UK', item: `${BASE}${PATH}` },
    ],
  }

  return (
    <div className="dark-section min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Nav />

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Hero / intro */}
        <div className="mb-12">
          <div className="eyebrow mb-4">UK iPADS · LIVE REFURBISHED &amp; USED PRICES · 2026</div>
          <h1 className="heading-section text-[var(--ink)]">
            Cheapest refurbished iPad<br />
            <span className="text-[var(--slice-text)]">in the UK, right now.</span>
          </h1>
          <p className="text-[var(--ink-dim)] text-lg mt-5 max-w-2xl leading-relaxed">
            {cheapestIpad ? (
              <>
                {`The cheapest iPad we hold a verified price on is the `}
                <Link href={`/${ROUTE}/${cheapestIpad.slug}`} className="text-[var(--slice-text)] hover:underline">{cheapestIpad.name}</Link>
                {` from `}
                <span className="price-num text-[var(--ink)]">{ipadStr}</span>
                {` (${(CONDITION_LABEL[cheapestIpad.condition] ?? cheapestIpad.condition).toLowerCase()}). `}
                {ipadIsRefurb ? (
                  <>{`As that listing is `}<span className="text-[var(--ink)]">refurbished</span>{` — tested and usually warrantied — it is currently both the cheapest iPad and the cheapest refurbished one we hold. We still keep used and refurbished clearly apart in the list below.`}</>
                ) : refurbIsDistinct ? (
                  <>
                    {`The cheapest `}<span className="text-[var(--ink)]">refurbished</span>{` iPad — tested and usually warrantied — is the `}
                    <Link href={`/${ROUTE}/${cheapestRefurbIpad!.slug}`} className="text-[var(--slice-text)] hover:underline">{cheapestRefurbIpad!.name}</Link>
                    {` from `}<span className="price-num text-[var(--ink)]">{refurbStr}</span>
                    {`. Both figures are rows in the list below; we keep used and refurbished clearly apart so you know exactly what you are buying.`}
                  </>
                ) : (
                  <>{`We don’t currently hold a verified refurbished iPad price below it — every other iPad in the list is a used listing.`}</>
                )}
              </>
            ) : (
              <>We don’t hold a verified iPad price right now — check back shortly.</>
            )}
          </p>
          {lastChecked && (
            <p className="meta text-[var(--ink-faint)] mt-4">
              {`Last checked: ${lastChecked} · ${ipadRows.length} iPads with a live price${otherTabletCount > 0 ? `, plus ${otherTabletCount} other tablet${otherTabletCount !== 1 ? 's' : ''} we track` : ''}, from CEX and eBay`}
            </p>
          )}
        </div>

        {/* Live price list — core unique value (always-visible, no reveal-gating) */}
        <section className="mist mist-wide mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-2">Live cheapest tablet prices, cheapest first</h2>
          <p className="meta text-[var(--ink-dim)] mb-5">Every iPad we hold a live price on — plus the other UK tablets we track — each at its cheapest verified price and real condition. Counterfeit-suspect and unverified listings are excluded.</p>
          <div className="space-y-2">
            {d.rows.map(r => (
              <Link
                key={r.slug}
                href={`/${ROUTE}/${r.slug}`}
                className="group card card-interactive p-4 slice-bar flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="font-display font-semibold text-[var(--ink)] text-sm group-hover:text-[var(--slice-text)] transition-colors truncate">{r.name}</div>
                  <div className="meta text-[var(--ink-dim)] mt-1">
                    {CONDITION_LABEL[r.condition] ?? r.condition}
                    {r.retailerId && RETAILER[r.retailerId] ? ` · ${RETAILER[r.retailerId]}` : ''}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="meta">from </span>
                  <span className="price-num text-base text-[var(--ink)]">{formatGBP(Math.round(r.price))}</span>
                </div>
              </Link>
            ))}
          </div>
          {lastChecked && (
            <p className="meta text-[var(--ink-faint)] mt-4">{`Last checked: ${lastChecked}. Live prices change as stock moves.`}</p>
          )}
          <p className="label text-[13px] text-[var(--ink-faint)] mt-2">
            We may earn a commission when you buy through our links — it never affects the prices you see.
          </p>
        </section>

        {/* Used vs refurbished for iPads */}
        <section className="mist mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-3">Used vs refurbished — what each saves on an iPad</h2>
          <div className="space-y-3 text-[var(--ink-dim)] text-sm leading-relaxed max-w-3xl">
            <p><span className="text-[var(--ink)]">Used</span> is the cheapest route and sold as-is. On an iPad the things that matter are <span className="text-[var(--ink)]">battery health</span>, the <span className="text-[var(--ink)]">screen and glass</span> (cracks, dead pixels, cosmetic wear), and — crucially — that <span className="text-[var(--ink)]">Activation Lock / iCloud is off</span>, or the iPad is locked to someone else. Remember storage is <span className="text-[var(--ink)]">not upgradeable</span>, so buy enough up front, and decide between Wi-Fi and cellular before you shop. A graded used unit from CEX still carries a warranty; a private used listing usually does not.</p>
            <p><span className="text-[var(--ink)]">Refurbished</span> (and certified refurbished) costs more because the iPad has been tested and restored — typically wiped, unlocked, with a confirmed working battery and a 12-month warranty. You are paying for assurance and a known-clean unit. On a current-generation iPad or one you’ll keep for years that is often worth it; on an older model you’ll case anyway, a graded used unit usually wins on price.</p>
          </div>
        </section>

        {/* eBay listings + traps */}
        <section className="mist mist-high mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-3">Reading an eBay iPad listing safely</h2>
          <div className="space-y-3 text-[var(--ink-dim)] text-sm leading-relaxed max-w-3xl">
            <p>Read the title and condition together. A low price next to “for parts”, “spares or repair”, “cracked glass”, “iCloud locked” or “Activation Lock on” is honest about being a broken or locked unit — not a usable iPad. Watch too for <span className="text-[var(--ink)]">screen-only or replacement-part</span> listings (an iPad digitizer or LCD, not a whole device) and relisted/clone stock that reuses stock photos or pairs a current name with an older generation.</p>
            <p>Our matcher takes <span className="text-[var(--ink)]">precision over recall</span>: where an iPad price is unverifiable or counterfeit-suspect — no trusted retailer anchor, a wrong-generation model code, a part-only listing — we <span className="text-[var(--ink)]">suppress it rather than show it</span>. The prices above are the ones that survived that filter, so a “too cheap to be true” listing never becomes the headline here.</p>
          </div>
        </section>

        {/* Value sweet spot */}
        <section className="mist mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-3">Which iPad is the value sweet spot?</h2>
          <div className="space-y-3 text-[var(--ink-dim)] text-sm leading-relaxed max-w-3xl">
            <p>For most people it is a <span className="text-[var(--ink)]">one-generation-old base iPad or iPad Air</span> bought used or refurbished — plenty of performance for browsing, video, notes and light work, at a fraction of the latest Pro. iPads get many years of iPadOS updates from launch, so a slightly older model still has a long support runway ahead of it.</p>
            <p>Pay for <span className="text-[var(--ink)]">cellular</span> only if you genuinely need data away from Wi-Fi; otherwise Wi-Fi is cheaper and you can tether your phone. And because storage can’t be added later, size up rather than down. Compare every tracked model — iPads and other tablets — on the{' '}
            <Link href="/best-tablets-uk" className="text-[var(--slice-text)] hover:underline">cheapest tablets live-price guide</Link>.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mist mist-wide mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-5">Refurbished iPad FAQ</h2>
          <div className="space-y-3">
            {faqs.map(f => (
              <details key={f.q} className="card p-5">
                <summary className="font-display font-semibold text-[var(--ink)] text-sm cursor-pointer">{f.q}</summary>
                <p className="text-[var(--ink-dim)] text-sm leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Internal links */}
        <div className="mt-4 pt-8 border-t border-[var(--border)]">
          <div className="label text-[var(--ink-dim)] mb-3">Keep reading</div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/used-refurbished-tech-uk" className="meta text-[var(--slice-text)] hover:underline">Used &amp; refurbished tech — full UK guide &rarr;</Link>
            <Link href="/best-tablets-uk" className="meta text-[var(--slice-text)] hover:underline">Cheapest tablets UK — live prices &rarr;</Link>
            <Link href="/cheapest-used-refurbished-iphone-uk" className="meta text-[var(--slice-text)] hover:underline">Cheapest used or refurbished iPhone UK &rarr;</Link>
            <Link href="/cheapest-refurbished-laptop-uk" className="meta text-[var(--slice-text)] hover:underline">Cheapest refurbished laptop UK &rarr;</Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
