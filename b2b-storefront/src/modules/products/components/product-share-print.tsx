"use client"

import React, { useState } from "react"

export default function ProductSharePrint({
  title,
  handle,
}: {
  title?: string
  handle?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://controlnautas.com/products/${handle || ""}`
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: title || "Control Nautas",
          url,
        })
        return
      } catch (e) {
        // Fallback to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  return (
    <div className="hidden sm:flex items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        className="border border-[#CCCCCC] hover:bg-gray-50 text-[#0066CC] px-2.5 py-1 text-xs font-normal transition-colors rounded-[3px] flex items-center gap-1 cursor-pointer"
        title="Compartir enlace del producto"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
        {copied ? "¡Enlace copiado! ✓" : "Compartir"}
      </button>
      <button
        type="button"
        onClick={handlePrint}
        className="border border-[#CCCCCC] hover:bg-gray-50 text-[#0066CC] px-2.5 py-1 text-xs font-normal transition-colors rounded-[3px] flex items-center gap-1 cursor-pointer"
        title="Imprimir ficha técnica"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
        </svg>
        Imprimir
      </button>
    </div>
  )
}
