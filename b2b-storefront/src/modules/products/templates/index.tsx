import React, { Suspense } from "react"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductActionsWrapper from "./product-actions-wrapper"
import ProductSharePrint from "@modules/products/components/product-share-print"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const getProductSpecs = (metadata?: Record<string, any>) => {
  if (!metadata) {
    return [
      { label: "País de origen", value: "Estados Unidos / Internacional" },
      { label: "Certificaciones", value: "UL Listed, Conforme RoHS" },
      { label: "Garantía", value: "1 año de garantía de fabricante" }
    ]
  }

  // If there's a specific pim_specs object, we could use it, otherwise iterate over metadata
  const specs = []
  
  if (metadata.brand) specs.push({ label: "Marca", value: metadata.brand })
  if (metadata.item_number) specs.push({ label: "Nº de Ítem", value: metadata.item_number })
  if (metadata.mfr_model) specs.push({ label: "Modelo Fab.", value: metadata.mfr_model })
  
  // Add other PIM specs or metadata fields dynamically
  for (const [key, value] of Object.entries(metadata)) {
    if (!["brand", "item_number", "mfr_model"].includes(key) && typeof value === 'string') {
      const label = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      specs.push({ label, value })
    }
  }

  if (specs.length === 0) {
    specs.push(
      { label: "País de origen", value: "Estados Unidos / Internacional" },
      { label: "Certificaciones", value: "UL Listed, Conforme RoHS" },
      { label: "Garantía", value: "1 año de garantía de fabricante" }
    )
  }

  return specs
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const specs = getProductSpecs(product.metadata as any)

  // Format breadcrumbs
  const breadcrumbs = [
    { label: "Inicio", href: "/" },
    { label: "Catálogo Técnico", href: "/store" },
    { label: product.title || "Detalles del Producto", href: `/products/${product.handle}` }
  ]

  return (
    <div className="w-full bg-[#FFFFFF] font-[Arial,Helvetica,sans-serif] text-[#333333] select-none pb-16">
      {/* 1. Breadcrumbs & Email/Print Bar */}
      <div className="border-b border-[#CCCCCC] bg-[#FFFFFF]">
        <div className="max-w-[1440px] mx-auto px-6 py-3 flex items-center justify-between text-[12px] text-[#666666] font-normal">
          <div className="flex items-center flex-wrap gap-1.5">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-[#666666]">/</span>}
                {idx < breadcrumbs.length - 1 ? (
                  <LocalizedClientLink href={crumb.href} className="text-[#0066CC] hover:underline">
                    {crumb.label}
                  </LocalizedClientLink>
                ) : (
                  <span className="text-[#333333] font-normal truncate max-w-[200px] md:max-w-xs">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <ProductSharePrint title={product.title} handle={product.handle} />
        </div>
      </div>

      {/* 2. Main Product Information Row */}
      <div className="max-w-[1440px] mx-auto px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Image Gallery (40% width) */}
          <div className="lg:col-span-5 w-full">
            <ImageGallery images={images} />
          </div>

          {/* Column 2: Core Info (35% width) */}
          <div className="lg:col-span-4 w-full flex flex-col gap-4">
            <div>
              <h1 className="text-[22px] font-bold text-[#333333] leading-[1.3] mb-2">
                {product.title}
              </h1>
              
              {/* Item / Mfr Model details */}
              <div className="text-[13px] text-[#666666] flex flex-wrap items-center gap-x-4 mt-2">
                <span>Ítem <span className="font-bold text-[#333333]">#{product.handle?.substring(0, 6).toUpperCase() || "N/A"}</span></span>
                <span className="text-[#CCCCCC]">|</span>
                <span>Modelo Fab. <span className="font-bold text-[#333333]">#{(product.metadata?.mfr_model as string) || product.handle?.toUpperCase() || "N/A"}</span></span>
              </div>
            </div>

            {/* Ratings Row */}
            <div className="flex items-center gap-1.5 text-xs text-yellow-500 font-bold border-b border-gray-100 pb-3">
              <span>★★★★★</span>
              <span className="text-gray-500 font-normal text-[12px]">(5.0)</span>
              <span className="text-[#CCCCCC]">|</span>
              <span className="text-[#666666] font-normal text-[12px]">Garantía Oficial de Fabricante</span>
            </div>

            {/* Sub-description */}
            <div className="text-[13px] text-[#333333] leading-relaxed pt-2">
              <p className="mb-2">
                {product.description || "Equipo industrial de alta precisión diseñado para aplicaciones de control de procesos, automatización e instrumentación técnica. Cumple con estándares internacionales de calidad y eficiencia operativa."}
              </p>
            </div>
            
            {/* Catalog Brand Details */}
            <div className="text-[13px] text-[#666666] mt-2 font-normal">
              Distribuidor Oficial en Perú · <LocalizedClientLink href="/contacto" className="font-bold text-[#0066CC] hover:underline">Soporte Técnico Especializado</LocalizedClientLink>
            </div>
          </div>

          {/* Column 3: Buy Box (25% width) */}
          <div className="lg:col-span-3 w-full">
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
          </div>

        </div>

        {/* 3. Product Details Tabular Grid */}
        <div className="mt-12 border-t border-[#CCCCCC] pt-8">
          <div className="border-b-2 border-black pb-1 mb-6">
            <h2 className="text-[18px] font-bold text-black uppercase tracking-wide">
              Detalles del Producto
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Specs Table List */}
            <div className="lg:col-span-8 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0 border-t border-[#CCCCCC]">
                {specs.map((spec, idx) => (
                  <div 
                    key={idx} 
                    className="flex justify-between items-center py-2.5 px-3 border-b border-[#E5E5E5] text-[13px] bg-white"
                  >
                    <span className="text-[#666666] font-normal">{spec.label}</span>
                    <span className="text-[#333333] font-bold text-right ml-4">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents Section */}
            <div className="lg:col-span-4 w-full">
              <h3 className="text-[18px] font-bold text-black border-b border-[#CCCCCC] pb-2 mb-4 uppercase tracking-wide">
                Documentación Técnica
              </h3>
              <div className="flex flex-col gap-3">
                <a 
                  href={`https://wa.me/51950302141?text=${encodeURIComponent(`Hola Control Nautas, solicito el manual técnico y datasheet de: ${product.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[13px] text-[#0066CC] font-bold hover:underline"
                >
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A1 1 0 0113 2.586V6a1 1 0 001 1h3.414L18 8v9a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2h8v2H6V6zm0 4h8v2H6v-2zm0 4h5v2H6v-2z" clipRule="evenodd"></path>
                  </svg>
                  Solicitar Manual / Ficha Técnica (PDF)
                </a>
                <a 
                  href={`https://wa.me/51950302141?text=${encodeURIComponent(`Hola Control Nautas, solicito la Hoja de Seguridad (MSDS/SDS) de: ${product.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[13px] text-[#0066CC] font-bold hover:underline"
                >
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A1 1 0 0113 2.586V6a1 1 0 001 1h3.414L18 8v9a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2h8v2H6V6zm0 4h8v2H6v-2zm0 4h5v2H6v-2z" clipRule="evenodd"></path>
                  </svg>
                  Solicitar Hoja de Seguridad (SDS / MSDS)
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* 4. Related Products section */}
        <div
          className="mt-16 border-t border-[#CCCCCC] pt-10"
          data-testid="related-products-container"
        >
          <h3 className="text-[18px] font-bold text-black mb-6 uppercase tracking-wide">
            Productos Relacionados y Complementarios
          </h3>
          <Suspense fallback={<SkeletonRelatedProducts />}>
            <RelatedProducts product={product} countryCode={countryCode} />
          </Suspense>
        </div>

      </div>
    </div>
  )
}

export default ProductTemplate
