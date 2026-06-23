import Link from 'next/link'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Reveal from '@/components/Reveal'
import { formatGBP } from '@/lib/utils'
import { SEGMENT_LABELS } from '@/lib/conditionSlices'
import { getUsedRefurbSnapshot } from '@/lib/guide'

const BASE = 'https://www.priceslicr.com'
const PATH = '/used-refurbished-tech-uk'
const PUBLISHED = '2026-06-23'

// Condition enum → plain-language definition (mirrors the DB enum exactly).
const CONDITIONS: { key: string; term: string; body: string }[] = [
  { key: 'new', term: 'New', body: 'Sealed, unused stock with the full manufacturer warranty. The benchmark price the second-hand market discounts from — rarely the cheapest, always the safest.' },
  { key: 'certified_refurbished', term: 'Certified Refurbished', body: 'Restored and tested by the manufacturer or an approved partner, typically with a warranty (often 12 months) and fresh accessories. The closest second-hand option to new, and priced accordingly.' },
  { key: 'refurbished', term: 'Refurbished', body: 'Restored and tested by a graded seller (a retailer or a specialist like CEX). Usually warrantied and graded for cosmetic wear. Sits between certified-refurbished and used on both price and assurance.' },
  { key: 'used', term: 'Used', body: 'Pre-owned and sold as-is by a shop or private seller. Cheapest of all, but assurance varies most — a CEX C-grade with a warranty is a very different buy from a private "spares or repair" listing.' },
]

const CEX_GRADES: { grade: string; body: string }[] = [
  { grade: 'A', body: 'Excellent — minimal to no visible wear, close to new in the hand. The premium second-hand tier; we map it to “refurbished”.' },
  { grade: 'B', body: 'Good — light, normal signs of use (faint scuffs, minor marks). Fully working; the usual value sweet spot.' },
  { grade: 'C', body: 'Fair — heavier cosmetic wear (visible scratches, dings) but fully functional. Cheapest CEX tier; fine if you case it anyway.' },
]

