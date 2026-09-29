import { Metadata } from "next"
import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CartTemplate from "@modules/cart/templates"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Shopping Cart | Control Nautas United States",
  description: "Review industrial supplies in your shopping cart.",
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
