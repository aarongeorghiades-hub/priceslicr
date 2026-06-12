import type { Metadata } from 'next'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Use',
  description:
    'The terms governing your use of PriceSlicr, a free UK price-comparison and information service operated by ENA Enterprises Ltd.',
  path: '/terms',
})

const linkClass = 'text-[var(--slice-text)] underline underline-offset-2 hover:no-underline'

export default function TermsPage() {
  return (
    <div className="dark-section min-h-screen">
      <Nav />

      <main className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <h1 className="heading-section text-[var(--ink)] mb-3">Terms of Use</h1>
        <p className="label text-[var(--ink-faint)] mb-10">Last updated: 12 June 2026</p>

        <div className="space-y-10 text-[var(--ink-dim)] leading-relaxed">
          <section>
            <h2 className="heading-card text-[var(--ink)] mb-3">About these terms</h2>
            <p>
              These terms govern your use of PriceSlicr (the &ldquo;site&rdquo;), operated by ENA Enterprises
              Ltd, registered in England and Wales under company number 17257845. By using the site you agree
              to these terms. If you do not agree, please do not use the site.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-[var(--ink)] mb-3">What PriceSlicr is</h2>
            <p>
              PriceSlicr is a free price-comparison and information service. We gather and present prices,
              savings, and guidance to help you compare options across UK retailers and marketplaces. We are
              not a retailer or seller: we do not sell products, process payments, or fulfil orders. Any
              purchase you make is a contract between you and the relevant retailer or marketplace, subject to
              their terms.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-[var(--ink)] mb-3">Price accuracy</h2>
            <p>
              Prices and product information are gathered from retailers and marketplaces and may be out of
              date, incomplete, or incorrect at any time. Prices change frequently and may differ from what we
              show. Always verify the final price, specification, condition, and availability on the
              retailer&apos;s own website before you buy. We do not guarantee that any price shown is currently
              available.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-[var(--ink)] mb-3">Affiliate disclosure</h2>
            <p>
              Some outbound links are affiliate links. We may earn a commission when you buy through our links
              &mdash; it never affects the prices you see.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-[var(--ink)] mb-3">No warranty</h2>
            <p>
              The site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any
              kind, whether express or implied, to the fullest extent permitted by law. We do not warrant that
              the site, or the information on it, will be accurate, complete, uninterrupted, or error-free.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-[var(--ink)] mb-3">Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, ENA Enterprises Ltd will not be liable for any loss or
              damage arising from your use of the site or your reliance on any information on it, including any
              purchasing decision you make. Nothing in these terms excludes or limits liability that cannot be
              excluded or limited under applicable law.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-[var(--ink)] mb-3">Intellectual property</h2>
            <p>
              The content, design, and branding of the site belong to ENA Enterprises Ltd, except for retailer
              names, logos, and product information, which remain the property of their respective owners. You
              may not copy or reuse our content without permission.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-[var(--ink)] mb-3">Governing law</h2>
            <p>
              These terms and any dispute arising from them are governed by the laws of England and Wales, and
              are subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-[var(--ink)] mb-3">Contact</h2>
            <p>
              Questions about these terms? Email{' '}
              <a href="mailto:contact@priceslicr.com" className={linkClass}>contact@priceslicr.com</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
