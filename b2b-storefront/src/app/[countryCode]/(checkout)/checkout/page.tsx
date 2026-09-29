import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import ExportQuoteButton from "@modules/checkout/components/export-quote-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Metadata } from "next"
import { company } from "@lib/config/company"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Procesar Pedido B2B | Control Nautas Perú",
  description: "Finalice su pedido de equipos y suministros industriales con entrega a nivel nacional y facturación electrónica.",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function Checkout() {
  const cart = await retrieveCart()

  if (!cart || !cart.items?.length) {
    return (
      <div className="max-w-[800px] mx-auto py-24 px-6 text-center font-[Arial,Helvetica,sans-serif]">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          🛒
        </div>
        <h1 className="text-[26px] font-black text-[#131921] mb-2 tracking-tight">Su carrito está vacío</h1>
        <p className="text-[14px] text-[#666] mb-8 max-w-md mx-auto">
          Para procesar una compra formal o emitir una cotización técnica, agregue productos desde nuestro catálogo de instrumentación y suministros industriales.
        </p>
        <LocalizedClientLink
          href="/store"
          className="inline-block bg-[#C8102E] hover:bg-[#9B0C24] text-white font-bold text-[14px] px-8 py-3.5 rounded shadow-sm transition-colors uppercase tracking-wider"
        >
          Explorar Catálogo de Productos
        </LocalizedClientLink>
      </div>
    )
  }

  const customer = await retrieveCustomer().catch(() => null)

  return (
    <div className="w-full bg-[#F8F9FA] min-h-screen py-10 font-[Arial,Helvetica,sans-serif]">
      <div className="max-w-[1300px] mx-auto px-4 lg:px-8">
        
        {/* Header de Checkout con Sellos de Confianza */}
        <div className="mb-8 bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-[#666] mb-1">
              <LocalizedClientLink href="/store" className="hover:text-[#0066CC]">Catálogo</LocalizedClientLink>
              <span>›</span>
              <LocalizedClientLink href="/cart" className="hover:text-[#0066CC]">Carrito</LocalizedClientLink>
              <span>›</span>
              <span className="font-bold text-[#131921]">Finalizar Pedido</span>
            </div>
            <h1 className="text-[26px] font-black text-[#131921] tracking-tight">
              Finalizar Compra / Generar Orden Formal
            </h1>
            <p className="text-[13px] text-[#555] mt-0.5">
              Complete los datos de entrega y confirme la orden para emisión de Factura Electrónica y despacho.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#4A5568] bg-[#F1F5F9] px-4 py-2.5 rounded border border-[#CBD5E1]">
            <span className="flex items-center gap-1 font-bold text-[#1E7E34]">
              🛡️ Compra Segura B2B
            </span>
            <span className="text-gray-300">|</span>
            <span>RUC: <strong className="text-[#131921]">{company.taxId}</strong></span>
            <span className="text-gray-300">|</span>
            <span className="font-semibold text-[#0066CC]">Facturación SUNAT</span>
          </div>
        </div>
        
        {/* Grid de 2 Columnas: Formulario de Pasos y Resumen */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
          <div className="space-y-6">
            <div className="hide-on-print">
              <PaymentWrapper cart={cart}>
                <CheckoutForm cart={cart} customer={customer} />
              </PaymentWrapper>
            </div>
          </div>
          
          <div className="space-y-6">
            <CheckoutSummary cart={cart} />
            
            {/* Botón de Exportar Cotización Formal B2B */}
            <div className="border border-[#E2E8F0] p-5 rounded-lg bg-white shadow-sm text-center hide-on-print">
              <h3 className="font-bold text-[14px] text-[#131921] mb-1">
                ¿Requiere Aprobación Interna de Compras?
              </h3>
              <p className="text-[12px] text-[#666] mb-3">
                Descargue un resumen de cotización técnica formal con RUC y desglose de precios para su área de logística.
              </p>
              <ExportQuoteButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
