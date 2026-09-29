"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import HomeRecentProducts from "@modules/home/components/home-recent-products"

type HomeCategory = {
  name: string
  slug: string
  count?: number
  img: string
}

export default function HomeTemplate({
  productCount,
  countryCode = "pe",
  categories,
  catalogDescription,
}: {
  productCount: number
  countryCode?: string
  categories: HomeCategory[]
  catalogDescription?: string
}) {
  return (
    <div className="w-full bg-white font-[Arial,Helvetica,sans-serif]">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 pt-2 sm:pt-3">
        <HomeRecentProducts countryCode={countryCode} />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 pt-1 pb-8">
        <div className="flex items-center justify-between w-full mb-3 sm:mb-4">
          <h2 className="text-[18px] sm:text-[20px] font-bold text-[#222222] font-[Arial,Helvetica,sans-serif]">
            {productCount} productos
          </h2>
          <LocalizedClientLink
            href="/store"
            className="text-[13px] sm:text-[14px] text-[#0066CC] hover:underline font-bold flex items-center gap-1 ml-auto text-right"
          >
            <span>Ver todo</span>
            <span>›</span>
          </LocalizedClientLink>
        </div>

        {/* 6-column Grid Desktop Parity */}
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
              <span className="text-[13px] sm:text-[14px] font-normal text-[#000000] font-[Roboto,Arial,Helvetica,sans-serif] text-center leading-snug mt-auto group-hover:text-[#0066CC] group-hover:underline">
                {cat.name}
              </span>
            </LocalizedClientLink>
          ))}
        </div>

        <div className="bg-[#185394] p-8 rounded-sm mb-12">
          <h2 className="text-[28px] font-bold text-white mb-2">
            Heat, control & industrial instrumentation
          </h2>
          <p className="text-[16px] text-white max-w-3xl mb-6">
            Control Nautas solutions: electric heating,
            heat tracing, PID controllers, sensors, environmental monitoring, PLC, and industrial insulation.
          </p>
          <LocalizedClientLink
            href="/store/calefaccion-electrica"
            className="inline-block bg-white text-[#185394] font-bold text-[14px] px-6 py-3 rounded-sm hover:bg-gray-100 transition-colors"
          >
            Explore heating
          </LocalizedClientLink>
        </div>

        {/* Supplies and Solutions Section */}
        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#222222] mb-4 font-['Roboto']">
            Suministros y Soluciones para Cada Industria
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card 1: Case Studies */}
            <div className="bg-[#F4F5F7] p-6 border border-[#E0E0E0] rounded-none flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <LocalizedClientLink href="/casos-de-exito" className="font-bold text-[16px] text-[#222222] hover:text-[#0066CC] flex items-center gap-1 font-['Roboto']">
                    <span>Industrial Case Studies</span>
                    <span className="text-[#0066CC]">›</span>
                  </LocalizedClientLink>
                  <div className="w-[32px] h-[32px] bg-[#CC0000] text-white flex items-center justify-center font-bold text-xs rounded-none">
                    C
                  </div>
                </div>
                <p className="text-[13px] text-[#444444] mb-4">
                  Solutions applied in power generation, mining, and data centers.
                </p>
              </div>
              <div className="text-[12px] text-[#0066CC] font-normal flex flex-wrap gap-2 pt-4 border-t border-[#E0E0E0]">
                <LocalizedClientLink href="/casos-de-exito/resistencias-electricas-prevenir-cortocircuitos" className="hover:underline font-['Roboto']">Power generation</LocalizedClientLink>
                <span>|</span>
                <LocalizedClientLink href="/casos-de-exito/heat-tracing-evitar-congelamiento" className="hover:underline font-['Roboto']">Mining</LocalizedClientLink>
                <span>|</span>
                <LocalizedClientLink href="/casos-de-exito/control-temperatura-datacenters-akcp" className="hover:underline font-['Roboto']">Datacenters</LocalizedClientLink>
              </div>
            </div>

            {/* Card 2: Product Lines */}
            <div className="bg-[#F4F5F7] p-6 border border-[#E0E0E0] rounded-none flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <LocalizedClientLink href="/store" className="font-bold text-[16px] text-[#222222] hover:text-[#0066CC] flex items-center gap-1 font-['Roboto']">
                    <span>Product Lines</span>
                    <span className="text-[#0066CC]">›</span>
                  </LocalizedClientLink>
                  <div className="w-[32px] h-[32px] bg-[#CC0000] text-white flex items-center justify-center font-bold text-xs rounded-none">
                    L
                  </div>
                </div>
                <p className="text-[13px] text-[#444444] mb-4">
                  Certified thermal insulation, electric heat tracing, sensors, and process instrumentation.
                </p>
              </div>
              <div className="text-[12px] text-[#0066CC] font-normal flex flex-wrap gap-2 pt-4 border-t border-[#E0E0E0]">
                <LocalizedClientLink href="/store/aislamiento-termico" className="hover:underline font-['Roboto']">Lana de Roca</LocalizedClientLink>
                <span>|</span>
                <LocalizedClientLink href="/store/trazado-termico" className="hover:underline font-['Roboto']">Heat Tracing</LocalizedClientLink>
                <span>|</span>
                <LocalizedClientLink href="/store/monitoreo-ambiental" className="hover:underline font-['Roboto']">Sensores</LocalizedClientLink>
              </div>
            </div>

            {/* Card 3: Soporte y Cobertura */}
            <div className="bg-[#F4F5F7] p-6 border border-[#E0E0E0] rounded-none flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <LocalizedClientLink href="/contacto" className="font-bold text-[16px] text-[#222222] hover:text-[#0066CC] flex items-center gap-1 font-['Roboto']">
                    <span>Technical Support & Shipping</span>
                    <span className="text-[#0066CC]">›</span>
                  </LocalizedClientLink>
                  <div className="w-[32px] h-[32px] bg-[#CC0000] text-white flex items-center justify-center font-bold text-xs rounded-none">
                    S
                  </div>
                </div>
                <p className="text-[13px] text-[#444444] mb-4">
                  Sizing support, fast B2B quotes, and shipping across the United States.
                </p>
              </div>
              <div className="text-[12px] text-[#0066CC] font-normal flex flex-wrap gap-2 pt-4 border-t border-[#E0E0E0]">
                <LocalizedClientLink href="/nosotros" className="hover:underline font-['Roboto']">About Us</LocalizedClientLink>
                <span>|</span>
                <LocalizedClientLink href="/contacto" className="hover:underline font-['Roboto']">Technical Advisory</LocalizedClientLink>
                <span>|</span>
                <LocalizedClientLink href="/entregas-y-devoluciones" className="hover:underline font-['Roboto']">Fulfillment Nacional</LocalizedClientLink>
              </div>
            </div>
          </div>

          {/* SEO Footer Text */}
          <p className="text-[11px] text-[#666666] leading-relaxed border-t border-[#E0E0E0] pt-6">
            Control Nautas specializes in process control, electric heating, heat tracing, industrial instrumentation, sensors, and automation — backed by expert technical support to keep your plant running efficiently.
          </p>
        </div>
      </div>
    </div>
  )
}
