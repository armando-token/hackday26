import { Metadata } from "next"
import { company } from "@lib/config/company"
import WhatsAppProductCTA from "@modules/common/components/whatsapp-product-cta"

export const metadata: Metadata = {
  title: "Contacto Comercial y Soporte de Ingeniería | Control Nautas Perú",
  description:
    "Canales oficiales de atención de Control Nautas S.A.C. Cotizaciones industriales, soporte de ingeniería de planta y venta de instrumentación.",
}

export default function ContactPage() {
  return (
    <div className="w-full bg-white text-[#1C242E] min-h-screen py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Header */}
        <div className="border-b border-neutral-200 pb-6 mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
            Atención Directa B2B
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            Contacto Comercial y Soporte de Ingeniería
          </h1>
          <p className="text-sm text-neutral-600 mt-2 max-w-3xl leading-relaxed">
            En <strong>Control Nautas S.A.C.</strong> ponemos a su disposición a nuestro equipo de ingenieros de aplicaciones para asesorarle en selección de instrumentación, automatización PLC/HMI, trazado térmico y calefacción industrial.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Ventas y Cotizaciones B2B */}
          <div className="border border-neutral-200 rounded-lg p-6 bg-neutral-50 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xl mb-4">
                💼
              </div>
              <h2 className="text-lg font-bold text-neutral-900 mb-2">Ventas y Cotizaciones B2B</h2>
              <p className="text-xs text-neutral-600 mb-5 leading-normal">
                Solicitudes de cotización formal (RFQ), licitaciones, atención a cuentas corporativas y órdenes de compra.
              </p>
              <div className="space-y-3 text-xs text-neutral-800">
                <p>
                  <strong>Teléfono / WhatsApp:</strong>{" "}
                  <a href={`tel:${company.phoneE164}`} className="text-blue-700 hover:underline font-semibold">
                    {company.phoneDisplay}
                  </a>
                </p>
                <p>
                  <strong>Correo Oficial:</strong>{" "}
                  <a href={`mailto:${company.email}`} className="text-blue-700 hover:underline font-semibold">
                    {company.email}
                  </a>
                </p>
                <p>
                  <strong>Razón Social:</strong> {company.legalName}
                </p>
                <p>
                  <strong>RUC:</strong> {company.taxId}
                </p>
              </div>
            </div>
            <div className="pt-5 mt-6 border-t border-neutral-200">
              <WhatsAppProductCTA
                variant="primary"
                ctaLocation="contact"
                customText="Escribir por WhatsApp"
                className="w-full justify-center"
              />
            </div>
          </div>

          {/* Card 2: Soporte de Ingeniería y Proyectos */}
          <div className="border border-neutral-200 rounded-lg p-6 bg-neutral-50 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xl mb-4">
                ⚙️
              </div>
              <h2 className="text-lg font-bold text-neutral-900 mb-2">Ingeniería y Proyectos</h2>
              <p className="text-xs text-neutral-600 mb-5 leading-normal">
                Dimensionamiento de sistemas de calentamiento, cálculo de pérdidas térmicas, selección de PLC y configuración de transmisores.
              </p>
              <div className="space-y-3 text-xs text-neutral-800">
                <p>
                  <strong>Atención Técnica:</strong>{" "}
                  <a href={`mailto:${company.email}`} className="text-blue-700 hover:underline font-semibold">
                    {company.email}
                  </a>
                </p>
                <p>
                  <strong>Fichas Técnicas y Manuales:</strong> Disponibles en cada ficha de producto
                </p>
                <p>
                  <strong>Marcas Representadas:</strong> Novus, Horner APG, AKCP, King Electric, MPI, EMS Kontrol
                </p>
              </div>
            </div>
            <div className="pt-5 mt-6 border-t border-neutral-200 text-xs text-neutral-500">
              ⏱️ Tiempo promedio de respuesta técnica: &lt; 24 horas hábiles.
            </div>
          </div>

          {/* Card 3: Oficina y Despachos */}
          <div className="border border-neutral-200 rounded-lg p-6 bg-neutral-50 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xl mb-4">
                📍
              </div>
              <h2 className="text-lg font-bold text-neutral-900 mb-2">Oficina Principal</h2>
              <p className="text-xs text-neutral-600 mb-5 leading-normal">
                Atención administrativa, recepción de guías y coordinación de despachos a nivel nacional.
              </p>
              <div className="space-y-3 text-xs text-neutral-800">
                <p>
                  <strong>Dirección:</strong><br />
                  {company.address}
                </p>
                <p>
                  <strong>Horario de Atención:</strong><br />
                  {company.hours}
                </p>
                <p>
                  <strong>Cobertura de Envíos:</strong> Lima Metropolitana y todo el territorio peruano.
                </p>
              </div>
            </div>
            <div className="pt-5 mt-6 border-t border-neutral-200 text-xs text-neutral-500">
              Despachos coordinados vía agencias autorizadas o recojo en almacén.
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
