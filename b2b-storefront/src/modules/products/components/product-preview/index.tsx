import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="block group mb-3">
      <div 
        data-testid="product-wrapper" 
        className="bg-white border border-[#CCCCCC] p-4 flex gap-4 md:gap-6 items-center rounded-none shadow-none"
      >
        {/* Left: Product Thumbnail with right border and 130px exact sizing on desktop */}
        <div className="flex-shrink-0 w-24 h-24 md:w-[130px] md:h-[130px] flex items-center justify-center bg-white pr-3 md:pr-4 border-r border-[#CCCCCC]">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="square"
            isFeatured={isFeatured}
          />
        </div>

        {/* Right: Product Info */}
        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            {/* Title - Link Blue */}
            <h3 className="text-[#0066CC] font-bold text-[14px] leading-snug group-hover:underline mb-1" data-testid="product-title">
              {product.title}
            </h3>
            
            {/* Item details */}
            <div className="text-[12px] text-[#666666] flex flex-wrap gap-x-4 gap-y-1 mb-2 font-normal">
              <span>Item <span className="font-bold text-[#333333]">#{product.variants?.[0]?.sku || (product.metadata?.item_number as string)}</span></span>
              <span>Modelo fab. <span className="font-bold text-[#333333]">#{(product.metadata?.mfr_model as string) || "N/A"}</span></span>
            </div>

            {/* Mock ratings */}
            <div className="flex items-center text-xs text-yellow-500 gap-1.5 mb-1 font-bold">
              <span>★★★★★</span>
              <span className="text-gray-400 font-normal text-[11px]">(4.8)</span>
            </div>

            {/* In stock indicator */}
            <div className="text-xs text-[#1E7E34] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E7E34]"></span>
              En stock
            </div>
          </div>

          {/* Pricing & See Details */}
          <div className="flex flex-col items-start md:items-end justify-center min-w-[150px] gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-[#CCCCCC]">
            {cheapestPrice ? (
              <div className="text-[#1E7E34] font-bold text-[18px] md:text-right">
                <PreviewPrice price={cheapestPrice} />
                <span className="text-[11px] text-[#666666] font-normal block mt-0.5">/ unidad</span>
                <span className="text-[11px] font-semibold text-[#1E7E34] block mt-0.5">
                  ✓ Entrega Inmediata
                </span>
              </div>
            ) : (
              <div className="text-[13px] font-bold text-[#666666] md:text-right">
                Sign in to see price
                <span className="text-[11px] font-semibold text-[#555555] block mt-1">
                  ⏳ Import lead time
                </span>
              </div>
            )}
            
            <span className="bg-[#CC0000] text-white text-[12px] font-bold px-4 py-2 rounded-none hover:bg-[#C8102E] transition-colors uppercase mt-1 select-none text-center">
              Ver Detalles
            </span>
          </div>
        </div>

      </div>
    </LocalizedClientLink>
  )
}
