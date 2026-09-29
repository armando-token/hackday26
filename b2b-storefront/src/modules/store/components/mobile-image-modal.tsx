"use client"

import { useEffect } from "react"

interface MobileImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  title: string
  brand?: string
  mfrModel?: string
  price?: number
  priceMode?: "fixed" | "quote"
}

export default function MobileImageModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  brand,
  mfrModel,
  price,
  priceMode,
}: MobileImageModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:bg-white text-lg font-bold"
          aria-label="Cerrar"
        >
          ✕
        </button>

        {/* Image Container */}
        <div className="w-full h-[280px] bg-white p-4 flex items-center justify-center border-b border-gray-100">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Product Details Header */}
        <div className="p-4 flex flex-col gap-1 bg-[#FAFAFA]">
          {brand && (
            <span className="text-[11px] font-bold text-[#565959] uppercase tracking-wider">
              {brand} {mfrModel ? `· Mod. ${mfrModel}` : ""}
            </span>
          )}
          <h3 className="text-[14px] font-semibold text-[#0F1111] leading-tight line-clamp-2">
            {title}
          </h3>
          {priceMode === "fixed" && price && price > 0 ? (
            <div className="text-[17px] font-bold text-[#1E7E34] mt-1">
              S/ {price.toFixed(2)}
            </div>
          ) : (
            <div className="text-[13px] font-semibold text-[#0066CC] mt-1">
              💼 Modalidad de Quote B2B
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
