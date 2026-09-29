"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import HomeRecentProducts from "@modules/home/components/home-recent-products"
import type { CatalogProduct } from "@lib/catalog/catalog-types"

type HomeCategory = {
  name: string
  slug: string
  count?: number
  img: string
}

function priceLabel(p: CatalogProduct): string {
  if (p.display?.priceLabel) return p.display.priceLabel
  const amount = p.primaryVariant?.calculatedPrice?.amount
  const currency = (p.primaryVariant?.calculatedPrice?.currencyCode || "usd").toUpperCase()
  if (amount == null) return "Request quote"
  return `${currency} ${Number(amount).toFixed(2)}`
}

export default function HomeTemplate({
  productCount,
  countryCode = "us",
  categories,
  catalogDescription,
  featuredProducts = [],
}: {
  productCount: number
  countryCode?: string
  categories: HomeCategory[]
  catalogDescription?: string
  featuredProducts?: CatalogProduct[]
}) {
  return (
    <div className="w-full bg-white font-[Arial,Helvetica,sans-serif]">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 pt-2 sm:pt-3">
        <HomeRecentProducts countryCode={countryCode} />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 pt-1 pb-8">
        {featuredProducts.length > 0 ? (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[20px] font-bold text-[#222222]">
                Hack Day demo products
              </h2>
              <LocalizedClientLink
                href="/store/automatizacion-control"
                className="text-[13px] text-[#0066CC] hover:underline font-bold"
              >
                View all ›
              </LocalizedClientLink>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {featuredProducts.map((p) => {
                const img =
                  p.thumbnail ||
                  p.images?.[0]?.url ||
                  "/demo/images/CN-X5PRIME-HE-XP5.png"
                return (
                  <LocalizedClientLink
                    key={p.handle}
                    href={`/products/${p.handle}`}
                    className="border border-[#E0E0E0] p-4 hover:border-[#0066CC] transition-colors"
                  >
                    <div className="h-[160px] flex items-center justify-center mb-3 bg-[#FAFAFA]">
                      <img
                        src={img}
                        alt={p.title}
                        className="max-h-[150px] max-w-full object-contain"
                      />
                    </div>
                    <div className="text-[11px] text-[#666] mb-1">
                      SKU {p.pim?.itemNumber || p.primaryVariant?.sku || p.handle}
                    </div>
                    <div className="text-[14px] font-bold text-[#111] leading-snug mb-2 min-h-[40px]">
                      {p.title}
                    </div>
                    <div className="text-[15px] font-bold text-[#B12704]">
                      {priceLabel(p)}
                    </div>
                  </LocalizedClientLink>
                )
              })}
            </div>
          </section>
        ) : null}

        <div className="flex items-center justify-between w-full mb-3 sm:mb-4">
          <h2 className="text-[18px] sm:text-[20px] font-bold text-[#222222]">
            {productCount} products
          </h2>
          <LocalizedClientLink
            href="/store"
            className="text-[13px] sm:text-[14px] text-[#0066CC] hover:underline font-bold flex items-center gap-1 ml-auto text-right"
          >
            <span>View all</span>
            <span>›</span>
          </LocalizedClientLink>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 mb-12">
          {categories.map((cat) => (
            <LocalizedClientLink
              key={cat.slug}
              href={`/store/${cat.slug}`}
              className="bg-white border border-[#E0E0E0] -ml-px -mt-px p-3 sm:p-4 min-h-[190px] flex flex-col items-center justify-between hover:border-[#0066CC] hover:z-10 relative transition-colors group"
            >
              <div className="w-full h-[135px] sm:h-[145px] mb-2 flex items-center justify-center overflow-hidden">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="max-h-[130px] sm:max-h-[140px] max-w-full w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <span className="text-[13px] sm:text-[14px] font-normal text-[#000000] text-center leading-snug mt-auto group-hover:text-[#0066CC] group-hover:underline">
                {cat.name}
                {cat.count != null ? (
                  <span className="block text-[11px] text-[#666] mt-1">{cat.count} products</span>
                ) : null}
              </span>
            </LocalizedClientLink>
          ))}
        </div>

        <div className="bg-[#185394] p-8 rounded-sm mb-12">
          <h2 className="text-[28px] font-bold text-white mb-2">
            Heat, control & industrial instrumentation
          </h2>
          <p className="text-[16px] text-white max-w-3xl mb-6">
            Control Nautas solutions: electric heating, heat tracing, PID controllers,
            sensors, environmental monitoring, PLC, and industrial insulation.
          </p>
          <LocalizedClientLink
            href="/store/automatizacion-control"
            className="inline-block bg-white text-[#185394] font-bold text-[14px] px-6 py-3 rounded-sm hover:bg-gray-100 transition-colors"
          >
            Browse demo catalog
          </LocalizedClientLink>
        </div>

        <p className="text-[11px] text-[#666666] leading-relaxed border-t border-[#E0E0E0] pt-6">
          {catalogDescription ||
            "Control Nautas specializes in process control, electric heating, heat tracing, industrial instrumentation, sensors, and automation."}
        </p>
      </div>
    </div>
  )
}
