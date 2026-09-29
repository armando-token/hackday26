/**
 * Facetas derivadas de CatalogProduct[] (plan maestro, §12.2).
 * Reutiliza la lógica de alias de specs; la fuente de atributos es siempre pim.specs.
 */

import type { CatalogProduct } from "./catalog-types"
import { getCatalogSpecValue } from "./catalog-present"
import {
  canonicalSpecKey,
  normalizeFacetValue,
  shouldSkipSpecColumn,
} from "@lib/cn-catalog/spec-aliases"
import { LEAF_SPEC_SCHEMA } from "@lib/cn-catalog/leaf-spec-schema"

export type { FacetSelection } from "@lib/cn-catalog/facets"
export {
  toggleFacetValue,
  facetValueLabel,
  FACET_MAX,
  FACET_OPTIONS_PREVIEW,
} from "@lib/cn-catalog/facets"

export type FacetOption = { value: string; count: number }
export type CategoryFacet = {
  key: string
  label: string
  options: FacetOption[]
}

function countBy(values: string[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const v of values) {
    if (!v || v === "————") continue
    const t = v.trim()
    if (!t) continue
    m.set(t, (m.get(t) || 0) + 1)
  }
  return m
}

function mapToOptions(m: Map<string, number>): FacetOption[] {
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
    .map(([value, count]) => ({ value, count }))
}

function uniqueHeavy(options: Map<string, number>, n: number): boolean {
  if (options.size < 2) return true
  const singles = [...options.values()].filter((c) => c === 1).length
  return singles / options.size > 0.6 || options.size > Math.max(12, n * 0.55)
}

export function buildCatalogFacets(
  products: CatalogProduct[],
  opts?: {
    includeGroupFacet?: { id: string; title: string; count: number }[]
    leafSlug?: string
  }
): CategoryFacet[] {
  const facets: CategoryFacet[] = []
  const n = products.length
  if (!n) return facets

  const brands = countBy(products.map((p) => p.brand?.name || ""))
  if (brands.size >= 2) {
    facets.push({ key: "brand", label: "Marca", options: mapToOptions(brands) })
  }

  const priced = products.filter(
    (p) => !p.display.requiresQuote && (p.display.price?.amount ?? 0) > 0
  )
  const quote = products.filter((p) => p.display.requiresQuote)
  if (priced.length > 0 && quote.length > 0) {
    facets.push({
      key: "priceMode",
      label: "Price",
      options: [
        { value: "fixed", count: priced.length },
        { value: "quote", count: quote.length },
      ],
    })
  }

  const inStock = products.filter(
    (p) => p.display.availability === "in_stock"
  ).length
  const out = n - inStock
  if (inStock > 0 && out > 0) {
    facets.push({
      key: "inStock",
      label: "Availability",
      options: [
        { value: "in", count: inStock },
        { value: "out", count: out },
      ],
    })
  }

  if (opts?.includeGroupFacet && opts.includeGroupFacet.length > 1) {
    facets.push({
      key: "group",
      label: "Tipo de producto",
      options: opts.includeGroupFacet.map((g) => ({
        value: g.id,
        count: g.count,
      })),
    })
  }

  const prefer = new Set(
    opts?.leafSlug ? LEAF_SPEC_SCHEMA[opts.leafSlug] || [] : []
  )
  const allowAlways = new Set([
    "Voltaje",
    "Potencia",
    "Warranty",
    "Alimentación",
    "Tensión Nominal",
    "Tipo de Dispositivo",
    "Dimensiones",
  ])

  const specFreq = new Map<string, Map<string, number>>()
  const specCoverage = new Map<string, number>()

  for (const p of products) {
    const seen = new Set<string>()
    const keys = new Set([
      ...Object.keys(p.pim.specs || {}),
      ...prefer,
      ...allowAlways,
    ])
    for (const rawKey of keys) {
      const key = canonicalSpecKey(rawKey)
      if (shouldSkipSpecColumn(key)) continue
      let val = getCatalogSpecValue(p, key)
      if (!val) continue
      val = normalizeFacetValue(key, val)
      if (val.length > 72) val = val.slice(0, 69) + "…"
      if (!specFreq.has(key)) specFreq.set(key, new Map())
      const m = specFreq.get(key)!
      m.set(val, (m.get(val) || 0) + 1)
      if (!seen.has(key)) {
        seen.add(key)
        specCoverage.set(key, (specCoverage.get(key) || 0) + 1)
      }
    }
  }

  const specFacets: CategoryFacet[] = []
  for (const [key, coverage] of specCoverage.entries()) {
    const optionsMap = specFreq.get(key)!
    const ratio = coverage / n
    const forced = prefer.has(key) || allowAlways.has(key)
    if (!forced && ratio < 0.2) continue
    if (forced && ratio < 0.12) continue
    if (optionsMap.size < 2) continue
    if (optionsMap.size > 28 && !forced) continue
    if (uniqueHeavy(optionsMap, n) && !forced) continue
    specFacets.push({
      key: `spec:${key}`,
      label: key,
      options: mapToOptions(optionsMap),
    })
  }

  facets.push(...specFacets.slice(0, 10 - facets.length))
  return facets
}

export function catalogProductMatchesFacets(
  product: CatalogProduct,
  selected: Record<string, string[]>,
  groupId?: string
): boolean {
  for (const [key, values] of Object.entries(selected)) {
    if (!values.length) continue
    if (key === "brand") {
      if (!values.includes(product.brand?.name || "")) return false
      continue
    }
    if (key === "priceMode") {
      const mode = product.display.requiresQuote ? "quote" : "fixed"
      if (!values.includes(mode)) return false
      continue
    }
    if (key === "inStock") {
      const v =
        product.display.availability === "in_stock" ? "in" : "out"
      if (!values.includes(v)) return false
      continue
    }
    if (key === "group") {
      if (groupId && !values.includes(groupId)) return false
      continue
    }
    if (key.startsWith("spec:")) {
      const specKey = key.slice(5)
      const raw = getCatalogSpecValue(product, specKey)
      const norm = normalizeFacetValue(specKey, raw)
      const truncated = norm.length > 72 ? norm.slice(0, 69) + "…" : norm
      if (
        !values.includes(raw) &&
        !values.includes(norm) &&
        !values.includes(truncated)
      ) {
        return false
      }
    }
  }
  return true
}
