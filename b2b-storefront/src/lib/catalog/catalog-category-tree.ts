import "server-only"

import { cache } from "react"
import { sdk } from "@lib/config"
import type { CnCategoryNode } from "@lib/cn-catalog/taxonomy"
import { familyImage } from "@lib/cn-catalog/category-images"
import { normalizeMediaUrl } from "./catalog-mappers"
import { catalogRevalidateOptions } from "./catalog-cache"
import { listAllCatalogProducts } from "./catalog-source"

export type MedusaStoreCategoryNode = {
  id: string
  handle: string
  name: string
  description?: string | null
  is_active?: boolean
  rank?: number | null
  metadata?: { image_url?: string; [key: string]: unknown } | null
  category_children?: MedusaStoreCategoryNode[]
}

export function mapMedusaCategoryToNode(
  raw: MedusaStoreCategoryNode,
  productCounts: Map<string, number> = new Map()
): CnCategoryNode {
  const children = (raw.category_children || [])
    .filter((child) => child.is_active !== false)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    .map((child) => mapMedusaCategoryToNode(child, productCounts))

  const leafCount = productCounts.get(raw.handle) ?? 0
  const childTotal = children.reduce(
    (sum, child) => sum + (child.productCount ?? 0),
    0
  )

  const rawImageUrl =
    typeof raw.metadata?.image_url === "string" ? raw.metadata.image_url : null
  const normalized = normalizeMediaUrl(rawImageUrl)
  const imageUrl = normalized || familyImage(raw.handle)

  return {
    slug: raw.handle,
    name: raw.name,
    description: raw.description?.trim() || undefined,
    productCount: children.length ? childTotal : leafCount,
    children: children.length ? children : undefined,
    imageUrl,
    metadata: raw.metadata ?? null,
  }
}

async function fetchRootCategories(): Promise<MedusaStoreCategoryNode[]> {
  const data = await sdk.client.fetch<{
    product_categories?: MedusaStoreCategoryNode[]
  }>("/store/product-categories", {
    query: {
      parent_category_id: "null",
      limit: 100,
      fields:
        "id,handle,name,description,is_active,rank,metadata,*category_children,*category_children.metadata,*category_children.category_children,*category_children.category_children.metadata",
    },
    ...catalogRevalidateOptions([
      "catalog",
      "catalog:categories",
      "catalog:taxonomy",
    ]),
    cache: "force-cache",
  })

  return (data.product_categories || []).filter((c) => c.is_active !== false)
}

function buildProductCountIndex(
  countryCode: string,
  products: Awaited<ReturnType<typeof listAllCatalogProducts>>
): Map<string, number> {
  const counts = new Map<string, number>()
  for (const product of products) {
    const handle = product.leafCategory.handle
    counts.set(handle, (counts.get(handle) ?? 0) + 1)
  }
  return counts
}

export const getCatalogCategoryTree = cache(
  async (countryCode = "us"): Promise<CnCategoryNode> => {
    const [roots, products] = await Promise.all([
      fetchRootCategories(),
      listAllCatalogProducts(countryCode),
    ])

    const productCounts = buildProductCountIndex(countryCode, products)
    const children = roots
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
      .map((root) => mapMedusaCategoryToNode(root, productCounts))

    return {
      slug: "catalogo",
      name: "Catalog",
      description:
        "Electric heating, heat tracing, industrial control and instrumentation, monitoring, PLC, and insulation.",
      productCount: products.length,
      children,
    }
  }
)

export function findCategoryInTree(
  slugs: string[],
  root: CnCategoryNode
): CnCategoryNode | null {
  if (!slugs.length) return root
  let node: CnCategoryNode = root
  for (const slug of slugs) {
    const next = node.children?.find((child) => child.slug === slug)
    if (!next) return null
    node = next
  }
  return node
}

export function getCategoryPathInTree(
  slugs: string[],
  root: CnCategoryNode
): CnCategoryNode[] {
  const path: CnCategoryNode[] = []
  let node: CnCategoryNode = root
  for (const slug of slugs) {
    const next = node.children?.find((child) => child.slug === slug)
    if (!next) break
    path.push(next)
    node = next
  }
  return path
}

export function flattenCategoryTree(
  root: CnCategoryNode,
  parentPath: string[] = []
): { path: string[]; node: CnCategoryNode }[] {
  const path =
    root.slug === "catalogo" ? parentPath : [...parentPath, root.slug]
  const self =
    root.slug === "catalogo" ? [] : [{ path, node: root }]
  const kids =
    root.children?.flatMap((child) => flattenCategoryTree(child, path)) ?? []
  return [...self, ...kids]
}

export function getL1Families(root: CnCategoryNode): CnCategoryNode[] {
  return root.children ?? []
}
