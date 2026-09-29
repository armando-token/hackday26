"use client"

import React from "react"
import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import { company } from "@lib/config/company"

const CheckoutSummary = ({ cart }: { cart: any }) => {
  const itemsCount = (cart?.items || []).reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)

  return (
    <div className="sticky top-6 flex flex-col gap-y-4">
      <div className="w-full bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
          <h2 className="text-[18px] font-black text-[#131921] tracking-tight">
            Resumen de la Orden
          </h2>
          <span className="bg-gray-100 text-[#4A5568] text-[12px] font-bold px-2.5 py-1 rounded">
            {itemsCount} {itemsCount === 1 ? "ítem" : "ítems"}
          </span>
        </div>

        {/* Totales de Carrito */}
        <div className="mb-4">
          <CartTotals totals={cart} />
        </div>

        {/* Lista de Productos en Checkout */}
        <div className="pt-3 border-t border-[#E2E8F0] mb-4">
          <span className="text-[13px] font-bold text-[#131921] block mb-2">
            Productos incluidos:
          </span>
          <ItemsPreviewTemplate cart={cart} />
        </div>

        {/* Código de Descuento o Promoción */}
        <div className="pt-3 border-t border-[#E2E8F0]">
          <DiscountCode cart={cart} />
        </div>
      </div>

      {/* Asistencia Directa por WhatsApp */}
      <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-4 text-center">
        <p className="text-[13px] font-bold text-[#166534] mb-1">
          💬 ¿Requiere asistencia con su orden o crédito B2B?
        </p>
        <p className="text-[12px] text-[#15803D] mb-3">
          Un ingeniero especialista de Control Nautas puede validar sus requerimientos técnicos.
        </p>
        <a
          href={`https://wa.me/${company.whatsappNumber}?text=${encodeURIComponent(
            `Hola Control Nautas, estoy en el checkout del pedido y requiero asistencia técnica con los suministros industriales.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold py-2.5 px-4 rounded text-[13px] transition-colors shadow-sm"
        >
          <span>💬</span> Chatear con Soporte Técnico
        </a>
      </div>
    </div>
  )
}

export default CheckoutSummary
