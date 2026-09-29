"use client"

import { useEffect } from "react"

interface MobileSortSheetProps {
  isOpen: boolean
  onClose: () => void
  currentSort: string
  onSelectSort: (sortKey: string) => void
}

const SORT_OPTIONS = [
  { value: "default", label: "Destacados (Technical relevance)" },
  { value: "price_asc", label: "Price: de menor a mayor (S/)" },
  { value: "price_desc", label: "Price: de mayor a menor (S/)" },
  { value: "name", label: "Nombre / Modelo (A – Z)" },
]

export default function MobileSortSheet({
  isOpen,
  onClose,
  currentSort,
  onSelectSort,
}: MobileSortSheetProps) {
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
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-end justify-center font-[Arial,Helvetica,sans-serif]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-2xl flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-250 pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#E5E5E5] bg-white rounded-t-2xl">
          <h2 className="text-[16px] font-bold text-[#0F1111]">
            Ordenar Products
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 text-base font-bold"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Radio Options List */}
        <div className="px-4 py-2 divide-y divide-[#EEEEEE]">
          {SORT_OPTIONS.map((opt) => {
            const isSelected = currentSort === opt.value

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onSelectSort(opt.value)
                  onClose()
                }}
                className={`w-full py-3.5 px-2 flex items-center justify-between text-left transition-colors cursor-pointer ${
                  isSelected ? "bg-blue-50/60 font-bold" : "hover:bg-gray-50"
                }`}
              >
                <span
                  className={`text-[14px] ${
                    isSelected ? "text-[#0066CC] font-bold" : "text-[#0F1111]"
                  }`}
                >
                  {opt.label}
                </span>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected
                      ? "border-[#0066CC] bg-[#0066CC]"
                      : "border-gray-400 bg-white"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
