import { Metadata } from "next"
import { company } from "@lib/config/company"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Política de Privacidad y Protección de Datos | Control Nautas S.A.C.",
  description:
    "Política de protección de datos personales de Control Nautas S.A.C. en cumplimiento con la Ley N° 29733 de la República del Perú.",
}

export default function PoliticaPrivacidadPage() {
  return (
    <div className="w-full bg-white text-[#1C242E] min-h-screen py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="text-xs text-neutral-500 mb-6 flex items-center gap-2">
          <LocalizedClientLink href="/" className="hover:underline">Inicio</LocalizedClientLink>
          <span>/</span>
          <span className="text-neutral-900 font-semibold">Política de Privacidad</span>
        </div>

        {/* Header */}
        <div className="border-b border-neutral-200 pb-8 mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
            Cumplimiento Legal (Ley N° 29733)
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-3">
            Política de Privacidad y Protección de Datos Personales
          </h1>
          <p className="text-sm text-neutral-600 max-w-3xl leading-relaxed">
            En <strong>{company.legalName}</strong> (RUC {company.taxId}) respetamos y protegemos la privacidad de nuestros usuarios, en estricto cumplimiento de la Ley N° 29733 (Ley de Protección de Datos Personales del Perú) y su Reglamento vigente aprobado mediante Decreto Supremo N° 016-2024-JUS.
          </p>
        </div>

        <div className="space-y-8 text-xs text-neutral-700 leading-relaxed max-w-4xl">
          <section className="border-b border-neutral-200 pb-6">
            <h2 className="text-sm font-bold text-neutral-900 mb-2">1. Responsable del Tratamiento</h2>
            <p>
              El titular y responsable del banco de datos personales recopilados a través de este sitio web es <strong>{company.legalName}</strong>, con domicilio en {company.address}, correo de contacto: <a href={`mailto:${company.email}`} className="text-blue-700 underline font-semibold">{company.email}</a>.
            </p>
          </section>

          <section className="border-b border-neutral-200 pb-6">
            <h2 className="text-sm font-bold text-neutral-900 mb-2">2. Finalidad del Tratamiento</h2>
            <p className="mb-2">
              Los datos proporcionados por los usuarios (nombres, apellidos, correo electrónico, teléfono, empresa, RUC y dirección de entrega) son utilizados exclusivamente para:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Elaboración y envío de cotizaciones técnico-comerciales solicitadas por el cliente.</li>
              <li>Procesamiento de órdenes de compra, facturación electrónica y entrega logística de suministros.</li>
              <li>Soporte de ingeniería y servicio postventa de los equipos adquiridos.</li>
              <li>Comunicaciones comerciales directas mediante WhatsApp o correo cuando el usuario lo ha autorizado expresamente.</li>
            </ul>
          </section>

          <section className="border-b border-neutral-200 pb-6">
            <h2 className="text-sm font-bold text-neutral-900 mb-2">3. Uso de Cookies y Medición</h2>
            <p>
              Utilizamos cookies técnicas y analíticas (mediante Google Tag Manager y Google Analytics 4) para asegurar el correcto funcionamiento del carrito de compras y evaluar agregadamente el rendimiento del catálogo. En ningún caso se registran datos personales sensibles ni información financiera en estas herramientas.
            </p>
          </section>

          <section className="border-b border-neutral-200 pb-6">
            <h2 className="text-sm font-bold text-neutral-900 mb-2">4. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)</h2>
            <p>
              Los titulares de los datos pueden ejercer en cualquier momento sus derechos de Acceso, Rectificación, Cancelación u Oposición reconocidos por la Ley 29733, enviando una comunicación escrita con el asunto &quot;Derechos ARCO&quot; a <a href={`mailto:${company.email}`} className="text-blue-700 underline font-semibold">{company.email}</a> o presentándola en nuestra sede en Jesús María, Lima.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-neutral-900 mb-2">5. Seguridad de la Información</h2>
            <p>
              {company.legalName} adopta las medidas técnicas, organizativas y legales requeridas para salvaguardar la confidencialidad de la información y prevenir su alteración, pérdida o tratamiento no autorizado.
            </p>
          </section>
        </div>

      </div>
    </div>
  )
}
