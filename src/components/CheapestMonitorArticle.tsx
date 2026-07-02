import Link from 'next/link'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { formatGBP } from '@/lib/utils'
import { getCheapestForCategory, getRetailerNames } from '@/lib/guide'

const BASE = 'https://www.priceslicr.com'
const PATH = '/cheapest-used-monitor-uk'
const ROUTE = 'monitors'
const PUBLISHED = '2026-06-25'

const CONDITION_LABEL: Record<string, string> = {
  new: 'New',
  certified_refurbished: 'Certified refurbished',
  refurbished: 'Refurbished',
  used: 'Used',
}
const isRefurbCondition = (c: string) => c === 'refurbished' || c === 'certified_refurbished'

export default async function CheapestMonitorArticle() {
  // Anchors are read FROM the rendered rows (cheapest-first already), so every prose
  // figure is a visible table row and can never drift from the table. Priced/trusted only;
  // unpriced models are omitted upstream, so the list never shows "From £0".
  const [d, retailerNames] = await Promise.all([getCheapestForCategory('monitor'), getRetailerNames()])
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
      q: 'Is it safe to buy a used monitor?',
      a: 'Yes, with the right checks — monitors last for years and take far less wear than phones or laptops, so used ones are often strong value. The single thing that decides a good buy is panel condition: ask the seller about dead or stuck pixels, backlight bleed and (on OLED) any image retention before you commit, and test it within your return window on arrival. Cosmetic scuffs on the bezel or stand matter far less. Confirm the correct stand and the power and video cables are included, as replacements cost real money.',
    },
    {
      q: 'How do I check for dead pixels and backlight bleed?',
      a: 'Set the monitor to full-screen solid colours — a pure black, then white, red, green and blue. Dead pixels show as permanent black dots and stuck pixels as dots stuck on one colour; on a full white or grey screen you can spot dirt and uniformity issues. Backlight bleed and IPS glow show up on a full black screen in a dark room as lighter patches, usually at the corners — a little is normal on IPS, large bright patches are not. On OLED, display a static high-contrast image briefly and check nothing faintly lingers when it changes (image retention).',
    },
    {
      q: 'Do refurbished monitors come with a warranty?',
      a: `Usually, yes. Graded refurbished and certified refurbished monitors are tested — including for dead pixels — and typically include a warranty, often 12 months. A private used listing is sold as-seen with no cover. That testing and warranty is what the refurbished premium buys you.${refurbStr ? ` Right now the cheapest refurbished monitor we hold a verified price on is the ${cheapestRefurb!.name} from ${refurbStr}.` : ' At the moment we don’t hold a verified refurbished price on any monitor we track — every priced screen below is a used listing we could verify.'}`,
    },
    {
      q: 'How much do you save buying used instead of new?',
      a: 'Often a lot — monitors hold up well, so used and ex-office units frequently undercut new by a wide margin, and last-generation gaming panels drop sharply once a new model lands. The saving is biggest on higher-end screens (4K, USB-C docking, OLED, high-refresh gaming). On cheap office monitors the used saving can be small enough that a new one with a full warranty makes more sense.',
    },
    {
      q: 'Where is the cheapest place to buy a used monitor in the UK?',
      a: `It depends how much assurance you want. CEX is strong for graded, warrantied used stock with easy returns; eBay often has the lowest outright price and plenty of ex-office and last-gen gaming panels, but assurance varies by seller and monitors are fragile to post — favour tested sellers or collection where you can. This page tracks the live cheapest verified price${overallStr ? ` — currently from ${overallStr}` : ''}, and we leave out listings we can’t verify.`,
    },
  ]

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Cheapest Used Monitor UK: Live Prices (2026)',
    description: 'Live UK prices for used and refurbished monitors, cheapest first, with the dead-pixel, backlight-bleed and panel checks that decide a good buy explained honestly.',
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
      { '@type': 'ListItem', position: 3, name: 'Cheapest Used Monitor UK', item: `${BASE}${PATH}` },
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
          <div className="eyebrow mb-4">UK MONITORS · LIVE USED &amp; REFURBISHED PRICES · 2026</div>
          <h1 className="heading-section text-[var(--ink)]">
            Cheapest used monitor<br />
            <span className="text-[var(--slice-text)]">in the UK, right now.</span>
          </h1>
          <p className="text-[var(--ink-dim)] text-lg mt-5 max-w-2xl leading-relaxed">
            {cheapest ? (
              <>
                {`The cheapest monitor we hold a verified price on is the `}
                <Link href={`/${ROUTE}/${cheapest.slug}`} className="text-[var(--slice-text)] hover:underline">{cheapest.name}</Link>
                {` from `}
                <span className="price-num text-[var(--ink)]">{overallStr}</span>
                {` (${(CONDITION_LABEL[cheapest.condition] ?? cheapest.condition).toLowerCase()}). `}
                {overallIsRefurb ? (
                  <>{`As that listing is `}<span className="text-[var(--ink)]">refurbished</span>{` — tested for dead pixels and usually warrantied — it is currently both the cheapest monitor and the cheapest refurbished one we hold. We keep used and refurbished clearly apart in the list below.`}</>
                ) : refurbIsDistinct ? (
                  <>
                    {`The cheapest `}<span className="text-[var(--ink)]">refurbished</span>{` monitor — tested for dead pixels and usually warrantied — is the `}
                    <Link href={`/${ROUTE}/${cheapestRefurb!.slug}`} className="text-[var(--slice-text)] hover:underline">{cheapestRefurb!.name}</Link>
                    {` from `}<span className="price-num text-[var(--ink)]">{refurbStr}</span>
                    {`. Both figures are rows in the list below; we keep used and refurbished clearly apart so you know exactly what you are buying.`}
                  </>
                ) : (
                  <>{`We don’t currently hold a verified `}<span className="text-[var(--ink)]">refurbished</span>{` monitor price — every screen in the list below is a used (or new) listing we could verify. On a monitor the panel is what matters, so a graded unit tested for dead pixels and backlight bleed is worth holding out for if you want the assurance.`}</>
                )}
              </>
            ) : (
              <>We don’t hold a verified monitor price right now — check back shortly.</>
            )}
          </p>
          {lastChecked && cheapest && (
            <p className="meta text-[var(--ink-faint)] mt-4">
              {`Last checked: ${lastChecked} · ${d.count} monitor${d.count !== 1 ? 's' : ''} with a verified live price, from CEX and eBay`}
            </p>
          )}
        </div>

        {/* Live price list — core unique value (always-visible, no reveal-gating) */}
        {cheapest && (
          <section className="mist mist-wide mb-12">
            <h2 className="heading-card text-[var(--ink)] mb-2">Live cheapest monitor prices, cheapest first</h2>
            <p className="meta text-[var(--ink-dim)] mb-5">Every monitor we hold a live price on, each at its cheapest verified price and real condition. We only list screens we can verify a price for — unverified and price-less listings are left out, so you never see a placeholder.</p>
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

        {/* Used vs refurbished for a monitor */}
        <section className="mist mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-3">Used vs refurbished — what each means for a monitor</h2>
          <div className="space-y-3 text-[var(--ink-dim)] text-sm leading-relaxed max-w-3xl">
            <p><span className="text-[var(--ink)]">Used</span> is the cheapest route and sold as-seen, and on a monitor it is the <span className="text-[var(--ink)]">panel</span> — not the cosmetics — that decides whether it’s a good buy. Ask about and then test for <span className="text-[var(--ink)]">dead or stuck pixels</span>, <span className="text-[var(--ink)]">backlight bleed and IPS glow</span> on dark scenes, and, on OLED panels, <span className="text-[var(--ink)]">image retention or burn-in</span>; if the listing shows <span className="text-[var(--ink)]">panel hours</span>, factor those in. Check the right <span className="text-[var(--ink)]">stand</span> and the <span className="text-[var(--ink)]">power and video cables</span> are included — replacements cost real money and the correct stand can be hard to source. A scuffed bezel matters far less than a clean panel.</p>
            <p><span className="text-[var(--ink)]">Refurbished</span> (and certified refurbished) costs more because the monitor has been tested — including for dead pixels — and restored, typically with the stand and cables and a warranty, often 12 months. A private used listing carries none of that. On a higher-end panel you’ll keep for years, that tested-panel assurance is often worth the premium; on a cheap office screen a graded-used unit usually wins on price.</p>
          </div>
        </section>

        {/* eBay listings + traps */}
        <section className="mist mist-high mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-3">Reading an eBay monitor listing safely</h2>
          <div className="space-y-3 text-[var(--ink-dim)] text-sm leading-relaxed max-w-3xl">
            <p>Read the title and condition together. A low price next to <span className="text-[var(--ink)]">“for parts”</span>, <span className="text-[var(--ink)]">“spares or repair”</span>, <span className="text-[var(--ink)]">“cracked screen”</span>, <span className="text-[var(--ink)]">“lines on display”</span> or <span className="text-[var(--ink)]">“no stand”</span> is honest about a broken or incomplete unit — not a working monitor. <span className="text-[var(--ink)]">“Collection only”</span> is common and often sensible: monitors are fragile and dear to post, and courier damage in transit is a frequent cause of dead-on-arrival screens. Be wary too of <span className="text-[var(--ink)]">stock-photo relists</span> that hide the actual panel’s condition.</p>
            <p>Our matcher takes <span className="text-[var(--ink)]">precision over recall</span>: where a monitor price is unverifiable or counterfeit-suspect — no trusted anchor, a part-only or wrong-model listing — we <span className="text-[var(--ink)]">suppress it rather than show it</span>. The prices above are the ones that survived that filter, so a “too cheap to be true” listing never becomes the headline here.</p>
          </div>
        </section>

        {/* Value sweet spot */}
        <section className="mist mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-3">Where the value really is</h2>
          <div className="space-y-3 text-[var(--ink-dim)] text-sm leading-relaxed max-w-3xl">
            <p>The strongest value is <span className="text-[var(--ink)]">ex-office and business monitors</span> and <span className="text-[var(--ink)]">last-generation gaming panels</span> bought used. Ex-corporate screens are plentiful, well looked after and heavily discounted; gaming panels drop sharply the moment a newer model lands, even though the older one is still excellent.</p>
            <p>Buy for how you’ll use it. For <span className="text-[var(--ink)]">work</span>, prioritise resolution and size — 27-inch 1440p is the comfortable default, 4K for fine detail and more desktop space, and USB-C if you want one cable to a laptop. For <span className="text-[var(--ink)]">gaming</span>, a high refresh rate and low response time matter more than raw resolution. For <span className="text-[var(--ink)]">creative</span> work, prioritise colour accuracy and panel quality (IPS or OLED). Compare every tracked screen on the{' '}
            <Link href="/best-monitors-uk" className="text-[var(--slice-text)] hover:underline">cheapest monitors live-price guide</Link>.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mist mist-wide mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-5">Used monitor FAQ</h2>
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
            <Link href="/best-monitors-uk" className="meta text-[var(--slice-text)] hover:underline">Cheapest monitors UK — live prices &rarr;</Link>
            <Link href="/cheapest-refurbished-laptop-uk" className="meta text-[var(--slice-text)] hover:underline">Cheapest refurbished laptop UK &rarr;</Link>
            <Link href="/cheapest-used-refurbished-iphone-uk" className="meta text-[var(--slice-text)] hover:underline">Cheapest used or refurbished iPhone UK &rarr;</Link>
            <Link href="/cheapest-refurbished-apple-watch-uk" className="meta text-[var(--slice-text)] hover:underline">Cheapest refurbished Apple Watch UK &rarr;</Link>
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
