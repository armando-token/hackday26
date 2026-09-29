import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/types"

export type ResolvedProductRef = {
  id: string
  handle: string | null
}

export async function resolveProductById(
  container: MedusaContainer,
  productId: string
): Promise<ResolvedProductRef | null> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { id: productId },
  })
  const row = data?.[0] as { id: string; handle?: string } | undefined
  return row ? { id: row.id, handle: row.handle ?? null } : null
}

export async function resolveProductFromVariantId(
  container: MedusaContainer,
  variantId: string
): Promise<ResolvedProductRef | null> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product_variant",
    fields: ["id", "product_id", "product.id", "product.handle"],
    filters: { id: variantId },
  })
  const row = data?.[0] as
    | { product_id?: string; product?: { id?: string; handle?: string } }
    | undefined
  const id = row?.product?.id || row?.product_id
  if (!id) return null
  return { id, handle: row?.product?.handle ?? null }
}

export async function resolveProductsFromPriceId(
  container: MedusaContainer,
  priceId: string
): Promise<ResolvedProductRef[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: prices } = await query.graph({
    entity: "price",
    fields: ["id", "price_set_id"],
    filters: { id: priceId },
  })
  const priceSetId = (prices?.[0] as { price_set_id?: string })?.price_set_id
  if (!priceSetId) return []

  return resolveProductsFromPriceSetId(container, priceSetId)
}

export async function resolveProductsFromPriceSetId(
  container: MedusaContainer,
  priceSetId: string
): Promise<ResolvedProductRef[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "price_set",
    fields: [
      "id",
      "variants.id",
      "variants.product_id",
      "variants.product.id",
      "variants.product.handle",
    ],
    filters: { id: priceSetId },
  })

  const refs = new Map<string, ResolvedProductRef>()
  const row = data?.[0] as {
    variants?: Array<{
      product_id?: string
      product?: { id?: string; handle?: string }
    }>
  }

  for (const variant of row?.variants || []) {
    const id = variant.product?.id || variant.product_id
    if (!id) continue
    refs.set(id, { id, handle: variant.product?.handle ?? null })
  }

  return [...refs.values()]
}

export async function resolveProductsFromInventoryLevelId(
  container: MedusaContainer,
  levelId: string
): Promise<ResolvedProductRef[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "inventory_level",
    fields: [
      "id",
      "inventory_item_id",
      "inventory_item.variants.id",
      "inventory_item.variants.product_id",
      "inventory_item.variants.product.id",
      "inventory_item.variants.product.handle",
    ],
    filters: { id: levelId },
  })

  const refs = new Map<string, ResolvedProductRef>()
  const row = data?.[0] as {
    inventory_item?: {
      variants?: Array<{
        product_id?: string
        product?: { id?: string; handle?: string }
      }>
    }
  }

  for (const variant of row?.inventory_item?.variants || []) {
    const id = variant.product?.id || variant.product_id
    if (!id) continue
    refs.set(id, { id, handle: variant.product?.handle ?? null })
  }

  return [...refs.values()]
}

export async function resolveCategoryById(
  container: MedusaContainer,
  categoryId: string
): Promise<{ id: string; handle: string | null } | null> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
    filters: { id: categoryId },
  })
  const row = data?.[0] as { id: string; handle?: string } | undefined
  return row ? { id: row.id, handle: row.handle ?? null } : null
}
