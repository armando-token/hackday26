/**
 * Tags de invalidación alineados con el storefront (catalog-cache.ts).
 */

export const CATALOG_TAGS = {
  root: "catalog",
  products: "catalog:products",
  product: (id: string) => `catalog:product:${id}`,
  handle: (handle: string) => `catalog:handle:${handle}`,
  categories: "catalog:categories",
  category: (id: string) => `catalog:category:${id}`,
  categoryHandle: (handle: string) => `catalog:category-handle:${handle}`,
  prices: "catalog:prices",
  inventory: "catalog:inventory",
  search: "catalog:search",
  feed: "catalog:feed",
  sitemap: "catalog:sitemap",
} as const

export function tagsForProduct(
  productId: string,
  handle?: string | null
): string[] {
  const tags = new Set<string>([
    CATALOG_TAGS.root,
    CATALOG_TAGS.products,
    CATALOG_TAGS.product(productId),
    CATALOG_TAGS.prices,
    CATALOG_TAGS.inventory,
    CATALOG_TAGS.search,
    CATALOG_TAGS.feed,
    CATALOG_TAGS.sitemap,
  ])
  if (handle) tags.add(CATALOG_TAGS.handle(handle))
  return [...tags]
}

export function tagsForCategory(
  categoryId: string,
  handle?: string | null
): string[] {
  const tags = new Set<string>([
    CATALOG_TAGS.root,
    CATALOG_TAGS.categories,
    CATALOG_TAGS.category(categoryId),
    CATALOG_TAGS.products,
    CATALOG_TAGS.search,
    CATALOG_TAGS.sitemap,
  ])
  if (handle) tags.add(CATALOG_TAGS.categoryHandle(handle))
  return [...tags]
}

export function tagsForPriceDimension(fallbackGlobal = false): string[] {
  if (fallbackGlobal) {
    return [
      CATALOG_TAGS.root,
      CATALOG_TAGS.prices,
      CATALOG_TAGS.products,
      CATALOG_TAGS.feed,
      CATALOG_TAGS.sitemap,
    ]
  }
  return [CATALOG_TAGS.prices]
}

export function tagsForInventoryDimension(fallbackGlobal = false): string[] {
  if (fallbackGlobal) {
    return [
      CATALOG_TAGS.root,
      CATALOG_TAGS.inventory,
      CATALOG_TAGS.products,
      CATALOG_TAGS.feed,
    ]
  }
  return [CATALOG_TAGS.inventory]
}

export function tagsForPim(productId: string, handle?: string | null): string[] {
  const tags = tagsForProduct(productId, handle)
  tags.push(CATALOG_TAGS.categories)
  return [...new Set(tags)]
}
