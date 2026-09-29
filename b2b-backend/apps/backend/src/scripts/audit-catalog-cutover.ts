import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

/**
 * Auditoria dry-run previa al corte a Medusa como fuente unica.
 *
 * Plan maestro, seccion 14. Este script SOLO LEE. No escribe en la base de
 * datos ni en los JSON del storefront. Su salida es un reporte en
 * md/auditoria-catalogo-<timestamp>/.
 *
 * Ejecucion:
 *   npx medusa exec ./src/scripts/audit-catalog-cutover.ts
 */

const JSON_PRODUCTS = path.resolve(
  process.cwd(),
  "../../../b2b-storefront/src/lib/cn-catalog/data/products.json"
)

const REPORT_ROOT = path.resolve(process.cwd(), "../../../md")

type Finding = {
  id: string
  gate: string
  severity: "blocker" | "warning" | "info"
  expected: string
  actual: string
  passed: boolean
  sample?: unknown[]
}

const findings: Finding[] = []
const errors: Array<{ step: string; message: string }> = []

function record(f: Finding) {
  findings.push(f)
  const mark = f.passed ? "PASS" : f.severity === "blocker" ? "FAIL" : "WARN"
  console.log(`[${mark}] ${f.gate}: esperado=${f.expected} actual=${f.actual}`)
}

/** Los errores se registran, nunca se descartan (invariante 10 del plan). */
async function step<T>(name: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    errors.push({ step: name, message })
    console.error(`[ERROR] ${name}: ${message}`)
    return null
  }
}

function loadJsonCatalog(): any[] {
  if (!fs.existsSync(JSON_PRODUCTS)) {
    errors.push({ step: "json", message: `No existe ${JSON_PRODUCTS}` })
    return []
  }
  const raw = JSON.parse(fs.readFileSync(JSON_PRODUCTS, "utf8"))
  return Array.isArray(raw) ? raw : raw.products || []
}

