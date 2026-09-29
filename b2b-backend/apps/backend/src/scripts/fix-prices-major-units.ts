import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

/**
 * Repara precios PEN escritos con factor ×100 (AUD-001). Moneda única: PEN.
 *
 *   npx medusa exec ./src/scripts/fix-prices-major-units.ts
 *   npx medusa exec ./src/scripts/fix-prices-major-units.ts apply
 */

const JSON_PRODUCTS = path.resolve(
  process.cwd(),
  "../../../b2b-storefront/src/lib/cn-catalog/data/products.json"
)

const REPORT_DIR = path.resolve(
  process.cwd(),
  "../../../md/auditoria-catalogo-20260831"
)

function loadJsonCatalog(): any[] {
  const raw = JSON.parse(fs.readFileSync(JSON_PRODUCTS, "utf8"))
  return Array.isArray(raw) ? raw : raw.products || []
}

function majorFromJson(price: number): number {
  return Math.round(price * 100) / 100
}

export default async function fixPricesMajorUnits({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const pricingModule = container.resolve(Modules.PRICING)
  const apply = process.argv.includes("apply")

  const jsonProducts = loadJsonCatalog()
  const jsonByHandle = new Map(
    jsonProducts
      .filter((p) => typeof p.price === "number" && p.price > 0)
      .map((p) => [p.handle, p])
  )

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "variants.id"],
    pagination: { take: 5000, skip: 0 },
  })

  const actions: Array<{ handle: string; pen: number; before: number }> = []

  for (const product of products || []) {
    const jp = jsonByHandle.get((product as any).handle)
    if (!jp) continue

    const variantId = (product as any).variants?.[0]?.id
    if (!variantId) continue

    const targetPen = majorFromJson(jp.price)

    const { data: variantRows } = await query.graph({
      entity: "product_variant",
      fields: [
        "id",
        "price_set.id",
        "price_set.prices.amount",
        "price_set.prices.currency_code",
      ],
      filters: { id: variantId },
    })

    const row = variantRows?.[0] as any
    const priceSet = row?.price_set
    if (!priceSet?.id) continue

    const penPrices = (priceSet.prices || []).filter(
      (p: any) => p.currency_code === "pen"
    )
    if (!penPrices.length) continue

    const currentPen = Number(penPrices[0].amount)
    const ratio = targetPen === 0 ? null : currentPen / targetPen
    const corrupted =
      Math.abs(currentPen - targetPen) > 0.01 &&
      ratio !== null &&
      Math.abs(ratio - 100) < 1

    if (!corrupted && Math.abs(currentPen - targetPen) <= 0.01) {
      continue
    }

    if (!corrupted && Math.abs(currentPen - targetPen) > 0.01) {
      console.warn(
        `[skip] ${(product as any).handle}: divergencia no x100 json=${targetPen} medusa=${currentPen}`
      )
      continue
    }

    actions.push({
      handle: (product as any).handle,
      pen: targetPen,
      before: currentPen,
    })

    if (apply) {
      await pricingModule.updatePriceSets(priceSet.id, {
        prices: [{ amount: targetPen, currency_code: "pen" }],
      })
    }
  }

  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true })
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const reportPath = path.join(REPORT_DIR, `fix-prices-major-${stamp}.json`)
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ apply, count: actions.length, actions }, null, 2)
  )

  console.log("")
  console.log(`Precios a reparar: ${actions.length} (${apply ? "APLICADO" : "dry-run"})`)
  console.log(`Reporte: ${reportPath}`)
  if (actions.length) {
    console.log("Muestra:", actions.slice(0, 5))
  }
}
