"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { familyImage } from "@lib/cn-catalog"
import type { CnCategoryNode } from "@lib/cn-catalog/taxonomy"

/**
 * B2B catalog hub — L1 family tiles only.
 * No Technical View dump of the entire catalog.
 */
export default function StoreTemplate({
  countryCode,
  catalogRoot,
  l1Families,
}: {
  countryCode: string
  sortBy?: string
  page?: string
  initialProducts?: unknown[]
  catalogRoot: CnCategoryNode
  l1Families: CnCategoryNode[]
}) {
  const children = [...l1Families].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  return (
    <div className="w-full bg-white font-[Arial,Helvetica,sans-serif] text-[#333] min-h-screen pb-16">
      <div className="border-b border-[#CCCCCC] bg-white">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between text-[11.5px] sm:text-[12px] text-[#666]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <LocalizedClientLink href="/" className="text-[#0066CC] hover:underline">
              Home
            </LocalizedClientLink>
            <span>/</span>
            <span className="text-[#333]">Product categories</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-3 sm:pt-6">
        <h1 className="text-[20px] sm:text-[28px] font-bold text-black mb-1">
          Product categories
        </h1>
        <p className="text-[12px] sm:text-[13px] text-[#666666] mb-2">
          {(catalogRoot.productCount ?? 0).toLocaleString()} productos industriales disponibles
        </p>
        <p className="text-[12px] sm:text-[13px] text-[#333] leading-relaxed max-w-4xl mb-6 sm:mb-8">
          {catalogRoot.description}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 border-t border-l border-[#CCCCCC] mb-10">
          {children.map((sub, idx) => (
            <LocalizedClientLink
              key={sub.slug}
              href={`/store/${sub.slug}`}
              className="flex flex-col items-center justify-between bg-white border-r border-b border-[#CCCCCC] p-4 min-h-[190px] group hover:bg-gray-50"
            >
              <div className="w-full h-[125px] sm:h-[135px] flex items-center justify-center p-1 mb-2 overflow-hidden">
                <img
                  src={sub.imageUrl || familyImage(sub.slug, idx)}
                  alt={sub.name}
                  className="max-w-full max-h-[120px] sm:max-h-[130px] w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <span className="text-[13px] sm:text-[14px] text-[#333] group-hover:text-[#0066CC] group-hover:underline text-center leading-tight mt-auto px-1 font-medium">
                {sub.name}
                {sub.productCount != null ? (
                  <span className="block text-[11px] text-[#666] mt-1">
                    {sub.productCount.toLocaleString()} productos
                  </span>
                ) : null}
                {sub.description ? (
                  <span className="block text-[11px] text-[#666] mt-1 font-normal leading-snug">
                    {sub.description}
                  </span>
                ) : null}
              </span>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Kept for imports that still reference card row — prefer TechnicalListing. */
export { TechnicalListing as TechnicalTable } from "./technical-listing"
export { HvacProductRow } from "./product-row"
