import "server-only"

import { cache } from "react"
import { sdk } from "@lib/config"
import { getRegion } from "@lib/data/regions"
import { CatalogContractError, CatalogNetworkError } from "./catalog-errors"
import { catalogProductTags, catalogRevalidateOptions } from "./catalog-cache"
import { mapMedusaStoreProductToCatalogProduct } from "./catalog-mappers"
import {
  parseMedusaProduct,
  parseMedusaProductList,
} from "./catalog-schema"
import type { CatalogProduct, CatalogProductList } from "./catalog-types"
import type { MedusaStoreProductListResponse } from "./medusa-types"

/**
 * Campos Store API sin espacios (plan maestro, §7.1).
 * Alias pim_info confirmado en contrato de la Fase 1.
 */
export const MEDUSA_CATALOG_FIELDS =
  "id,title,subtitle,description,handle,status,thumbnail,created_at,updated_at,metadata,*tags,*images,*categories,*categories.parent_category,*variants,*variants.options,+variants.inventory_quantity,*variants.calculated_price,+brand.*,+pim_info.*"

const PAGE_SIZE = 100

async function fetchMedusaProductPage(
  regionId: string,
  offset: number,
  extraQuery?: Record<string, string | number | undefined>
): Promise<MedusaStoreProductListResponse> {
  try {
    const data = await sdk.client.fetch<unknown>("/store/products", {
      query: {
        limit: PAGE_SIZE,
        offset,
        region_id: regionId,
        fields: MEDUSA_CATALOG_FIELDS,
        ...extraQuery,
      },
      ...catalogRevalidateOptions([
        "catalog",
        "catalog:products",
        "catalog:prices",
        "catalog:inventory",
      ]),
      cache: "force-cache",
    })
    return parseMedusaProductList(data)
  } catch (error) {
    if (error instanceof CatalogContractError) {
      throw error
    }
    throw new CatalogNetworkError("Error al consultar productos en Medusa", {
      cause: error,
    })
  }
}

async function resolveRegionId(countryCode: string): Promise<string> {
  const region = await getRegion(countryCode)
  if (!region?.id) {
    throw new CatalogNetworkError(
      `No se encontro region para el pais ${countryCode}`
    )
  }
  return region.id
}

function mapProductsOrThrow(products: MedusaStoreProductListResponse["products"]) {
  const mapped: CatalogProduct[] = []
  const errors: CatalogContractError[] = []

  for (const raw of products) {
    try {
      mapped.push(mapMedusaStoreProductToCatalogProduct(parseMedusaProduct(raw)))
    } catch (error) {
      if (error instanceof CatalogContractError) {
        errors.push(error)
        continue
      }
      throw error
    }
  }

  if (errors.length) {
    const first = errors[0]
    throw new CatalogContractError(
      `${errors.length} producto(s) con error de contrato; primero: ${first.message}`,
      {
        productId: first.productId,
        handle: first.handle,
        field: first.field,
      }
    )
  }

  return mapped
}

/** Lista todo el catálogo paginando hasta count (§7.1). Memoizada por request. */
async function listAllMedusaCatalogProductsImpl(
  countryCode: string
): Promise<CatalogProduct[]> {
  const regionId = await resolveRegionId(countryCode)
  const all: CatalogProduct[] = []
  let offset = 0
  let total = Infinity

  while (offset < total) {
    const page = await fetchMedusaProductPage(regionId, offset)
    total = page.count
    all.push(...mapProductsOrThrow(page.products))
    offset += PAGE_SIZE
    if (!page.products.length) {
      break
    }
  }

  return all
}

export const listAllMedusaCatalogProducts = cache(listAllMedusaCatalogProductsImpl)

async function getCachedCatalogProducts(
  countryCode: string
): Promise<CatalogProduct[]> {
  return listAllMedusaCatalogProducts(countryCode)
}

export async function getMedusaCatalogProductByHandle(
  handle: string,
  countryCode: string
): Promise<CatalogProduct | null> {
  const regionId = await resolveRegionId(countryCode)
  const page = await fetchMedusaProductPage(regionId, 0, { handle, limit: 1 })

  const raw = page.products[0]
  if (raw && raw.handle === handle) {
    return mapMedusaStoreProductToCatalogProduct(parseMedusaProduct(raw))
  }

  // Fallback: búsqueda por SKU o coincidencia case-insensitive en catálogo
  try {
    const all = await getCachedCatalogProducts(countryCode)
    const normalized = handle.toLowerCase().trim()
    const matched = all.find(
      (p) =>
        p.handle.toLowerCase() === normalized ||
        p.primaryVariant?.sku?.toLowerCase() === normalized ||
        p.variants?.some((v) => v.sku?.toLowerCase() === normalized) ||
        p.pim?.itemNumber?.toLowerCase() === normalized
    )
    if (matched) {
      return matched
    }
  } catch {}

  return null
}

export async function searchMedusaCatalogProducts(
  query: string,
  countryCode: string,
  options?: { limit?: number; offset?: number }
): Promise<CatalogProductList> {
  const regionId = await resolveRegionId(countryCode)
  const limit = options?.limit ?? 20
  const offset = options?.offset ?? 0

  const page = await fetchMedusaProductPage(regionId, offset, {
    q: query,
    limit,
  })

  const products = mapProductsOrThrow(page.products)
  return { products, count: page.count }
}

export async function getMedusaCatalogProductsByCategory(
  categoryHandle: string,
  countryCode: string
): Promise<CatalogProduct[]> {
  const all = await getCachedCatalogProducts(countryCode)
  return all.filter((p) =>
    p.categories.some((c) => c.handle === categoryHandle)
  )
}

export async function getMedusaCatalogProductsByLeafSlug(
  leafHandle: string,
  countryCode: string
): Promise<CatalogProduct[]> {
  const all = await getCachedCatalogProducts(countryCode)
  return all.filter((p) => p.leafCategory.handle === leafHandle)
}

export async function getMedusaCatalogProductsByHandles(
  handles: string[],
  countryCode: string
): Promise<CatalogProduct[]> {
  const wanted = new Set(handles)
  const all = await getCachedCatalogProducts(countryCode)
  const byHandle = new Map(all.map((p) => [p.handle, p]))

  return handles
    .map((h) => byHandle.get(h))
    .filter((p): p is CatalogProduct => Boolean(p))
}
