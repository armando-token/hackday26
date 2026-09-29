import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  buildRevalidatePayload,
  postCatalogRevalidation,
} from "../lib/catalog-revalidation-client"
import { resolveProductById } from "../lib/catalog-product-resolution"
import { tagsForPim } from "../lib/catalog-revalidation-tags"

type PimEventData = {
  product_id?: string
  pim_info_id?: string
}

export default async function catalogPimRevalidationHandler({
  event,
  container,
}: SubscriberArgs<PimEventData>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productId = event.data?.product_id
  if (!productId) return

  const product = await resolveProductById(container, productId)
  const payload = buildRevalidatePayload({
    event: event.name,
    entityId: productId,
    productIds: [productId],
    handles: product?.handle ? [product.handle] : undefined,
    tags: tagsForPim(productId, product?.handle),
  })

  await postCatalogRevalidation(payload, { logger })
}

export const config: SubscriberConfig = {
  event: ["b2b-pim.updated", "b2b-pim.created", "b2b-pim.deleted"],
}
