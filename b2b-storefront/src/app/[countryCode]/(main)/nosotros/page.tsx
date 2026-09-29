import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { company } from "@lib/config/company"

export const metadata: Metadata = {
  title: "About Us | Control Nautas — B2B Engineering & Instrumentation",
  description: company.description,
}

export default function AboutPage() {
  return (
    <div className="content-container py-10 max-w-3xl">
      <nav className="text-sm text-neutral-500 mb-6 flex gap-2">
        <LocalizedClientLink href="/" className="hover:underline">Home</LocalizedClientLink>
        <span>/</span>
        <span className="text-neutral-900 font-semibold">About Us</span>
      </nav>
      <h1 className="text-2xl font-bold mb-4">About Control Nautas</h1>
      <div className="prose prose-sm text-neutral-700 space-y-4">
        <p>{company.description}</p>
        <h2 className="text-sm font-bold text-neutral-900">Mission</h2>
        <p>
          Help engineers and buyers select, specify, and procure industrial control and instrumentation
          with clear technical documentation and responsive commercial support.
        </p>
        <h2 className="text-sm font-bold text-neutral-900">Focus areas</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Process control & automation (PLC/HMI/PID)</li>
          <li>Sensors and environmental monitoring</li>
          <li>Electric heating and heat tracing</li>
          <li>Thermal insulation systems</li>
        </ul>
        <LocalizedClientLink
          href="/contacto"
          className="inline-flex mt-4 px-4 py-2 bg-[#0066CC] text-white text-sm font-bold rounded hover:bg-[#0055AA]"
        >
          Contact sales & engineering
        </LocalizedClientLink>
      </div>
    </div>
  )
}
