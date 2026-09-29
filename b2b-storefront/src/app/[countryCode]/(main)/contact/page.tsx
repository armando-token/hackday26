import { Metadata } from "next"
import { company } from "@lib/config/company"

export const metadata: Metadata = {
  title: "Sales Contact & Engineering Support | Control Nautas",
  description: "RFQs, corporate accounts, and engineering support at Control Nautas.",
}

export default function ContactPage() {
  return (
    <div className="content-container py-10 max-w-3xl">
      <h1 className="text-2xl font-bold mb-3">Sales Contact & Engineering Support</h1>
      <p className="text-neutral-600 mb-8">
        Formal RFQs, corporate accounts, and purchase orders. Datasheets and manuals are available on each product page.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border border-neutral-200 p-5 rounded">
          <h2 className="font-bold text-sm mb-2">Commercial</h2>
          <p className="text-sm text-neutral-700">
            <a className="text-[#0066CC] font-semibold" href={`mailto:${company.email}`}>{company.email}</a><br />
            <a className="text-[#0066CC] font-semibold" href={`tel:${company.phoneE164}`}>{company.phoneDisplay}</a>
          </p>
        </div>
        <div className="border border-neutral-200 p-5 rounded">
          <h2 className="font-bold text-sm mb-2">WhatsApp</h2>
          <a className="text-[#0066CC] font-semibold text-sm" href={company.whatsappUrl} target="_blank" rel="noopener noreferrer">
            Chat with sales / engineering
          </a>
          <p className="text-xs text-neutral-500 mt-2">{company.hours}</p>
        </div>
      </div>
      <p className="text-sm text-neutral-600 mt-8">
        <strong>Datasheets & manuals:</strong> Available on each product page under Technical Documentation.
      </p>
    </div>
  )
}
