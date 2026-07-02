import Link from 'next/link'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { formatGBP } from '@/lib/utils'
import { getCheapestForCategory, getRetailerNames } from '@/lib/guide'

const BASE = 'https://www.priceslicr.com'
const PATH = '/cheapest-refurbished-headphones-uk'
const ROUTE = 'headphones'
const PUBLISHED = '2026-06-25'

const CONDITION_LABEL: Record<string, string> = {
  new: 'New',
  certified_refurbished: 'Certified refurbished',
  refurbished: 'Refurbished',
  used: 'Used',
}
const isRefurbCondition = (c: string) => c === 'refurbished' || c === 'certified_refurbished'

export default async function CheapestHeadphonesArticle() {
  // Headphones is the trust-gated category: the generalised resolver already routes
  // through trustedForHero, so counterfeit-suspect / no-anchor sets are suppressed
  // upstream. Anchors below are read FROM the rendered rows, so every prose figure is
  // a visible table row and can never drift from the table.
  const [d, retailerNames] = await Promise.all([getCheapestForCategory('headphones'), getRetailerNames()])
  const lastChecked = d.lastChecked
    ? new Date(d.lastChecked).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const cheapest = d.cheapestOverall
  const cheapestRefurb = d.cheapestRefurb
  const overallStr = cheapest ? formatGBP(Math.round(cheapest.price)) : null
  const refurbStr = cheapestRefurb ? formatGBP(Math.round(cheapestRefurb.price)) : null
  const overallIsRefurb = cheapest ? isRefurbCondition(cheapest.condition) : false
  const refurbIsDistinct = !!(cheapestRefurb && cheapest && cheapestRefurb.slug !== cheapest.slug)

  const faqs: { q: string; a: string }[] = [
    {
      q: 'Are cheap used AirPods or wireless earbuds on eBay fake?',
      a: 'A lot of the “brand new sealed” flagship earbuds sold far below retail are counterfeit — AirPods, Galaxy Buds and premium over-ears are among the most faked products online, and a good clone is hard to spot from photos. That is exactly why some popular models show no price on this page: where we cannot verify a listing against a trusted non-eBay seller, we suppress it rather than risk headlining a fake. Buy from a graded refurbisher or a seller with genuine serial/box detail, and treat a flagship at a fraction of its price as a warning, not a bargain.',
    },
    {
      q: 'Is it hygienic to buy used earbuds and headphones?',
      a: 'It is fine if you replace the parts that touch you. On in-ear buds, swap the silicone or foam ear tips for fresh ones — they are cheap and sold separately. On over-ear headphones the ear pads are usually replaceable too, and a wipe-down of the cups handles the rest. A graded refurbished set will normally have been cleaned and, where needed, re-tipped or re-padded as part of the process.',
    },
    {
      q: 'Do refurbished headphones come with a warranty?',
      a: `Usually, yes. Graded refurbished and certified refurbished sets are tested and typically carry a warranty, often 12 months, and crucially the battery will have been checked. A private used listing generally has no warranty — that testing and cover is what the refurbished premium buys you.${refurbStr ? ` Right now the cheapest refurbished pair we hold a verified price on is the ${cheapestRefurb!.name} from ${refurbStr}.` : ' At the moment we don’t hold a verified refurbished price on any set we track — every priced pair below is a used listing we could verify.'}`,
    },
    {
      q: 'How much do you save buying refurbished instead of new?',
      a: 'It varies by model, and the saving is biggest on last-generation flagships. On a £300+ pair of premium over-ears or top-tier earbuds, refurbished or graded-used can take a meaningful chunk off while keeping a tested battery and a warranty. On cheap earbuds the refurbished saving is often small — and with battery and hygiene risk on tiny in-ear cells, buying new can make more sense.',
    },
    {
      q: 'Where is the cheapest place to buy refurbished headphones in the UK?',
      a: `It depends how much assurance you want. CEX is strong for graded, warrantied used and refurbished stock with easy returns; eBay (including reseller and certified-refurbished outlets) often has the lowest outright price, but assurance varies by seller and counterfeits are common. This page tracks the live cheapest verified price${overallStr ? ` — currently from ${overallStr}` : ''}, and we leave out listings we can’t anchor to a trusted seller.`,
    },
  ]

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Cheapest Refurbished Headphones UK: Live Prices (2026)',
    description: 'Live UK prices for refurbished and used headphones and wireless earbuds, cheapest first, with the used-vs-refurbished difference and counterfeit risk explained honestly.',
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
      { '@type': 'ListItem', position: 3, name: 'Cheapest Refurbished Headphones UK', item: `${BASE}${PATH}` },
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
          <div className="eyebrow mb-4">UK HEADPHONES &amp; EARBUDS · LIVE REFURBISHED &amp; USED PRICES · 2026</div>
          <h1 className="heading-section text-[var(--ink)]">
            Cheapest refurbished headphones<br />
            <span className="text-[var(--slice-text)]">in the UK, right now.</span>
          </h1>
          <p className="text-[var(--ink-dim)] text-lg mt-5 max-w-2xl leading-relaxed">
            {cheapest ? (
              <>
                {`The cheapest headphones or earbuds we hold a verified price on are the `}
                <Link href={`/${ROUTE}/${cheapest.slug}`} className="text-[var(--slice-text)] hover:underline">{cheapest.name}</Link>
                {` from `}
                <span className="price-num text-[var(--ink)]">{overallStr}</span>
                {` (${(CONDITION_LABEL[cheapest.condition] ?? cheapest.condition).toLowerCase()}). `}
                {overallIsRefurb ? (
                  <>{`As that listing is `}<span className="text-[var(--ink)]">refurbished</span>{` — tested, with a checked battery and usually a warranty — it is currently both the cheapest pair and the cheapest refurbished one we hold. We keep used and refurbished clearly apart in the list below.`}</>
                ) : refurbIsDistinct ? (
                  <>
                    {`The cheapest `}<span className="text-[var(--ink)]">refurbished</span>{` pair — tested, with a checked battery and usually a warranty — is the `}
                    <Link href={`/${ROUTE}/${cheapestRefurb!.slug}`} className="text-[var(--slice-text)] hover:underline">{cheapestRefurb!.name}</Link>
                    {` from `}<span className="price-num text-[var(--ink)]">{refurbStr}</span>
                    {`. Both figures are rows in the list below; we keep used and refurbished clearly apart so you know exactly what you are buying.`}
                  </>
                ) : (
                  <>{`We don’t currently hold a verified `}<span className="text-[var(--ink)]">refurbished</span>{` headphones price — every pair in the list below is a used listing we could verify. That is honest, not a gap: for headphones we only headline a price we can anchor to a trusted seller, and right now no refurbished set clears that bar.`}</>
                )}
              </>
            ) : (
              <>We don’t hold a verified headphones price right now. For this category we suppress any listing we can’t anchor to a trusted, non-eBay seller — so when nothing clears that bar, we show nothing rather than risk headlining a counterfeit. Check back shortly.</>
            )}
          </p>
          {lastChecked && cheapest && (
            <p className="meta text-[var(--ink-faint)] mt-4">
              {`Last checked: ${lastChecked} · ${d.count} model${d.count !== 1 ? 's' : ''} with a verified live price, from CEX and eBay`}
            </p>
          )}
        </div>

        {/* Live price list — core unique value (always-visible, no reveal-gating) */}
        {cheapest && (
          <section className="mist mist-wide mb-12">
            <h2 className="heading-card text-[var(--ink)] mb-2">Live cheapest headphone &amp; earbud prices, cheapest first</h2>
            <p className="meta text-[var(--ink-dim)] mb-5">Every pair we can verify a live price on, each at its cheapest checked price and real condition. Counterfeit-suspect and unverifiable listings are excluded — which is why some popular models aren’t here.</p>
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
                      {r.retailerId && retailerNames[r.retailerId] ? ` · ${retailerNames[r.retailerId]}` : ''}
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
        )}

        {/* Used vs refurbished for headphones/earbuds */}
        <section className="mist mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-3">Used vs refurbished — what each means for headphones and earbuds</h2>
          <div className="space-y-3 text-[var(--ink-dim)] text-sm leading-relaxed max-w-3xl">
            <p><span className="text-[var(--ink)]">Used</span> is the cheapest route and sold as-is, and two things matter more here than on most tech. First, <span className="text-[var(--ink)]">hygiene and consumables</span>: ear tips and ear pads are the parts that touch you, they wear out, and they’re replaceable — plan to swap the tips on any used buds and budget for fresh pads on older over-ears. Second, <span className="text-[var(--ink)]">battery wear</span>, which bites hardest on true-wireless earbuds: the cells inside each bud are tiny, they degrade with every charge cycle, and they are <span className="text-[var(--ink)]">not user-replaceable</span> — so a cheap used pair can have badly reduced runtime that you can’t fix. Over-ear headphones have far larger batteries that age more gracefully. Whatever the form factor, check the kit is complete: both buds <span className="text-[var(--ink)]">and</span> the charging case for earbuds; the cable and case for over-ears.</p>
            <p><span className="text-[var(--ink)]">Refurbished</span> (and certified refurbished) costs more because the set has been tested and restored — typically cleaned and re-tipped or re-padded where needed, with a <span className="text-[var(--ink)]">confirmed working battery</span> and a warranty, often 12 months. On true-wireless earbuds in particular, that tested battery is the single biggest reason to pay the refurbished premium rather than gamble on a used pair.</p>
          </div>
        </section>

        {/* eBay listings + counterfeits */}
        <section className="mist mist-high mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-3">Reading an eBay headphones listing safely — counterfeits are the #1 risk</h2>
          <div className="space-y-3 text-[var(--ink-dim)] text-sm leading-relaxed max-w-3xl">
            <p>Headphones — and premium earbuds above all — are among the <span className="text-[var(--ink)]">most counterfeited products online</span>. AirPods, Galaxy Buds and flagship over-ears are faked convincingly enough that a “brand new sealed” unit at a fraction of the real price is a <span className="text-[var(--ink)]">classic fake</span>, not a find. Read the title and condition together and treat these as warnings: <span className="text-[var(--ink)]">“single earbud”</span> or <span className="text-[var(--ink)]">“case only”</span> (you’re buying half a product), <span className="text-[var(--ink)]">“for parts / spares or repair”</span>, stock photos rather than the actual item, and <span className="text-[var(--ink)]">clone model codes</span> or odd spellings on the box.</p>
            <p>Our approach is <span className="text-[var(--ink)]">precision over recall</span>: for headphones specifically, we will not headline a price we can’t verify. If a listing has no trusted, non-eBay anchor to price it against, we <span className="text-[var(--ink)]">suppress it rather than risk crowning a counterfeit</span> as the cheapest. That is exactly <span className="text-[var(--ink)]">why some models show no price here</span> — and it’s deliberate. The prices above are the ones that survived that filter.</p>
          </div>
        </section>

        {/* Value sweet spot */}
        <section className="mist mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-3">Where the value really is</h2>
          <div className="space-y-3 text-[var(--ink-dim)] text-sm leading-relaxed max-w-3xl">
            <p>The sweet spot is a <span className="text-[var(--ink)]">last-generation flagship</span> — premium over-ears or top-tier earbuds — bought <span className="text-[var(--ink)]">refurbished or graded-used</span>. You get most of the sound, noise cancelling and features of the current model for a lot less, and on a refurbished set a tested battery and warranty take the sting out of buying second-hand.</p>
            <p>There are times to just <span className="text-[var(--ink)]">buy new</span>: on cheap earbuds the refurbished saving is often too small to bother with, and on tiny true-wireless buds the battery and hygiene risk of a used pair can outweigh it. Weigh the saving against a degraded, non-replaceable battery before you commit. Compare every set we track — over-ear and in-ear — on the{' '}
            <Link href="/best-headphones-uk" className="text-[var(--slice-text)] hover:underline">cheapest headphones live-price guide</Link>.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mist mist-wide mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-5">Refurbished headphones FAQ</h2>
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
            <Link href="/best-headphones-uk" className="meta text-[var(--slice-text)] hover:underline">Cheapest headphones UK — live prices &rarr;</Link>
            <Link href="/cheapest-used-refurbished-iphone-uk" className="meta text-[var(--slice-text)] hover:underline">Cheapest used or refurbished iPhone UK &rarr;</Link>
            <Link href="/cheapest-refurbished-laptop-uk" className="meta text-[var(--slice-text)] hover:underline">Cheapest refurbished laptop UK &rarr;</Link>
            <Link href="/cheapest-refurbished-ipad-uk" className="meta text-[var(--slice-text)] hover:underline">Cheapest refurbished iPad UK &rarr;</Link>
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
