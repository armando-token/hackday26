"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { CnCategoryNode } from "@lib/cn-catalog/taxonomy"
import {
  LeafCategoryListing,
  type ProductCollectionData,
} from "@modules/store/templates/leaf-category-listing"
import SensorsHub from "@modules/store/components/sensors-hub"

export default function HvacCategoryTemplate({
  slugs,
  category,
  breadcrumbs,
  collections,
  aggregateCount,
}: {
  slugs: string[]
  category: CnCategoryNode
  breadcrumbs: CnCategoryNode[]
  collections: ProductCollectionData[]
  aggregateCount: number
}) {

  const isSensorsHub = slugs.length === 1 && slugs[0] === "sensores-transmisores"

  return (
    <div className="w-full bg-white font-[Arial,Helvetica,sans-serif] text-[#333] min-h-screen pb-16">
      {/* Top Breadcrumbs */}
      <div className="border-b border-[#CCCCCC]">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-2.5 sm:py-3 text-[11.5px] sm:text-[12px] text-[#666] flex flex-wrap gap-1.5">
          <LocalizedClientLink
            href="/store"
            className="text-[#0066CC] hover:underline"
          >
            Categorías de producto
          </LocalizedClientLink>
          {breadcrumbs.map((crumb, idx) => (
            <span key={crumb.slug} className="flex items-center gap-1.5">
              <span>/</span>
              {idx < breadcrumbs.length - 1 ? (
                <LocalizedClientLink
                  href={`/store/${breadcrumbs
                    .slice(0, idx + 1)
                    .map((c) => c.slug)
                    .join("/")}`}
                  className="text-[#0066CC] hover:underline"
                >
                  {crumb.name}
                </LocalizedClientLink>
              ) : (
                <span className="text-[#333]">{crumb.name}</span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 pt-3 sm:pt-6">
        {isSensorsHub ? (
          <SensorsHub category={category} />
        ) : (
          <>
            <h1 className="text-[20px] sm:text-[28px] font-bold mb-1 text-[#0F1111]">
              {category.name}
            </h1>
            <p className="text-[12px] sm:text-[13px] text-[#666] mb-3 sm:mb-4">
              Disponibles {aggregateCount} productos industriales
            </p>

            {collections.length === 0 ? (
              <p className="text-[14px] text-[#666] py-8">
                Aún no hay productos en esta categoría.
              </p>
            ) : (
              <LeafCategoryListing
                collections={collections}
                categoryDescription={category.description}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
