"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useParams } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useShellCart } from "@lib/cn-catalog"
import { addToCart } from "@lib/data/cart"

type QuickOrderMatch = {
  handle: string
  productId: string
  title: string
  brand: string
  itemNumber: string | null
  priceLabel: string
  canAddToCart: boolean
  availability: string
  variantId: string
}

interface ParsedLine {
  rawLine: string
  sku: string
  skuToken: string
  quantity: number
  product?: QuickOrderMatch
  status: "found_stock" | "found_quote" | "not_found"
}

function parseInputLines(inputText: string): Omit<ParsedLine, "product" | "status">[] {
  if (!inputText.trim()) return []

  return inputText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      let sku = ""
      let qty = 1

      if (line.includes(",") || line.includes(";") || line.includes("\t")) {
        const parts = line.split(/[,;\t]+/)
        sku = parts[0]?.trim() || ""
        qty = Math.max(1, parseInt(parts[1]?.trim() || "1", 10) || 1)
      } else {
        const match = line.match(/^(.*?)\s+(\d+)$/)
        if (match) {
          sku = match[1].trim()
          qty = Math.max(1, parseInt(match[2], 10) || 1)
        } else {
          sku = line
          qty = 1
        }
      }

      const skuToken = sku.toLowerCase().replace(/[^a-z0-9-_]/g, "")

      return {
        rawLine: line,
        sku,
        skuToken,
        quantity: qty,
      }
    })
}

function lineStatus(product?: QuickOrderMatch): ParsedLine["status"] {
  if (!product) return "not_found"
  if (product.canAddToCart && product.availability === "in_stock") {
    return "found_stock"
  }
  return "found_quote"
}

