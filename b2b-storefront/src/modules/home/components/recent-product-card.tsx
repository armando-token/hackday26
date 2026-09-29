"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { CatalogProduct } from "@lib/catalog/catalog-types"
import { getCatalogImageUrls, toShellCartLine } from "@lib/catalog/catalog-present"
import { useShellCart } from "@lib/cn-catalog"

export default function RecentProductCard({
  product,
}: {
  product: CatalogProduct
}) {
  const { addItem } = useShellCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const isQuote = product.display.requiresQuote

  const whatsappHref = `https://wa.me/51950302141?text=${encodeURIComponent(
    `Hello Control Nautas, please quote this product:\n\n*${product.title}*\nItem #: ${product.pim.itemNumber}\nModelo fab.: ${product.pim.mfrModel || "N/A"}`
  )}`

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!product.display.canAddToCart) return
    addItem(toShellCartLine(product, qty))
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const imageSrc = getCatalogImageUrls(product)[0] || "/placeholder.png"

  return (
    <article className="relative flex-shrink-0 w-[275px] h-[255px] bg-white border-r border-[#D3D2D3] last:border-r-0 overflow-hidden font-['Roboto',Arial,Helvetica,sans-serif] select-none">
      <div className="absolute top-[27px] left-[25px] w-[58px] h-[58px] flex items-center justify-center">
        <img
          src={imageSrc}
          alt={product.title}
          className="block w-auto h-auto max-w-[52px] max-h-[52px] object-contain object-center"
          loading="lazy"
        />
      </div>

      <div className="absolute top-[27px] left-[89px] right-[25px] min-w-0">
        <div className="h-[14px] m-0 overflow-hidden text-[#000000] text-[12px] font-bold leading-[14px] whitespace-nowrap truncate">
          {product.brand?.name || "CONTROL NAUTAS"}
        </div>

        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="block h-[54px] mt-[6px] overflow-hidden text-[#266694] hover:text-[#266694] focus:text-[#266694] no-underline hover:no-underline text-[14px] font-bold leading-[18px] line-clamp-3"
          title={product.title}
        >
          {product.title}
        </LocalizedClientLink>

        <div className="h-[18px] mt-[6px] overflow-hidden text-[#686B72] text-[14px] font-normal leading-[18px] whitespace-nowrap">
          <span>Item #</span>
          <strong className="ml-[3px] text-[#000000] text-[14px] font-bold">
            {product.pim.itemNumber}
          </strong>
        </div>

        <div className="mt-[15px]">
          <div className="h-[18px] flex items-center text-[#686B72] text-[14px] font-normal leading-[18px]">
            <span>Price</span>
          </div>
          <div className="h-[22px] mt-[1px] flex items-baseline whitespace-nowrap">
            <strong className="text-[#1F7226] text-[16px] font-bold leading-[22px]">
              {product.display.priceLabel}
            </strong>
            {!isQuote && (
              <span className="ml-[4px] text-[#686B72] text-[12px] font-normal leading-[18px]">
                / unidad
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute left-[25px] right-[27px] bottom-[25px] h-[40px] flex items-stretch gap-[11px]"
        onClick={(e) => e.stopPropagation()}
      >
        {!isQuote && (
          <label className="relative w-[56px] h-[40px] flex-shrink-0 border border-[#686B72] bg-white block">
            <span className="absolute -top-[8px] left-1/2 -translate-x-1/2 z-10 px-[3px] bg-white text-[#686B72] text-[11px] font-bold leading-[14px] whitespace-nowrap select-none">
              Qty
            </span>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) =>
                setQty(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-full h-full m-0 pt-[3px] border-0 outline-none bg-transparent text-[#000000] text-[14px] font-normal text-center leading-[38px] appearance-none"
              aria-label="Quantity"
            />
          </label>
        )}

        {isQuote ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="h-[40px] min-w-0 flex-1 m-0 px-[10px] border-2 border-[#B9002E] rounded-[3px] bg-white text-[#B9002E] hover:bg-[#B9002E] hover:text-white text-[14px] font-bold leading-[36px] text-center whitespace-nowrap cursor-pointer transition-colors flex items-center justify-center no-underline"
          >
            Quote
          </a>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            disabled={!product.display.canAddToCart}
            className="h-[40px] min-w-0 flex-1 m-0 px-[10px] border-2 border-[#B9002E] rounded-[3px] bg-white text-[#B9002E] hover:bg-[#B9002E] hover:text-white disabled:opacity-50 text-[14px] font-bold leading-[36px] text-center whitespace-nowrap cursor-pointer transition-colors flex items-center justify-center"
          >
            {added ? "Added ✓" : "Add to cart"}
          </button>
        )}
      </div>
    </article>
  )
}
