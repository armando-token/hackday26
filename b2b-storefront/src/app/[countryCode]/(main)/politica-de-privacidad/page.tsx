import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { company } from "@lib/config/company"

export const metadata: Metadata = {
  title: "Privacy Policy | Control Nautas",
  description: "Privacy policy for Control Nautas B2B storefront and Muse Commerce demo.",
}

export default function PrivacyPage() {
  return (
    <div className="content-container py-10 max-w-3xl">
      <nav className="text-sm text-neutral-500 mb-6 flex gap-2">
        <LocalizedClientLink href="/" className="hover:underline">Home</LocalizedClientLink>
        <span>/</span>
        <span className="text-neutral-900 font-semibold">Privacy Policy</span>
      </nav>
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <div className="prose prose-sm text-neutral-700 space-y-4">
        <p>
          <strong>{company.legalName}</strong> processes contact and order data solely to respond to quotes,
          fulfill orders, provide technical support, and operate this demonstration storefront.
        </p>
        <h2 className="text-sm font-bold text-neutral-900">1. Data controller</h2>
        <p>
          {company.legalName} — {company.address}. Contact: <a className="text-blue-700 underline" href={`mailto:${company.email}`}>{company.email}</a>
        </p>
        <h2 className="text-sm font-bold text-neutral-900">2. Purpose</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Respond to RFQs and commercial inquiries</li>
          <li>Process orders, invoices, and logistics</li>
          <li>Provide engineering support for purchased products</li>
        </ul>
        <h2 className="text-sm font-bold text-neutral-900">3. Cookies</h2>
        <p>
          We use technical and analytics cookies (e.g. Google Tag Manager / GA4) to operate the cart and measure aggregate catalog usage.
        </p>
        <h2 className="text-sm font-bold text-neutral-900">4. Your rights</h2>
        <p>
          You may request access, correction, or deletion of your personal data by emailing {company.email}.
        </p>
      </div>
    </div>
  )
}
