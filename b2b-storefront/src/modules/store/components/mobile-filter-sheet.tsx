"use client"

import { useEffect, useState } from "react"
import {
  type CategoryFacet,
  type FacetSelection,
  facetValueLabel,
} from "@lib/catalog/catalog-facets"
import type { ProductCollectionData } from "@modules/store/templates/leaf-category-listing"

interface MobileFilterSheetProps {
  isOpen: boolean
  onClose: () => void
  facets: CategoryFacet[]
  facetSel: FacetSelection
  onToggleFacet: (facetKey: string, value: string) => void
  onClearAll: () => void
  totalResults: number
  allCollections?: ProductCollectionData[]
}

export default function MobileFilterSheet({
  isOpen,
  onClose,
  facets,
  facetSel,
  onToggleFacet,
  onClearAll,
  totalResults,
  allCollections = [],
}: MobileFilterSheetProps) {
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({})

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

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key],
    }))
  }

  const isAccordionOpen = (key: string, defaultOpen = true) => {
    return openAccordions[key] !== undefined ? openAccordions[key] : defaultOpen
  }

  const activeFiltersCount = Object.values(facetSel).reduce(
    (acc, val) => acc + (val?.length || 0),
    0
  )

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-end justify-center font-[Arial,Helvetica,sans-serif]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-2xl max-h-[82vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#E5E5E5] bg-white sticky top-0 z-10 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-bold text-[#0F1111]">
              Filtros Técnicos
            </h2>
            {activeFiltersCount > 0 && (
              <span className="bg-[#0066CC] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-[13px] font-medium text-[#0066CC] hover:underline"
              >
                Limpiar todo
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 text-base font-bold"
              aria-label="Cerrar filtros"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Filters Body */}
        <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-[#EEEEEE]">
          {facets.map((facet, idx) => {
            const selected = facetSel[facet.key] || []
            const isOpen = isAccordionOpen(facet.key, idx < 3)

            return (
              <div key={facet.key} className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion(facet.key)}
                  className="w-full flex items-center justify-between text-left py-1"
                >
                  <span className="text-[14px] font-bold text-[#0F1111]">
                    {facet.label}
                    {selected.length > 0 && (
                      <span className="ml-1 text-[#0066CC] font-semibold text-[12px]">
                        ({selected.length})
                      </span>
                    )}
                  </span>
                  <span className="text-gray-400 text-[12px]">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-2 space-y-1 pl-1 max-h-60 overflow-y-auto">
                    {facet.options.map((opt) => {
                      const label =
                        facet.key === "group"
                          ? allCollections.find((c) => c.id === opt.value)
                              ?.title || opt.value
                          : facetValueLabel(facet.key, opt.value)
                      const isChecked = selected.includes(opt.value)

                      return (
                        <label
                          key={opt.value}
                          className="flex items-center justify-between py-2 px-1 cursor-pointer hover:bg-gray-50 rounded-sm active:bg-gray-100"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => onToggleFacet(facet.key, opt.value)}
                              className="w-5 h-5 rounded-sm accent-[#0066CC] cursor-pointer"
                            />
                            <span
                              className={`text-[13.5px] ${
                                isChecked
                                  ? "font-semibold text-[#0066CC]"
                                  : "text-[#333333]"
                              }`}
                            >
                              {label}
                            </span>
                          </div>
                          <span className="text-[12px] text-[#767676]">
                            ({opt.count})
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {facets.length === 0 && (
            <p className="text-[13px] text-gray-500 py-6 text-center">
              No hay filtros adicionales para este conjunto de productos.
            </p>
          )}
        </div>

        {/* Footer Apply Button */}
        <div className="p-3.5 border-t border-[#E5E5E5] bg-white sticky bottom-0 z-10 shadow-lg">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] border border-[#FCD200] rounded-full text-[14px] font-bold text-[#0F1111] shadow-xs flex items-center justify-center gap-2"
          >
            <span>Ver {totalResults} productos</span>
          </button>
        </div>
      </div>
    </div>
  )
}
