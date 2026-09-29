import "server-only"

import type { CatalogProduct, CatalogProductList } from "./catalog-types"
import {
  getMedusaCatalogProductByHandle,
  getMedusaCatalogProductsByCategory,
  getMedusaCatalogProductsByHandles,
  getMedusaCatalogProductsByLeafSlug,
  listAllMedusaCatalogProducts,
  searchMedusaCatalogProducts,
} from "./catalog-repository"

export type CatalogSource = "medusa"

/**
 * Fuente de catálogo server-only (plan maestro, §11).
 * Fase 7: Medusa es la única fuente activa; el fallback JSON fue retirado.
 */
export function getCatalogSource(): CatalogSource {
  const raw = (process.env.CATALOG_SOURCE || "medusa").toLowerCase()
  if (raw === "json") {
    throw new Error(
      "CATALOG_SOURCE=json fue retirado en la Fase 7. Configure CATALOG_SOURCE=medusa."
    )
  }
  return "medusa"
}

export async function listAllCatalogProducts(
  countryCode: string
): Promise<CatalogProduct[]> {
  getCatalogSource()
  return listAllMedusaCatalogProducts(countryCode)
}

export async function getCatalogProductByHandle(
  handle: string,
  countryCode: string
): Promise<CatalogProduct | null> {
  getCatalogSource()
  return getMedusaCatalogProductByHandle(handle, countryCode)
}

export async function searchCatalogProducts(
  query: string,
  countryCode: string,
  options?: { limit?: number; offset?: number }
): Promise<CatalogProductList> {
  getCatalogSource()
  return searchMedusaCatalogProducts(query, countryCode, options)
}

export async function getCatalogProductsByLeafSlug(
  leafHandle: string,
  countryCode: string
): Promise<CatalogProduct[]> {
  getCatalogSource()
  return getMedusaCatalogProductsByLeafSlug(leafHandle, countryCode)
}

export async function getCatalogProductsByHandles(
  handles: string[],
  countryCode: string
): Promise<CatalogProduct[]> {
  if (!handles.length) {
    return []
  }
  getCatalogSource()
  return getMedusaCatalogProductsByHandles(handles, countryCode)
}

export async function getCatalogProductsByCategory(
  categoryHandle: string,
  countryCode: string
): Promise<CatalogProduct[]> {
  getCatalogSource()
  return getMedusaCatalogProductsByCategory(categoryHandle, countryCode)
}

function normalizeSkuToken(token: string): string {
  return token.toLowerCase().replace(/[^a-z0-9-_]/g, "")
}

/** Resuelve tokens SKU / ítem / handle contra el catálogo activo (quick-order). */
export async function lookupCatalogProductsBySkuTokens(
  tokens: string[],
  countryCode: string
): Promise<Record<string, CatalogProduct>> {
  const unique = [...new Set(tokens.map(normalizeSkuToken).filter(Boolean))]
  if (!unique.length) {
    return {}
  }

  const all = await listAllCatalogProducts(countryCode)
  const result: Record<string, CatalogProduct> = {}

  for (const token of unique) {
    const matched = all.find((p) => {
      const pItem = (p.pim.itemNumber || "").toLowerCase()
      const pMfr = (p.pim.mfrModel || "").toLowerCase()
      const pHandle = p.handle.toLowerCase()
      return (
        pItem === token ||
        pMfr === token ||
        pHandle === token ||
        (pItem.length > 0 && pItem.includes(token)) ||
        (pItem.length > 0 && token.includes(pItem))
      )
    })
    if (matched) {
      result[token] = matched
    }
  }

  return result
}
