import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { company } from "@lib/config/company"

export const metadata: Metadata = {
  title: "Shipping & Returns | Control Nautas",
  description: "Shipping, pickup, and returns policy for Control Nautas industrial supplies.",
}

export default function ShippingReturnsPage() {
  return (
    <div className="content-container py-10 max-w-3xl">
      <nav className="text-sm text-neutral-500 mb-6 flex gap-2">
        <LocalizedClientLink href="/" className="hover:underline">Home</LocalizedClientLink>
        <span>/</span>
        <span className="text-neutral-900 font-semibold">Shipping & Returns</span>
      </nav>
      <h1 className="text-2xl font-bold mb-4">Shipping & Returns</h1>
      <div className="prose prose-sm text-neutral-700 space-y-4">
        <p>
          <strong>{company.legalName}</strong> packs and ships industrial products carefully. For the Hack Day demo,
          Muse offers may show shipping as to-be-confirmed until a formal order is placed.
        </p>
        <h2 className="text-sm font-bold text-neutral-900">1. Shipping</h2>
        <p>
          Delivery times and costs depend on destination and carrier. Pickup can be arranged after confirmation.
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li><strong>Place your order</strong> via the storefront or a technical quote.</li>
          <li><strong>Receive confirmation</strong> by email or WhatsApp.</li>
          <li><strong>We prepare and ship</strong> after payment/stock confirmation.</li>
          <li><strong>Receive or pick up</strong> your order at the agreed location.</li>
        </ol>
        <h2 className="text-sm font-bold text-neutral-900">2. Returns</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>30-day return window</strong> for unused products in original condition.</li>
          <li><strong>5 days for transit damage</strong> — email {company.email} with photos of product, packaging, and waybill.</li>
          <li>Keep original packaging, manuals, and accessories.</li>
        </ul>
        <h2 className="text-sm font-bold text-neutral-900">3. Need help?</h2>
        <p>{company.phoneDisplay} · {company.email}</p>
      </div>
    </div>
  )
}
