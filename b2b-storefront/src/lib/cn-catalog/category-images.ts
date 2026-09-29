/** Local CN media mirrors (from ETL). */
import categoryImagesJson from "./data/category-images.json"
import type { CnCategoryNode } from "./taxonomy"

export const CN_FAMILY_IMAGES: Record<string, string> = categoryImagesJson as Record<string, string>
export const CN_LEAF_IMAGES: Record<string, string> = categoryImagesJson as Record<string, string>

const FALLBACK = "/cn-media/categories/calefaccion-electrica.webp"

export function familyImage(
  nodeOrSlug: CnCategoryNode | string,
  _idx = 0
): string {
  if (typeof nodeOrSlug === "object" && nodeOrSlug !== null) {
    if (nodeOrSlug.imageUrl) {
      return nodeOrSlug.imageUrl
    }
    return (
      CN_FAMILY_IMAGES[nodeOrSlug.slug] ||
      CN_LEAF_IMAGES[nodeOrSlug.slug] ||
      FALLBACK
    )
  }
  return CN_FAMILY_IMAGES[nodeOrSlug] || CN_LEAF_IMAGES[nodeOrSlug] || FALLBACK
}

export function leafImage(
  nodeOrSlug: CnCategoryNode | string,
  idx = 0
): string {
  return familyImage(nodeOrSlug, idx)
}

export function getCategoryImageUrl(
  nodeOrSlug: CnCategoryNode | string,
  idx = 0
): string {
  return familyImage(nodeOrSlug, idx)
}
