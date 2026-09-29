"use client"

import { RadioGroup } from "@headlessui/react"
import { isStripeLike, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession } from "@lib/data/cart"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import { Button, Heading, Text, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { company } from "@lib/config/company"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id || availablePaymentMethods?.[0]?.id || "pp_system_default"
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const stepParam = searchParams.get("step")
  const hasAddress = !!cart?.shipping_address
  const hasShipping = (cart?.shipping_methods?.length ?? 0) > 0
  const hasPayment = !!activeSession || !!cart?.payment_collection

  const isOpen = stepParam === "payment" || (hasShipping && !hasPayment && stepParam !== "address" && stepParam !== "delivery" && stepParam !== "review")

  const handleEdit = () => {
    router.push(pathname + "?step=payment", { scroll: false })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (!activeSession || activeSession.provider_id !== selectedPaymentMethod) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
        })
      }

      router.push(pathname + "?step=review", { scroll: false })
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
            "bg-[#131921] text-white": hasShipping,
            "bg-gray-200 text-gray-500": !hasShipping,
          })}>
            3
          </span>
          <Heading
            level="h2"
            className={clx("text-[20px] font-bold flex items-center gap-2", {
              "text-[#131921]": hasShipping,
              "text-gray-400 select-none": !hasShipping,
            })}
          >
            Payment & invoicing
            {!isOpen && hasPayment && (
              <span className="text-[#1E7E34] text-[18px]">✓</span>
            )}
          </Heading>
        </div>
        {!isOpen && hasPayment && (
          <button
            onClick={handleEdit}
            className="text-[#0066CC] hover:underline text-[13px] font-bold"
            data-testid="edit-payment-button"
          >
            Modificar pago
          </button>
        )}
      </div>

      {isOpen && hasShipping ? (
        <div className="pt-2">
          <p className="text-[13px] text-[#666] mb-4">
            Select payment and invoice method:
          </p>

          <RadioGroup
            value={selectedPaymentMethod}
            onChange={(v) => setSelectedPaymentMethod(v)}
            className="space-y-4"
          >
            {/* Opción 1: Transferencia Bancaria B2B (Principal) */}
            <RadioGroup.Option
              value="pp_system_default"
              className={clx(
                "border-2 rounded-lg p-5 cursor-pointer transition-all bg-white",
                {
                  "border-[#0066CC] bg-[#F0F7FF] shadow-sm": selectedPaymentMethod === "pp_system_default",
                  "border-[#E2E8F0] hover:border-gray-300": selectedPaymentMethod !== "pp_system_default",
                }
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={clx("w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0", {
                    "border-[#0066CC]": selectedPaymentMethod === "pp_system_default",
                    "border-gray-300": selectedPaymentMethod !== "pp_system_default",
                  })}>
                    {selectedPaymentMethod === "pp_system_default" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0066CC]"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[15px] text-[#131921]">
                        🏦 Bank transfer / corporate deposit
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded">
                        Recomendado B2B
                      </span>
                    </div>
                    <p className="text-[13px] text-[#555] mt-1">
                      We accept corporate bank transfers with electronic invoicing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Información detallada de accounts bancarias corporativas */}
              <div className="mt-4 pt-4 border-t border-[#D0E2FF] grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px] bg-white p-4 rounded border border-[#C2DBFE]">
                <div>
                  <p className="font-bold text-[#131921] mb-1">🏦 Primary corporate bank account:</p>
                  <p className="text-[#333]">Cta. Cte. USD: <span className="font-mono font-bold">193-98765432-0-12</span></p>
                  <p className="text-[#666]">CCI: <span className="font-mono">002-193-0098765432012-14</span></p>
                </div>

                <div>
                  <p className="font-bold text-[#131921] mb-1">🏦 BBVA United States:</p>
                  <p className="text-[#333]">Cta. Cte. USD: <span className="font-mono font-bold">0011-0123-0100045678</span></p>
                  <p className="text-[#666]">CCI: <span className="font-mono">011-123-000100045678-55</span></p>
                </div>

                <div>
                  <p className="font-bold text-[#131921] mb-1">🏦 Interbank:</p>
                  <p className="text-[#333]">Cta. Cte. USD: <span className="font-mono font-bold">200-3001234567</span></p>
                  <p className="text-[#666]">CCI: <span className="font-mono">003-200-003001234567-21</span></p>
                </div>

                <div>
                  <p className="font-bold text-[#131921] mb-1">📱 Corporate payment:</p>
                  <p className="text-[#333]">Number: <span className="font-mono font-bold">{company.phoneDisplay}</span></p>
                  <p className="text-[#666]">Titular: <span className="font-semibold">{company.legalName}</span></p>
                </div>

                <div className="col-span-1 md:col-span-2 mt-2 pt-2 border-t border-gray-100 text-[11px] text-[#555]">
                  Titular: <strong className="text-[#131921]">{company.legalName}</strong> · Tax ID: <strong className="text-[#131921]">{company.taxId}</strong>
                </div>
              </div>
            </RadioGroup.Option>
          </RadioGroup>

          <div className="mt-6">
            <ErrorMessage error={error} data-testid="payment-method-error-message" />
            <Button
              size="large"
              className="w-full sm:w-auto bg-[#C8102E] hover:bg-[#9B0C24] text-white font-bold py-3.5 px-8 rounded text-[14px] uppercase tracking-wider transition-colors shadow-sm"
              onClick={handleSubmit}
              isLoading={isLoading}
              data-testid="submit-payment-button"
            >
              Continue to final review ›
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {hasPayment ? (
            <div className="pt-2 text-[13px] text-[#4A5568] bg-[#F8FAFC] p-4 rounded border border-[#EDF2F7]">
              <span className="font-bold text-[#131921] block mb-1">
                Selected method:
              </span>
              <p className="font-semibold text-[#2D3748]">
                Bank transfer / corporate invoice (demo)
              </p>
              <p className="text-[12px] text-[#666] mt-0.5">
                Tax ID: {company.taxId} - {company.legalName}
              </p>
            </div>
          ) : (
            <p className="text-[13px] text-gray-400">Select la modalidad de entrega primero.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default Payment
