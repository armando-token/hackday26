/**
 * Fixed columns for a product-TYPE leaf (Technical View).
 * Uses LEAF_SPEC_SCHEMA as ordered whitelist, then fill-rate + aliases.
 */

import leafSchemaJson from "./data/leaf-spec-schema.json"
import type { CnProduct } from "./products"
import {
  getSpecValue,
  shouldSkipSpecColumn,
  canonicalSpecKey,
} from "./spec-aliases"

export const LEAF_SPEC_SCHEMA = leafSchemaJson as Record<string, string[]>

const FILL_MIN = 0.4

function columnFill(products: CnProduct[], key: string): number {
  if (!products.length) return 0
  let hit = 0
  for (const p of products) {
    if (getSpecValue(p, key)) hit++
  }
  return hit / products.length
}

function freqKeys(products: CnProduct[]): string[] {
  const freq = new Map<string, number>()
  for (const p of products) {
    const seen = new Set<string>()
    for (const k of Object.keys(p.specs || {})) {
      const canon = canonicalSpecKey(k)
      if (shouldSkipSpecColumn(canon)) continue
      if (seen.has(canon)) continue
      seen.add(canon)
      if (getSpecValue(p, canon)) freq.set(canon, (freq.get(canon) || 0) + 1)
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
    .map(([k]) => k)
}

/**
 * Columns for Technical View: schema order → fill ≥40% → pad with frequent keys.
 * Always excludes Marca/Modelo when Brand column is shown separately.
 */
export function getLeafSpecColumns(
  leafSlug: string | undefined,
  products: CnProduct[],
  max = 6
): string[] {
  const n = products.length
  if (!n) return []

  const out: string[] = []
  const used = new Set<string>()

  const push = (key: string) => {
    const canon = canonicalSpecKey(key)
    if (shouldSkipSpecColumn(canon)) return
    if (used.has(canon)) return
    if (columnFill(products, canon) < FILL_MIN && out.length > 0) {
      // allow first schema cols only if they meet fill; skip sparse
      return
    }
    if (columnFill(products, canon) < FILL_MIN) return
    used.add(canon)
    out.push(canon)
  }

  const schema = leafSlug ? LEAF_SPEC_SCHEMA[leafSlug] || [] : []
  for (const k of schema) {
    if (out.length >= max) break
    push(k)
  }

  for (const k of freqKeys(products)) {
    if (out.length >= max) break
    push(k)
  }

  return out.slice(0, max)
}

export { getSpecValue }
