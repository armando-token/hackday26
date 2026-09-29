/**
 * Certifica el gate de la Fase 2: los 498 productos publicados deben
 * transformarse a CatalogProduct sin CatalogContractError.
 *
 * Uso:
 *   cd b2b-storefront
 *   CATALOG_SOURCE=medusa npx tsx scripts/catalog-contract-check.ts pe
 *
 * Requiere MEDUSA_BACKEND_URL y NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY en .env.local
 */

import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

function loadLocalEnv() {
  const path = resolve(process.cwd(), ".env.local")
  if (!existsSync(path)) {
    return
  }
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }
    const eq = trimmed.indexOf("=")
    if (eq === -1) {
      continue
    }
    const key = trimmed.slice(0, eq)
    const value = trimmed.slice(eq + 1)
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

loadLocalEnv()

import { CatalogContractError } from "../src/lib/catalog/catalog-errors"
import { mapMedusaStoreProductToCatalogProduct } from "../src/lib/catalog/catalog-mappers"
import { parseMedusaProduct } from "../src/lib/catalog/catalog-schema"

const MEDUSA_CATALOG_FIELDS =
  "id,title,subtitle,description,handle,status,thumbnail,created_at,updated_at,*images,*categories,*categories.parent_category,*variants,*variants.options,+variants.inventory_quantity,*variants.calculated_price,+brand.*,+pim_info.*"

const PAGE_SIZE = 100

async function main() {
  const countryCode = process.argv[2] || "pe"
  const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://127.0.0.1:9000"
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  if (!publishableKey) {
    console.error("Falta NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY")
    process.exit(1)
  }

  const regionsRes = await fetch(`${backendUrl}/store/regions`, {
    headers: { "x-publishable-api-key": publishableKey },
  })
  const regionsJson = await regionsRes.json()
  const region = (regionsJson.regions || []).find((r: { countries?: { iso_2: string }[] }) =>
    r.countries?.some((c) => c.iso_2 === countryCode)
  )
  if (!region?.id) {
    console.error(`Region no encontrada para ${countryCode}`)
    process.exit(1)
  }

  const errors: CatalogContractError[] = []
  let offset = 0
  let total = Infinity
  let ok = 0

  console.log("=".repeat(70))
  console.log("CERTIFICACION CatalogProduct v1 — Medusa → storefront")
  console.log(`Region: ${region.id} (${countryCode})`)
  console.log("=".repeat(70))

  while (offset < total) {
    const url = new URL(`${backendUrl}/store/products`)
    url.searchParams.set("limit", String(PAGE_SIZE))
    url.searchParams.set("offset", String(offset))
    url.searchParams.set("region_id", region.id)
    url.searchParams.set("fields", MEDUSA_CATALOG_FIELDS)

    const res = await fetch(url, {
      headers: { "x-publishable-api-key": publishableKey },
    })
    const json = await res.json()
    total = json.count ?? 0

    for (const raw of json.products || []) {
      try {
        mapMedusaStoreProductToCatalogProduct(parseMedusaProduct(raw))
        ok++
      } catch (error) {
        if (error instanceof CatalogContractError) {
          errors.push(error)
        } else {
          throw error
        }
      }
    }

    offset += PAGE_SIZE
    if (!(json.products || []).length) {
      break
    }
  }

  console.log(`[OK] Productos transformados: ${ok}/${total}`)
  console.log(`[${errors.length ? "FAIL" : "PASS"}] ContractError: esperado=0 actual=${errors.length}`)

  if (errors.length) {
    console.log("\nPrimeros 10 errores:")
    for (const err of errors.slice(0, 10)) {
      console.log(
        `  - ${err.handle || err.productId}: ${err.field} — ${err.message}`
      )
    }
    process.exit(1)
  }

  console.log("=".repeat(70))
  console.log("GATE FASE 2: PASS")
  console.log("=".repeat(70))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
