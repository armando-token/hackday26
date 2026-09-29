/**
 * Contrato interno del catálogo (plan maestro, sección 6).
 *
 * Los componentes visuales consumen estos tipos, nunca la respuesta cruda de
 * Medusa ni el JSON legacy. La forma se congela como v1: cualquier cambio
 * incompatible requiere una nueva versión del contrato.
 */

export type PurchaseMode =
  | "buy_now"
  | "quote_only"
  | "contact_for_price"
  | "made_to_order"

export type AvailabilityMode =
  | "in_stock"
  | "lead_time"
  | "made_to_order"
  | "discontinued"

export type DerivedAvailability =
  | "in_stock"
  | "backorder"
  | "made_to_order"
  | "out_of_stock"
  | "discontinued"

export type Money = {
  amount: number
  currencyCode: string
  originalAmount: number | null
}

export type CatalogVariant = {
  id: string
  sku: string
  title: string
  manageInventory: boolean
  allowBackorder: boolean
  inventoryQuantity: number | null
  calculatedPrice: Money | null
  options: Array<{ id: string; name: string; value: string }>
  isPurchasable: boolean
}

export type CatalogCategory = {
  id: string
  handle: string
  name: string
  description: string
  parentId: string | null
  rank: number
  isActive: boolean
  metadata: Record<string, unknown> | null
}

export type CatalogPim = {
  id: string
  productId: string
  mfrModel: string | null
  itemNumber: string | null
  purchaseMode: PurchaseMode
  availabilityMode: AvailabilityMode
  leadTimeDays: number | null
  technicalPdf: string | null
  manualPdf: string | null
  specs: Record<string, string>
  seoTitle: string | null
  seoDescription: string | null
  ogImage: string | null
}

export type CatalogDisplay = {
  availability: DerivedAvailability
  price: Money | null
  priceLabel: string
  canAddToCart: boolean
  requiresQuote: boolean
}

export type CatalogProduct = {
  id: string
  handle: string
  title: string
  subtitle: string | null
  description: string
  status: "published"
  thumbnail: string | null
  images: Array<{ id: string; url: string; rank: number }>
  updatedAt: string
  brand: {
    id: string
    name: string
    handle: string
    logoUrl: string | null
  } | null
  pim: CatalogPim
  categories: CatalogCategory[]
  leafCategory: CatalogCategory
  variants: CatalogVariant[]
  primaryVariant: CatalogVariant
  display: CatalogDisplay
  /** Identificadores legados para feeds/GA4 durante la migración. */
  legacy?: {
    wcId?: number
  }
}

export type CatalogProductList = {
  products: CatalogProduct[]
  count: number
}
