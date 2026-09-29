"use client"

import { Button, Heading } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  const handleBeginCheckout = () => {
    if (typeof window !== "undefined" && (window as any).dataLayer && cart) {
      ;(window as any).dataLayer.push({
        event: "begin_checkout",
        ecommerce: {
          currency: cart.currency_code?.toUpperCase() || "USD",
          value: cart.total || cart.subtotal || 0,
          items: cart.items?.map((item) => ({
            item_id: (item.variant?.metadata?.wc_id ? `gla_${item.variant?.metadata?.wc_id}` : item.variant?.sku || item.variant_id || item.id) as string,
            item_name: item.title || item.product_title || "",
            price: item.unit_price || 0,
            quantity: item.quantity,
          })),
        },
      })
    }
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Summary de la Orden
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
        onClick={handleBeginCheckout}
      >
        <Button className="w-full h-10">Procesar Orden de Compra</Button>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
