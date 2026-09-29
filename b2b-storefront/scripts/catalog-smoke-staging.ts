/**
 * Smoke staging post Fase 7 — verifica superficies críticas con Medusa.
 *
 *   npx tsx scripts/catalog-smoke-staging.ts pe
 */

import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

const BASE = process.env.SMOKE_BASE_URL || "http://127.0.0.1:8000"
const BACKEND = process.env.MEDUSA_BACKEND_URL || "http://127.0.0.1:9000"
const CANARY_HANDLE = "sensores-con-punta-de-metal"
const CANARY_SKU = "CN-10756"
const CANARY_PRICE = 89

function loadLocalEnv() {
  const path = resolve(process.cwd(), ".env.local")
  if (!existsSync(path)) return
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq)
    const value = trimmed.slice(eq + 1)
    if (!process.env[key]) process.env[key] = value
  }
}

loadLocalEnv()

const PUBLISHABLE = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

type Check = { name: string; ok: boolean; detail: string }

const checks: Check[] = []

function record(name: string, ok: boolean, detail: string) {
  checks.push({ name, ok, detail })
  console.log(`${ok ? "[PASS]" : "[FAIL]"} ${name}: ${detail}`)
}

/** Evita falsos positivos tipo "S/ 89" dentro de "S/ 8900.00". */
function htmlShowsExactPenPrice(html: string, amount: number): boolean {
  const formatted = amount.toFixed(2)
  const patterns = [
    new RegExp(`S/\\s*${formatted.replace(".", "\\.")}(?!\\d)`),
    new RegExp(`S/\\s*${Math.round(amount)}(?!\\d)`),
  ]
  return patterns.some((re) => re.test(html))
}

function feedHasGlaIds(feedText: string): boolean {
  return /gla_\d+/.test(feedText)
}

