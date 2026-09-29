import { Metadata } from "next"
import { company } from "@lib/config/company"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WhatsAppProductCTA from "@modules/common/components/whatsapp-product-cta"

export const metadata: Metadata = {
  title: "Entregas y Devoluciones en Perú | Control Nautas S.A.C.",
  description:
    "Políticas oficiales de entrega, despacho, plazos de garantía y devoluciones de Control Nautas S.A.C.",
}

export default function EntregasYDevolucionesPage() {
  return (
    <div className="w-full bg-white text-[#1C242E] min-h-screen py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="text-xs text-neutral-500 mb-6 flex items-center gap-2">
          <LocalizedClientLink href="/" className="hover:underline">Inicio</LocalizedClientLink>
          <span>/</span>
          <span className="text-neutral-900 font-semibold">Entregas y Devoluciones</span>
        </div>

        {/* Header */}
        <div className="border-b border-neutral-200 pb-8 mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
            Logística y Post-Venta
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-3">
            Entregas y Devoluciones
          </h1>
          <p className="text-sm text-neutral-600 max-w-3xl leading-relaxed">
            En <strong>{company.legalName}</strong> (RUC: {company.taxId}) revisamos y embalamos cada pedido con cuidado para que llegue en perfecto estado. Si tu producto llega dañado, tienes hasta 5 días calendario desde la recepción para escribir a <a href={`mailto:${company.email}`} className="text-blue-700 underline font-semibold">{company.email}</a> con fotos del daño y gestionaremos el reemplazo sin costo adicional.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10 text-sm text-neutral-800 leading-relaxed max-w-4xl">
          
          {/* Section 1: Flujo de Entrega */}
          <section className="bg-neutral-50 p-6 rounded-lg border border-neutral-200">
            <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <span>🚚</span> Opciones y Proceso de Entrega
            </h2>
            <p className="text-xs text-neutral-700 mb-4">
              En Control Nautas gestionamos el envío de tus pedidos a través de servicios de mensajería y transporte confiables (Lima y Provincias), para que tus productos lleguen seguros a la dirección que indiques. Los tiempos y costos de entrega pueden variar según la ciudad y el tipo de servicio elegido. Si lo prefieres, también podemos coordinar la recogida de tu pedido en nuestras instalaciones previa confirmación por correo.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-4 bg-white border border-neutral-200 rounded">
                <div className="font-bold text-blue-800 mb-1">1. Realiza tu pedido</div>
                <div className="text-neutral-600">A través de nuestra plataforma web o cotización técnica.</div>
              </div>
              <div className="p-4 bg-white border border-neutral-200 rounded">
                <div className="font-bold text-blue-800 mb-1">2. Confirmación</div>
                <div className="text-neutral-600">Recibe la confirmación por correo o WhatsApp con los detalles del pedido.</div>
              </div>
              <div className="p-4 bg-white border border-neutral-200 rounded">
                <div className="font-bold text-blue-800 mb-1">3. Preparación</div>
                <div className="text-neutral-600">Nuestro equipo prepara tu pedido, lo revisa y lo entrega a la empresa de transporte.</div>
              </div>
              <div className="p-4 bg-white border border-neutral-200 rounded">
                <div className="font-bold text-blue-800 mb-1">4. Recepción</div>
                <div className="text-neutral-600">Recibe tu pedido en la dirección indicada o retíralo en nuestras oficinas.</div>
              </div>
            </div>
          </section>

          {/* Section 2: Cambios, Devoluciones y Reembolsos */}
          <section className="bg-neutral-50 p-6 rounded-lg border border-neutral-200">
            <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <span>🛡️</span> Cambios, Devoluciones y Reembolsos
            </h2>
            <p className="text-xs text-neutral-700 mb-3">
              En Control Nautas queremos que quedes totalmente satisfecho con tu compra. Si tu producto llega dañado durante el transporte o necesitas solicitar un cambio o devolución, contamos con un proceso claro para atender tu caso dentro de plazos definidos:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-neutral-700">
              <li>
                <strong>Plazo de devolución de 30 días:</strong> Aceptamos devoluciones por cualquier motivo dentro de los 30 días posteriores a la compra, siempre que el producto se encuentre sin uso y en las mismas condiciones en que fue entregado.
              </li>
              <li>
                <strong>Plazo de 5 días por daños de transporte:</strong> Si tu pedido llegó dañado, debes escribir a <a href={`mailto:${company.email}`} className="text-blue-700 underline font-semibold">{company.email}</a> dentro de los primeros 5 días calendario, adjuntando fotos del producto, del embalaje y de la guía de envío.
              </li>
              <li>
                <strong>Condiciones del producto:</strong> El producto debe conservar su empaque original, manuales, accesorios y documentación tal como fueron entregados.
              </li>
              <li>
                <strong>Costos de envío:</strong> Los costos de envío de la mercancía devuelta por motivos no imputables a falla técnica corren por cuenta del cliente, y el costo de delivery original no es reembolsable.
              </li>
              <li>
                <strong>Productos no reembolsables:</strong> Productos fabricados o configurados a medida según especificaciones técnicas del cliente, así como artículos especiales de importación que no puedan revenderse.
              </li>
            </ul>
          </section>

          {/* Section 3: Proceso RMA */}
          <section className="bg-neutral-50 p-6 rounded-lg border border-neutral-200">
            <h2 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <span>📋</span> Cómo Iniciar el Proceso de Devolución (RMA)
            </h2>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-neutral-700">
              <li>Solicita una Autorización de Devolución (RMA) escribiendo a <a href={`mailto:${company.email}`} className="text-blue-700 underline font-semibold">{company.email}</a> o a nuestro WhatsApp oficial <strong>{company.phoneDisplay}</strong> indicando tu número de pedido y motivo de la devolución.</li>
              <li>Envía o entrega el producto en nuestras instalaciones para su inspección técnica.</li>
              <li>Una vez completada la revisión del estado del ítem, procesaremos el reembolso o cambio de producto dentro del plazo coordinado.</li>
            </ol>
          </section>

          {/* Contact Banner */}
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-blue-950">
              <div className="font-bold text-sm mb-1">¿Necesitas ayuda con un envío o devolución?</div>
              Comunícate con nuestro equipo técnico y comercial en Lima: {company.phoneDisplay} • {company.email}
            </div>
            <WhatsAppProductCTA
              variant="primary"
              ctaLocation="contact"
              customText="Consultar por WhatsApp"
            />
          </div>

        </div>

      </div>
    </div>
  )
}
