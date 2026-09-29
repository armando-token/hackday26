"use client"

import React, { useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { company } from "@lib/config/company"

// Mensajes claros y directos con alta legibilidad
const B2B_MESSAGES_POOL = [
  "¿Cotización con RUC? 📄",
  "¡Asesoría técnica inmediata! ⚙️",
  "Stock para entrega hoy 🚚",
  "¿Dudas con tu proyecto? 💡",
  "Envíos a todo el Perú 📦",
  "Descuentos por volumen 💼",
  "Factura y Guía SUNAT 📑",
  "¿Ficha técnica de equipos? 📋",
  "Chatea con un ingeniero 💬",
  "Precios de distribuidor 🏷️",
]

const WA_ASSIGNED_KEY = "cn_wa_assigned"

export default function WhatsAppFloatingLauncher() {
  const pathname = usePathname()
  const [msgIndex, setMsgIndex] = useState(0)
  const [showMsg, setShowMsg] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Determinar el contexto de navegación para el mensaje pre-llenado
  const getContextMessage = useCallback(() => {
    if (!pathname) return "Hola Control Nautas! Deseo consultar sobre suministros industriales."

    if (pathname.includes("/products/")) {
      const slug = pathname.split("/products/")[1]?.split("?")[0] || ""
      const cleanSlug = slug.replace(/-/g, " ")
      return `Hola Control Nautas! Me interesa cotizar el producto: ${cleanSlug}. ¿Tienen stock y entrega inmediata?`
    }

    if (pathname.includes("/cart")) {
      return "Hola Control Nautas! Tengo productos en mi carrito y deseo coordinar la cotización formal y despacho."
    }

    if (pathname.includes("/checkout")) {
      return "Hola Control Nautas! Estoy en el proceso de checkout y requiero asistencia para validar mi pedido / Factura Electrónica."
    }

    if (pathname.includes("/categories/") || pathname.includes("/store")) {
      const cat = pathname.split("/store/")[1]?.split("?")[0] || pathname.split("/categories/")[1]?.split("?")[0] || "catálogo"
      const cleanCat = cat.replace(/-/g, " ")
      return `Hola Control Nautas! Estoy revisando la sección de ${cleanCat} y requiero asesoría técnica para un proyecto.`
    }

    if (pathname.includes("/casos-de-exito")) {
      return "Hola Control Nautas! Estuve revisando sus casos de éxito y deseo consultar una solución técnica similar para mi empresa."
    }

    if (pathname.includes("/contacto")) {
      return "Hola Control Nautas! Deseo comunicarme con el área de ventas y proyectos."
    }

    return "Hola Control Nautas! Deseo información y cotización de equipos de instrumentación y automatización industrial."
  }, [pathname])

  // Obtener número con soporte para rotación y stickiness
  const getWhatsAppNumber = useCallback(() => {
    const defaultNumber = company.whatsappNumber || "51950302141"
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(WA_ASSIGNED_KEY)
        if (stored) return stored
        localStorage.setItem(WA_ASSIGNED_KEY, defaultNumber)
      }
    } catch (_) {}
    return defaultNumber
  }, [])

  // Disparar apertura de WhatsApp con tracking de Analytics
  const handleOpenWhatsApp = useCallback((customMsg?: string) => {
    const waNumber = getWhatsAppNumber()
    const finalMsg = customMsg || getContextMessage()

    // Tracking GTM / GA4 / Ads
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      ;(window as any).dataLayer.push({
        event: "whatsapp_click",
        whatsapp_source: "floating_launcher",
        page_path: pathname,
        currency: "PEN",
        value: 1,
      })
    }

    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(finalMsg)}`
    window.open(waUrl, "_blank", "noopener,noreferrer")
    setUnreadCount(0)
    setShowMsg(false)
  }, [getContextMessage, getWhatsAppNumber, pathname])

  // Escuchar eventos globales de otros componentes para abrir el chat
  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).triggerWhatsAppChat = (data: any) => {
        if (typeof data === "string") {
          handleOpenWhatsApp(data)
        } else if (data && data.message) {
          handleOpenWhatsApp(data.message)
        } else if (data && data.itemName) {
          const msg = `Hola Control Nautas! Me interesa cotizar: ${data.itemName}${data.itemModel ? ` (Modelo: ${data.itemModel})` : ""}.`
          handleOpenWhatsApp(msg)
        } else {
          handleOpenWhatsApp()
        }
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).triggerWhatsAppChat
      }
    }
  }, [handleOpenWhatsApp])

  // Ciclo temporizado de mensajes emergentes breves
  useEffect(() => {
    let currentIndex = 0

    // Primer mensaje tras 3 segundos de carga
    const initialTimeout = setTimeout(() => {
      setShowMsg(true)
      setTimeout(() => {
        setShowMsg(false)
        setUnreadCount((prev) => Math.min(prev + 1, 9))
        currentIndex = (currentIndex + 1) % B2B_MESSAGES_POOL.length
        setMsgIndex(currentIndex)
      }, 6000) // Visible por 6s
    }, 3000)

    // Intervalo continuo cada 10 segundos
    const intervalId = setInterval(() => {
      setShowMsg(true)
      setTimeout(() => {
        setShowMsg(false)
        setUnreadCount((prev) => Math.min(prev + 1, 9))
        currentIndex = (currentIndex + 1) % B2B_MESSAGES_POOL.length
        setMsgIndex(currentIndex)
      }, 6000)
    }, 10000)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(intervalId)
    }
  }, [])

  return (
    <aside
      aria-label="Soporte por WhatsApp"
      className="fixed bottom-2.5 right-3 sm:bottom-4 sm:right-5 z-[99999] flex items-center justify-end pointer-events-none font-[Roboto,Arial,sans-serif]"
    >
      {/* Globo Emergente de Mensaje B2B con Mayor Legibilidad */}
      <div
        onClick={() => handleOpenWhatsApp()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        aria-hidden={!showMsg}
        className={`cn-popout-bubble absolute right-[76px] sm:right-[84px] bottom-1.5 pointer-events-auto cursor-pointer select-none bg-[#131921]/95 backdrop-blur-xs text-white border-2 border-[#25D366] px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.35)] transition-all duration-300 transform origin-right flex items-center gap-2 ${
          showMsg || isHovered
            ? "opacity-100 scale-100 translate-x-0"
            : "opacity-0 scale-90 translate-x-4 pointer-events-none"
        }`}
        style={{
          maxWidth: "calc(100vw - 95px)",
        }}
      >
        <span className="text-[14px] sm:text-[15px] font-bold text-white tracking-normal whitespace-nowrap leading-tight">
          {B2B_MESSAGES_POOL[msgIndex]}
        </span>

        {/* Puntero triangular derecho hacia el botón */}
        <div
          className="absolute top-1/2 -right-[8px] -translate-y-1/2 w-0 h-0"
          style={{
            borderTop: "7px solid transparent",
            borderBottom: "7px solid transparent",
            borderLeft: "8px solid #25D366",
          }}
        />
      </div>

      {/* Botón Circular Pulsante de WhatsApp (Más Grande y Ergonómico) */}
      <button
        onClick={() => handleOpenWhatsApp()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Consultar por WhatsApp a Control Nautas"
        className="cn-wa-launcher relative pointer-events-auto w-[64px] h-[64px] sm:w-[70px] sm:h-[70px] rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center shadow-[0_10px_28px_rgba(37,211,102,0.4)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      >
        {/* Ícono de WhatsApp SVG Oficial */}
        <svg
          className="w-9 h-9 sm:w-10 sm:h-10 fill-current relative z-10"
          viewBox="0 0 24 24"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>

        {/* Badge Rojo de Notificaciones / Mensajes No Leídos */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 z-20 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-[#D32F2F] text-white text-[11px] sm:text-[12px] font-black rounded-full border-2 border-white shadow-md animate-bounce">
            {unreadCount}
          </span>
        )}

        {/* Anillo de Onda Expansiva Radar Ping */}
        <span className="cn-radar-ring absolute inset-0 rounded-full bg-[#25D366] pointer-events-none z-0" />
      </button>

      {/* Estilos Keyframes de Animaciones */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes cnRadarPing {
            0% {
              transform: scale(1);
              opacity: 0.75;
            }
            70%, 100% {
              transform: scale(1.6);
              opacity: 0;
            }
          }
          .cn-radar-ring {
            animation: cnRadarPing 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          @keyframes cnPulseSlow {
            0%, 100% {
              box-shadow: 0 10px 28px rgba(0,0,0,0.25);
            }
            50% {
              box-shadow: 0 10px 32px rgba(37, 211, 102, 0.55);
            }
          }
          .cn-wa-launcher {
            animation: cnPulseSlow 2.8s infinite ease-in-out;
          }
        `,
        }}
      />
    </aside>
  )
}
