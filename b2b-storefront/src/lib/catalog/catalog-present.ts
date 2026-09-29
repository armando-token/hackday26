/**
 * Helpers de presentación para componentes que consumen CatalogProduct.
 * No son fuente de datos: solo derivan valores de visualización del contrato.
 */

import type { CatalogProduct, DerivedAvailability } from "./catalog-types"
import { getSpecValueFromSpecs } from "@lib/cn-catalog/spec-aliases"

export function getCatalogImageUrls(product: CatalogProduct): string[] {
  if (product.images.length) {
    return product.images.map((i) => i.url)
  }
  return product.thumbnail ? [product.thumbnail] : []
}

export function getCatalogSpecValue(
  product: CatalogProduct,
  key: string
): string {
  return getSpecValueFromSpecs(product.pim.specs, key, {
    brand: product.brand?.name,
    mfrModel: product.pim.mfrModel ?? undefined,
    itemNumber: product.pim.itemNumber ?? undefined,
  })
}

export function getCatalogShortDescription(product: CatalogProduct): string {
  const raw = product.description.trim()
  if (raw) {
    return raw.replace(/sobre este art[ií]culo[:\s]*/gi, "").replace(/\s+/g, " ").trim()
  }
  const specs = Object.entries(product.pim.specs)
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ")
  return specs || product.title
}

export function getCatalogGa4ItemId(product: CatalogProduct): string {
  if (product.legacy?.wcId) {
    return `gla_${product.legacy.wcId}`
  }
  return product.pim.itemNumber || product.primaryVariant.sku || product.handle
}

export function getCatalogStockDisplay(product: CatalogProduct): {
  text: string
  color: string
} {
  switch (product.display.availability) {
    case "in_stock":
      return { text: "● En stock (Entrega inmediata)", color: "text-[#1E7E34]" }
    case "backorder":
      return {
        text: "● Disponible bajo pedido / Importación",
        color: "text-[#D97706]",
      }
    case "made_to_order":
      return {
        text: "● Fabricación / Suministro a medida",
        color: "text-[#475569]",
      }
    case "discontinued":
      return {
        text: "● Producto discontinuado",
        color: "text-[#C8102E]",
      }
    default:
      return {
        text: "● Sin stock para entrega inmediata · Cotizar",
        color: "text-[#C8102E]",
      }
  }
}

export function schemaAvailability(
  availability: DerivedAvailability
): string {
  if (availability === "in_stock") {
    return "https://schema.org/InStock"
  }
  if (availability === "backorder" || availability === "made_to_order") {
    return "https://schema.org/PreOrder"
  }
  return "https://schema.org/OutOfStock"
}

export function getRelatedCatalogProducts(
  product: CatalogProduct,
  pool: CatalogProduct[],
  limit = 4
): CatalogProduct[] {
  return pool
    .filter(
      (p) =>
        p.handle !== product.handle &&
        p.leafCategory.handle === product.leafCategory.handle
    )
    .slice(0, limit)
}

export function getCatalogCategoryPath(product: CatalogProduct): Array<{
  slug: string
  name: string
}> {
  return product.categories.map((c) => ({ slug: c.handle, name: c.name }))
}

/** Payload para ShellCart v2 (variantId + quantity, sin precio persistido). */
export function toShellCartLine(product: CatalogProduct, quantity = 1) {
  return {
    variantId: product.primaryVariant.id,
    productId: product.id,
    handle: product.handle,
    quantity: Math.min(999, Math.max(1, quantity || 1)),
  }
}
