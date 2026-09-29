import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

/**
 * Verificacion post-reconciliacion (plan maestro §14).
 * Ejecuta los mismos gates que audit-catalog-cutover y sale con codigo 1
 * si queda algún bloqueante fallido.
 *
 *   npx medusa exec ./src/scripts/verify-catalog-cutover.ts
 */

const JSON_PRODUCTS = path.resolve(
  process.cwd(),
  "../../../b2b-storefront/src/lib/cn-catalog/data/products.json"
)

const REPORT_DIR = path.resolve(
  process.cwd(),
  "../../../md/auditoria-catalogo-20260831"
)

type Finding = {
  gate: string
  severity: string
  passed: boolean
  expected: string
  actual: string
}

function loadJsonCatalog(): any[] {
  const raw = JSON.parse(fs.readFileSync(JSON_PRODUCTS, "utf8"))
  return Array.isArray(raw) ? raw : raw.products || []
}

export default async function verifyCatalogCutover({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const pimService = container.resolve("b2bPim") as any
  const listPim =
    typeof pimService.listPimInfos === "function"
      ? "listPimInfos"
      : "listPimInfoes"

  const findings: Finding[] = []

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "handle",
      "thumbnail",
      "images.id",
      "variants.id",
      "variants.sku",
      "categories.id",
      "categories.handle",
      "categories.parent_category_id",
      "categories.is_active",
    ],
    filters: { status: "published" },
    pagination: { take: 1000, skip: 0 },
  })

  const leafDe = (p: any) =>
    (p.categories || []).filter((c: any) => c.parent_category_id)

  const sinHoja = (products || []).filter((p: any) => leafDe(p).length === 0)
  const multiHoja = (products || []).filter((p: any) => leafDe(p).length > 1)

  findings.push({
    gate: "Productos publicados",
    severity: "info",
    expected: "498",
    actual: String(products?.length || 0),
    passed: products?.length === 498,
  })

  findings.push({
    gate: "Exactamente 1 categoria hoja",
    severity: "blocker",
    expected: "498/498",
    actual: `${(products?.length || 0) - sinHoja.length - multiHoja.length}/${products?.length || 0}`,
    passed: sinHoja.length === 0 && multiHoja.length === 0,
  })

  const allPim = await pimService[listPim]({}, { take: 5000 })
  const productIds = new Set((products || []).map((p: any) => p.id))
  const huerfanos = allPim.filter((p: any) => !productIds.has(p.product_id))

  findings.push({
    gate: "PIM huerfanos",
    severity: "blocker",
    expected: "0",
    actual: String(huerfanos.length),
    passed: huerfanos.length === 0,
  })

  const { data: priced } = await query.graph({
    entity: "product",
    fields: [
      "handle",
      "variants.prices.amount",
      "variants.prices.currency_code",
    ],
    filters: { status: "published" },
    pagination: { take: 1000, skip: 0 },
  })

  const penDupes: string[] = []
  for (const p of priced || []) {
    const pen: number[] = []
    for (const v of (p as any).variants || []) {
      for (const pr of v.prices || []) {
        if (pr.currency_code === "pen") pen.push(Number(pr.amount))
      }
    }
    if (pen.length > 1) penDupes.push((p as any).handle)
  }

  findings.push({
    gate: "Precio PEN unico por variante",
    severity: "blocker",
    expected: "0",
    actual: String(penDupes.length),
    passed: penDupes.length === 0,
  })

  const jsonProducts = loadJsonCatalog()
  const jsonByHandle = new Map(jsonProducts.map((p: any) => [p.handle, p]))
  const priceDiffs: string[] = []

  for (const p of priced || []) {
    const jp = jsonByHandle.get((p as any).handle)
    if (!jp || typeof jp.price !== "number") continue
    const pen: number[] = []
    for (const v of (p as any).variants || []) {
      for (const pr of v.prices || []) {
        if (pr.currency_code === "pen") pen.push(Number(pr.amount))
      }
    }
    if (!pen.length) continue
    const medusa = pen[0]
    if (Math.abs(medusa - jp.price) > 0.01) {
      priceDiffs.push((p as any).handle)
    }
  }

  findings.push({
    gate: "Paridad precio JSON vs Medusa",
    severity: "blocker",
    expected: "0",
    actual: String(priceDiffs.length),
    passed: priceDiffs.length === 0,
  })

  const imagesEmpty = (products || []).filter(
    (p: any) => !(p.images || []).length
  )
  findings.push({
    gate: "Productos con galeria image[]",
    severity: "blocker",
    expected: "0 sin images",
    actual: String(imagesEmpty.length),
    passed: imagesEmpty.length === 0,
  })

  const blockers = findings.filter((f) => !f.passed && f.severity === "blocker")

  const report = {
    generatedAt: new Date().toISOString(),
    gatesBloqueantesFallidos: blockers.length,
    findings,
    samples: {
      sinHoja: sinHoja.slice(0, 10).map((p: any) => p.handle),
      multiHoja: multiHoja.slice(0, 10).map((p: any) => ({
        handle: p.handle,
        hojas: leafDe(p).map((c: any) => c.handle),
      })),
      priceDiffs: priceDiffs.slice(0, 10),
      penDupes,
    },
  }

  fs.mkdirSync(REPORT_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 15)
  const out = path.join(REPORT_DIR, `verify-cutover-${stamp}.json`)
  fs.writeFileSync(out, JSON.stringify(report, null, 2))

  console.log("=".repeat(70))
  console.log("VERIFY CATALOGO CUTOVER")
  console.log(`Gates bloqueantes fallidos: ${blockers.length}`)
  for (const f of findings) {
    const mark = f.passed ? "PASS" : f.severity === "blocker" ? "FAIL" : "WARN"
    console.log(`[${mark}] ${f.gate}: ${f.actual} (esperado ${f.expected})`)
  }
  console.log(`Reporte: ${out}`)
  console.log("=".repeat(70))

  if (blockers.length > 0) {
    throw new Error(
      `Verificacion fallida: ${blockers.length} gate(s) bloqueante(s).`
    )
  }
}
