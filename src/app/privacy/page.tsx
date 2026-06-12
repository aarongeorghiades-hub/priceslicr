import type { Metadata } from 'next'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  alternates: { canonical: '/privacy' },
  title: 'Privacy Policy',
  description:
    'How PriceSlicr handles your data. We run no accounts, forms, or analytics trackers — this policy explains what that means and your rights under UK GDPR.',
}

const linkClass = 'text-[var(--slice-text)] underline underline-offset-2 hover:no-underline'

export default function PrivacyPage() {
  return (
    <div className="dark-section min-h-screen">
      <Nav />

      <main className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <h1 className="heading-section text-[var(--ink)] mb-3">Privacy Policy</h1>
        <p className="label text-[var(--ink-faint)] mb-10">Last updated: 12 June 2026</p>

        <div className="space-y-10 text-[var(--ink-dim)] leading-relaxed">
          <section>
            <h2 className="heading-card text-[var(--ink)] mb-3">Who we are</h2>
            <p>
              PriceSlicr is operated by ENA Enterprises Ltd, a company registered in England and Wales
              under company number 17257845. In this policy, &ldquo;we&rdquo;, &ldquo;us&rdquo; and
              &ldquo;our&rdquo; refer to ENA Enterprises Ltd. We are the data controller for the limited
              processing described below. You can reach us at{' '}
              <a href="mailto:contact@priceslicr.com" className={linkClass}>contact@priceslicr.com</a>.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-[var(--ink)] mb-3">What we collect</h2>
            <p className="mb-3">
              PriceSlicr is an information and price-comparison website. We do not operate user accounts,
              logins, sign-up forms, newsletters, or contact forms, and we do not ask you to submit any
              personal information to use the site. We do not run third-party analytics, advertising, or
              behavioural-tracking scripts.
            </p>
            <p>
              Like any website, our hosting infrastructure may automatically process limited technical
              information &mdash; such as your IP address, browser type, and the pages requested &mdash; in
              server logs for the purposes of operating, securing, and debugging the service. We do not use
              this information to identify you or to build a profile, and we do not sell it.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-[var(--ink)] mb-3">Cookies</h2>
            <p>
              We do not set analytics or advertising cookies of our own. Any cookies present are strictly
              necessary for the basic operation of the site. Note that affiliate networks may set their own
              cookies when you click an outbound retailer link &mdash; see the next section.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-[var(--ink)] mb-3">Affiliate links</h2>
            <p className="mb-3">
              Some links to retailers and marketplaces are affiliate links. When you click one, the affiliate
              network may set cookies on your device to attribute any resulting purchase to us so we earn a
              commission. We do not control these cookies and cannot see your individual purchases &mdash;
              they are operated by the networks under their own privacy and cookie policies:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                eBay Partner Network &mdash;{' '}
                <a href="https://www.ebay.co.uk/help/policies/member-behaviour-policies/user-privacy-notice-privacy-policy?id=4260" target="_blank" rel="noopener noreferrer" className={linkClass}>eBay privacy notice</a>
              </li>
              <li>
                Amazon Associates &mdash;{' '}
                <a href="https://www.amazon.co.uk/privacy" target="_blank" rel="noopener noreferrer" className={linkClass}>Amazon privacy notice</a>
              </li>
              <li>
                Awin &mdash;{' '}
                <a href="https://www.awin.com/gb/privacy-policy" target="_blank" rel="noopener noreferrer" className={linkClass}>Awin privacy policy</a>
              </li>
            </ul>
            <p className="mt-3">
              Other retailer links are plain search links that do not carry affiliate tracking. We may earn a
              commission when you buy through our links &mdash; it never affects the prices you see.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-[var(--ink)] mb-3">Legal basis for processing</h2>
            <p>
              Where we process the limited technical information described above, we rely on our legitimate
              interests (UK GDPR Article 6(1)(f)) in operating and securing the website. We do not process any
              special-category data.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-[var(--ink)] mb-3">Your rights</h2>
            <p className="mb-3">
              Under the UK GDPR you have the right to access, rectify, erase, restrict, or object to the
              processing of your personal data, and the right to data portability. Because we do not hold
              accounts or directly collected personal data, in most cases we will hold little or no information
              that identifies you.
            </p>
            <p>
              To exercise any of these rights, email{' '}
              <a href="mailto:contact@priceslicr.com" className={linkClass}>contact@priceslicr.com</a>. We will
              respond within one month.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-[var(--ink)] mb-3">Complaints</h2>
            <p>
              If you are unhappy with how we have handled your data, you have the right to complain to the UK
              Information Commissioner&apos;s Office at{' '}
              <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className={linkClass}>https://ico.org.uk</a>.
              We would appreciate the chance to address your concern first, so please contact us before you do.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-[var(--ink)] mb-3">Changes to this policy</h2>
            <p>
              We may update this policy from time to time. Any changes will be posted on this page with a
              revised &ldquo;last updated&rdquo; date.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-[var(--ink)] mb-3">Contact</h2>
            <p>
              ENA Enterprises Ltd, registered in England and Wales (company no. 17257845). Email:{' '}
              <a href="mailto:contact@priceslicr.com" className={linkClass}>contact@priceslicr.com</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
