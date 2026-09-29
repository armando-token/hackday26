"use client"

import React, { useEffect, useRef, useState } from "react"

type AltchaProps = {
  name?: string
  challengeUrl?: string
  auto?: "onload" | "onfocus" | "onsubmit"
  onStateChange?: (state: string) => void
  className?: string
}

export default function AltchaWidget({
  name = "altcha",
  challengeUrl = "/api/altcha/challenge",
  auto,
  onStateChange,
  className = "w-full my-3",
}: AltchaProps) {
  const widgetRef = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // @ts-ignore
    import("altcha")
      .then(() => {
        setMounted(true)
      })
      .catch((err) => {
        console.error("Error loading Altcha script:", err)
      })
  }, [])

  useEffect(() => {
    const el = widgetRef.current
    if (!el || !onStateChange) return

    const handleStateChange = (ev: Event) => {
      const customEv = ev as CustomEvent<{ state: string }>
      if (customEv.detail?.state) {
        onStateChange(customEv.detail.state)
      }
    }

    el.addEventListener("statechange", handleStateChange)
    return () => {
      el.removeEventListener("statechange", handleStateChange)
    }
  }, [mounted, onStateChange])

  const spanishStrings = JSON.stringify({
    label: "Verificación de seguridad anti-bot",
    verifying: "Verificando...",
    verified: "Verificación completada ✓",
    error: "Error de verificación. Reintentar",
    expired: "Verificación expirada. Reintentar",
    waitAlert: "Por favor espera mientras se verifica...",
    footer: "Protegido por Altcha (PoW)",
  })

  if (!mounted) {
    return (
      <div className={`p-3 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-neutral-500 flex items-center gap-2 ${className}`}>
        <span className="w-3 h-3 border-2 border-[#131921] border-t-transparent rounded-full animate-spin"></span>
        Cargando verificación de seguridad...
      </div>
    )
  }

  return (
    <div className={className}>
      {React.createElement("altcha-widget", {
        ref: widgetRef,
        challengeurl: challengeUrl,
        name: name,
        auto: auto,
        strings: spanishStrings,
        hidelogo: "true",
        style: {
          "--altcha-max-width": "100%",
          "--altcha-border-radius": "6px",
          "--altcha-color-base": "#131921",
          "--altcha-color-border": "#E5E7EB",
          "--altcha-color-bg": "#F9FAFB",
        },
      })}
    </div>
  )
}