export default async function UsedRefurbHub() {
  const snap = await getUsedRefurbSnapshot()
  const lastChecked = snap.lastChecked
    ? new Date(snap.lastChecked).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const lowestStr = snap.lowest ? `${formatGBP(Math.round(snap.lowest.price))}` : null

  // ── FAQ (rendered + FAQPage schema, single source) ──
  const faqs: { q: string; a: string }[] = [
    {
      q: 'What is the difference between used and refurbished?',
      a: 'Used means pre-owned and sold as-is, cheapest but with the most variable condition. Refurbished means a seller has tested and restored the item, usually with a warranty and a cosmetic grade. Certified refurbished is the manufacturer-backed version of that, closest to new. On price it runs new → certified refurbished → refurbished → used, cheapest last.',
    },
    {
      q: 'Are CEX grades A, B and C safe to buy?',
      a: 'Yes — all three are fully working and come with CEX’s warranty (commonly up to 24 months) and returns. The grade is about cosmetics only: A is near-new, B has light wear, C has heavier scratches but works the same. If you use a case anyway, a C-grade is usually the best value.',
    },
    {
      q: 'Why are some eBay prices so cheap — are they fake?',
      a: 'Sometimes. A “new and sealed” flagship at a fraction of its normal price is a classic counterfeit or scam pattern, and a single earbud or a spares/parts unit can look like a whole device in a list. We take a precision-over-recall stance: where a second-hand price is unverifiable or counterfeit-suspect, we suppress it rather than show it, so a “too cheap” listing never becomes our headline price.',
    },
    {
      q: 'Is it cheaper to buy refurbished or used?',
      a: 'Used is almost always cheaper than refurbished, because refurbished includes testing and usually a warranty. The gap is the price of peace of mind. For higher-value items (laptops, current-gen phones) many buyers pay a little more for refurbished; for older or cased items, used wins on pure price.',
    },
    {
      q: 'Do refurbished phones and laptops come with a warranty?',
      a: 'Usually, yes. Certified refurbished and graded-seller refurbished items (including CEX) typically include a warranty, often 12–24 months. Private used listings on eBay generally do not — that is the main trade-off between the two routes.',
    },
    {
      q: 'Where is the cheapest place to buy refurbished tech in the UK?',
      a: `It depends on the item and how much assurance you want. CEX is strong for graded, warrantied refurbished and used stock with easy returns; eBay often has the lowest outright prices and the widest selection, but assurance varies by seller. This page tracks the live cheapest verified second-hand price for each category so you can compare both routes${lowestStr ? ` — currently from ${lowestStr}` : ''}.`,
    },
  ]

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Used & Refurbished Tech UK: Live Prices & Buying Guide (2026)',
    description: 'How to buy used and refurbished tech in the UK without overpaying or getting burned — used vs refurbished, CEX grades, eBay conditions and counterfeit risk, plus live cheapest verified second-hand prices.',
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE}${PATH}` },
    datePublished: PUBLISHED,
    dateModified: snap.lastChecked ? snap.lastChecked.slice(0, 10) : PUBLISHED,
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
      { '@type': 'ListItem', position: 2, name: 'Used & Refurbished Tech UK', item: `${BASE}${PATH}` },
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
        <div className="mb-14">
          <div className="eyebrow mb-4">UK USED &amp; REFURBISHED TECH · LIVE PRICES · 2026</div>
          <h1 className="heading-section text-[var(--ink)]">
            Used &amp; refurbished tech in the UK<br />
            <span className="text-[var(--slice-text)]">without overpaying — or getting burned.</span>
          </h1>
          <p className="text-[var(--ink-dim)] text-lg mt-5 max-w-2xl leading-relaxed">
            {`An honest, live-price guide to buying second-hand tech. We track real UK prices from CEX and eBay, explain what the grades and conditions actually mean, and show the cheapest verified price for each category${lowestStr ? `, currently from ` : '.'}`}
            {lowestStr && <><span className="price-num text-[var(--ink)]">{lowestStr}</span>{`.`}</>}
            {' '}Where a price looks too cheap to be real, we leave it out rather than mislead you.
          </p>
          {lastChecked && (
            <p className="meta text-[var(--ink-faint)] mt-4">{`Last checked: ${lastChecked} · live prices from CEX and eBay`}</p>
          )}
        </div>

        {/* 2. Used vs Refurbished vs Certified Refurbished */}
        <Reveal as="section" className="mist mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-2">Used vs refurbished vs certified refurbished</h2>
          <p className="meta text-[var(--ink-dim)] mb-5">The four conditions we track, cheapest assurance last.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {CONDITIONS.map(c => (
              <div key={c.key} className="card p-5">
                {/* Heading IS the clean human label (New / Certified Refurbished /
                    Refurbished / Used) — no raw-enum subtitle. */}
                <div className="font-display font-semibold text-[var(--ink)] text-sm mb-2">{c.term}</div>
                <p className="text-[var(--ink-dim)] text-sm leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* 3. CEX grades */}
        <Reveal as="section" className="mist mist-high mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-2">CEX grades explained (A / B / C)</h2>
          <p className="meta text-[var(--ink-dim)] mb-5">CEX grades are about cosmetics, not whether it works — every grade is tested and warrantied.</p>
          <div className="space-y-3">
            {CEX_GRADES.map(g => (
              <div key={g.grade} className="card p-5 flex items-baseline gap-4">
                <span className="price-num text-2xl text-[var(--slice-text)] shrink-0 w-8">{g.grade}</span>
                <p className="text-[var(--ink-dim)] text-sm leading-relaxed">{g.body}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* 4. eBay conditions + counterfeit risk */}
        <Reveal as="section" className="mist mist-wide mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-3">Reading eBay listings (and spotting fakes)</h2>
          <div className="space-y-3 text-[var(--ink-dim)] text-sm leading-relaxed max-w-3xl">
            <p>eBay condition labels run from <span className="text-[var(--ink)]">Brand New</span> and <span className="text-[var(--ink)]">Open Box</span> through <span className="text-[var(--ink)]">Certified Refurbished</span>, <span className="text-[var(--ink)]">Excellent/Very Good/Good Refurbished</span>, down to <span className="text-[var(--ink)]">Used</span> and <span className="text-[var(--ink)]">For parts or not working</span>. Read the title and the condition together: a low price next to “for parts”, “spares”, “cracked”, “single earbud” or “case only” is honest about being a partial or broken unit.</p>
            <p>The trap is the listing that looks whole and genuine but is priced like junk. A “brand new, sealed” current flagship at a fraction of its normal price is a classic counterfeit or scam pattern. Our matcher takes <span className="text-[var(--ink)]">precision over recall</span>: where a second-hand price is unverifiable or counterfeit-suspect — no trusted retailer anchor, a clone tell in the title, a wrong-generation model code — we <span className="text-[var(--ink)]">suppress it rather than show it</span>. A “too cheap to be true” listing never becomes the headline price on this site.</p>
          </div>
        </Reveal>

        {/* 5. CEX vs eBay */}
        <Reveal as="section" className="mist mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-5">CEX vs eBay — which route?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="font-display font-semibold text-[var(--ink)] text-sm mb-2">Choose CEX for assurance</div>
              <p className="text-[var(--ink-dim)] text-sm leading-relaxed">Consistent grading, a warranty (commonly up to 24 months) and straightforward returns. Best when you want a known-good unit with recourse if something is wrong, and you can live with a slightly higher price than the cheapest private listing.</p>
            </div>
            <div className="card p-5">
              <div className="font-display font-semibold text-[var(--ink)] text-sm mb-2">Choose eBay for price &amp; selection</div>
              <p className="text-[var(--ink-dim)] text-sm leading-relaxed">The widest selection and often the lowest outright price, including models CEX doesn’t stock. The trade-off is variable seller assurance, so check feedback, the exact condition and whether a warranty is offered — and lean on Buyer Protection.</p>
            </div>
          </div>
        </Reveal>

        {/* 6. Is refurbished worth it */}
        <Reveal as="section" className="mist mist-high mb-12">
          <h2 className="heading-card text-[var(--ink)] mb-5">Is refurbished worth it?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="font-display font-semibold text-[var(--ink)] text-sm mb-2">Yes, when…</div>
              <ul className="text-[var(--ink-dim)] text-sm leading-relaxed space-y-2 list-disc pl-4">
                <li>you want most of the saving of used but with a warranty and testing;</li>
                <li>it’s a higher-value item (laptop, current-gen phone) where failure is costly;</li>
                <li>a one-generation-old model is heavily discounted — usually the value sweet spot.</li>
              </ul>
            </div>
            <div className="card p-5">
              <div className="font-display font-semibold text-[var(--ink)] text-sm mb-2">Maybe not, when…</div>
              <ul className="text-[var(--ink-dim)] text-sm leading-relaxed space-y-2 list-disc pl-4">
                <li>a graded <span className="text-[var(--ink)]">used</span> unit (e.g. CEX C) is much cheaper and you’ll case it anyway;</li>
                <li>the refurbished premium is close to a new-stock sale price — then buy new;</li>
                <li>battery health matters (phones, watches) and the listing won’t state it.</li>
              </ul>
            </div>
          </div>
        </Reveal>

        {/* 7. LIVE PRICE SNAPSHOT — deliberately NOT wrapped in <Reveal>. This is the
            page's core conversion content; a scroll-reveal can leave a deep section at
            opacity:0 (reveal-hidden) when its IntersectionObserver doesn't fire, which
            showed as an empty band (S25). Always-visible plain <section> instead. */}
        <section className="mist mist-wide mb-4">
          <h2 className="heading-card text-[var(--ink)] mb-2">Live cheapest verified second-hand price</h2>
          <p className="meta text-[var(--ink-dim)] mb-5">The cheapest trusted used or refurbished price we currently hold per category. Counterfeit-suspect and unverified prices are excluded.</p>
          <div className="space-y-2">
            {snap.rows.map(r => (
              <div key={r.category} className="card p-4 slice-bar flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-display font-semibold text-[var(--ink)] text-sm">{r.label}</div>
                  {r.product && r.price != null ? (
                    <Link href={`/${r.route}/${r.product.slug}`} className="meta text-[var(--slice-text)] hover:underline">
                      {r.product.name} &rarr;
                    </Link>
                  ) : (
                    <span className="meta text-[var(--ink-faint)]">No verified second-hand price yet</span>
                  )}
                </div>
                <div className="shrink-0 text-right flex items-baseline gap-3">
                  {r.price != null && r.segment ? (
                    <span>
                      <span className="meta">from </span>
                      <span className="price-num text-base text-[var(--ink)]">{formatGBP(Math.round(r.price))}</span>
                      <span className="meta">{' · '}{SEGMENT_LABELS[r.segment].toLowerCase()}</span>
                    </span>
                  ) : (
                    <span className="meta text-[var(--ink-faint)]">&mdash;</span>
                  )}
                  <Link href={r.guidePath} className="meta text-[var(--slice-text)] hover:underline whitespace-nowrap">
                    All {r.label.toLowerCase()} &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {lastChecked && (
            <p className="meta text-[var(--ink-faint)] mt-4">{`Last checked: ${lastChecked}. Live prices from CEX and eBay; they change as stock moves.`}</p>
          )}
          <p className="label text-[13px] text-[var(--ink-faint)] mt-2">
            We may earn a commission when you buy through our links — it never affects the prices you see.
          </p>
        </section>

        {/* 9. FAQ */}
        <Reveal as="section" className="mist mt-12">
          <h2 className="heading-card text-[var(--ink)] mb-5">Used &amp; refurbished tech FAQ</h2>
          <div className="space-y-3">
            {faqs.map(f => (
              <details key={f.q} className="card p-5">
                <summary className="font-display font-semibold text-[var(--ink)] text-sm cursor-pointer">{f.q}</summary>
                <p className="text-[var(--ink-dim)] text-sm leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>

        {/* Internal links out to the live-price guides */}
        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <div className="label text-[var(--ink-dim)] mb-3">Live cheapest-price guides</div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {snap.rows.map(r => (
              <Link key={r.category} href={r.guidePath} className="meta text-[var(--slice-text)] hover:underline">
                Cheapest {r.label.toLowerCase()} &rarr;
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
