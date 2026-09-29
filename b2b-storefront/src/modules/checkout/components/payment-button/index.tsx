"use client"

import { isManual, isStripeLike } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import React, { useState } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  return (
    <ManualPaymentButton notReady={notReady} data-testid={dataTestId} />
  )
}

const ManualPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handlePayment = async () => {
    setSubmitting(true)
    setErrorMessage(null)
    try {
      await placeOrder()
    } catch (err: any) {
      setErrorMessage(err.message || "Ocurrió un error al procesar el pedido.")
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        disabled={notReady || submitting}
        onClick={handlePayment}
        className="w-full sm:w-auto bg-[#C8102E] hover:bg-[#9B0C24] disabled:bg-[#999] text-white font-bold py-4 px-10 rounded text-[15px] uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
        data-testid="submit-order-button"
      >
        {submitting ? (
          <>
            <span className="animate-spin text-lg">⏳</span> Procesando Pedido Formal...
          </>
        ) : (
          <>
            ✓ Confirmar y Procesar Orden de Compra ›
          </>
        )}
      </button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
