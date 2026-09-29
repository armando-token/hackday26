"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { formatPrice, type CnProduct } from "@lib/cn-catalog"

export function HvacProductRow({ product }: { product: CnProduct }) {
  const img = product.images?.[0] || product.image || ""
  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="block group">
      <div className="bg-white border border-[#CCCCCC] p-4 flex gap-4 items-center">
        <div className="w-24 h-24 flex items-center justify-center border-r border-[#CCCCCC] pr-3">
          <img src={img} alt={product.title} className="max-w-full max-h-full object-contain" loading="lazy" />
        </div>
        <div className="flex-1">
          <div className="text-[11px] text-[#666] font-bold">{product.brand}</div>
          <h3 className="text-[#0066CC] font-bold text-[14px] group-hover:underline">{product.title}</h3>
          <div className="text-[12px] text-[#666]">
            Ítem <b>#{product.itemNumber}</b> · Fab. <b>#{product.mfrModel}</b>
          </div>
        </div>
        <div className="text-[#1E7E34] font-bold text-[18px]">
          {formatPrice(product.price, product.priceMode)}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