export default function QuickOrderPage() {
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "pe"
  const [inputText, setInputText] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [addedSuccess, setAddedSuccess] = useState(false)
  const [lookup, setLookup] = useState<Record<string, QuickOrderMatch>>({})
  const { addItem } = useShellCart()

  const baseLines = useMemo(() => parseInputLines(inputText), [inputText])

  useEffect(() => {
    const tokens = [...new Set(baseLines.map((l) => l.skuToken).filter(Boolean))]
    if (!tokens.length) {
      setLookup({})
      return
    }

    const timer = setTimeout(() => {
      fetch("/api/catalog/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skus: tokens, countryCode }),
      })
        .then((r) => r.json())
        .then((data) => setLookup(data.matches || {}))
        .catch(() => setLookup({}))
    }, 300)

    return () => clearTimeout(timer)
  }, [baseLines, countryCode])

  const parsedLines = useMemo<ParsedLine[]>(() => {
    return baseLines.map((line) => {
      const product = lookup[line.skuToken]
      return {
        ...line,
        product,
        status: lineStatus(product),
      }
    })
  }, [baseLines, lookup])

  const loadSample = async () => {
    const sampleSkus = ["CN-10204", "TR-502", "HEAT-4410", "PLC-HM-01"]
    try {
      const res = await fetch("/api/catalog/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skus: sampleSkus, countryCode }),
      })
      const data = await res.json()
      const matches: Record<string, QuickOrderMatch> = data.matches || {}
      const lines = sampleSkus
        .filter((sku) => matches[sku.toLowerCase().replace(/[^a-z0-9-_]/g, "")] || matches[sku])
        .map((sku, idx) => {
          const token = sku.toLowerCase().replace(/[^a-z0-9-_]/g, "")
          const hit = matches[token] || matches[sku]
          const code = hit?.itemNumber || sku
          return `${code}, ${(idx + 1) * 5}`
        })

      if (lines.length) {
        setInputText(lines.join("\n"))
      } else {
        setInputText(sampleSkus.map((sku, idx) => `${sku}, ${(idx + 1) * 5}`).join("\n"))
      }
    } catch {
      setInputText(sampleSkus.map((sku, idx) => `${sku}, ${(idx + 1) * 5}`).join("\n"))
    }
    setSubmitted(false)
    setAddedSuccess(false)
  }

  const handleProcessOrder = async () => {
    setSubmitted(true)
    let addedCount = 0

    for (const item of parsedLines) {
      if (item.product?.canAddToCart && item.product.availability === "in_stock") {
        addItem({
          variantId: item.product.variantId,
          productId: item.product.productId,
          handle: item.product.handle,
          quantity: item.quantity,
        })
        addedCount += 1

        if (item.product.variantId) {
          try {
            await addToCart({
              variantId: item.product.variantId,
              quantity: item.quantity,
              countryCode,
            })
          } catch (e) {
            console.error("Error adding quick-order item to Medusa:", e)
          }
        }
      }
    }

    if (addedCount > 0) {
      setAddedSuccess(true)
    }
  }

  const foundStockCount = parsedLines.filter((l) => l.status === "found_stock").length
  const foundQuoteCount = parsedLines.filter((l) => l.status === "found_quote").length
  const notFoundCount = parsedLines.filter((l) => l.status === "not_found").length

  return (
    <div className="max-w-[1240px] mx-auto py-10 px-4 sm:px-6 font-[Arial,Helvetica,sans-serif] select-none text-[#333333]">
      <div className="border-b border-[#CCCCCC] pb-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
          Entrada de Pedido Rápido B2B
        </h1>
        <p className="text-[14px] text-[#666666] mt-2 max-w-3xl leading-relaxed">
          Herramienta para órdenes por volumen o compras corporativas recurrentes. Ingrese Códigos de Ítem, Números de Parte del Fabricante (MFR) o SKUs de su sistema ERP.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-bold text-[#333333] uppercase tracking-wide">
              SKU y Cantidad (uno por línea)
            </label>
            <button
              type="button"
              onClick={loadSample}
              className="text-[12px] text-[#0066CC] hover:underline font-semibold"
            >
              Cargar ejemplo
            </button>
          </div>

          <textarea
            rows={10}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value)
              setSubmitted(false)
              setAddedSuccess(false)
            }}
            className="w-full border border-[#CCCCCC] rounded-none p-3.5 text-sm font-mono focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none bg-white placeholder:text-gray-400"
            placeholder={"CN-10204, 10\nTR-502, 25\nHEAT-4410, 5\nPLC-HM-01, 2"}
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleProcessOrder}
              disabled={parsedLines.length === 0}
              className="bg-[#C8102E] hover:bg-[#9B0C24] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-none transition-colors uppercase tracking-wider text-[13px]"
            >
              Verificar Disponibilidad y Agregar a la Orden
            </button>

            {inputText && (
              <button
                type="button"
                onClick={() => {
                  setInputText("")
                  setSubmitted(false)
                  setAddedSuccess(false)
                }}
                className="border border-[#CCCCCC] bg-white text-[#666666] hover:bg-gray-50 py-3.5 px-4 rounded-none text-[13px] font-medium"
              >
                Limpiar
              </button>
            )}
          </div>

          {addedSuccess && (
            <div className="bg-[#E6F4EA] border border-[#137333] text-[#137333] p-4 text-[13px] flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 font-bold">
                <span>✓</span>
                <span>¡Productos agregados correctamente al carrito de compras!</span>
              </div>
              <LocalizedClientLink
                href="/cart"
                className="bg-[#137333] hover:bg-[#0e5c28] text-white px-4 py-1.5 font-bold uppercase text-[12px] transition-colors"
              >
                Ver Carrito ›
              </LocalizedClientLink>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-[#F9F9F9] p-6 border border-[#E5E5E5] flex flex-col justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-[#222222] mb-3 uppercase tracking-wide">
              Instrucciones de Uso
            </h2>
            <ul className="list-disc pl-5 space-y-2.5 text-[13px] text-[#555555]">
              <li>Copie y pegue directamente columnas desde Microsoft Excel o su sistema SAP / ERP.</li>
              <li>Formato recomendado: <code>CÓDIGO, CANTIDAD</code> (separados por coma, tabulación o espacio).</li>
              <li>Los ítems en stock se agregan directamente al carro de compra con despacho nacional.</li>
              <li>Los ítems de cotización o fabricación a medida se marcan para RFQ formal.</li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E5E5E5] text-[12px] text-[#666666]">
            ¿Necesita cotizar más de 50 líneas o listas de materiales completas? Escríbanos a{" "}
            <a href="mailto:ventas@controlnautas.com" className="text-[#0066CC] font-bold underline">
              ventas@controlnautas.com
            </a>{" "}
            o al WhatsApp oficial.
          </div>
        </div>
      </div>

      {parsedLines.length > 0 && (
        <div className="mt-10 border-t border-[#CCCCCC] pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="text-[18px] font-bold text-[#222222]">
              Líneas Analizadas ({parsedLines.length})
            </h3>
            <div className="flex items-center gap-4 text-[12px] font-semibold">
              <span className="text-[#137333]">● En Stock: {foundStockCount}</span>
              <span className="text-[#D97706]">● Cotización / A Pedido: {foundQuoteCount}</span>
              <span className="text-[#C8102E]">● No Encontrado: {notFoundCount}</span>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#CCCCCC]">
            <table className="w-full text-[13px] bg-white">
              <thead className="bg-[#F2F2F2] border-b border-[#CCCCCC] text-left text-[12px] font-bold text-[#333333]">
                <tr>
                  <th className="py-2.5 px-3">SKU Ingresado</th>
                  <th className="py-2.5 px-3">Producto Encontrado</th>
                  <th className="py-2.5 px-3">Marca</th>
                  <th className="py-2.5 px-3 text-center">Cant.</th>
                  <th className="py-2.5 px-3 text-right">Precio Unit.</th>
                  <th className="py-2.5 px-3">Disponibilidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {parsedLines.map((item, idx) => (
                  <tr key={idx} className={item.status === "not_found" ? "bg-red-50/50" : "hover:bg-gray-50"}>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#333333]">
                      {item.sku}
                    </td>
                    <td className="py-2.5 px-3">
                      {item.product ? (
                        <LocalizedClientLink
                          href={`/products/${item.product.handle}`}
                          className="text-[#0066CC] hover:underline font-medium line-clamp-1"
                        >
                          {item.product.title}
                        </LocalizedClientLink>
                      ) : (
                        <span className="text-[#C8102E] font-semibold">
                          No encontrado en catálogo
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[#666666]">
                      {item.product?.brand || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#137333]">
                      {item.product?.priceLabel ?? "—"}
                    </td>
                    <td className="py-2.5 px-3">
                      {item.status === "found_stock" && (
                        <span className="text-[#137333] font-bold text-[12px]">
                          ✓ Entrega Inmediata
                        </span>
                      )}
                      {item.status === "found_quote" && (
                        <span className="text-[#D97706] font-semibold text-[12px]">
                          ⏳ Vía Cotización / Importación
                        </span>
                      )}
                      {item.status === "not_found" && (
                        <span className="text-[#C8102E] font-semibold text-[12px]">
                          Revisar SKU
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
