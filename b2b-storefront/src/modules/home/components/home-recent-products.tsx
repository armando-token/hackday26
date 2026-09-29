"use client"

import { useEffect, useRef, useState } from "react"
import type { CatalogProduct } from "@lib/catalog/catalog-types"
import { useShellLists } from "@lib/cn-catalog"
import RecentProductCard from "@modules/home/components/recent-product-card"

export default function HomeRecentProducts({
  excludeHandle,
  countryCode = "pe",
  limit = 10,
}: {
  excludeHandle?: string
  countryCode?: string
  limit?: number
} = {}) {
  const { viewed } = useShellLists()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [products, setProducts] = useState<CatalogProduct[]>([])

  useEffect(() => {
    const handles = viewed
      .filter((h) => h !== excludeHandle)
      .slice(0, limit)

    if (!handles.length) {
      setProducts([])
      return
    }

    const controller = new AbortController()
    fetch(
      `/api/catalog/products?handles=${encodeURIComponent(handles.join(","))}&countryCode=${countryCode}`,
      { signal: controller.signal }
    )
      .then((r) => r.json())
      .then((data) => {
        const byHandle = new Map<string, CatalogProduct>(
          (data.products || []).map((p: CatalogProduct) => [p.handle, p])
        )
        setProducts(
          handles
            .map((h) => byHandle.get(h))
            .filter((p): p is CatalogProduct => Boolean(p))
        )
      })
      .catch(() => setProducts([]))

    return () => controller.abort()
  }, [viewed, excludeHandle, countryCode, limit])

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 5)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [products.length])

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: direction === "left" ? -540 : 540,
      behavior: "smooth",
    })
  }

  if (products.length === 0) return null

  return (
    <section className="w-full mb-3 sm:mb-4 select-none">
      <div className="pt-0 pb-1 mb-1.5">
        <h2 className="text-[18px] sm:text-[20px] font-bold text-[#111111] font-[Roboto,Arial,Helvetica,sans-serif]">
          Products vistos recientemente
        </h2>
      </div>

      <div className="relative border border-[#D3D2D3] bg-white group select-none">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-[#D3D2D3] shadow-md flex items-center justify-center text-black font-bold text-lg hover:bg-gray-100 transition-all opacity-90 group-hover:opacity-100 cursor-pointer"
            aria-label="Anterior"
          >
            ‹
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-[#D3D2D3] shadow-md flex items-center justify-center text-black font-bold text-lg hover:bg-gray-100 transition-all opacity-90 group-hover:opacity-100 cursor-pointer"
            aria-label="Siguiente"
          >
            ›
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex overflow-x-auto scrollbar-none scroll-smooth h-[255px]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((p) => (
            <RecentProductCard key={p.handle} product={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
