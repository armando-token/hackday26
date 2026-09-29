"use client"

import { Radio as MedusaRadio, RadioGroup } from "@headlessui/react"
import { setShippingMethod } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid, Loader } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Button, Heading, Text, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const stepParam = searchParams.get("step")
  const hasAddress = !!cart?.shipping_address
  const hasShipping = (cart?.shipping_methods?.length ?? 0) > 0

  // Automatically open Delivery if explicitly requested or if address is filled and delivery is not chosen yet
  const isOpen = stepParam === "delivery" || (hasAddress && !hasShipping && stepParam !== "address" && stepParam !== "payment" && stepParam !== "review")

  const selectedShippingMethod = cart?.shipping_methods?.at(-1)
  const [shippingMethodId, setShippingMethodId] = useState<string>(
    selectedShippingMethod?.shipping_option_id ||
      availableShippingMethods?.[0]?.id ||
      ""
  )

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSelect = async (id: string) => {
    setShippingMethodId(id)
    setIsLoading(true)
    setError(null)
    try {
      await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (shippingMethodId && (!selectedShippingMethod || selectedShippingMethod.shipping_option_id !== shippingMethodId)) {
        await setShippingMethod({ cartId: cart.id, shippingMethodId })
      }
      router.push(pathname + "?step=payment", { scroll: false })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm">
      <div className="flex flex-row items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={clx("w-8 h-8 rounded-full font-bold flex items-center justify-center text-[14px]", {
            "bg-[#131921] text-white": hasAddress,
            "bg-gray-200 text-gray-500": !hasAddress,
          })}>
            2
          </span>
          <Heading
            level="h2"
            className={clx("text-[20px] font-bold flex items-center gap-2", {
              "text-[#131921]": hasAddress,
              "text-gray-400 select-none": !hasAddress,
            })}
          >
            Modalidad de Envío y Despacho
            {!isOpen && hasShipping && (
              <span className="text-[#1E7E34] text-[18px]">✓</span>
            )}
          </Heading>
        </div>
        {!isOpen && hasShipping && (
          <button
            onClick={handleEdit}
            className="text-[#0066CC] hover:underline text-[13px] font-bold"
            data-testid="edit-delivery-button"
          >
            Cambiar modalidad
          </button>
        )}
      </div>

      {isOpen && hasAddress ? (
        <div className="pt-2">
          <p className="text-[13px] text-[#666] mb-4">
            Seleccione el método de despacho para sus suministros industriales en Perú:
          </p>

          <RadioGroup
            value={shippingMethodId}
            onChange={(v) => handleSelect(v)}
            className="space-y-3"
          >
            {(availableShippingMethods || []).map((option) => {
              const isSelected = option.id === shippingMethodId
              const isPickup = option.name.toLowerCase().includes("recojo")

              return (
                <RadioGroup.Option
                  key={option.id}
                  value={option.id}
                  className={clx(
                    "relative border-2 rounded-lg p-4 cursor-pointer transition-all flex items-start justify-between gap-4",
                    {
                      "border-[#0066CC] bg-[#F0F7FF] shadow-sm": isSelected,
                      "border-[#E2E8F0] bg-white hover:border-gray-300": !isSelected,
                    }
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={clx("w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0", {
                      "border-[#0066CC]": isSelected,
                      "border-gray-300": !isSelected,
                    })}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#0066CC]"></div>}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[15px] text-[#131921]">
                          {isPickup ? "🏬 " : "🚚 "} {option.name}
                        </span>
                        {isPickup && (
                          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded">
                            Gratis
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[13px] text-[#666] mt-1">
                        {isPickup
                          ? "Retiro inmediato en Almacén Central: Av. General Eugenio Garzón 2099, Jesús María, Lima (Lun-Vie 8:30am - 6:00pm)."
                          : "Entrega a domicilio, planta u obra en Lima Metropolitana (24-48 hrs) o Provincias vía Shalom / Olva / Carga Pesada (48-72 hrs)."}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-[14px] text-[#131921]">
                      {option.amount === 0 ? "Gratis (S/ 0.00)" : `S/ ${(option.amount || 0).toFixed(2)}`}
                    </span>
                  </div>
                </RadioGroup.Option>
              )
            })}
          </RadioGroup>

          <div className="mt-6">
            <ErrorMessage error={error} data-testid="delivery-option-error-message" />
            <Button
              size="large"
              className="w-full sm:w-auto bg-[#C8102E] hover:bg-[#9B0C24] text-white font-bold py-3.5 px-8 rounded text-[14px] uppercase tracking-wider transition-colors shadow-sm"
              onClick={handleSubmit}
              isLoading={isLoading}
              data-testid="submit-delivery-option-button"
            >
              Continuar al Método de Pago ›
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {hasShipping && selectedShippingMethod ? (
            <div className="pt-2 text-[13px] text-[#4A5568] bg-[#F8FAFC] p-4 rounded border border-[#EDF2F7] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#131921] block mb-1">
                  Modalidad seleccionada:
                </span>
                <p className="font-semibold text-[#2D3748]">
                  {selectedShippingMethod.name}
                </p>
              </div>
              <span className="font-bold text-[#1E7E34]">
                {selectedShippingMethod.amount === 0 ? "Gratis" : `S/ ${(selectedShippingMethod.amount || 0).toFixed(2)}`}
              </span>
            </div>
          ) : (
            <p className="text-[13px] text-gray-400">Complete los datos de entrega primero.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default Shipping
