"use client"

import { setAddresses } from "@lib/data/cart"
import compareAddresses from "@lib/util/compare-addresses"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text, useToggleState } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const stepParam = searchParams.get("step")
  // Automatically open Address step if step is explicitly "address", or if step param is missing, or if no address set yet
  const isOpen = stepParam === "address" || !stepParam || !cart?.shipping_address

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address", { scroll: false })
  }

  const [message, formAction] = useActionState(setAddresses, null)

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm">
      <div className="flex flex-row items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#131921] text-white font-bold flex items-center justify-center text-[14px]">
            1
          </span>
          <Heading
            level="h2"
            className="text-[20px] font-bold text-[#131921] flex items-center gap-2"
          >
            Datos de Facturación y Entrega
            {!isOpen && cart?.shipping_address && (
              <span className="text-[#1E7E34] text-[18px]">✓</span>
            )}
          </Heading>
        </div>
        {!isOpen && cart?.shipping_address && (
          <button
            onClick={handleEdit}
            className="text-[#0066CC] hover:underline text-[13px] font-bold"
            data-testid="edit-address-button"
          >
            Editar datos
          </button>
        )}
      </div>

      {isOpen ? (
        <form action={formAction}>
          <div className="pt-2">
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
            />

            {!sameAsBilling && (
              <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
                <h3 className="text-[16px] font-bold text-[#131921] mb-4">
                  Dirección y Razón Social de Facturación
                </h3>
                <BillingAddress cart={cart} />
              </div>
            )}

            <div className="mt-6">
              <SubmitButton
                className="w-full sm:w-auto bg-[#C8102E] hover:bg-[#9B0C24] text-white font-bold py-3.5 px-8 rounded text-[14px] uppercase tracking-wider transition-colors shadow-sm"
                data-testid="submit-address-button"
              >
                Continuar a Opciones de Entrega ›
              </SubmitButton>
              <ErrorMessage error={message} data-testid="address-error-message" />
            </div>
          </div>
        </form>
      ) : (
        <div>
          {cart && cart.shipping_address ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-[13px] text-[#4A5568] bg-[#F8FAFC] p-4 rounded border border-[#EDF2F7]">
              <div>
                <span className="font-bold text-[#131921] block mb-1">
                  📦 Destinatario / Empresa:
                </span>
                <p className="font-semibold text-[#2D3748]">
                  {cart.shipping_address.company ? `${cart.shipping_address.company} - ` : ""}
                  {cart.shipping_address.first_name} {cart.shipping_address.last_name}
                </p>
                <p>{cart.shipping_address.address_1}</p>
                <p>{cart.shipping_address.city} - {cart.shipping_address.province}</p>
              </div>

              <div>
                <span className="font-bold text-[#131921] block mb-1">
                  📞 Contacto & Notificaciones:
                </span>
                <p>{cart.shipping_address.phone || "No especificado"}</p>
                <p className="text-[#0066CC]">{cart.email}</p>
              </div>

              <div>
                <span className="font-bold text-[#131921] block mb-1">
                  📄 Comprobante:
                </span>
                <p>{sameAsBilling ? "Misma dirección y razón social" : "Facturación separada"}</p>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <Spinner />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Addresses
