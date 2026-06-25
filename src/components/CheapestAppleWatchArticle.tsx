import Link from 'next/link'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { formatGBP } from '@/lib/utils'
import { getCheapestForCategory } from '@/lib/guide'

const BASE = 'https://www.priceslicr.com'
const PATH = '/cheapest-refurbished-apple-watch-uk'
const ROUTE = 'smartwatches'
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
const isAppleWatch = (name: string) => /apple watch/i.test(name)

export default async function CheapestAppleWatchArticle() {
  const d = await getCheapestForCategory('smartwatch')
  const lastChecked = d.lastChecked
    ? new Date(d.lastChecked).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  // Anchors are filtered FROM the rendered rows (cheapest-first already), so every prose
  // figure is a visible table row. Apple-Watch-led framing, but non-Apple watches are never
  // mislabelled — they show under their real names as comparison rows.
  const watchRows = d.rows.filter(r => isAppleWatch(r.name))
  const otherCount = d.rows.length - watchRows.length
  const cheapestWatch = watchRows[0] ?? null
  const cheapestRefurbWatch = watchRows.find(r => isRefurbCondition(r.condition)) ?? null
  const watchStr = cheapestWatch ? formatGBP(Math.round(cheapestWatch.price)) : null
  const refurbStr = cheapestRefurbWatch ? formatGBP(Math.round(cheapestRefurbWatch.price)) : null
  const watchIsRefurb = cheapestWatch ? isRefurbCondition(cheapestWatch.condition) : false
  const refurbIsDistinct = !!(cheapestRefurbWatch && cheapestWatch && cheapestRefurbWatch.slug !== cheapestWatch.slug)

  const faqs: { q: string; a: string }[] = [
    {
      q: 'Is it safe to buy a used Apple Watch?',
      a: 'Yes, with checks. A graded used Apple Watch from a tested seller is the safer route. From a private eBay seller, the single most important check is that Activation Lock (iCloud) is OFF — an Activation-Locked watch is a paperweight. After that, the things that matter most are battery health (watch batteries are tiny and degrade fastest of any Apple device), the screen and case (cracks, deep scratches), that the correct band size is included, and — on cellular models — whether the watch is tied to a network.',
    },
    {
      q: 'How do I check Activation Lock is off before buying?',
      a: 'Ask the seller to confirm the watch has been unpaired from its previous iPhone and erased, which removes Activation Lock. A genuinely reset Apple Watch boots to the language/pairing setup screen and does not ask for a previous owner’s Apple ID. If, when you pair it, it demands an Apple ID and password you don’t have, it is Activation Locked — walk away. Never buy one described as “iCloud locked” or “Activation Lock on”.',
    },
    {
      q: 'Do refurbished Apple Watches come with a warranty?',
      a: `Usually, yes. Graded refurbished and certified refurbished Apple Watches are tested and typically include a warranty, often 12 months, and crucially the battery will have been checked. A private used listing generally has no warranty — that testing, a confirmed unlocked unit and a known-good battery are what the refurbished premium buys you.${refurbStr ? ` Right now the cheapest refurbished Apple Watch we hold a verified price on is the ${cheapestRefurbWatch!.name} from ${refurbStr}.` : ' At the moment we don’t hold a verified refurbished price on any Apple Watch we track — every priced watch below is a used listing we could verify.'}`,
    },
    {
      q: 'How much do you save buying refurbished instead of new?',
      a: 'It varies by model, and the saving is biggest on last-generation watches. A one- or two-generation-old Apple Watch SE or Series bought used or refurbished can cost a fraction of the latest model while still getting watchOS updates for years. Refurbished keeps a tested battery and a warranty; used drops the price further, trading that cover for the saving — worth weighing carefully on a watch, where a worn battery is the most likely fault.',
    },
    {
      q: 'Where is the cheapest place to buy a refurbished Apple Watch in the UK?',
      a: `It depends how much assurance you want. CEX is strong for graded, warrantied used and refurbished stock with easy returns; eBay (including reseller and certified-refurbished outlets) often has the lowest outright price, but assurance varies by seller. This page tracks the live cheapest verified price${watchStr ? ` — the cheapest Apple Watch right now is from ${watchStr}` : ''}, and we leave out listings that look too cheap to be real.`,
    },
  ]

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Cheapest Refurbished Apple Watch UK: Live Prices (2026)',
    description: 'Live UK prices for refurbished and used Apple Watches, cheapest first, with the used-vs-refurbished difference, Activation Lock and battery-health checks explained honestly.',
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
      { '@type': 'ListItem', position: 3, name: 'Cheapest Refurbished Apple Watch UK', item: `${BASE}${PATH}` },
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
          <div className="eyebrow mb-4">UK APPLE WATCH · LIVE REFURBISHED &amp; USED PRICES · 2026</div>
          <h1 className="heading-section text-[var(--ink)]">
            Cheapest refurbished Apple Watch<br />
            <span className="text-[var(--slice-text)]">in the UK, right now.</span>
          </h1>
          <p className="text-[var(--ink-dim)] text-lg mt-5 max-w-2xl leading-relaxed">
            {cheapestWatch ? (
              <>
                {`The cheapest Apple Watch we hold a verified price on is the `}
                <Link href={`/${ROUTE}/${cheapestWatch.slug}`} className="text-[var(--slice-text)] hover:underline">{cheapestWatch.name}</Link>
                {` from `}
                <span className="price-num text-[var(--ink)]">{watchStr}</span>
                {` (${(CONDITION_LABEL[cheapestWatch.condition] ?? cheapestWatch.condition).toLowerCase()}). `}
                {watchIsRefurb ? (
                  <>{`As that listing is `}<span className="text-[var(--ink)]">refurbished</span>{` — tested, with a checked battery and usually a warranty — it is currently both the cheapest Apple Watch and the cheapest refurbished one we hold. We keep used and refurbished clearly apart in the list below.`}</>
                ) : refurbIsDistinct ? (
                  <>
                    {`The cheapest `}<span className="text-[var(--ink)]">refurbished</span>{` Apple Watch — tested, with a checked battery and usually a warranty — is the `}
                    <Link href={`/${ROUTE}/${cheapestRefurbWatch!.slug}`} className="text-[var(--slice-text)] hover:underline">{cheapestRefurbWatch!.name}</Link>
                    {` from `}<span className="price-num text-[var(--ink)]">{refurbStr}</span>
                    {`. Both figures are rows in the list below; we keep used and refurbished clearly apart so you know exactly what you are buying.`}
                  </>
                ) : (
                  <>{`We don’t currently hold a verified `}<span className="text-[var(--ink)]">refurbished</span>{` Apple Watch price — every watch in the list below is a used listing we could verify. On a watch, where a tired battery is the most likely fault, a graded refurbished unit with a tested battery and warranty is worth holding out for if you can.`}</>
                )}
              </>
            ) : (
              <>We don’t hold a verified Apple Watch price right now — check back shortly. The live list below shows every smartwatch we currently hold a price on.</>
            )}
          </p>
          {lastChecked && (
            <p className="meta text-[var(--ink-faint)] mt-4">
              {`Last checked: ${lastChecked} · ${watchRows.length} Apple Watch${watchRows.length !== 1 ? 'es' : ''} with a live price${otherCount > 0 ? `, plus ${otherCount} other smartwatch${otherCount !== 1 ? 'es' : ''} we track` : ''}, from CEX and eBay`}
            </p>
          )}
        </div>

        {/* Live price list — core unique value (always-visible, no reveal-gating) */}
        <section className="mist mist-wide mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-2">Live cheapest smartwatch prices, cheapest first</h2>
          <p className="meta text-[var(--ink-dim)] mb-5">Every Apple Watch we hold a live price on — plus the other UK smartwatches we track — each at its cheapest verified price and real condition. Counterfeit-suspect and unverified listings are excluded.</p>
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

        {/* Used vs refurbished for an Apple Watch */}
        <section className="mist mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-3">Used vs refurbished — what each means for an Apple Watch</h2>
          <div className="space-y-3 text-[var(--ink-dim)] text-sm leading-relaxed max-w-3xl">
            <p><span className="text-[var(--ink)]">Used</span> is the cheapest route and sold as-is, and four things matter more on a watch than on most tech. First, <span className="text-[var(--ink)]">battery health</span>: Apple Watch batteries are tiny and degrade fastest of any Apple device, a worn one needs a paid battery service, and there is no easy at-home swap — so a cheap used watch can mean a watch that barely lasts a day. Second, <span className="text-[var(--ink)]">Activation Lock must be off</span>, or the watch is locked to someone else’s Apple ID and useless to you. Third, the <span className="text-[var(--ink)]">case and screen</span> (cracks, deep scratches) and that the <span className="text-[var(--ink)]">right band size and fit</span> is included — bands are sized, and the wrong one means buying another. Fourth, <span className="text-[var(--ink)]">cellular vs GPS</span>: a cellular (LTE) model needs carrier support to use its data features and may be tied to a network, while a GPS model leans on your iPhone. A graded used watch from a tested seller still carries a warranty; a private used listing usually does not.</p>
            <p><span className="text-[var(--ink)]">Refurbished</span> (and certified refurbished) costs more because the watch has been tested and restored — typically wiped and unlocked, with a <span className="text-[var(--ink)]">confirmed working battery</span> and a warranty, often 12 months. On a watch, where the battery is the part most likely to be worn, that tested battery is the single biggest reason to pay the refurbished premium rather than gamble on a used unit.</p>
          </div>
        </section>

        {/* eBay listings + traps */}
        <section className="mist mist-high mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-3">Reading an eBay Apple Watch listing safely</h2>
          <div className="space-y-3 text-[var(--ink-dim)] text-sm leading-relaxed max-w-3xl">
            <p>Read the title and condition together. A low price next to <span className="text-[var(--ink)]">“Activation Lock on”</span>, <span className="text-[var(--ink)]">“iCloud locked”</span>, <span className="text-[var(--ink)]">“for parts”</span>, <span className="text-[var(--ink)]">“spares or repair”</span>, <span className="text-[var(--ink)]">“no charger”</span> or <span className="text-[var(--ink)]">“cracked screen”</span> is honest about being a locked or broken unit — not a usable watch. Watch too for <span className="text-[var(--ink)]">aftermarket or clone bands</span> dressed up as genuine, and outright <span className="text-[var(--ink)]">fake units</span> at a fraction of the real price.</p>
            <p>Our matcher takes <span className="text-[var(--ink)]">precision over recall</span>: where an Apple Watch price is unverifiable or counterfeit-suspect — no trusted retailer anchor, a part-only or locked listing — we <span className="text-[var(--ink)]">suppress it rather than show it</span>. The prices above are the ones that survived that filter, so a “too cheap to be true” listing never becomes the headline here.</p>
          </div>
        </section>

        {/* Value sweet spot */}
        <section className="mist mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-3">Which Apple Watch is the value sweet spot?</h2>
          <div className="space-y-3 text-[var(--ink-dim)] text-sm leading-relaxed max-w-3xl">
            <p>For most people it is a <span className="text-[var(--ink)]">one- or two-generation-old Apple Watch SE or a prior Series</span> bought used or refurbished — the big everyday features (notifications, workouts, heart-rate, contactless) are all there for a fraction of the latest model, and Apple Watches keep getting watchOS updates for years from launch, so a slightly older one still has a long support runway ahead of it.</p>
            <p>Step up to a <span className="text-[var(--ink)]">newer model</span> only if you specifically want its additions — the latest health sensors, a brighter always-on display, or the rugged Ultra’s battery life and size. Decide which features you’ll actually use, then buy the oldest model that has them. Compare every tracked watch — Apple and otherwise — on the{' '}
            <Link href="/best-smartwatches-uk" className="text-[var(--slice-text)] hover:underline">cheapest smartwatches live-price guide</Link>.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mist mist-wide mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-5">Refurbished Apple Watch FAQ</h2>
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
            <Link href="/best-smartwatches-uk" className="meta text-[var(--slice-text)] hover:underline">Cheapest smartwatches UK — live prices &rarr;</Link>
            <Link href="/cheapest-used-refurbished-iphone-uk" className="meta text-[var(--slice-text)] hover:underline">Cheapest used or refurbished iPhone UK &rarr;</Link>
            <Link href="/cheapest-refurbished-ipad-uk" className="meta text-[var(--slice-text)] hover:underline">Cheapest refurbished iPad UK &rarr;</Link>
            <Link href="/cheapest-refurbished-headphones-uk" className="meta text-[var(--slice-text)] hover:underline">Cheapest refurbished headphones UK &rarr;</Link>
          </div>
        </div>

        {/* Affiliate disclosure — footer-level (also under the price section above) */}
        <p className="label text-[13px] text-[var(--ink-faint)] mt-8">
          PriceSlicr is a price tracker, not a shop or a review site. We don’t test or rate products, and we never invent reviews or ratings. Some links are affiliate links and we may earn a commission when you buy through them — it never affects the price you pay or which listings we show.
        </p>
      </div>

      <Footer />
    </div>
  )
}
