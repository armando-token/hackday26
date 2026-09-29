import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PricingEvents } from "@medusajs/utils"
import {
  buildRevalidatePayload,
  postCatalogRevalidation,
} from "../lib/catalog-revalidation-client"
import {
  resolveProductsFromPriceId,
  resolveProductsFromPriceSetId,
} from "../lib/catalog-product-resolution"
import {
  tagsForPriceDimension,
  tagsForProduct,
} from "../lib/catalog-revalidation-tags"

function mergeProductTags(
  products: Array<{ id: string; handle: string | null }>
): { productIds: string[]; handles: string[]; tags: string[] } {
  const productIds: string[] = []
  const handles: string[] = []
  const tags = new Set<string>()

  for (const p of products) {
    productIds.push(p.id)
    if (p.handle) handles.push(p.handle)
    for (const t of tagsForProduct(p.id, p.handle)) tags.add(t)
  }

  return { productIds, handles, tags: [...tags] }
}

export default async function catalogPriceRevalidationHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const name = event.name
  const entityId = event.data?.id
  if (!entityId) return

  let products: Array<{ id: string; handle: string | null }> = []

  if (name === PricingEvents.PRICE_SET_UPDATED) {
    products = await resolveProductsFromPriceSetId(container, entityId)
  } else {
    products = await resolveProductsFromPriceId(container, entityId)
  }

  if (!products.length) {
    const payload = buildRevalidatePayload({
      event: name,
      entityId,
      tags: tagsForPriceDimension(true),
    })
    logger.warn(
      `[catalog-revalidate] price resolution=fallback_global event=${name} id=${entityId}`
    )
    await postCatalogRevalidation(payload, { logger })
    return
  }

  const merged = mergeProductTags(products)
  const payload = buildRevalidatePayload({
    event: name,
    entityId,
    productIds: merged.productIds,
    handles: merged.handles.length ? merged.handles : undefined,
    tags: merged.tags,
  })
  await postCatalogRevalidation(payload, { logger })
}

export const config: SubscriberConfig = {
  event: [
    PricingEvents.PRICE_CREATED,
    PricingEvents.PRICE_UPDATED,
    PricingEvents.PRICE_DELETED,
    PricingEvents.PRICE_SET_UPDATED,
  ],
}
