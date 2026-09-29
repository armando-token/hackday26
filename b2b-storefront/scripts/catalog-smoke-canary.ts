/**
 * Smoke probe canario: compara JSON vs Medusa para handles clave (plan §22).
 *
 *   npx tsx scripts/catalog-smoke-canary.ts pe
 *
 * No importa catalog-repository (server-only); usa Store API directa.
 */

import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"
import { mapMedusaStoreProductToCatalogProduct } from "../src/lib/catalog/catalog-mappers"
import { parseMedusaProduct } from "../src/lib/catalog/catalog-schema"

const MEDUSA_CATALOG_FIELDS =
  "id,title,subtitle,description,handle,status,thumbnail,created_at,updated_at,metadata,*images,*categories,*categories.parent_category,*variants,*variants.options,+variants.inventory_quantity,*variants.calculated_price,+brand.*,+pim_info.*"

const JSON_PRODUCTS = resolve(
  process.cwd(),
  "src/lib/cn-catalog/data/products.json"
)

const CANARY_HANDLES = [
  "sensores-con-punta-de-metal",
  "sensor-rtd-con-cabezal-y-conexion-a-proceso",
  "cintas-aislante-foam-tape",
  "termopar-de-bayoneta-ajustable",
  "tzone-bt07-data-logger",
]


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

type JsonProduct = {
  handle: string
  price?: number
  categorySlug?: string
}

function loadJsonMap(): Map<string, JsonProduct> {
  const raw = JSON.parse(readFileSync(JSON_PRODUCTS, "utf8"))
  const list: JsonProduct[] = Array.isArray(raw) ? raw : raw.products || []
  return new Map(list.map((p) => [p.handle, p]))
}

async function fetchMedusaProduct(
  handle: string,
  regionId: string,
  backendUrl: string,
  publishableKey: string
) {
  const url = new URL(`${backendUrl}/store/products`)
  url.searchParams.set("handle", handle)
  url.searchParams.set("region_id", regionId)
  url.searchParams.set("fields", MEDUSA_CATALOG_FIELDS)
  url.searchParams.set("limit", "1")

  const res = await fetch(url, {
    headers: { "x-publishable-api-key": publishableKey },
  })
  const json = await res.json()
  const raw = json.products?.[0]
  if (!raw) {
    return null
  }
  return mapMedusaStoreProductToCatalogProduct(parseMedusaProduct(raw))
}

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

  const jsonMap = loadJsonMap()

  console.log("=".repeat(60))
  console.log(`CANARY SMOKE — ${CANARY_HANDLES.length} handles`)
  console.log("=".repeat(60))

  let failures = 0
  for (const handle of CANARY_HANDLES) {
    const j = jsonMap.get(handle)
    let m: Awaited<ReturnType<typeof fetchMedusaProduct>>
    try {
      m = await fetchMedusaProduct(handle, region.id, backendUrl, publishableKey)
    } catch (e) {
      console.log(`[FAIL] ${handle}: error Medusa — ${e}`)
      failures++
      continue
    }

    if (!j || !m) {
      console.log(`[FAIL] ${handle}: falta en ${!j ? "JSON" : "Medusa"}`)
      failures++
      continue
    }

    const jPrice = typeof j.price === "number" ? j.price : 0
    const mPrice = m.display.price?.amount ?? 0
    const priceOk = Math.abs(jPrice - mPrice) < 0.01
    const jLeaf = j.categorySlug || ""
    const leafOk = jLeaf === m.leafCategory.handle

    if (!priceOk || !leafOk) {
      failures++
      console.log(
        `[FAIL] ${handle}: precio json=${jPrice} medusa=${mPrice} leaf json=${jLeaf} medusa=${m.leafCategory.handle}`
      )
    } else {
      console.log(`[PASS] ${handle}: S/ ${mPrice.toFixed(2)} @ ${m.leafCategory.handle}`)
    }
  }

  console.log("=".repeat(60))
  console.log(failures ? `FALLAS: ${failures}` : "TODOS OK")
  process.exit(failures ? 1 : 0)
}

main()
