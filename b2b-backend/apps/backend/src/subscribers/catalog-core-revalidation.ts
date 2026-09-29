import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  ProductCategoryWorkflowEvents,
  ProductVariantWorkflowEvents,
  ProductWorkflowEvents,
} from "@medusajs/framework/utils"
import {
  buildRevalidatePayload,
  postCatalogRevalidation,
} from "../lib/catalog-revalidation-client"
import {
  resolveCategoryById,
  resolveProductById,
  resolveProductFromVariantId,
} from "../lib/catalog-product-resolution"
import { tagsForCategory, tagsForProduct } from "../lib/catalog-revalidation-tags"

async function emitForProduct(
  container: SubscriberArgs["container"],
  event: string,
  productId: string,
  handle?: string | null
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const payload = buildRevalidatePayload({
    event,
    entityId: productId,
    productIds: [productId],
    handles: handle ? [handle] : undefined,
    tags: tagsForProduct(productId, handle),
  })
  await postCatalogRevalidation(payload, { logger })
}

export default async function catalogCoreRevalidationHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const name = event.name
  const entityId = event.data?.id
  if (!entityId) return

  if (
    name === ProductWorkflowEvents.CREATED ||
    name === ProductWorkflowEvents.UPDATED ||
    name === ProductWorkflowEvents.DELETED
  ) {
    const product = await resolveProductById(container, entityId)
    await emitForProduct(container, name, entityId, product?.handle)
    return
  }

  if (
    name === ProductVariantWorkflowEvents.CREATED ||
    name === ProductVariantWorkflowEvents.UPDATED ||
    name === ProductVariantWorkflowEvents.DELETED
  ) {
    const product = await resolveProductFromVariantId(container, entityId)
    if (product) {
      await emitForProduct(container, name, product.id, product.handle)
    }
    return
  }

  if (
    name === ProductCategoryWorkflowEvents.CREATED ||
    name === ProductCategoryWorkflowEvents.UPDATED ||
    name === ProductCategoryWorkflowEvents.DELETED
  ) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const category = await resolveCategoryById(container, entityId)
    const payload = buildRevalidatePayload({
      event: name,
      entityId,
      categoryIds: [entityId],
      categoryHandles: category?.handle ? [category.handle] : undefined,
      tags: tagsForCategory(entityId, category?.handle),
    })
    await postCatalogRevalidation(payload, { logger })
  }
}

export const config: SubscriberConfig = {
  event: [
    ProductWorkflowEvents.CREATED,
    ProductWorkflowEvents.UPDATED,
    ProductWorkflowEvents.DELETED,
    ProductVariantWorkflowEvents.CREATED,
    ProductVariantWorkflowEvents.UPDATED,
    ProductVariantWorkflowEvents.DELETED,
    ProductCategoryWorkflowEvents.CREATED,
    ProductCategoryWorkflowEvents.UPDATED,
    ProductCategoryWorkflowEvents.DELETED,
  ],
}
