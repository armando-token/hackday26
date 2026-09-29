import { z } from "zod"
import type {
  MedusaStoreProduct,
  MedusaStoreProductListResponse,
} from "./medusa-types"

/**
 * Validación runtime en el límite Medusa → storefront (plan maestro, §7.4).
 * Rechaza respuestas malformadas antes de que lleguen al mapper.
 */

const calculatedPriceSchema = z
  .object({
    calculated_amount: z.number().nullable().optional(),
    original_amount: z.number().nullable().optional(),
    currency_code: z.string().nullable().optional(),
  })
  .passthrough()

const variantSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().nullable().optional(),
    sku: z.string().nullable().optional(),
    manage_inventory: z.boolean().optional(),
    allow_backorder: z.boolean().optional(),
    inventory_quantity: z.number().nullable().optional(),
    calculated_price: calculatedPriceSchema.nullable().optional(),
    options: z.array(z.record(z.string(), z.unknown())).nullable().optional(),
  })
  .passthrough()

const categorySchema: z.ZodType<{
  id: string
  handle: string
  name: string
  description?: string | null
  parent_category_id?: string | null
  rank?: number | null
  is_active?: boolean
  metadata?: Record<string, unknown> | null
  parent_category?: unknown
}> = z.lazy(() =>
  z
    .object({
      id: z.string().min(1),
      handle: z.string().min(1),
      name: z.string(),
      description: z.string().nullable().optional(),
      parent_category_id: z.string().nullable().optional(),
      rank: z.number().nullable().optional(),
      is_active: z.boolean().optional(),
      metadata: z.record(z.string(), z.unknown()).nullable().optional(),
      parent_category: categorySchema.nullable().optional(),
    })
    .passthrough()
)

const pimInfoSchema = z
  .object({
    id: z.string().min(1),
    product_id: z.string().min(1),
    mfr_model: z.string().nullable().optional(),
    item_number: z.string().nullable().optional(),
    purchase_mode: z.string().nullable().optional(),
    availability_mode: z.string().nullable().optional(),
    lead_time_days: z.number().nullable().optional(),
    technical_pdf: z.string().nullable().optional(),
    manual_pdf: z.string().nullable().optional(),
    specs: z.record(z.string(), z.unknown()).nullable().optional(),
    seo_title: z.string().nullable().optional(),
    seo_description: z.string().nullable().optional(),
    og_image: z.string().nullable().optional(),
  })
  .passthrough()

const brandSchema = z
  .object({
    id: z.string().min(1),
    name: z.string(),
    handle: z.string(),
    logo_url: z.string().nullable().optional(),
  })
  .passthrough()

const imageSchema = z
  .object({
    id: z.string().min(1),
    url: z.string().min(1),
    rank: z.number().nullable().optional(),
  })
  .passthrough()

export const medusaStoreProductSchema = z
  .object({
    id: z.string().min(1),
    handle: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    status: z.string().optional(),
    thumbnail: z.string().nullable().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    images: z.array(imageSchema).nullable().optional(),
    categories: z.array(categorySchema).nullable().optional(),
    variants: z.array(variantSchema).nullable().optional(),
    brand: brandSchema.nullable().optional(),
    pim_info: pimInfoSchema.nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
    tags: z.array(z.union([z.string(), z.record(z.string(), z.unknown())])).nullable().optional(),
  })
  .passthrough()

export const medusaStoreProductListSchema = z.object({
  products: z.array(medusaStoreProductSchema),
  count: z.number().int().nonnegative(),
  limit: z.number().optional(),
  offset: z.number().optional(),
})

export function parseMedusaProductList(
  raw: unknown
): MedusaStoreProductListResponse {
  return medusaStoreProductListSchema.parse(raw) as MedusaStoreProductListResponse
}

export function parseMedusaProduct(raw: unknown): MedusaStoreProduct {
  return medusaStoreProductSchema.parse(raw) as MedusaStoreProduct
}
