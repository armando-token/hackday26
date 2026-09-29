"use client"

import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = () => {
  return (
    <div className="w-full max-w-[600px] mx-auto px-6 py-12">
      <div className="border border-[#E5E7EB] bg-white p-8 rounded-lg shadow-sm text-center">
        <div className="w-16 h-16 bg-[#FFFBEB] text-[#D97706] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border border-[#FDE68A]">
          🔒
        </div>
        <h1 className="text-[20px] font-bold text-[#111827] mb-2">
          Portal de Clientes B2B en Mantenimiento
        </h1>
        <p className="text-[14px] text-[#4B5563] leading-relaxed mb-6">
          Customer account creation and sign-in are temporarily disabled during a security configuration update.
        </p>
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded p-4 text-[13px] text-[#374151] text-left mb-6">
          <p className="font-semibold mb-1">Need to place an order or request a quote?</p>
          <ul className="list-disc pl-5 space-y-1 text-[#6B7280]">
            <li>Puede comprar o cotizar directamente como invitado desde el carrito.</li>
            <li>For immediate sales and technical support, contact us via WhatsApp or <span className="text-[#1E7E34] font-medium">ventas@controlnautas.com</span>.</li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <LocalizedClientLink
            href="/store"
            className="px-5 py-2.5 bg-[#0066CC] hover:bg-[#004C99] text-white font-medium text-[13px] rounded transition-colors"
          >
            Explorar Catalog B2B
          </LocalizedClientLink>
          <a
            href="https://wa.me/51950302141"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[#1E7E34] hover:bg-[#155D27] text-white font-medium text-[13px] rounded transition-colors flex items-center justify-center gap-1.5"
          >
            <span>💬</span> Ask via WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

export default LoginTemplate
