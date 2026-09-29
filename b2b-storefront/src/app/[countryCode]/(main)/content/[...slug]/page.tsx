import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Legal Policies | Control Nautas",
  description: "Privacy, terms of use, sales conditions, and fulfillment policies for Control Nautas.",
}

const PAGES: Record<string, { title: string; subtitle: string; paragraphs: string[] }> = {
  "privacy-policy": {
    title: "Privacy Policy",
    subtitle: "Responsible handling of personal and corporate data.",
    paragraphs: [
      "Control Nautas S.A.C. is committed to the confidentiality of customer, engineer, and platform-user information.",
      "Collected contact data is used only for quotes, order processing, invoicing, and technical delivery support.",
      "We do not sell or transfer user data to third parties without prior explicit consent.",
      "You may request access, correction, or deletion of your data by emailing ventas@controlnautas.com.",
    ],
  },
  "terms-of-use": {
    title: "Terms of Use",
    subtitle: "Guidelines for accessing the technical catalog and B2B platform.",
    paragraphs: [
      "Access to this website and technical catalog is governed by these Terms of Use. By browsing or creating a corporate account, you agree to these terms.",
      "Published technical information is for industrial selection guidance. Control Nautas may update specs as manufacturer documentation evolves.",
      "Published prices are USD web reference values and may require confirmation for stock, volume, or engineered quotes.",
      "Unauthorized commercial reproduction of catalog content, images, or databases is prohibited.",
    ],
  },
  "sales-conditions": {
    title: "Sales Conditions",
    subtitle: "Commercial terms, invoicing, warranties, and delivery.",
    paragraphs: [
      "Commercial transactions are processed by Control Nautas S.A.C. with electronic invoicing where applicable.",
      "Products carry manufacturer warranty against manufacturing defects, backed by the official brands.",
      "Shipments use qualified carriers with packaging suitable for industrial electronics and instrumentation.",
      "For returns and exchanges, items must be in original packaging without improper energization outside manufacturer parameters.",
    ],
  },
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const key = (slug || []).join("-") || "privacy-policy"
  const page = PAGES[key] || PAGES["privacy-policy"]

  return (
    <div className="content-container py-10 max-w-3xl">
      <nav className="text-sm text-neutral-500 mb-6 flex gap-2">
        <LocalizedClientLink href="/" className="hover:underline">Home</LocalizedClientLink>
        <span>/</span>
        <span className="text-neutral-900 font-semibold">{page.title}</span>
      </nav>
      <h1 className="text-2xl font-bold mb-2">{page.title}</h1>
      <p className="text-neutral-600 mb-6">{page.subtitle}</p>
      <div className="space-y-4 text-sm text-neutral-700">
        {page.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="mt-8 flex gap-4 text-sm">
        <LocalizedClientLink href="/store" className="text-[#0066CC] hover:underline">← Back to Catalog</LocalizedClientLink>
        <LocalizedClientLink href="/contacto" className="text-[#0066CC] hover:underline">Contact</LocalizedClientLink>
      </div>
    </div>
  )
}
