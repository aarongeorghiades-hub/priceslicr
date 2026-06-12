import type { Metadata } from 'next'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  alternates: { canonical: '/contact' },
  title: 'Contact',
  description:
    'Get in touch with PriceSlicr, operated by ENA Enterprises Ltd — for price errors, retailer issues, data requests, or partnerships.',
}

export default function ContactPage() {
  return (
    <div className="dark-section min-h-screen">
      <Nav />

      <main className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <h1 className="heading-section text-[var(--ink)] mb-5">Contact</h1>

        <p className="text-[var(--ink-dim)] leading-relaxed max-w-2xl mb-8">
          Email us about price errors, retailer or listing issues, data requests, or partnership enquiries.
          We read everything and reply as quickly as we can.
        </p>

        <a
          href="mailto:contact@priceslicr.com"
          className="inline-flex items-center font-display text-xl md:text-2xl font-semibold text-[var(--slice-text)] underline underline-offset-4 hover:no-underline"
        >
          contact@priceslicr.com
        </a>

        <div className="card p-6 mt-10 max-w-xl">
          <h2 className="heading-card text-[var(--ink)] mb-3">Company details</h2>
          <div className="text-[var(--ink-dim)] leading-relaxed space-y-1">
            <p>ENA Enterprises Ltd</p>
            <p>Registered in England and Wales</p>
            <p>Company number 17257845</p>
          </div>
        </div>

        <p className="label text-[var(--ink-faint)] mt-8">
          We do not operate a contact form &mdash; email is the best way to reach us.
        </p>
      </main>

      <Footer />
    </div>
  )
}
