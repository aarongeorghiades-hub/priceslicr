import Link from 'next/link'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { formatGBP } from '@/lib/utils'
import { getCheapestForCategory } from '@/lib/guide'

const BASE = 'https://www.priceslicr.com'
const PATH = '/cheapest-refurbished-laptop-uk'
const ROUTE = 'laptops'
const PUBLISHED = '2026-06-24'

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

export default async function CheapestLaptopArticle() {
  const d = await getCheapestForCategory('laptop')
  const lastChecked = d.lastChecked
    ? new Date(d.lastChecked).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const overall = d.cheapestOverall
  const refurb = d.cheapestRefurb
  const overallStr = overall ? formatGBP(Math.round(overall.price)) : null
  const refurbStr = refurb ? formatGBP(Math.round(refurb.price)) : null
  const overallIsRefurb = overall ? isRefurbCondition(overall.condition) : false
  const refurbIsDistinct = !!(refurb && overall && refurb.slug !== overall.slug)

  const faqs: { q: string; a: string }[] = [
    {
      q: 'Is it safe to buy a used laptop?',
      a: 'Yes, with checks. A graded used laptop from CEX is tested and warrantied. From a private eBay seller, confirm the exact CPU/RAM/SSD match the title, that the charger is included, the battery still holds a charge (ask for the cycle count or battery-health reading), and that the hinge, screen and keyboard are sound. Steer clear of “spares or repair”, “no OS/SSD” or “sold as seen” unless you intend to fix it.',
    },
    {
      q: 'How much do you save buying refurbished instead of new?',
      a: `Often a large amount on business models, which depreciate fast. A one-generation-old machine — or an ex-corporate ThinkPad, Latitude or EliteBook refurbished to grade — is usually the value sweet spot.${refurbStr ? ` Right now the cheapest refurbished laptop we hold a live price on is the ${refurb!.name} from ${refurbStr}.` : ''} Used drops the price further, trading the warranty for the saving.`,
    },
    {
      q: 'Do refurbished laptops come with a warranty?',
      a: 'Usually, yes. Certified refurbished and graded-seller refurbished laptops (including CEX) typically include a warranty, often 12 months. Private used listings on eBay generally do not — that warranty, plus testing and a confirmed working battery, is what the refurbished premium buys you.',
    },
    {
      q: 'What should I check on a used laptop?',
      a: 'Battery first: cycle count and health — a high cycle count means a replacement may be due, which adds cost. Then the hinge (no wobble or cracking), the screen (dead pixels, backlight bleed), the keyboard and trackpad, the ports, and that the original charger is included. Confirm the CPU generation, RAM and SSD size match the listing rather than an older spec.',
    },
    {
      q: 'Where is the cheapest place to buy a refurbished laptop in the UK?',
      a: `It depends on how much assurance you want. CEX is strong for graded, warrantied refurbished and used stock with easy returns; eBay (including manufacturer and reseller outlets) often has the lowest outright price and the widest choice, but assurance varies by seller. This page tracks the live cheapest verified price across both${overallStr ? ` — currently from ${overallStr}` : ''}, and we leave out listings that look too cheap to be real.`,
    },
  ]

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Cheapest Refurbished Laptop UK: Live Prices (2026)',
    description: 'Live UK prices for refurbished and used laptops, cheapest first, with the used-vs-refurbished difference explained honestly.',
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
      { '@type': 'ListItem', position: 3, name: 'Cheapest Refurbished Laptop UK', item: `${BASE}${PATH}` },
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
          <div className="eyebrow mb-4">UK LAPTOPS · LIVE REFURBISHED &amp; USED PRICES · 2026</div>
          <h1 className="heading-section text-[var(--ink)]">
            Cheapest refurbished laptop<br />
            <span className="text-[var(--slice-text)]">in the UK, right now.</span>
          </h1>
          <p className="text-[var(--ink-dim)] text-lg mt-5 max-w-2xl leading-relaxed">
            {overall ? (
              <>
                {`The cheapest laptop we hold a verified price on is the `}
                <Link href={`/${ROUTE}/${overall.slug}`} className="text-[var(--slice-text)] hover:underline">{overall.name}</Link>
                {` from `}
                <span className="price-num text-[var(--ink)]">{overallStr}</span>
                {` (${(CONDITION_LABEL[overall.condition] ?? overall.condition).toLowerCase()}). `}
                {overallIsRefurb ? (
                  <>{`As that listing is `}<span className="text-[var(--ink)]">refurbished</span>{` — tested and usually warrantied — it is currently both the cheapest laptop and the cheapest refurbished one we hold. We still keep used and refurbished clearly apart in the list below.`}</>
                ) : refurbIsDistinct ? (
                  <>
                    {`The cheapest `}<span className="text-[var(--ink)]">refurbished</span>{` laptop — tested and usually warrantied — is the `}
                    <Link href={`/${ROUTE}/${refurb!.slug}`} className="text-[var(--slice-text)] hover:underline">{refurb!.name}</Link>
                    {` from `}<span className="price-num text-[var(--ink)]">{refurbStr}</span>
                    {`. Both figures are rows in the list below; we keep used and refurbished clearly apart so you know exactly what you are buying.`}
                  </>
                ) : (
                  <>{`We don’t currently hold a verified refurbished laptop price below it — every other figure in the list is a used listing.`}</>
                )}
              </>
            ) : (
              <>We don’t hold a verified laptop price right now — check back shortly.</>
            )}
          </p>
          {lastChecked && (
            <p className="meta text-[var(--ink-faint)] mt-4">{`Last checked: ${lastChecked} · ${d.count} laptop models with a live price, from CEX and eBay`}</p>
          )}
        </div>

        {/* Live price list — core unique value (always-visible, no reveal-gating) */}
        <section className="mist mist-wide mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-2">Live cheapest laptop prices, cheapest first</h2>
          <p className="meta text-[var(--ink-dim)] mb-5">Each model’s cheapest verified price, with its real condition. Counterfeit-suspect and unverified listings are excluded.</p>
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

        {/* Used vs refurbished for laptops */}
        <section className="mist mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-3">Used vs refurbished — what each saves on a laptop</h2>
          <div className="space-y-3 text-[var(--ink-dim)] text-sm leading-relaxed max-w-3xl">
            <p><span className="text-[var(--ink)]">Used</span> is the cheapest route and sold as-is. On a laptop the things that decide whether a cheap unit is a bargain or a headache are the <span className="text-[var(--ink)]">battery cycle count</span> (the laptop equivalent of phone battery health — a worn battery is a real replacement cost), the <span className="text-[var(--ink)]">hinge, screen and keyboard</span> for wear, and whether the <span className="text-[var(--ink)]">original charger</span> is included (third-party chargers vary). A graded used unit from CEX still carries a warranty; a private used listing usually does not.</p>
            <p><span className="text-[var(--ink)]">Refurbished</span> (and certified refurbished) costs more because the machine has been tested and restored — typically with a confirmed working battery, a clean OS install and a 12-month warranty. You are paying for assurance and a known-good battery. On a higher-value or work laptop that is often worth it; on an older machine you will replace in a couple of years, a graded used unit usually wins on price.</p>
          </div>
        </section>

        {/* eBay listings + traps */}
        <section className="mist mist-high mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-3">Reading an eBay laptop listing safely</h2>
          <div className="space-y-3 text-[var(--ink-dim)] text-sm leading-relaxed max-w-3xl">
            <p>Match the title to the photos and the spec box: a cheap price next to “spares or repair”, “no OS”, “no SSD”, “for parts”, “cracked screen” or “charger not included” is honest about being incomplete — budget for what is missing. Watch for <span className="text-[var(--ink)]">spec mismatches</span> (a listing that pairs a current model name with an older-generation CPU) and relisted/clone stock that reuses stock photos.</p>
            <p>Our matcher takes <span className="text-[var(--ink)]">precision over recall</span>: where a laptop price is unverifiable or counterfeit-suspect — no trusted retailer anchor, a wrong-generation model code, a clone tell — we <span className="text-[var(--ink)]">suppress it rather than show it</span>. The prices above are the ones that survived that filter, so a “too cheap to be true” listing never becomes the headline here.</p>
          </div>
        </section>

        {/* Value sweet spot */}
        <section className="mist mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-3">Which refurbished laptop is the value sweet spot?</h2>
          <div className="space-y-3 text-[var(--ink-dim)] text-sm leading-relaxed max-w-3xl">
            <p>For most people it is a <span className="text-[var(--ink)]">one-generation-old</span> machine, or an <span className="text-[var(--ink)]">ex-business refurbished</span> model — Lenovo ThinkPad, Dell Latitude or HP EliteBook. These were built to last, bought in bulk and offloaded cheaply, so a graded refurb often undercuts a new budget laptop while being a far better machine.</p>
            <p>On platform: a refurbished <span className="text-[var(--ink)]">MacBook</span> carries a premium and an out-of-warranty battery service can be pricey, but holds value and lasts; a refurbished <span className="text-[var(--ink)]">Windows</span> business laptop is the value play; a budget <span className="text-[var(--ink)]">Chromebook</span> only makes sense if you live in the browser and want the lowest possible price. Compare every tracked model on the{' '}
            <Link href="/best-laptops-uk" className="text-[var(--slice-text)] hover:underline">cheapest laptops live-price guide</Link>.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mist mist-wide mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-5">Refurbished laptop FAQ</h2>
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
            <Link href="/best-laptops-uk" className="meta text-[var(--slice-text)] hover:underline">Cheapest laptops UK — live prices &rarr;</Link>
            <Link href="/cheapest-used-refurbished-iphone-uk" className="meta text-[var(--slice-text)] hover:underline">Cheapest used or refurbished iPhone UK &rarr;</Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
