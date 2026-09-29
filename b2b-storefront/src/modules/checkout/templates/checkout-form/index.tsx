import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

const DEFAULT_PAYMENT_PROVIDERS: any[] = [
  {
    id: "pp_system_default",
    is_enabled: true,
  },
]

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = (await listCartShippingMethods(cart.id)) || []
  const paymentMethods = (await listCartPaymentMethods(cart.region?.id ?? "")) || DEFAULT_PAYMENT_PROVIDERS

  return (
    <div className="w-full space-y-6">
      {/* 1. Datos de Facturación y Entrega */}
      <Addresses cart={cart} customer={customer} />

      {/* 2. Modalidad de Envío y Despacho */}
      <Shipping cart={cart} availableShippingMethods={shippingMethods} />

      {/* 3. Método de Pago y Cuentas Bancarias */}
      <Payment cart={cart} availablePaymentMethods={paymentMethods.length > 0 ? paymentMethods : DEFAULT_PAYMENT_PROVIDERS} />

      {/* 4. Revisión y Confirmación Final */}
      <Review cart={cart} />
    </div>
  )
}
