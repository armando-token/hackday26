"use client"

import React, { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { CatalogProduct } from "@lib/catalog/catalog-types"
import {
  getCatalogCategoryPath,
  getCatalogGa4ItemId,
  getCatalogImageUrls,
  getCatalogShortDescription,
  getCatalogStockDisplay,
  schemaAvailability,
  toShellCartLine,
} from "@lib/catalog/catalog-present"
import { useShellLists, useShellCart } from "@lib/cn-catalog"
import { addToCart } from "@lib/data/cart"
import HomeRecentProducts from "@modules/home/components/home-recent-products"
import WhatsAppProductCTA from "@modules/common/components/whatsapp-product-cta"
import { company } from "@lib/config/company"

export default function HvacProductTemplate({
  product,
  related,
  countryCode,
}: {
  product: CatalogProduct
  related: CatalogProduct[]
  countryCode: string
}) {
  const { list, toggleList, trackView } = useShellLists()
  const { addItem } = useShellCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)

  const images = getCatalogImageUrls(product)
  const isQuote = product.display.requiresQuote
  const shortDesc = getCatalogShortDescription(product)
  const { text: stockText, color: stockColor } = getCatalogStockDisplay(product)
  const onList = list.includes(product.handle)
  const crumbs = getCatalogCategoryPath(product)

  const isDemo = Boolean(
    product.isDemo ||
    product.metadata?.hackday_demo ||
    (product as any).tags?.some?.((t: any) => {
      const val = typeof t === "string" ? t : (t?.value || t?.name || "")
      return val === "hackday_demo" || val.includes?.("hackday_demo")
    }) ||
    product.primaryVariant?.sku?.toUpperCase().startsWith("CN-DEMO-") ||
    product.variants?.some((v) => v.sku?.toUpperCase().startsWith("CN-DEMO-")) ||
    product.pim?.itemNumber?.toUpperCase().startsWith("CN-DEMO-")
  )

  useEffect(() => {
    trackView(product.handle)
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      const ga4ItemId = getCatalogGa4ItemId(product)
      ;(window as any).dataLayer.push({
        event: "view_item",
        ecommerce: {
          currency: "PEN",
          value: product.display.price?.amount || 0,
          items: [
            {
              item_id: ga4ItemId,
              item_name: product.title,
              item_brand: product.brand?.name,
              item_category: product.leafCategory.handle,
              price: product.display.price?.amount || 0,
            },
          ],
        },
      })
    }
  }, [product, trackView])

  const onAdd = async () => {
    if (!product.display.canAddToCart) return
    const variantId = product.primaryVariant.id

    setIsAdding(true)
    try {
      addItem(toShellCartLine(product, qty))
      setAdded(true)
      await addToCart({ variantId, quantity: qty, countryCode })
      if (typeof window !== "undefined" && (window as any).dataLayer) {
        const ga4ItemId = getCatalogGa4ItemId(product)
        ;(window as any).dataLayer.push({
          event: "add_to_cart",
          ecommerce: {
            currency: "PEN",
            value: (product.display.price?.amount || 0) * qty,
            items: [
              {
                item_id: ga4ItemId,
                item_name: product.title,
                item_brand: product.brand?.name,
                item_category: product.leafCategory.handle,
                price: product.display.price?.amount || 0,
                quantity: qty,
              },
            ],
          },
        })
      }
      setTimeout(() => setAdded(false), 5000)
    } catch (err) {
      console.error("Error agregando a carrito Medusa:", err)
    } finally {
      setIsAdding(false)
    }
  }

  const canonicalUrl = `${company.siteUrl}/${countryCode}/products/${product.handle}`
  const priceAmount = product.display.price?.amount

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: images.length
      ? images.map((img) =>
          img.startsWith("http") ? img : `${company.siteUrl}${img}`
        )
      : undefined,
    description: shortDesc || product.title,
    sku: product.pim.itemNumber,
    mpn: product.pim.mfrModel,
    brand: {
      "@type": "Brand",
      name: product.brand?.name || "Control Nautas",
    },
    offers:
      !isQuote && priceAmount
        ? {
            "@type": "Offer",
            url: canonicalUrl,
            priceCurrency: "PEN",
            price: priceAmount.toFixed(2),
            itemCondition: "https://schema.org/NewCondition",
            availability: schemaAvailability(product.display.availability),
            seller: {
              "@type": "Organization",
              name: company.legalName,
              url: company.siteUrl,
            },
          }
        : undefined,
  }

  return (
    <div className="w-full bg-white font-[Arial,Helvetica,sans-serif] text-[#333] pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {isDemo && (
        <div
          role="alert"
          data-testid="demo-product-banner"
          className="w-full bg-[#FFF3CD] border-b-2 border-[#FFEEBA] text-[#856404] px-6 py-4 shadow-sm"
        >
          <div className="max-w-[1440px] mx-auto flex items-center gap-3">
            <span className="text-xl font-bold bg-[#856404] text-white rounded-full w-7 h-7 flex items-center justify-center shrink-0">
              !
            </span>
            <div>
              <p className="font-bold text-[15px] tracking-wide uppercase">
                FICTITIOUS PRODUCT — DEMONSTRATION DATA
              </p>
              <p className="text-[12px] text-[#664d03] mt-0.5">
                This product is a synthetic benchmark component generated exclusively for technical demonstration. Technical specifications, schematics, and parameters are demonstrative.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="border-b border-[#CCCCCC]">
        <div className="max-w-[1440px] mx-auto px-6 py-3 text-[12px] text-[#666] flex flex-wrap gap-1.5">
          <LocalizedClientLink
            href="/store"
            className="text-[#0066CC] hover:underline"
          >
            Categorías de producto
          </LocalizedClientLink>
          {crumbs.map((c, idx) => (
            <React.Fragment key={c.slug}>
              <span>/</span>
              <LocalizedClientLink
                href={`/store/${crumbs
                  .slice(0, idx + 1)
                  .map((x) => x.slug)
                  .join("/")}`}
                className="text-[#0066CC] hover:underline"
              >
                {c.name}
              </LocalizedClientLink>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <div className="flex items-center justify-center border border-[#CCCCCC] bg-white p-8 min-h-[360px]">
            {images[imgIdx] ? (
              <img
                src={images[imgIdx]}
                alt={product.title}
                className="max-h-[340px] max-w-full object-contain"
              />
            ) : null}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImgIdx(i)}
                  className={`w-14 h-14 border flex-shrink-0 p-1 ${
                    i === imgIdx ? "border-[#CC0000]" : "border-[#CCC]"
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          {isDemo && (
            <div
              data-testid="demo-product-badge"
              className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 rounded text-amber-900 font-bold text-[12px] uppercase"
            >
              <span>⚠️</span> FICTITIOUS PRODUCT — DEMONSTRATION DATA
            </div>
          )}
          <div className="text-[12px] font-bold text-[#666] uppercase mb-1">
            {product.brand?.name}
          </div>
          <h1 className="text-[24px] font-bold leading-snug mb-2">
            {product.title}
          </h1>
          <div className="text-[13px] text-[#666] flex flex-wrap gap-x-4 mb-4">
            <span>
              Ítem{" "}
              <b className="text-[#333]">#{product.pim.itemNumber}</b>
            </span>
            <span>
              Modelo fab.{" "}
              <b className="text-[#333]">#{product.pim.mfrModel}</b>
            </span>
          </div>

          <div className="border border-[#CCCCCC] p-5 mb-6 bg-[#FAFAFA]">
            <div className="text-[#1E7E34] font-bold text-[28px] mb-1">
              {product.display.priceLabel}
              {!isQuote && (
                <span className="block text-[12px] text-[#666] font-normal">
                  / und.
                </span>
              )}
            </div>
            <div className={`text-[13px] font-semibold mb-4 ${stockColor}`}>
              {stockText}
            </div>
            <div className="flex flex-wrap gap-2.5 items-center">
              {product.display.canAddToCart && (
                <>
                  <label className="text-[13px] font-bold">Cant.</label>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={qty}
                    onChange={(e) =>
                      setQty(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-20 border border-[#CCC] px-2 py-2 text-[14px] bg-white rounded"
                  />
                  <button
                    onClick={onAdd}
                    disabled={isAdding}
                    className="bg-[#C8102E] disabled:bg-[#999] text-white font-bold text-[14px] px-7 py-3 uppercase hover:bg-[#9B0C24] rounded transition-colors shadow-sm"
                  >
                    {isAdding
                      ? "Agregando..."
                      : added
                        ? "Añadido al Carrito ✓"
                        : "Añadir al carrito"}
                  </button>
                  {added && (
                    <LocalizedClientLink
                      href="/cart"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[13px] px-5 py-3 rounded transition-colors"
                    >
                      Ver Carrito y Pagar ›
                    </LocalizedClientLink>
                  )}
                </>
              )}

              <WhatsAppProductCTA
                itemId={product.pim.itemNumber || ""}
                itemName={product.title}
                itemBrand={product.brand?.name || ""}
                itemModel={product.pim.mfrModel || ""}
                itemCategory={product.leafCategory.handle}
                itemUrl={canonicalUrl}
                ctaLocation="product_detail"
                variant="primary"
                customText={
                  isQuote ? "Cotizar por WhatsApp" : "Consultar por WhatsApp"
                }
              />

              <button
                type="button"
                onClick={() => toggleList(product.handle)}
                className="border border-[#CCC] text-[#333] font-medium text-[13px] px-4 py-3 bg-white hover:bg-gray-50 rounded"
              >
                {onList ? "✓ En lista" : "Guardar"}
              </button>
            </div>
          </div>

          <p className="text-[14px] leading-relaxed text-[#444] mb-6 max-w-2xl">
            {shortDesc}
          </p>

          <div className="border border-[#CCCCCC]">
            <div className="bg-[#F2F2F2] px-4 py-2 font-bold text-[14px] border-b border-[#CCCCCC]">
              Detalles del producto
            </div>
            <table className="w-full text-[13px]">
              <tbody>
                <tr className="border-b border-[#EEEEEE]">
                  <td className="px-4 py-2 font-bold w-[40%] bg-[#FAFAFA]">
                    Marca
                  </td>
                  <td className="px-4 py-2">{product.brand?.name}</td>
                </tr>
                <tr className="border-b border-[#EEEEEE]">
                  <td className="px-4 py-2 font-bold bg-[#FAFAFA]">Ítem #</td>
                  <td className="px-4 py-2">{product.pim.itemNumber}</td>
                </tr>
                <tr className="border-b border-[#EEEEEE]">
                  <td className="px-4 py-2 font-bold bg-[#FAFAFA]">
                    Modelo fab.
                  </td>
                  <td className="px-4 py-2">{product.pim.mfrModel}</td>
                </tr>
                {Object.entries(product.pim.specs).map(([label, value]) => (
                  <tr key={label} className="border-b border-[#EEEEEE]">
                    <td className="px-4 py-2 font-bold bg-[#FAFAFA]">
                      {label}
                    </td>
                    <td className="px-4 py-2">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(product.pim.technicalPdf || product.pim.manualPdf || isDemo) && (
              <div className="p-4 bg-[#FAFAFA] border-t border-[#CCCCCC] flex flex-wrap gap-3">
                {(product.pim.technicalPdf || isDemo) && (
                  <a
                    href={
                      product.pim.technicalPdf ||
                      `/demo/datasheets/${product.primaryVariant.sku || product.handle}.pdf`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-white bg-[#C8102E] hover:bg-[#9B0C24] rounded transition-colors"
                  >
                    📄 Descargar Ficha Técnica (PDF)
                  </a>
                )}
                {(product.pim.manualPdf || isDemo) && (
                  <a
                    href={
                      product.pim.manualPdf ||
                      `/demo/specs/${product.primaryVariant.sku || product.handle}.md`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-[#333] bg-[#EAEAEA] hover:bg-[#DDD] rounded transition-colors"
                  >
                    📘 Ver Especificaciones (MD)
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-6 mt-2">
          <div className="border-b-2 border-[#C8102E] pb-2 mb-6">
            <h2 className="text-[18px] font-bold uppercase">
              Productos relacionados
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <LocalizedClientLink
                key={p.handle}
                href={`/products/${p.handle}`}
                className="border border-[#CCCCCC] p-4 hover:shadow-sm"
              >
                <img
                  src={getCatalogImageUrls(p)[0]}
                  alt={p.title}
                  className="w-full h-28 object-contain mb-2"
                  loading="lazy"
                />
                <div className="text-[11px] font-bold text-[#666]">
                  {p.brand?.name}
                </div>
                <div className="text-[13px] font-bold text-[#00739E] line-clamp-2 min-h-[2.5em]">
                  {p.title}
                </div>
                <div className="text-[12px] text-[#666] mt-1">
                  Ítem #{p.pim.itemNumber}
                </div>
                <div className="text-[#1E7E34] font-bold text-[14px] mt-1">
                  {p.display.priceLabel}
                </div>
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-6 mt-10">
        <HomeRecentProducts
          excludeHandle={product.handle}
          countryCode={countryCode}
          limit={8}
        />
      </div>
    </div>
  )
}
