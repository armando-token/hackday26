/**
 * Dynamic category facets: derived from products on THIS page.
 */

import type { CnProduct } from "./products"
import {
  getSpecValue,
  normalizeFacetValue,
  shouldSkipSpecColumn,
  canonicalSpecKey,
} from "./spec-aliases"
import { LEAF_SPEC_SCHEMA } from "./leaf-spec-schema"

export type FacetOption = {
  value: string
  count: number
}

export type CategoryFacet = {
  key: string
  label: string
  options: FacetOption[]
}

export const FACET_MAX = 10
export const FACET_OPTIONS_PREVIEW = 8

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

/**
 * Build sidebar facets for the current product set.
 */
export function buildCategoryFacets(
  products: CnProduct[],
  opts?: {
    includeGroupFacet?: { id: string; title: string; count: number }[]
    leafSlug?: string
  }
): CategoryFacet[] {
  const facets: CategoryFacet[] = []
  const n = products.length
  if (!n) return facets

  const brands = countBy(products.map((p) => p.brand || ""))
  if (brands.size >= 2) {
    facets.push({
      key: "brand",
      label: "Marca",
      options: mapToOptions(brands),
    })
  }

  const priced = products.filter((p) => p.priceMode === "fixed" && p.price > 0)
  const quote = products.filter((p) => p.priceMode === "quote" || p.price <= 0)
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

  // Price range buckets for fixed-price products
  if (priced.length >= 3) {
    const prices = priced.map((p) => p.price).sort((a, b) => a - b)
    const q1 = prices[Math.floor(prices.length * 0.33)]
    const q2 = prices[Math.floor(prices.length * 0.66)]
    const buckets = [
      { value: `0-${q1}`, count: 0, label: `Hasta S/ ${q1.toFixed(0)}` },
      { value: `${q1}-${q2}`, count: 0, label: `S/ ${q1.toFixed(0)} – ${q2.toFixed(0)}` },
      {
        value: `${q2}-999999`,
        count: 0,
        label: `Más de S/ ${q2.toFixed(0)}`,
      },
    ]
    for (const p of priced) {
      if (p.price <= q1) buckets[0].count++
      else if (p.price <= q2) buckets[1].count++
      else buckets[2].count++
    }
    facets.push({
      key: "priceRange",
      label: "Price",
      options: buckets
        .filter((b) => b.count > 0)
        .map((b) => ({ value: b.value, count: b.count })),
    })
  }

  const inStock = products.filter((p) => p.inStock).length
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

  // Prefer leaf schema keys + high-fill specs
  const prefer = new Set(opts?.leafSlug ? LEAF_SPEC_SCHEMA[opts.leafSlug] || [] : [])
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
      ...Object.keys(p.specs || {}),
      ...prefer,
      ...allowAlways,
    ])
    for (const rawKey of keys) {
      const key = canonicalSpecKey(rawKey)
      if (shouldSkipSpecColumn(key)) continue
      let val = getSpecValue(p, key)
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
    // Still skip if almost all unique even when forced
    if (forced && optionsMap.size > 20 && uniqueHeavy(optionsMap, n)) continue
    specFacets.push({
      key: `spec:${key}`,
      label: key,
      options: mapToOptions(optionsMap),
    })
  }

  specFacets.sort((a, b) => {
    const ca = specCoverage.get(a.label) || 0
    const cb = specCoverage.get(b.label) || 0
    const fa = prefer.has(a.label) || allowAlways.has(a.label) ? 1 : 0
    const fb = prefer.has(b.label) || allowAlways.has(b.label) ? 1 : 0
    return fb - fa || cb - ca
  })

  facets.push(...specFacets.slice(0, FACET_MAX - facets.length))
  return facets
}

export type FacetSelection = Record<string, string[]>

export function emptyFacetSelection(): FacetSelection {
  return {}
}

export function toggleFacetValue(
  selected: FacetSelection,
  facetKey: string,
  value: string
): FacetSelection {
  const cur = selected[facetKey] || []
  const next = cur.includes(value)
    ? cur.filter((v) => v !== value)
    : [...cur, value]
  const out = { ...selected }
  if (next.length === 0) delete out[facetKey]
  else out[facetKey] = next
  return out
}

export function productMatchesFacets(
  product: CnProduct,
  selected: FacetSelection,
  groupId?: string
): boolean {
  for (const [key, values] of Object.entries(selected)) {
    if (!values.length) continue
    if (key === "brand") {
      if (!values.includes(product.brand)) return false
      continue
    }
    if (key === "priceMode") {
      const mode =
        product.priceMode === "quote" || product.price <= 0 ? "quote" : "fixed"
      if (!values.includes(mode)) return false
      continue
    }
    if (key === "priceRange") {
      if (product.priceMode === "quote" || product.price <= 0) return false
      const ok = values.some((range) => {
        const [lo, hi] = range.split("-").map(Number)
        return product.price >= lo && product.price <= hi
      })
      if (!ok) return false
      continue
    }
    if (key === "inStock") {
      const v = product.inStock ? "in" : "out"
      if (!values.includes(v)) return false
      continue
    }
    if (key === "group") {
      if (groupId && !values.includes(groupId)) return false
      continue
    }
    if (key.startsWith("spec:")) {
      const specKey = key.slice(5)
      const raw = getSpecValue(product, specKey)
      const norm = normalizeFacetValue(specKey, raw)
      const truncated = norm.length > 72 ? norm.slice(0, 69) + "…" : norm
      if (
        !values.includes(raw) &&
        !values.includes(norm) &&
        !values.includes(truncated)
      ) {
        return false
      }
      continue
    }
  }
  return true
}

export function facetValueLabel(facetKey: string, value: string): string {
  if (facetKey === "priceMode") {
    return value === "quote" ? "Solicitar quote" : "Price publicado"
  }
  if (facetKey === "inStock") {
    return value === "in" ? "En stock" : "Sin stock"
  }
  if (facetKey === "priceRange") {
    const [lo, hi] = value.split("-").map(Number)
    if (lo === 0) return `Hasta S/ ${hi}`
    if (hi >= 999999) return `Más de S/ ${lo}`
    return `S/ ${lo} – ${hi}`
  }
  return value
}
