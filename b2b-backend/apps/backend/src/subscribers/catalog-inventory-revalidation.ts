import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { InventoryEvents } from "@medusajs/utils"
import {
  buildRevalidatePayload,
  postCatalogRevalidation,
} from "../lib/catalog-revalidation-client"
import { resolveProductsFromInventoryLevelId } from "../lib/catalog-product-resolution"
import {
  tagsForInventoryDimension,
  tagsForProduct,
} from "../lib/catalog-revalidation-tags"

export default async function catalogInventoryRevalidationHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const name = event.name
  const entityId = event.data?.id
  if (!entityId) return

  const products = await resolveProductsFromInventoryLevelId(container, entityId)

  if (!products.length) {
    logger.warn(
      `[catalog-revalidate] inventory resolution=fallback_global event=${name} id=${entityId}`
    )
    const payload = buildRevalidatePayload({
      event: name,
      entityId,
      tags: tagsForInventoryDimension(true),
    })
    await postCatalogRevalidation(payload, { logger })
    return
  }

  const productIds: string[] = []
  const handles: string[] = []
  const tags = new Set<string>()

  for (const p of products) {
    productIds.push(p.id)
    if (p.handle) handles.push(p.handle)
    for (const t of tagsForProduct(p.id, p.handle)) tags.add(t)
  }

  const payload = buildRevalidatePayload({
    event: name,
    entityId,
    productIds,
    handles: handles.length ? handles : undefined,
    tags: [...tags],
  })
  await postCatalogRevalidation(payload, { logger })
}

export const config: SubscriberConfig = {
  event: [
    InventoryEvents.INVENTORY_LEVEL_CREATED,
    InventoryEvents.INVENTORY_LEVEL_UPDATED,
    InventoryEvents.INVENTORY_LEVEL_DELETED,
  ],
}