export default async function auditCatalogCutover({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const startedAt = new Date()

  console.log("=".repeat(70))
  console.log("AUDITORIA DRY-RUN — corte a Medusa fuente unica")
  console.log(`Inicio: ${startedAt.toISOString()}`)
  console.log("=".repeat(70))

  // ---------------------------------------------------------------- productos
  const products =
    (await step("productos", async () => {
      const { data } = await query.graph({
        entity: "product",
        fields: [
          "id",
          "handle",
          "title",
          "status",
          "thumbnail",
          "images.id",
          "images.url",
          "variants.id",
          "variants.sku",
          "variants.manage_inventory",
          "variants.allow_backorder",
          "categories.id",
          "categories.handle",
          "categories.name",
          "categories.is_active",
          "categories.parent_category_id",
        ],
        filters: { status: "published" },
        pagination: { take: 1000, skip: 0 },
      })
      return data
    })) || []

  record({
    id: "productos-publicados",
    gate: "Productos publicados",
    severity: "info",
    expected: "498",
    actual: String(products.length),
    passed: products.length === 498,
  })

  // -------------------------------------------------------------------- marca
  const brandLinks =
    (await step("marcas", async () => {
      const { data } = await query.graph({
        entity: "product",
        fields: ["id", "brand.id", "brand.name"],
        filters: { status: "published" },
        pagination: { take: 1000, skip: 0 },
      })
      return data
    })) || []

  const sinMarca = brandLinks.filter((p: any) => !p.brand)
  record({
    id: "brand-link",
    gate: "Productos con enlace de marca",
    severity: "blocker",
    expected: `${products.length}/${products.length}`,
    actual: `${brandLinks.length - sinMarca.length}/${brandLinks.length}`,
    passed: sinMarca.length === 0,
    sample: sinMarca.slice(0, 10).map((p: any) => p.id),
  })

  // ---------------------------------------------------------------------- PIM
  const pimService = container.resolve("b2bPim") as any
  const allPim =
    (await step("pim", async () => {
      // El servicio autogenerado expone listPimInfos o listPimInfoes segun version.
      const fn =
        typeof pimService.listPimInfos === "function"
          ? "listPimInfos"
          : "listPimInfoes"
      return await pimService[fn]({}, { take: 5000 })
    })) || []

  const productIds = new Set(products.map((p: any) => p.id))
  const pimByProduct = new Map<string, any[]>()
  for (const pim of allPim as any[]) {
    const list = pimByProduct.get(pim.product_id) || []
    list.push(pim)
    pimByProduct.set(pim.product_id, list)
  }

  const huerfanos = (allPim as any[]).filter((p) => !productIds.has(p.product_id))
  record({
    id: "pim-huerfanos",
    gate: "PIM huerfanos (sin producto activo)",
    severity: "blocker",
    expected: "0",
    actual: String(huerfanos.length),
    passed: huerfanos.length === 0,
    sample: huerfanos.map((p) => ({ id: p.id, product_id: p.product_id })),
  })

  const duplicados = [...pimByProduct.entries()].filter(([, v]) => v.length > 1)
  record({
    id: "pim-duplicados",
    gate: "product_id duplicados en PIM",
    severity: "blocker",
    expected: "0",
    actual: String(duplicados.length),
    passed: duplicados.length === 0,
    sample: duplicados.slice(0, 10).map(([k, v]) => ({ product_id: k, n: v.length })),
  })

  const sinPim = products.filter((p: any) => !pimByProduct.has(p.id))
  record({
    id: "pim-cobertura",
    gate: "Productos con exactamente 1 PIM",
    severity: "blocker",
    expected: `${products.length}/${products.length}`,
    actual: `${products.length - sinPim.length}/${products.length}`,
    passed: sinPim.length === 0,
    sample: sinPim.slice(0, 10).map((p: any) => p.handle),
  })

  // ----------------------------------------------------------------- variante
  const sinVariante = products.filter((p: any) => !p.variants?.length)
  const sinSku = products.filter((p: any) =>
    p.variants?.some((v: any) => !v.sku)
  )
  record({
    id: "variantes",
    gate: "Productos con al menos 1 variante",
    severity: "blocker",
    expected: `${products.length}/${products.length}`,
    actual: `${products.length - sinVariante.length}/${products.length}`,
    passed: sinVariante.length === 0,
    sample: sinVariante.slice(0, 10).map((p: any) => p.handle),
  })
  record({
    id: "skus",
    gate: "Variantes con SKU",
    severity: "blocker",
    expected: "0 sin SKU",
    actual: `${sinSku.length} productos con variante sin SKU`,
    passed: sinSku.length === 0,
    sample: sinSku.slice(0, 10).map((p: any) => p.handle),
  })

  // ---------------------------------------------------------------- categoria
  const leafDe = (p: any) =>
    (p.categories || []).filter((c: any) => c.parent_category_id)

  const sinHoja = products.filter((p: any) => leafDe(p).length === 0)
  const multiHoja = products.filter((p: any) => leafDe(p).length > 1)
  record({
    id: "categoria-hoja",
    gate: "Productos con exactamente 1 categoria hoja",
    severity: "blocker",
    expected: `${products.length}/${products.length}`,
    actual: `${products.length - sinHoja.length - multiHoja.length}/${products.length}`,
    passed: sinHoja.length === 0 && multiHoja.length === 0,
    sample: [
      ...sinHoja.slice(0, 10).map((p: any) => ({ handle: p.handle, hojas: 0 })),
      ...multiHoja
        .slice(0, 10)
        .map((p: any) => ({ handle: p.handle, hojas: leafDe(p).length })),
    ],
  })

  const categoriasInactivas = new Map<string, string>()
  for (const p of products as any[]) {
    for (const c of p.categories || []) {
      if (c.is_active === false) categoriasInactivas.set(c.id, c.handle)
    }
  }
  record({
    id: "categorias-inactivas",
    gate: "Categorias inactivas con productos publicados",
    severity: "warning",
    expected: "0",
    actual: String(categoriasInactivas.size),
    passed: categoriasInactivas.size === 0,
    sample: [...categoriasInactivas.values()],
  })

  // ------------------------------------------------------------------ imagenes
  const sinAsset = products.filter(
    (p: any) => !p.thumbnail && !(p.images || []).length
  )
  record({
    id: "assets",
    gate: "Productos sin imagen principal",
    severity: "blocker",
    expected: "0",
    actual: String(sinAsset.length),
    passed: sinAsset.length === 0,
    sample: sinAsset.slice(0, 10).map((p: any) => p.handle),
  })

  // -------------------------------------------------------------------- enums
  const PURCHASE = ["buy_now", "quote_only", "contact_for_price", "made_to_order"]
  const AVAIL = ["in_stock", "lead_time", "made_to_order", "discontinued"]
  const enumInvalido = (allPim as any[]).filter(
    (p) =>
      !PURCHASE.includes(p.purchase_mode) || !AVAIL.includes(p.availability_mode)
  )
  record({
    id: "enums",
    gate: "Valores de enum invalidos en PIM",
    severity: "blocker",
    expected: "0",
    actual: String(enumInvalido.length),
    passed: enumInvalido.length === 0,
    sample: enumInvalido.slice(0, 10).map((p) => ({
      product_id: p.product_id,
      purchase_mode: p.purchase_mode,
      availability_mode: p.availability_mode,
    })),
  })

  const leadTimeMal = (allPim as any[]).filter(
    (p) =>
      (p.availability_mode === "lead_time" &&
        (!p.lead_time_days || p.lead_time_days < 1)) ||
      (p.availability_mode !== "lead_time" && p.lead_time_days)
  )
  record({
    id: "lead-time",
    gate: "lead_time_days coherente con availability_mode",
    severity: "warning",
    expected: "0 incoherencias",
    actual: String(leadTimeMal.length),
    passed: leadTimeMal.length === 0,
    sample: leadTimeMal.slice(0, 10).map((p) => ({
      product_id: p.product_id,
      availability_mode: p.availability_mode,
      lead_time_days: p.lead_time_days,
    })),
  })

  // ------------------------------------------------------------------- precios
  const withPrices =
    (await step("precios", async () => {
      const { data } = await query.graph({
        entity: "product",
        fields: [
          "id",
          "handle",
          "variants.id",
          "variants.prices.amount",
          "variants.prices.currency_code",
        ],
        filters: { status: "published" },
        pagination: { take: 1000, skip: 0 },
      })
      return data
    })) || []

  const priceIndex = new Map<string, { pen: number[]; other: string[] }>()
  for (const p of withPrices as any[]) {
    const pen: number[] = []
    const other: string[] = []
    for (const v of p.variants || []) {
      for (const pr of v.prices || []) {
        if (pr.currency_code === "pen") pen.push(Number(pr.amount))
        else other.push(String(pr.currency_code || "unknown"))
      }
    }
    priceIndex.set(p.handle, { pen, other })
  }

  const penDuplicado = [...priceIndex.entries()].filter(([, v]) => v.pen.length > 1)
  record({
    id: "precio-duplicado",
    gate: "Variantes con precio PEN duplicado",
    severity: "blocker",
    expected: "0",
    actual: String(penDuplicado.length),
    passed: penDuplicado.length === 0,
    sample: penDuplicado.map(([h, v]) => ({ handle: h, precios_pen: v.pen })),
  })

  const buyNow = (allPim as any[]).filter(
    (p) => p.purchase_mode === "buy_now" && productIds.has(p.product_id)
  )
  const handleById = new Map(products.map((p: any) => [p.id, p.handle]))
  const buyNowSinPrecio = buyNow.filter((p) => {
    const h = handleById.get(p.product_id)
    const px = h ? priceIndex.get(h as string) : undefined
    return !px || px.pen.length === 0
  })
  record({
    id: "buynow-precio",
    gate: "buy_now con precio PEN",
    severity: "blocker",
    expected: `${buyNow.length}/${buyNow.length}`,
    actual: `${buyNow.length - buyNowSinPrecio.length}/${buyNow.length}`,
    passed: buyNowSinPrecio.length === 0,
    sample: buyNowSinPrecio
      .slice(0, 10)
      .map((p) => handleById.get(p.product_id)),
  })

  const noPenEnCatalogo = [...priceIndex.values()].reduce(
    (acc, v) => acc + v.other.length,
    0
  )
  const handlesConOtraMoneda = [...priceIndex.entries()]
    .filter(([, v]) => v.other.length > 0)
    .map(([h, v]) => ({ handle: h, monedas: [...new Set(v.other)] }))
  record({
    id: "solo-pen",
    gate: "Precios solo PEN en catalogo publicado",
    severity: "blocker",
    expected: "0",
    actual: String(noPenEnCatalogo),
    passed: noPenEnCatalogo === 0,
    sample: handlesConOtraMoneda.slice(0, 10),
  })

  // ----------------------------------------------- comparacion contra JSON
  const jsonProducts = loadJsonCatalog()
  const jsonByHandle = new Map(jsonProducts.map((p: any) => [p.handle, p]))

  const diffPrecio: any[] = []
  const soloEnJson: string[] = []
  const soloEnMedusa: string[] = []

  for (const jp of jsonProducts) {
    if (!priceIndex.has(jp.handle)) soloEnJson.push(jp.handle)
  }
  for (const p of products as any[]) {
    if (!jsonByHandle.has(p.handle)) soloEnMedusa.push(p.handle)
  }

  for (const [handle, px] of priceIndex.entries()) {
    const jp = jsonByHandle.get(handle)
    if (!jp || typeof jp.price !== "number" || px.pen.length === 0) continue
    const medusaMajor = px.pen[0]
    if (Math.abs(medusaMajor - jp.price) > 0.01) {
      const ratio = jp.price === 0 ? null : medusaMajor / jp.price
      diffPrecio.push({
        handle,
        json: jp.price,
        medusa: medusaMajor,
        ratio: ratio ? Number(ratio.toFixed(4)) : null,
        sospecha_x100:
          ratio !== null && (Math.abs(ratio - 100) < 1 || Math.abs(ratio - 0.01) < 0.001),
      })
    }
  }

  record({
    id: "paridad-handles",
    gate: "Handles presentes en ambas fuentes",
    severity: "blocker",
    expected: "0 discrepancias",
    actual: `${soloEnJson.length} solo JSON, ${soloEnMedusa.length} solo Medusa`,
    passed: soloEnJson.length === 0 && soloEnMedusa.length === 0,
    sample: [...soloEnJson.slice(0, 10), ...soloEnMedusa.slice(0, 10)],
  })

  const sospechosos = diffPrecio.filter((d) => d.sospecha_x100)
  record({
    id: "precio-x100",
    gate: "Precios con sospecha de factor x100",
    severity: "blocker",
    expected: "0",
    actual: String(sospechosos.length),
    passed: sospechosos.length === 0,
    sample: sospechosos.slice(0, 10),
  })

  record({
    id: "precio-divergente",
    gate: "Divergencia de precio JSON vs Medusa",
    severity: "warning",
    expected: "0",
    actual: String(diffPrecio.length),
    passed: diffPrecio.length === 0,
    sample: diffPrecio.slice(0, 20),
  })

  // ------------------------------------------------------------------ reporte
  const stamp = startedAt.toISOString().replace(/[-:T]/g, "").slice(0, 15)
  const outDir = path.join(REPORT_ROOT, `auditoria-catalogo-20260831`)
  fs.mkdirSync(outDir, { recursive: true })

  const blockers = findings.filter((f) => !f.passed && f.severity === "blocker")

  const report = {
    generatedAt: startedAt.toISOString(),
    mode: "dry-run",
    totals: {
      productosMedusa: products.length,
      productosJson: jsonProducts.length,
      pimTotal: (allPim as any[]).length,
      pimHuerfanos: huerfanos.length,
      buyNow: buyNow.length,
      variantesConPen: [...priceIndex.values()].filter((v) => v.pen.length > 0)
        .length,
    },
    gatesBloqueantesFallidos: blockers.length,
    findings,
    diferenciasPrecioCompletas: diffPrecio,
    errores: errors,
  }

  const jsonPath = path.join(outDir, `audit-cutover-${stamp}.json`)
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))

  console.log("=".repeat(70))
  console.log(`Gates bloqueantes fallidos: ${blockers.length}`)
  for (const b of blockers) {
    console.log(`  - ${b.gate}: esperado=${b.expected} actual=${b.actual}`)
  }
  if (errors.length) {
    console.log(`Errores durante la auditoria: ${errors.length}`)
    for (const e of errors) console.log(`  - ${e.step}: ${e.message}`)
  }
  console.log(`Reporte: ${jsonPath}`)
  console.log("=".repeat(70))
}