async function main() {
  const cc = process.argv[2] || "pe"
  console.log("=".repeat(60))
  console.log(`SMOKE STAGING — ${BASE} (${cc})`)
  console.log("=".repeat(60))

  try {
    const h = await fetch(`${BACKEND}/health`)
    record("Backend health", h.ok, `HTTP ${h.status}`)
  } catch (e) {
    record("Backend health", false, String(e))
  }

  try {
    const h = await fetch(`${BASE}/${cc}`)
    record("Storefront home", h.ok, `HTTP ${h.status}`)
  } catch (e) {
    record("Storefront home", false, String(e))
  }

  const pdpRes = await fetch(`${BASE}/${cc}/products/${CANARY_HANDLE}`)
  const pdpHtml = await pdpRes.text()
  record(
    "PDP HTTP",
    pdpRes.ok,
    `HTTP ${pdpRes.status} /products/${CANARY_HANDLE}`
  )
  const priceOk = htmlShowsExactPenPrice(pdpHtml, CANARY_PRICE)
  record(
    `PDP precio S/ ${CANARY_PRICE}`,
    priceOk,
    priceOk ? "importe exacto" : "no coincide o precio x100 visible"
  )
  record(
    `PDP SKU ${CANARY_SKU}`,
    pdpHtml.includes(CANARY_SKU),
    pdpHtml.includes(CANARY_SKU) ? "encontrado" : "no encontrado"
  )

  const catPath = `${cc}/store/sensores-transmisores/temperatura-termopar-rtd`
  const catRes = await fetch(`${BASE}/${catPath}`)
  const catHtml = await catRes.text()
  record("Categoría HTTP", catRes.ok, `HTTP ${catRes.status}`)
  record(
    "Categoría listado",
    catHtml.includes(CANARY_HANDLE) || catHtml.includes("Sensores"),
    "producto o título visible"
  )

  const searchRes = await fetch(`${BASE}/${cc}/search?q=sensor+rtd`)
  const searchHtml = await searchRes.text()
  record("Búsqueda HTTP", searchRes.ok, `HTTP ${searchRes.status}`)
  record(
    "Búsqueda resultados",
    searchHtml.includes("sensor") || searchHtml.includes("Sensor"),
    "contenido de búsqueda"
  )

  const apiUrl = `${BASE}/api/catalog/products?handles=${CANARY_HANDLE}&countryCode=${cc}`
  const apiRes = await fetch(apiUrl)
  let apiOk = false
  let apiDetail = `HTTP ${apiRes.status}`
  if (apiRes.ok) {
    try {
      const json = await apiRes.json()
      const p = json.products?.[0]
      const apiPrice = p?.display?.price?.amount
      const priceMatch =
        typeof apiPrice === "number" &&
        Math.abs(apiPrice - CANARY_PRICE) < 0.01
      apiOk = Boolean(
        p?.primaryVariant?.id &&
          p?.handle === CANARY_HANDLE &&
          priceMatch
      )
      apiDetail = apiOk
        ? `variantId=${p.primaryVariant.id.slice(0, 12)}… precio=${apiPrice}`
        : `variantId=${p?.primaryVariant?.id ? "ok" : "falta"} precio=${apiPrice}`
    } catch {
      apiDetail = "respuesta no JSON"
    }
  }
  record("API /api/catalog/products", apiOk, apiDetail)

  const searchApi = `${BASE}/api/catalog/search?q=sensor&countryCode=${cc}&limit=5`
  const searchApiRes = await fetch(searchApi)
  let searchApiOk = false
  if (searchApiRes.ok) {
    try {
      const json = await searchApiRes.json()
      searchApiOk = (json.products?.length || json.count) > 0
    } catch {
      searchApiOk = false
    }
  }
  record(
    "API /api/catalog/search",
    searchApiOk,
    `HTTP ${searchApiRes.status}`
  )

  const feedRes = await fetch(`${BASE}/api/feed/google-merchant`)
  const feedText = await feedRes.text()
  record(
    "Feed Google Merchant gla_*",
    feedRes.ok && feedHasGlaIds(feedText),
    `HTTP ${feedRes.status}, gla=${feedHasGlaIds(feedText)}`
  )

  const siteRes = await fetch(`${BASE}/sitemap.xml`)
  const siteXml = await siteRes.text()
  record(
    "Sitemap",
    siteRes.ok && siteXml.includes(CANARY_HANDLE),
    `HTTP ${siteRes.status}`
  )

  if (PUBLISHABLE) {
    const regions = await fetch(`${BACKEND}/store/regions`, {
      headers: { "x-publishable-api-key": PUBLISHABLE },
    }).then((r) => r.json())
    const region = (regions.regions || []).find((r: any) =>
      r.countries?.some((c: any) => c.iso_2 === cc)
    )
    if (region?.id) {
      const url = new URL(`${BACKEND}/store/products`)
      url.searchParams.set("handle", CANARY_HANDLE)
      url.searchParams.set("region_id", region.id)
      url.searchParams.set("limit", "1")
      const prodRes = await fetch(url, {
        headers: { "x-publishable-api-key": PUBLISHABLE },
      })
      const prodJson = await prodRes.json()
      const variant = prodJson.products?.[0]?.variants?.[0]
      const storeAmount = variant?.calculated_price?.calculated_amount
      const storePriceOk =
        typeof storeAmount === "number" &&
        Math.abs(storeAmount - CANARY_PRICE) < 0.01
      record(
        "Medusa Store API precio checkout",
        prodRes.ok && prodJson.products?.length === 1 && storePriceOk,
        `HTTP ${prodRes.status} amount=${storeAmount}`
      )
    }
  }

  const failures = checks.filter((c) => !c.ok)
  console.log("=".repeat(60))
  console.log(
    failures.length
      ? `FALLAS: ${failures.length}/${checks.length}`
      : `TODOS OK (${checks.length} checks)`
  )
  process.exit(failures.length ? 1 : 0)
}

main()
