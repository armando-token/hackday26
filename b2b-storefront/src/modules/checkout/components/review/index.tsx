"use client"

import { Heading, Text, clx } from "@medusajs/ui"
import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()
  const stepParam = searchParams.get("step")

  const hasAddress = !!cart?.shipping_address
  const hasShipping = (cart?.shipping_methods?.length ?? 0) > 0
  const hasPayment = !!cart?.payment_collection || (cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0)

  const isComplete = hasAddress && hasShipping && hasPayment
  const isOpen = stepParam === "review" || isComplete

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm">
      <div className="flex flex-row items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={clx("w-8 h-8 rounded-full font-bold flex items-center justify-center text-[14px]", {
            "bg-[#131921] text-white": isComplete,
            "bg-gray-200 text-gray-500": !isComplete,
          })}>
            4
          </span>
          <Heading
            level="h2"
            className={clx("text-[20px] font-bold flex items-center gap-2", {
              "text-[#131921]": isComplete,
              "text-gray-400 select-none": !isComplete,
            })}
          >
            Revisión Final y Procesamiento de Orden
          </Heading>
        </div>
      </div>

      {isOpen && isComplete ? (
        <div className="pt-2">
          <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0] text-[13px] text-[#4A5568] mb-6 space-y-2">
            <p className="font-semibold text-[#131921]">
              ✓ Al hacer clic en <strong className="text-[#C8102E]">"Confirmar y procesar orden"</strong>, se registrará su pedido formal en nuestro sistema central.
            </p>
            <p className="text-[12px] text-[#666]">
              Se enviará automáticamente la confirmación con el resumen de ítems, precios con IGV y datos de cuenta bancaria para coordinar el despacho inmediato.
            </p>
            <p className="text-[11px] text-[#888] pt-1 border-t border-gray-200">
              Operación amparada bajo el D.S. N° 016-2024-JUS, Ley 29733 de Protección de Datos Personales y garantía técnica de Control Nautas S.A.C.
            </p>
          </div>

          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </div>
      ) : (
        <div>
          <p className="text-[13px] text-gray-400">Complete los pasos anteriores para confirmar su orden de compra.</p>
        </div>
      )}
    </div>
  )
}

export default Review
