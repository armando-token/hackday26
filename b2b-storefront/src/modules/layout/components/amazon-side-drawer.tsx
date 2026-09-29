"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { company } from "@lib/config/company"

export default function AmazonSideDrawer({
  isOpen,
  onClose,
  categories,
}: {
  isOpen: boolean
  onClose: () => void
  categories: { name: string; href: string }[]
}) {
  const [sortedCategories] = useState(() =>
    [...categories].sort((a, b) => a.name.localeCompare(b.name, "es"))
  )

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex select-none font-[Roboto,Arial,Helvetica,sans-serif]">
      {/* 1. Dark Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/70 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Floating 'X' Close Button next to drawer top right */}
      <button
        onClick={onClose}
        className="fixed top-3 left-[375px] z-50 text-white font-bold text-3xl leading-none cursor-pointer hover:opacity-80 transition-opacity p-1"
        aria-label="Cerrar menú"
      >
        ✕
      </button>

      {/* 3. Left Side Drawer Panel */}
      <div className="fixed top-0 left-0 h-full w-[360px] sm:w-[365px] bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
        {/* Drawer Header (Amazon Dark Navy #232F3E) */}
        <LocalizedClientLink
          href="/account"
          onClick={onClose}
          className="bg-[#232F3E] text-white px-7 py-3.5 flex items-center gap-3 font-bold text-[18px] hover:bg-[#1A232E] transition-colors flex-shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <span>Hola, identifícate</span>
        </LocalizedClientLink>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto text-[14px] text-[#0F1111] py-2">
          {/* Section 1: Tendencias */}
          <div>
            <div className="text-[16px] font-bold text-[#111111] px-7 pt-3 pb-2">
              Tendencias
            </div>
            <ul>
              <li>
                <LocalizedClientLink
                  href="/store"
                  onClick={onClose}
                  className="block px-7 py-2.5 hover:bg-[#EAEDED] text-[#0F1111] transition-colors"
                >
                  Lo Más Vendido
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/store"
                  onClick={onClose}
                  className="block px-7 py-2.5 hover:bg-[#EAEDED] text-[#0F1111] transition-colors"
                >
                  Novedades y Productos Destacados
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/store"
                  onClick={onClose}
                  className="block px-7 py-2.5 hover:bg-[#EAEDED] text-[#0F1111] transition-colors"
                >
                  Catálogo Completo de Productos
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/casos-de-exito"
                  onClick={onClose}
                  className="block px-7 py-2.5 hover:bg-[#EAEDED] text-[#0F1111] transition-colors font-medium text-[#0066CC]"
                >
                  Casos de Éxito en la Industria
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          <div className="border-b border-[#E5E7EB] my-3" />

          {/* Section 2: Comprar por Categoría */}
          <div>
            <div className="text-[16px] font-bold text-[#111111] px-7 pt-1 pb-2">
              Buscar por Categoría
            </div>
            <ul>
              {sortedCategories.map((cat) => (
                <li key={cat.href}>
                  <LocalizedClientLink
                    href={cat.href}
                    onClick={onClose}
                    className="flex items-center justify-between px-7 py-2.5 hover:bg-[#EAEDED] text-[#0F1111] transition-colors group"
                  >
                    <span className="truncate pr-2">{cat.name}</span>
                    <span className="text-[#888888] group-hover:text-[#111111] text-[14px] font-bold">
                      ›
                    </span>
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-b border-[#E5E7EB] my-3" />

          {/* Section 3: Información Institucional */}
          <div>
            <div className="text-[16px] font-bold text-[#111111] px-7 pt-1 pb-2">
              Empresa y Soporte
            </div>
            <ul>
              <li>
                <LocalizedClientLink
                  href="/nosotros"
                  onClick={onClose}
                  className="block px-7 py-2.5 hover:bg-[#EAEDED] text-[#0F1111] transition-colors"
                >
                  Sobre Control Nautas
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/contacto"
                  onClick={onClose}
                  className="block px-7 py-2.5 hover:bg-[#EAEDED] text-[#0F1111] transition-colors"
                >
                  Contacto e Ingeniería
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/entregas-y-devoluciones"
                  onClick={onClose}
                  className="block px-7 py-2.5 hover:bg-[#EAEDED] text-[#0F1111] transition-colors"
                >
                  Envíos y Devoluciones
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          <div className="border-b border-[#E5E7EB] my-3" />

          {/* Section 4: Ayuda y Configuración */}
          <div className="pb-6">
            <div className="text-[16px] font-bold text-[#111111] px-7 pt-1 pb-2">
              Ayuda y Configuración
            </div>
            <ul>
              <li>
                <LocalizedClientLink
                  href="/account"
                  onClick={onClose}
                  className="block px-7 py-2.5 hover:bg-[#EAEDED] text-[#0F1111] transition-colors"
                >
                  Mi Cuenta
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/account/orders"
                  onClick={onClose}
                  className="block px-7 py-2.5 hover:bg-[#EAEDED] text-[#0F1111] transition-colors"
                >
                  Mis Pedidos
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/contacto"
                  onClick={onClose}
                  className="block px-7 py-2.5 hover:bg-[#EAEDED] text-[#0F1111] transition-colors"
                >
                  Contacto Comercial
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/casos-de-exito"
                  onClick={onClose}
                  className="block px-7 py-2.5 hover:bg-[#EAEDED] text-[#0F1111] transition-colors"
                >
                  Casos de Éxito
                </LocalizedClientLink>
              </li>
              <li>
                <a
                  href={`tel:${company.phoneE164}`}
                  onClick={onClose}
                  className="block px-7 py-2.5 hover:bg-[#EAEDED] text-blue-700 font-semibold transition-colors"
                >
                  📞 Soporte: {company.phoneDisplay}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
