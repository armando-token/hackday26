"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { formatPrice, useShellCart } from "@lib/cn-catalog"

export default function ShellCartButton({
  className = "flex items-center gap-1 p-1 text-white hover:outline hover:outline-1 hover:outline-white cursor-pointer select-none rounded-sm",
  showText = false,
}: {
  className?: string
  showText?: boolean
}) {
  const { itemCount, subtotal, getResolvedLines } = useShellCart()
  const lines = getResolvedLines()

  return (
    <div className="relative group flex items-center select-none" style={{ fontFamily: 'Roboto, Arial, Helvetica, sans-serif' }}>
      <LocalizedClientLink href="/cart" className={className}>
        <div className="relative inline-flex items-center justify-center min-w-[38px] h-[30px]">
          <span className="absolute top-[2px] right-[13px] text-[#F08804] font-bold text-[13px] leading-none z-10 select-none">
            {itemCount}
          </span>
          <svg
            className="w-[38px] h-[30px] text-white flex-shrink-0"
            viewBox="0 0 38 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 4h5l3.6 14h18.4l3.5-10H10" />
            <circle cx="14" cy="24" r="1.8" fill="currentColor" />
            <circle cx="27" cy="24" r="1.8" fill="currentColor" />
          </svg>
        </div>
        {showText && (
          <span className="text-[14px] font-bold text-white leading-tight ml-1">
            Cart
          </span>
        )}
      </LocalizedClientLink>

      <div className="hidden group-hover:block absolute right-0 top-full z-50 w-[320px] bg-white border border-[#CCCCCC] shadow-lg text-[#333]">
        <div className="p-3 border-b border-[#CCCCCC] font-bold text-[13px]">
          Cart ({itemCount})
        </div>
        {lines.length === 0 ? (
          <div className="p-4 text-[13px] text-[#666]">Your cart is empty.</div>
        ) : (
          <ul className="max-h-64 overflow-y-auto">
            {lines.slice(0, 5).map((line) => (
              <li
                key={line.variantId}
                className="flex gap-3 p-3 border-b border-[#EEE] text-[12px]"
              >
                <img
                  src={line.image}
                  alt=""
                  className="w-12 h-12 object-contain"
                />
                <div className="flex-1">
                  <div className="font-bold text-[#00739E] line-clamp-2">
                    {line.title}
                  </div>
                  <div className="text-[#666]">
                    Qty {line.quantity} · {line.priceLabel}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="p-3 flex items-center justify-between">
          <span className="text-[13px] font-bold">
            Subtotal {formatPrice(subtotal)}
          </span>
          <LocalizedClientLink
            href="/cart"
            className="bg-[#C8102E] text-white text-[12px] font-bold px-3 py-2"
          >
            Ver carrito
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
