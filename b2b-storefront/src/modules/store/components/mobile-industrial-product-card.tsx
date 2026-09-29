"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { CatalogProduct } from "@lib/catalog/catalog-types"
import { getCatalogImageUrls, toShellCartLine } from "@lib/catalog/catalog-present"
import { useShellCart } from "@lib/cn-catalog"
import MobileImageModal from "./mobile-image-modal"

interface MobileProductCardProps {
  product: CatalogProduct
  calculatePricePerM2?: (product: CatalogProduct) => string | null
}

export default function MobileIndustrialProductCard({
  product,
  calculatePricePerM2,
}: MobileProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const { addItem } = useShellCart()

  const imageUrl =
    product.thumbnail ||
    getCatalogImageUrls(product)[0] ||
    "/cn-media/categories/calefaccion-electrica.webp"

  const secondaryPrice = calculatePricePerM2 ? calculatePricePerM2(product) : null
  const priceAmount = product.display.price?.amount ?? 0

  // Extract up to 2 key engineering specifications
  const specEntries = Object.entries(product.pim.specs || {})
    .filter(([k, v]) => Boolean(v && v.trim() && !/garant[ií]a|c[oó]digo|marca/i.test(k)))
    .slice(0, 2)

  const handleActionClick = (e: React.MouseEvent) => {
    if (!product.display.requiresQuote && priceAmount > 0) {
      e.preventDefault()
      e.stopPropagation()
      addItem(toShellCartLine(product, 1))
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 1400)
    }
  }

  // Determine availability status
  const isBackorder = product.display.availability === "backorder"
  const isMadeToOrder = product.display.availability === "made_to_order"
  const isInStock = product.display.availability === "in_stock"

  return (
    <>
      <div className="w-full bg-white border-b border-[#E5E5E5] p-2.5 sm:p-3 flex flex-row gap-2.5 items-stretch transition-colors hover:bg-[#FAFAFA]">
        {/* Left Column: 130px Image Container */}
        <div className="w-[125px] sm:w-[135px] min-w-[125px] sm:min-w-[135px] h-[135px] sm:h-[145px] relative bg-white p-1 flex items-center justify-center flex-shrink-0 self-start">
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            className="w-full h-full flex items-center justify-center"
          >
            <img
              src={imageUrl}
              alt={product.title}
              loading="lazy"
              className="max-h-full max-w-full object-contain"
            />
          </LocalizedClientLink>

          {/* Availability Badge in Corner */}
          <div className="absolute top-1 left-1 z-1">
            {isInStock && (
              <span className="bg-[#EBF7EE] text-[#1E7E34] border border-[#C3E6CB] text-[9.5px] font-bold px-1.5 py-0.5 rounded-xs leading-none inline-block">
                ● En stock
              </span>
            )}
            {isBackorder && (
              <span className="bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] text-[9.5px] font-bold px-1.5 py-0.5 rounded-xs leading-none inline-block">
                ⏳ A pedido
              </span>
            )}
            {isMadeToOrder && (
              <span className="bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] text-[9.5px] font-bold px-1.5 py-0.5 rounded-xs leading-none inline-block">
                ● A medida
              </span>
            )}
          </div>

          {/* Quick Zoom Lupa Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsModalOpen(true)
            }}
            className="absolute bottom-1 right-1 w-6 h-6 bg-white/90 hover:bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 shadow-xs cursor-pointer z-2"
            aria-label="Ver imagen ampliada"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
        </div>

        {/* Right Column: Technical & Commercial Body */}
        <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
          <div>
            {/* Brand + Manufacturer Model */}
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#565959] uppercase tracking-wide truncate mb-0.5">
              <span>{product.brand?.name || "Control Nautas"}</span>
              {product.pim.mfrModel && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-[#333] font-semibold lowercase first-letter:uppercase">
                    Mod. {product.pim.mfrModel}
                  </span>
                </>
              )}
            </div>

            {/* Product Title (2 lines max, legible 13.5px) */}
            <LocalizedClientLink
              href={`/products/${product.handle}`}
              className="text-[13.5px] font-semibold text-[#0F1111] leading-[1.25] line-clamp-2 hover:text-[#0066CC] transition-colors"
            >
              {product.title}
            </LocalizedClientLink>

            {/* Key Specs Snippet (if available) */}
            {specEntries.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-[#555555] leading-tight line-clamp-1">
                {specEntries.map(([k, v], idx) => (
                  <span key={k}>
                    <strong className="font-semibold text-gray-700">{k}:</strong> {v}
                    {idx < specEntries.length - 1 ? " · " : ""}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & CTA Section */}
          <div className="mt-1.5 pt-1 border-t border-gray-100">
            <div className="flex items-baseline justify-between gap-1 mb-1">
              {!product.display.requiresQuote && priceAmount > 0 ? (
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[16px] sm:text-[17px] font-bold text-[#0F1111] leading-none">
                      {product.display.priceLabel}
                    </span>
                  </div>
                  {secondaryPrice && (
                    <span className="text-[10px] text-[#1E7E34] font-medium mt-0.5">
                      {secondaryPrice}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#0066CC] leading-tight">
                    Consultar Precio B2B
                  </span>
                  <span className="text-[10.5px] text-[#666666]">
                    Cotización formal con IGV
                  </span>
                </div>
              )}
            </div>

            {/* Amazon-Style Action Button (Yellow / Gold) */}
            {!product.display.requiresQuote && priceAmount > 0 ? (
              <button
                type="button"
                onClick={handleActionClick}
                className={`w-full py-1.5 px-3 rounded-full text-[12.5px] font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                  isAdded
                    ? "bg-[#1E7E34] text-white border border-[#1E7E34]"
                    : "bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] border border-[#FCD200] text-[#0F1111]"
                }`}
              >
                {isAdded ? (
                  <>✓ Añadido a Cotización</>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Añadir a Cotización
                  </>
                )}
              </button>
            ) : (
              <LocalizedClientLink
                href={`/products/${product.handle}`}
                className="w-full py-1.5 px-3 rounded-full text-[12.5px] font-semibold bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] border border-[#FCD200] text-[#0F1111] flex items-center justify-center gap-1.5 shadow-xs transition-all text-center"
              >
                <span>Solicitar Cotización RFQ →</span>
              </LocalizedClientLink>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <MobileImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={imageUrl}
        title={product.title}
        brand={product.brand?.name ?? ""}
        mfrModel={product.pim.mfrModel ?? ""}
        price={priceAmount}
        priceMode={product.display.requiresQuote ? "quote" : "fixed"}
      />
    </>
  )
}
