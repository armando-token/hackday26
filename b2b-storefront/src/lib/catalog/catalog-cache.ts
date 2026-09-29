/**
 * Nombres de cache tags del catálogo (plan maestro, sección 11).
 *
 * No dependen de _medusa_cache_id: el contenido público del catálogo es global
 * y se invalida por webhooks firmados en la Fase 5.
 */

export const CATALOG_CACHE_TAGS = {
  root: "catalog",
  products: "catalog:products",
  product: (productId: string) => `catalog:product:${productId}`,
  handle: (handle: string) => `catalog:handle:${handle}`,
  categories: "catalog:categories",
  category: (categoryId: string) => `catalog:category:${categoryId}`,
  categoryHandle: (handle: string) => `catalog:category-handle:${handle}`,
  prices: "catalog:prices",
  inventory: "catalog:inventory",
  search: "catalog:search",
  feed: "catalog:feed",
  sitemap: "catalog:sitemap",
} as const

export function catalogRevalidateOptions(tags: string[]) {
  return { next: { tags } }
}

export function catalogProductTags(product: {
  id: string
  handle: string
}) {
  return [
    CATALOG_CACHE_TAGS.root,
    CATALOG_CACHE_TAGS.products,
    CATALOG_CACHE_TAGS.product(product.id),
    CATALOG_CACHE_TAGS.handle(product.handle),
    CATALOG_CACHE_TAGS.prices,
    CATALOG_CACHE_TAGS.inventory,
  ]
}
