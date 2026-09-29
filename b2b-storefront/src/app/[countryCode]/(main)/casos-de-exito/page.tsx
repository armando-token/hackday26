import { Metadata } from "next"
import { CASE_STUDIES } from "@lib/data/case-studies"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WhatsAppProductCTA from "@modules/common/components/whatsapp-product-cta"
import { company } from "@lib/config/company"

export const metadata: Metadata = {
  title: "Case Studies y Aplicaciones en Planta Industrial | Control Nautas United States",
  description:
    "Real engineering projects: heat tracing in mining, boiler insulation, AKCP monitoring in data centers, and thermal control in hydropower.",
}

export default function CaseStudiesIndexPage() {
  return (
    <div className="w-full bg-[#FAFAFA] text-[#1C242E] min-h-screen py-12">
      <div className="max-w-[1240px] mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="text-xs text-neutral-500 mb-6 flex items-center gap-2">
          <LocalizedClientLink href="/" className="hover:underline">Home</LocalizedClientLink>
          <span>/</span>
          <span className="text-neutral-900 font-semibold">Case Studies</span>
        </div>

        {/* Hero Header */}
        <div className="bg-white p-8 md:p-10 rounded-xl border border-neutral-200 shadow-sm mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
            Ingeniería de Aplicación en Campo
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight mb-4">
            Case Studies y Soluciones Industriales en United States
          </h1>
          <p className="text-sm text-neutral-600 max-w-3xl leading-relaxed">
            Descubra cómo nuestras soluciones de instrumentación, aislamiento térmico, automatización y trazado eléctrico han resuelto desafíos críticos de continuidad operativa, eficiencia energética y seguridad en los principales sectores industriales del país.
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {CASE_STUDIES.map((c) => (
            <article
              key={c.slug}
              className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Industry Tag & Header */}
                <div className="p-6 pb-4 border-b border-neutral-100 bg-neutral-50">
                  <span className="inline-block bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded">
                    {c.industry}
                  </span>
                  <div className="text-[11px] text-neutral-500 mt-2 font-medium">
                    📍 {c.location}
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <h2 className="text-base font-bold text-neutral-900 leading-snug mb-2 hover:text-blue-700 transition-colors">
                    <LocalizedClientLink href={`/casos-de-exito/${c.slug}`}>
                      {c.title}
                    </LocalizedClientLink>
                  </h2>
                  <p className="text-xs text-neutral-600 leading-relaxed mb-6 line-clamp-3">
                    {c.summary}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-2 mb-6">
                    <div className="text-[11px] font-bold uppercase text-neutral-400">Resultados Clave:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {c.results.slice(0, 2).map((r, idx) => (
                        <div key={idx} className="bg-neutral-50 p-2 rounded border border-neutral-100">
                          <div className="text-sm font-extrabold text-emerald-700">{r.metric}</div>
                          <div className="text-[10px] text-neutral-500 line-clamp-1">{r.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="p-6 pt-0">
                <LocalizedClientLink
                  href={`/casos-de-exito/${c.slug}`}
                  className="w-full inline-flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold py-2.5 px-4 rounded transition-colors"
                >
                  Ver Caso Completo ›
                </LocalizedClientLink>
              </div>
            </article>
          ))}
        </div>

        {/* CTA Footer */}
        <div className="bg-[#1C242E] text-white p-8 md:p-10 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold mb-2">¿Su planta tiene un desafío térmico o de automatización similar?</h2>
            <p className="text-xs text-neutral-300 max-w-xl">
              Nuestros especialistas en campo pueden realizar una evaluación técnica y proponer la arquitectura óptima para su proceso.
            </p>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <LocalizedClientLink
              href="/contacto"
              className="bg-white text-neutral-900 hover:bg-neutral-100 font-bold text-xs px-5 py-3 rounded transition-colors"
            >
              Contactar Ingeniería
            </LocalizedClientLink>
            <WhatsAppProductCTA
              variant="primary"
              ctaLocation="case_study"
              customText="Ask via WhatsApp"
            />
          </div>
        </div>

      </div>
    </div>
  )
}
