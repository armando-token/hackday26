"use client"

import React from "react"
import { company } from "@lib/config/company"

interface WhatsAppProductCTAProps {
  itemId?: string
  itemName?: string
  itemBrand?: string
  itemCategory?: string
  itemModel?: string
  itemUrl?: string
  ctaLocation?: "product_detail" | "cart" | "floating" | "contact" | "case_study"
  className?: string
  variant?: "primary" | "secondary" | "outline" | "floating"
  customText?: string
}

export default function WhatsAppProductCTA({
  itemId = "",
  itemName = "",
  itemBrand = "",
  itemCategory = "",
  itemModel = "",
  itemUrl = "",
  ctaLocation = "product_detail",
  className = "",
  variant = "primary",
  customText,
}: WhatsAppProductCTAProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      // 1. DataLayer event push para GTM / GA4 / Google Ads (sin bloquear la navegación)
      if (typeof window !== "undefined" && (window as any).dataLayer) {
        ;(window as any).dataLayer.push({
          event: "whatsapp_product_click",
          lead_channel: "whatsapp",
          cta_location: ctaLocation,
          item_id: itemId || undefined,
          item_name: itemName || undefined,
          item_brand: itemBrand || undefined,
          item_category: itemCategory || undefined,
          currency: company.currency,
          value: 1,
        })
      }
    } catch (err) {
      console.warn("Analytics event tracking warning:", err)
    }
  }

  // Build pre-filled message
  let message = `Hola Control Nautas.`
  if (itemName) {
    message += ` Deseo cotizar/asesoría técnica para el equipo: ${itemName}`
    if (itemModel) {
      message += ` (Modelo: ${itemModel})`
    }
    if (itemUrl) {
      message += ` - Enlace: ${itemUrl}`
    }
  } else {
    message += ` Deseo contactar con un ingeniero de ventas de Control Nautas.`
  }

  const whatsappHref = `https://wa.me/${company.whatsappNumber}?text=${encodeURIComponent(message)}`

  // Default button styles based on variant
  let buttonStyle = "inline-flex items-center justify-center font-medium transition-all duration-150 rounded"
  if (variant === "primary") {
    buttonStyle += " bg-[#25D366] hover:bg-[#1EBE5D] text-white px-5 py-3 text-sm shadow-sm font-semibold gap-2"
  } else if (variant === "outline") {
    buttonStyle += " border-2 border-[#25D366] text-[#1EBE5D] hover:bg-[#25D366]/10 px-4 py-2 text-sm font-medium gap-2"
  } else if (variant === "secondary") {
    buttonStyle += " bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 text-xs font-semibold gap-2"
  } else if (variant === "floating") {
    buttonStyle +=
      " fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#1EBE5D] text-white p-4 rounded-full shadow-2xl transition-transform transform hover:scale-105 flex items-center justify-center"
  }

  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`${buttonStyle} ${className}`}
      aria-label="Contactar por WhatsApp a Control Nautas"
      id={`wa-cta-${ctaLocation}-${itemId || 'general'}`}
    >
      <svg
        className="w-5 h-5 flex-shrink-0"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
      <span>{customText || "Consultar por WhatsApp"}</span>
    </a>
  )
}
