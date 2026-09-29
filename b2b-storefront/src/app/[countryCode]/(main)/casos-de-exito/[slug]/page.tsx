import { Metadata } from "next"
import { notFound } from "next/navigation"
import { CASE_STUDIES } from "@lib/data/case-studies"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WhatsAppProductCTA from "@modules/common/components/whatsapp-product-cta"
import { company } from "@lib/config/company"

interface Props {
  params: Promise<{
    countryCode: string
    slug: string
  }>
}

export async function generateStaticParams() {
  const countries = ["pe", "dk", "us"]
  return countries.flatMap((countryCode) =>
    CASE_STUDIES.map((c) => ({
      countryCode,
      slug: c.slug,
    }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const caseStudy = CASE_STUDIES.find((c) => c.slug === slug)

  if (!caseStudy) {
    return {
      title: "Caso de Éxito no encontrado | Control Nautas",
    }
  }

  const canonicalUrl = `${company.siteUrl}/casos-de-exito/${caseStudy.slug}`

  return {
    title: `${caseStudy.title} | Caso de Éxito Control Nautas`,
    description: caseStudy.summary,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: caseStudy.title,
      description: caseStudy.summary,
      url: canonicalUrl,
      type: "article",
      publishedTime: caseStudy.date,
      authors: [company.legalName],
    },
  }
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { slug } = await params
  const caseStudy = CASE_STUDIES.find((c) => c.slug === slug)

  if (!caseStudy) {
    notFound()
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: caseStudy.title,
    description: caseStudy.summary,
    datePublished: caseStudy.date,
    author: {
      "@type": "Organization",
      name: company.legalName,
      url: company.siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: company.legalName,
      logo: {
        "@type": "ImageObject",
        url: `${company.siteUrl}/images/logo/control_nautas_logo_fondo_blanco.webp`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${company.siteUrl}/casos-de-exito/${caseStudy.slug}`,
    },
  }

  return (
    <div className="w-full bg-[#FAFAFA] text-[#1C242E] min-h-screen py-12">
      {/* Article Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-[1100px] mx-auto px-6">
        
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-xs text-neutral-500 mb-6 flex items-center gap-2">
          <LocalizedClientLink href="/" className="hover:underline">Inicio</LocalizedClientLink>
          <span>/</span>
          <LocalizedClientLink href="/casos-de-exito" className="hover:underline">Casos de Éxito</LocalizedClientLink>
          <span>/</span>
          <span className="text-neutral-900 font-semibold truncate max-w-xs md:max-w-md">{caseStudy.title}</span>
        </nav>

        {/* Case Header */}
        <header className="bg-white p-8 md:p-10 rounded-xl border border-neutral-200 shadow-sm mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded">
              {caseStudy.industry}
            </span>
            <span className="text-xs text-neutral-500 font-medium">
              📍 {caseStudy.location}
            </span>
            <span className="text-xs text-neutral-400">
              • Publicado: {new Date(caseStudy.date).toLocaleDateString("es-PE", { year: "numeric", month: "long" })}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight mb-3">
            {caseStudy.title}
          </h1>

          <p className="text-sm md:text-base text-neutral-600 leading-relaxed font-normal">
            {caseStudy.subtitle}
          </p>
        </header>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {caseStudy.results.map((r, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm text-center">
              <div className="text-3xl font-extrabold text-emerald-600 mb-1">{r.metric}</div>
              <div className="text-xs text-neutral-600 font-medium">{r.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Left / Main Column (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* El Desafío / Problema */}
            <section className="bg-white p-8 rounded-xl border border-neutral-200 shadow-sm">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <span className="text-rose-600">⚠️</span> El Desafío Operativo en Planta
              </h2>
              <ul className="space-y-3 text-xs text-neutral-700 leading-relaxed">
                {caseStudy.problem.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* La Solución Implementada */}
            <section className="bg-white p-8 rounded-xl border border-neutral-200 shadow-sm">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">💡</span> Solución de Ingeniería Desarrollada
              </h2>
              <ul className="space-y-3 text-xs text-neutral-700 leading-relaxed">
                {caseStudy.solution.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-blue-500 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Equipamiento y Tecnologías */}
            <section className="bg-white p-8 rounded-xl border border-neutral-200 shadow-sm">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <span className="text-neutral-700">🛠️</span> Equipamiento y Tecnologías Suministradas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {caseStudy.technologies.map((t, idx) => (
                  <div key={idx} className="p-3 bg-neutral-50 rounded border border-neutral-200 font-medium text-neutral-800">
                    {t}
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Column: CTA Box & Related Categories */}
          <div className="space-y-6">
            
            {/* Direct WhatsApp Action Box */}
            <div className="bg-[#1C242E] text-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-base mb-2">¿Necesita una solución similar?</h3>
              <p className="text-xs text-neutral-300 mb-5 leading-relaxed">
                Nuestros ingenieros de aplicaciones están disponibles para dimensionar su proyecto o cotizar suministros de inmediato.
              </p>
              <WhatsAppProductCTA
                variant="primary"
                ctaLocation="case_study"
                customText={caseStudy.ctaText}
                className="w-full justify-center"
              />
            </div>

            {/* Related Category Box */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
              <h3 className="font-bold text-sm text-neutral-900 mb-2">Categoría de Catálogo</h3>
              <p className="text-xs text-neutral-600 mb-4 leading-normal">
                Explore nuestra gama completa de productos relacionados con este caso:
              </p>
              <LocalizedClientLink
                href={`/store/${caseStudy.relatedCategorySlug}`}
                className="inline-flex items-center justify-between w-full bg-neutral-50 hover:bg-neutral-100 p-3 rounded border border-neutral-200 text-xs font-bold text-blue-700 transition-colors"
              >
                <span>{caseStudy.relatedCategory}</span>
                <span>›</span>
              </LocalizedClientLink>
            </div>

            {/* Institutional Trust */}
            <div className="bg-neutral-100 p-6 rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-2">
              <div className="font-bold text-neutral-900">Garantía Control Nautas</div>
              <p>• Productos 100% nuevos y certificados.</p>
              <p>• Asesoría técnica especializada antes y después de la compra.</p>
              <p>• Despachos a todo el territorio peruano.</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
