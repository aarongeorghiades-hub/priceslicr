import Link from 'next/link'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { formatGBP } from '@/lib/utils'
import { getCheapestIphones } from '@/lib/guide'

const BASE = 'https://www.priceslicr.com'
const PATH = '/cheapest-used-refurbished-iphone-uk'
const PUBLISHED = '2026-06-24'

// Honest, human condition labels — never call a used price "refurbished".
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

export default async function CheapestIphoneArticle() {
  const d = await getCheapestIphones()
  const lastChecked = d.lastChecked
    ? new Date(d.lastChecked).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const overall = d.cheapestOverall
  const refurb = d.cheapestRefurb
  const overallStr = overall ? formatGBP(Math.round(overall.price)) : null
  const refurbStr = refurb ? formatGBP(Math.round(refurb.price)) : null
  const isRefurbCondition = (c: string) => c === 'refurbished' || c === 'certified_refurbished'
  // Both anchors are rows from the table (cheapestOverall = rows[0]; cheapestRefurb =
  // cheapest refurbished row). When the cheapest overall is itself refurbished, it IS
  // the cheapest refurbished too — so we don't cite a second (phantom) figure.
  const overallIsRefurb = overall ? isRefurbCondition(overall.condition) : false
  const refurbIsDistinct = !!(refurb && overall && refurb.slug !== overall.slug)

  const faqs: { q: string; a: string }[] = [
    {
      q: 'Is it safe to buy a used iPhone?',
      a: 'Yes, with care. A used iPhone from a graded seller like CEX is tested and comes with a warranty and returns. From a private eBay seller, check the exact condition, the seller feedback, that iCloud Activation Lock is off, and the battery health figure. Avoid anything titled “for parts”, “spares” or “iCloud locked” — those are not whole, usable phones.',
    },
    {
      q: 'How much do you save buying refurbished instead of new?',
      a: `Usually a meaningful chunk, and more on older models. A one-generation-old iPhone is the value sweet spot — most of the experience for noticeably less.${refurbStr ? ` Right now the cheapest refurbished iPhone we hold a live price on is the ${refurb!.name} from ${refurbStr}.` : ''} Used drops the price further still, trading the warranty for the saving.`,
    },
    {
      q: 'Do refurbished iPhones come with a warranty?',
      a: 'Usually, yes. Certified refurbished and graded-seller refurbished iPhones (including CEX) typically include a warranty, often 12–24 months. Private used listings on eBay generally do not — that warranty is the main thing the refurbished premium buys you.',
    },
    {
      q: 'Where is the cheapest place to buy a used iPhone in the UK?',
      a: `It depends on how much assurance you want. CEX is strong for graded, warrantied used and refurbished stock with easy returns; eBay often has the lowest outright price and the widest model choice, but assurance varies by seller. This page tracks the live cheapest verified price across both${overallStr ? ` — currently from ${overallStr}` : ''}, and we leave out listings that look too cheap to be real.`,
    },
  ]

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Cheapest Used or Refurbished iPhone UK: Live Prices (2026)',
    description: 'Live UK prices for used and refurbished iPhones, cheapest first, with the used-vs-refurbished difference explained honestly.',
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
      { '@type': 'ListItem', position: 3, name: 'Cheapest Used or Refurbished iPhone UK', item: `${BASE}${PATH}` },
    ],
  }

  return (
    <div className="dark-section min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Nav />

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Hero / intro — answers the query directly with live figures */}
        <div className="mb-12">
          <div className="eyebrow mb-4">UK iPHONE · LIVE USED &amp; REFURBISHED PRICES · 2026</div>
          <h1 className="heading-section text-[var(--ink)]">
            Cheapest used or refurbished iPhone<br />
            <span className="text-[var(--slice-text)]">in the UK, right now.</span>
          </h1>
          <p className="text-[var(--ink-dim)] text-lg mt-5 max-w-2xl leading-relaxed">
            {overall ? (
              <>
                {`The cheapest iPhone we hold a verified price on is the `}
                <Link href={`/phones/${overall.slug}`} className="text-[var(--slice-text)] hover:underline">{overall.name}</Link>
                {` from `}
                <span className="price-num text-[var(--ink)]">{overallStr}</span>
                {` (${(CONDITION_LABEL[overall.condition] ?? overall.condition).toLowerCase()}). `}
                {overallIsRefurb ? (
                  <>{`As that listing is `}<span className="text-[var(--ink)]">refurbished</span>{` — tested and usually warrantied — it is currently both the cheapest iPhone and the cheapest refurbished one we hold. We still keep used and refurbished clearly apart in the list below.`}</>
                ) : refurbIsDistinct ? (
                  <>
                    {`The cheapest `}<span className="text-[var(--ink)]">refurbished</span>{` iPhone — tested and usually warrantied — is the `}
                    <Link href={`/phones/${refurb!.slug}`} className="text-[var(--slice-text)] hover:underline">{refurb!.name}</Link>
                    {` from `}<span className="price-num text-[var(--ink)]">{refurbStr}</span>
                    {`. Both figures are rows in the list below; we keep used and refurbished clearly apart so you know exactly what you are buying.`}
                  </>
                ) : (
                  <>{`We don’t currently hold a verified refurbished iPhone price below it — every other figure in the list is a used listing.`}</>
                )}
              </>
            ) : (
              <>We don’t hold a verified iPhone price right now — check back shortly.</>
            )}
          </p>
          {lastChecked && (
            <p className="meta text-[var(--ink-faint)] mt-4">{`Last checked: ${lastChecked} · ${d.count} iPhone models with a live price, from CEX and eBay`}</p>
          )}
        </div>

        {/* Live price list — the core unique value (always-visible section, no reveal-gating) */}
        <section className="mist mist-wide mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-2">Live cheapest iPhone prices, cheapest first</h2>
          <p className="meta text-[var(--ink-dim)] mb-5">Each model’s cheapest verified price, with its real condition. Counterfeit-suspect and unverified listings are excluded.</p>
          <div className="space-y-2">
            {d.rows.map(r => (
              <Link
                key={r.slug}
                href={`/phones/${r.slug}`}
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

        {/* Used vs refurbished for iPhones */}
        <section className="mist mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-3">Used vs refurbished — what each saves on an iPhone</h2>
          <div className="space-y-3 text-[var(--ink-dim)] text-sm leading-relaxed max-w-3xl">
            <p><span className="text-[var(--ink)]">Used</span> is the cheapest route and sold as-is. The two things that matter most on a used iPhone are <span className="text-[var(--ink)]">battery health</span> (look for the percentage; under ~85% you may want a battery replacement soon) and that <span className="text-[var(--ink)]">Activation Lock is off</span>. A graded used unit from CEX still includes a warranty; a private used listing usually does not.</p>
            <p><span className="text-[var(--ink)]">Refurbished</span> (and certified refurbished) costs more because the phone has been tested and restored, normally with a fresh battery threshold and a 12–24 month warranty. You are paying for assurance. On a higher-value, current-generation iPhone where a failure is costly, that premium is often worth it; on an older model you will case anyway, used usually wins on pure price.</p>
          </div>
        </section>

        {/* eBay listings + counterfeit / for-parts traps */}
        <section className="mist mist-high mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-3">Reading an eBay iPhone listing safely</h2>
          <div className="space-y-3 text-[var(--ink-dim)] text-sm leading-relaxed max-w-3xl">
            <p>Read the title and condition together. A low price next to “for parts”, “spares or repair”, “cracked”, “iCloud locked” or “no Face ID” is honest about being a partial or locked unit — not a working phone. The dangerous listing is the one that looks whole and genuine but is priced like junk: a “brand new, sealed” current iPhone at a fraction of its normal price is a classic counterfeit or scam pattern.</p>
            <p>Our matcher takes <span className="text-[var(--ink)]">precision over recall</span>: where an iPhone price is unverifiable or counterfeit-suspect — no trusted anchor, a clone tell, a wrong-model code — we <span className="text-[var(--ink)]">suppress it rather than show it</span>. The prices above are the ones that survived that filter, so a “too cheap to be true” listing never becomes the headline here.</p>
          </div>
        </section>

        {/* Value sweet spot */}
        <section className="mist mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-3">Which iPhone is the value sweet spot?</h2>
          <p className="text-[var(--ink-dim)] text-sm leading-relaxed max-w-3xl">
            For most people it is the <span className="text-[var(--ink)]">one-generation-old</span> model bought used or refurbished: you skip the new-model premium but keep years of iOS updates ahead of you (recent iPhones get roughly five to six years of support from launch). The cheapest SE is the budget pick if you only need the essentials; a one-gen-old Pro is the value pick if you want the better cameras and screen. Compare every tracked model on the{' '}
            <Link href="/best-phones-uk" className="text-[var(--slice-text)] hover:underline">cheapest phones live-price guide</Link>.
          </p>
        </section>

        {/* FAQ */}
        <section className="mist mist-wide mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-5">Used &amp; refurbished iPhone FAQ</h2>
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
            <Link href="/best-phones-uk" className="meta text-[var(--slice-text)] hover:underline">Cheapest phones UK — live prices &rarr;</Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
