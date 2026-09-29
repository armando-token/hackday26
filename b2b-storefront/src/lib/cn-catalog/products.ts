/**
 * Tipos y utilidades de presentación del catálogo CN.
 * Los datos de producto viven en Medusa (Fase 7); sin import de products.json en runtime.
 */

export type CnProduct = {
  handle: string
  wcId?: number
  legacyWcId?: number
  title: string
  brand: string
  itemNumber: string
  mfrModel: string
  priceMode: "fixed" | "quote"
  price: number
  currency: string
  shortDescription?: string
  technicalDescription?: string
  descriptionHtml?: string
  categoryPath: string[]
  categorySlug: string
  images: string[]
  image?: string
  inStock: boolean
  availabilityMode?: "in_stock" | "backorder" | "made_to_order" | "out_of_stock"
  isPurchasable: boolean
  specs: Record<string, string>
  rating?: number
  reviewCount?: number
  permalink?: string
  description?: string
}

export function formatPrice(
  price: number,
  mode?: "fixed" | "quote"
): string {
  if (mode === "quote" || price <= 0) return "Request price"
  return `S/ ${price.toFixed(2)}`
}

export function getAllBrands(products: CnProduct[]): string[] {
  return Array.from(
    new Set(products.map((p) => p.brand).filter(Boolean) as string[])
  ).sort()
}

/** Short technical description — never WP HTML. */
export function getShortTechnicalDescription(product: CnProduct): string {
  if (product.technicalDescription && product.technicalDescription.trim()) {
    return product.technicalDescription.trim()
  }
  const raw = (product.shortDescription || "").trim()
  if (!raw) {
    const specs = Object.entries(product.specs || {})
      .slice(0, 3)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ")
    return specs || product.title
  }
  return raw.replace(/sobre este art[ií]culo[:\s]*/gi, "").replace(/\s+/g, " ").trim()
}

export const PAGE_SIZE = 24

/** @deprecated use getLeafSpecColumns from leaf-spec-schema */
export function getSpecColumns(products: CnProduct[], max = 6): string[] {
  const freq = new Map<string, number>()
  for (const p of products) {
    for (const k of Object.keys(p.specs || {})) {
      freq.set(k, (freq.get(k) || 0) + 1)
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([k]) => k)
}
