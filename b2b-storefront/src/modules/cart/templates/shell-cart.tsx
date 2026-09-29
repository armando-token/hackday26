"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { formatPrice, useShellCart } from "@lib/cn-catalog"
import { syncCartFromClient } from "@lib/data/cart"
import { company } from "@lib/config/company"

export default function ShellCartTemplate() {
  const router = useRouter()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "pe"
  const {
    resolvedLines,
    setQuantity,
    removeItem,
    subtotal,
    clear,
    isResolving,
  } = useShellCart()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  const checkoutableLines = resolvedLines.filter(
    (l) => l.canAddToCart && !l.requiresQuote
  )
  const quoteLines = resolvedLines.filter((l) => l.requiresQuote || !l.canAddToCart)

  const handleProceedToCheckout = async () => {
    if (checkoutableLines.length === 0) {
      setSyncError(
        "No hay productos con precio fijo para checkout. Use WhatsApp o correo para cotizar."
      )
      return
    }

    setIsSyncing(true)
    setSyncError(null)
    try {
      await syncCartFromClient(
        checkoutableLines.map((l) => ({
          variantId: l.variantId,
          quantity: l.quantity,
        })),
        countryCode
      )
      router.push(`/${countryCode}/checkout`)
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Error al sincronizar el carrito"
      setSyncError(message)
      console.error("Error al sincronizar carrito Medusa:", e)
    } finally {
      setIsSyncing(false)
    }
  }

  const generateWhatsAppMessage = () => {
    const itemsList = resolvedLines
      .map(
        (line) =>
          `• *${line.title}*\n  Item: ${line.itemNumber || "N/A"} | Cant: ${line.quantity} | ${line.priceLabel}`
      )
      .join("\n\n")

    const msg = `Hola Control Nautas, deseo cotizar/comprar los siguientes suministros industriales:\n\n${itemsList}\n\n*Total Estimado:* ${formatPrice(subtotal)}\n\nPor favor confirmar availability y plazos de entrega.`
    return `https://wa.me/${company.whatsappNumber}?text=${encodeURIComponent(msg)}`
  }

  const rfqMailto = () => {
    const body = resolvedLines
      .map(
        (line) =>
          `- ${line.title}\n  Item #${line.itemNumber || "N/A"} · Fab. ${line.mfrModel || "N/A"} · Qty ${line.quantity} · ${line.priceLabel}`
      )
      .join("\n\n")
    return `mailto:${company.email}?subject=${encodeURIComponent(
      "Control Nautas quote / order request"
    )}&body=${encodeURIComponent(
      `Please provide a formal quote / stock confirmation:\n\n${body}\n\nEstimated subtotal (priced items only): ${formatPrice(subtotal)}\n\nCompany / Tax ID:\nContact:\nPhone:\nDelivery address:`
    )}`
  }

  if (resolvedLines.length === 0 && !isResolving) {
    return (
      <div className="max-w-[960px] mx-auto px-6 py-20 font-[Arial,Helvetica,sans-serif] text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          🛒
        </div>
        <h1 className="text-[26px] font-bold mb-2 text-[#1C242E]">Your shopping cart is empty</h1>
        <p className="text-[14px] text-[#666] mb-8 max-w-md mx-auto">
          Browse our technical catalog of industrial supplies for heating, insulation, instrumentation, and control.
        </p>
        <LocalizedClientLink
          href="/store"
          className="bg-[#C8102E] hover:bg-[#9B0C24] text-white font-bold text-[14px] px-8 py-3.5 inline-block rounded shadow-sm transition-colors"
        >
          Explorar Product Catalog
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-10 font-[Arial,Helvetica,sans-serif] text-[#333]">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E0E0E0]">
        <div>
          <h1 className="text-[26px] font-black text-[#131921] tracking-tight">Shopping Cart</h1>
          <p className="text-[13px] text-[#666]">
            {resolvedLines.length} productos en su lista de pedido
            {isResolving ? " · actualizando precios…" : ""}
          </p>
        </div>
        <button
          onClick={clear}
          className="text-[13px] text-[#C8102E] hover:underline font-semibold"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 border border-[#E0E0E0] rounded bg-white shadow-sm overflow-hidden">
          <div className="bg-[#F8F9FA] px-4 py-3 text-[12px] font-bold border-b border-[#E0E0E0] grid grid-cols-12 text-[#555] uppercase tracking-wider">
            <div className="col-span-6">Product / Specification</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Unit Price</div>
            <div className="col-span-2 text-right">Subtotal</div>
          </div>

          <div className="divide-y divide-[#EEEEEE]">
            {resolvedLines.map((line) => (
              <div
                key={line.variantId}
                className="grid grid-cols-12 gap-3 px-4 py-4 items-center text-[13px] hover:bg-gray-50/50 transition-colors"
              >
                <div className="col-span-6 flex gap-3 items-center">
                  <img
                    src={line.image}
                    alt={line.title}
                    className="w-16 h-16 object-contain border border-[#EEE] p-1 rounded bg-white flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-[#888] uppercase tracking-wider block">
                      {line.brand}
                    </span>
                    <LocalizedClientLink
                      href={`/products/${line.handle}`}
                      className="font-bold text-[#0066CC] hover:underline text-[13px] line-clamp-2"
                    >
                      {line.title}
                    </LocalizedClientLink>
                    <div className="text-[11px] text-[#777] mt-0.5">
                      Item #{line.itemNumber || "—"} · Mod. {line.mfrModel || "—"}
                    </div>
                    {line.requiresQuote && (
                      <span className="text-[11px] text-[#D97706] font-semibold mt-1 block">
                        Quote only — not included in checkout
                      </span>
                    )}
                    <button
                      onClick={() => removeItem(line.variantId)}
                      className="text-[11px] text-[#C8102E] mt-1 font-semibold hover:underline block"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="col-span-2 flex justify-center">
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={line.quantity}
                    onChange={(e) =>
                      setQuantity(
                        line.variantId,
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    className="w-16 border border-[#CCC] px-2 py-1 text-center text-[13px] font-semibold rounded bg-white"
                  />
                </div>

                <div className="col-span-2 text-right font-semibold text-[#1E7E34]">
                  {line.priceLabel}
                </div>

                <div className="col-span-2 text-right font-black text-[#131921]">
                  {line.requiresQuote
                    ? "Quote"
                    : formatPrice(line.priceAmount * line.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="border border-[#E0E0E0] rounded bg-white p-5 shadow-sm">
            <h2 className="font-bold text-[16px] text-[#131921] mb-4 pb-2 border-b border-[#EEE]">
              Order Summary
            </h2>

            <div className="flex justify-between text-[14px] mb-2 text-[#555]">
              <span>Subtotal productos:</span>
              <span className="font-bold text-[#131921]">{formatPrice(subtotal)}</span>
            </div>

            {quoteLines.length > 0 && (
              <div className="text-[12px] text-[#D97706] mb-3">
                {quoteLines.length} quote item(s) are not included in checkout.
              </div>
            )}

            <div className="flex justify-between text-[13px] mb-3 text-[#777]">
              <span>Shipping (US):</span>
              <span className="text-emerald-700 font-semibold">Calculado en checkout</span>
            </div>

            <div className="border-t border-[#DDD] pt-3 flex justify-between text-[17px] font-black text-[#131921] mb-5">
              <span>Total Estimado:</span>
              <span className="text-[#1E7E34]">{formatPrice(subtotal)}</span>
            </div>

            {syncError && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-800 text-[12px] px-3 py-2 rounded">
                {syncError}
              </div>
            )}

            <button
              onClick={handleProceedToCheckout}
              disabled={isSyncing || checkoutableLines.length === 0}
              className="w-full bg-[#C8102E] hover:bg-[#9B0C24] disabled:bg-[#999] text-white font-bold py-3.5 px-4 rounded text-[14px] uppercase tracking-wide transition-colors shadow-sm flex items-center justify-center gap-2 mb-3"
            >
              {isSyncing ? (
                <>
                  <span className="animate-spin text-lg">⏳</span> Syncing order...
                </>
              ) : (
                <>Proceder al Checkout ›</>
              )}
            </button>

            <a
              href={generateWhatsAppMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold py-3 px-4 rounded text-[13px] transition-colors flex items-center justify-center gap-2 mb-2"
            >
              <span>💬</span> Quote cart via WhatsApp
            </a>

            <a
              href={rfqMailto()}
              className="w-full border border-[#999] hover:bg-gray-50 text-[#333] font-bold py-2.5 px-4 rounded text-[12px] text-center block transition-colors"
            >
              ✉️ Email quote
            </a>
          </div>

          <LocalizedClientLink
            href="/store"
            className="text-center text-[13px] text-[#0066CC] hover:underline font-semibold py-2"
          >
            ← Continue shopping
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
