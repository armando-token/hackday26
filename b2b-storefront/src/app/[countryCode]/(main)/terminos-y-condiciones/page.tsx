import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { company } from "@lib/config/company"

export const metadata: Metadata = {
  title: "Terms & Conditions | Control Nautas",
  description:
    "Commercial terms for purchase, quoting, invoicing, and delivery of industrial supplies from Control Nautas.",
}

export default function TermsPage() {
  return (
    <div className="content-container py-10 max-w-3xl">
      <nav className="text-sm text-neutral-500 mb-6 flex gap-2">
        <LocalizedClientLink href="/" className="hover:underline">Home</LocalizedClientLink>
        <span>/</span>
        <span className="text-neutral-900 font-semibold">Terms & Conditions</span>
      </nav>
      <h1 className="text-2xl font-bold mb-4">Terms & Conditions</h1>
      <div className="prose prose-sm text-neutral-700 space-y-4">
        <p>
          These terms govern purchases and quotes between <strong>{company.legalName}</strong> ({company.taxIdLabel} {company.taxId})
          and customers for the Hack Day Muse Commerce demonstration catalog.
        </p>
        <h2 className="text-sm font-bold text-neutral-900">1. Catalog & pricing</h2>
        <p>
          Catalog prices are shown in US Dollars (USD), tax-excluded, and may require confirmation for volume, lead time, or custom configuration.
          Quote-only items require a formal technical-commercial proposal.
        </p>
        <h2 className="text-sm font-bold text-neutral-900">2. Orders & payment</h2>
        <p>
          Orders may be paid by corporate bank transfer. Fulfillment begins after payment confirmation unless otherwise agreed.
        </p>
        <h2 className="text-sm font-bold text-neutral-900">3. Shipping</h2>
        <p>
          Shipping terms are confirmed per order. Demo catalog shipping status is informational and may show as to-be-confirmed in Muse offers.
        </p>
        <h2 className="text-sm font-bold text-neutral-900">4. Contact</h2>
        <p>
          {company.email} · {company.phoneDisplay} · {company.address}
        </p>
      </div>
    </div>
  )
}
