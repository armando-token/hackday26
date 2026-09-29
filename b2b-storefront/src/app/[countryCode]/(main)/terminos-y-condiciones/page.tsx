import { Metadata } from "next"
import { company } from "@lib/config/company"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Términos y Condiciones de Venta | Control Nautas S.A.C. Perú",
  description:
    "Términos y condiciones comerciales de compra, cotización, facturación electrónica y entrega de suministros industriales de Control Nautas S.A.C.",
}

export default function TerminosYCondicionesPage() {
  return (
    <div className="w-full bg-white text-[#1C242E] min-h-screen py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="text-xs text-neutral-500 mb-6 flex items-center gap-2">
          <LocalizedClientLink href="/" className="hover:underline">Inicio</LocalizedClientLink>
          <span>/</span>
          <span className="text-neutral-900 font-semibold">Términos y Condiciones</span>
        </div>

        {/* Header */}
        <div className="border-b border-neutral-200 pb-8 mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
            Marco Legal y Comercial
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-3">
            Términos y Condiciones Generales de Venta B2B
          </h1>
          <p className="text-sm text-neutral-600 max-w-3xl leading-relaxed">
            Las presentes condiciones rigen las operaciones de compraventa y cotización entre <strong>{company.legalName}</strong> (RUC {company.taxId}) y los clientes corporativos o personas naturales dentro del territorio de la República del Perú.
          </p>
        </div>

        <div className="space-y-8 text-xs text-neutral-700 leading-relaxed max-w-4xl">
          <section className="border-b border-neutral-200 pb-6">
            <h2 className="text-sm font-bold text-neutral-900 mb-2">1. Identidad y Ámbito de Aplicación</h2>
            <p>
              El portal web <code>{company.siteUrl}</code> es operado por {company.legalName}, domiciliada en {company.address}. Todas las transacciones comerciales, órdenes de compra y cotizaciones están sujetas a las leyes peruanas y a las estipulaciones aquí contenidas.
            </p>
          </section>

          <section className="border-b border-neutral-200 pb-6">
            <h2 className="text-sm font-bold text-neutral-900 mb-2">2. Precios y Moneda</h2>
            <p>
              Los precios de compra directa mostrados en el catálogo web están expresados en Soles Peruanos (PEN - {company.currencySymbol}) e incluyen el Impuesto General a las Ventas (IGV - 18%) salvo indicación expresa en contrario. Los productos en modalidad &apos;Solicitar Cotización&apos; requieren la emisión de una propuesta técnico-económica formal con vigencia de 15 a 30 días calendario.
            </p>
          </section>

          <section className="border-b border-neutral-200 pb-6">
            <h2 className="text-sm font-bold text-neutral-900 mb-2">3. Facturación Electrónica</h2>
            <p>
              Emitimos Facturas y Boletas de Venta Electrónicas conforme a la normativa de la SUNAT. Durante el proceso de compra, el cliente puede especificar su Razón Social y RUC o sus datos de persona natural para la correcta emisión del comprobante respectivo.
            </p>
          </section>

          <section className="border-b border-neutral-200 pb-6">
            <h2 className="text-sm font-bold text-neutral-900 mb-2">4. Modalidades de Pago</h2>
            <p>
              El pago inicial para pedidos a través del ecommerce se realiza mediante transferencia o depósito bancario en cuentas corrientes oficiales de {company.legalName} en entidades financieras reguladas en el Perú (BCP, BBVA, Interbank). La preparación y despacho de la mercadería inicia una vez verificado el abono en cuenta.
            </p>
          </section>

          <section className="border-b border-neutral-200 pb-6">
            <h2 className="text-sm font-bold text-neutral-900 mb-2">5. Garantía de los Productos</h2>
            <p>
              Todos los equipos e instrumentos comercializados por {company.legalName} son 100% nuevos, auténticos y cuentan con garantía de fábrica de doce (12) meses contra defectos de manufactura, sujeta al uso e instalación acorde a los manuales del fabricante.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-neutral-900 mb-2">6. Jurisdicción y Contacto</h2>
            <p>
              Para cualquier controversia derivada del presente acuerdo, las partes se someten a la competencia de los jueces y tribunales del Distrito Judicial de Lima, Perú. Para consultas legales o comerciales, puede escribir a <a href={`mailto:${company.email}`} className="text-blue-700 underline font-semibold">{company.email}</a> o llamar al <a href={`tel:${company.phoneE164}`} className="text-blue-700 underline font-semibold">{company.phoneDisplay}</a>.
            </p>
          </section>
        </div>

      </div>
    </div>
  )
}
