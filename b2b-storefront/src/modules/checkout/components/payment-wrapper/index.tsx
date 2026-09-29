"use client"

import { loadStripe } from "@stripe/stripe-js"
import React from "react"
import StripeWrapper from "./stripe-wrapper"
import { HttpTypes } from "@medusajs/types"
import { isStripeLike } from "@lib/constants"

type PaymentWrapperProps = {
  cart: HttpTypes.StoreCart
  children: React.ReactNode
}

const stripeKey =
  process.env.NEXT_PUBLIC_STRIPE_KEY ||
  process.env.NEXT_PUBLIC_MEDUSA_PAYMENTS_PUBLISHABLE_KEY

const medusaAccountId = process.env.NEXT_PUBLIC_MEDUSA_PAYMENTS_ACCOUNT_ID
const stripePromise = stripeKey
  ? loadStripe(
      stripeKey,
      medusaAccountId ? { stripeAccount: medusaAccountId } : undefined
    )
  : null

const PaymentWrapper: React.FC<PaymentWrapperProps> = ({ cart, children }) => {
  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window as any).dataLayer &&
      cart &&
      cart.items &&
      cart.items.length > 0
    ) {
      ;(window as any).dataLayer.push({
        event: "begin_checkout",
        ecommerce: {
          currency: cart.currency_code?.toUpperCase() || "PEN",
          value: cart.total || cart.subtotal || 0,
          items: cart.items.map((item) => ({
            item_id: (item.variant?.metadata?.wc_id
              ? `gla_${item.variant?.metadata?.wc_id}`
              : item.variant?.sku || item.variant_id || item.id) as string,
            item_name: item.title || item.product_title || "",
            price: item.unit_price || 0,
            quantity: item.quantity,
          })),
        },
      })
    }
  }, [cart?.id])

  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  if (
    isStripeLike(paymentSession?.provider_id) &&
    paymentSession &&
    stripePromise
  ) {
    return (
      <StripeWrapper
        paymentSession={paymentSession}
        stripeKey={stripeKey}
        stripePromise={stripePromise}
      >
        {children}
      </StripeWrapper>
    )
  }

  return <div>{children}</div>
}

export default PaymentWrapper
