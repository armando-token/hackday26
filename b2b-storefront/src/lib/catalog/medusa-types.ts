/**
 * Forma mínima de la respuesta Store API de Medusa.
 *
 * Solo incluye los campos que el mapper consume. No reexporta tipos de
 * @medusajs/types para no acoplar el contrato interno a cambios del SDK.
 */

export type MedusaCalculatedPrice = {
  calculated_amount?: number | null
  original_amount?: number | null
  currency_code?: string | null
}

export type MedusaStoreVariant = {
  id: string
  title?: string | null
  sku?: string | null
  manage_inventory?: boolean
  allow_backorder?: boolean
  inventory_quantity?: number | null
  calculated_price?: MedusaCalculatedPrice | null
  options?: Array<{
    id?: string
    option_id?: string
    value?: string
    option?: { id?: string; title?: string }
  }> | null
}

export type MedusaStoreCategory = {
  id: string
  handle: string
  name: string
  description?: string | null
  parent_category_id?: string | null
  rank?: number | null
  is_active?: boolean
  is_internal?: boolean
  metadata?: Record<string, unknown> | null
  parent_category?: MedusaStoreCategory | null
}

export type MedusaStoreBrand = {
  id: string
  name: string
  handle: string
  logo_url?: string | null
}

export type MedusaStorePimInfo = {
  id: string
  product_id: string
  mfr_model?: string | null
  item_number?: string | null
  purchase_mode?: string | null
  availability_mode?: string | null
  lead_time_days?: number | null
  technical_pdf?: string | null
  manual_pdf?: string | null
  specs?: Record<string, unknown> | null
  seo_title?: string | null
  seo_description?: string | null
  og_image?: string | null
}

export type MedusaStoreImage = {
  id: string
  url: string
  rank?: number | null
}

export type MedusaStoreProduct = {
  id: string
  handle: string
  title: string
  subtitle?: string | null
  description?: string | null
  status?: string
  thumbnail?: string | null
  created_at?: string
  updated_at?: string
  metadata?: Record<string, unknown> | null
  images?: MedusaStoreImage[] | null
  categories?: MedusaStoreCategory[] | null
  variants?: MedusaStoreVariant[] | null
  brand?: MedusaStoreBrand | null
  pim_info?: MedusaStorePimInfo | null
}

export type MedusaStoreProductListResponse = {
  products: MedusaStoreProduct[]
  count: number
  limit?: number
  offset?: number
}
