import { Metadata } from "next"
import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CartTemplate from "@modules/cart/templates"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Carrito de Compras | Control Nautas Perú",
  description: "Revise los suministros industriales en su carrito de compras.",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function CartPage() {
  const cart = await retrieveCart()
  const customer = await retrieveCustomer().catch(() => null)

  return <CartTemplate cart={cart} customer={customer} />
}
