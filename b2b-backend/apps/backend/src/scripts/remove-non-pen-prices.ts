import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { execSync } from "child_process"
import fs from "fs"
import path from "path"

/**
 * Elimina todos los precios que no sean PEN (moneda única soles).
 *
 *   npm run catalog:remove-non-pen
 *   npm run catalog:remove-non-pen:apply
 *
 * Alias legacy: catalog:remove-usd → mismo script (idempotente).
 */

const REPORT_DIR = path.resolve(
  process.cwd(),
  "../../../md/auditoria-catalogo-20260831"
)

const PRICE_PREF_TO_REMOVE = [
  "prpref_01KW0RTPQAWRFACAZ7P0Y8296H", // currency_code usd
  "prpref_01KW0RTPQAYBHEH706SRJAJ2RK", // currency_code eur
  "prpref_01KW0RTPR3P11VE95NDRG764W6", // region_id fantasma
]

const BATCH_SIZE = 50
const PEN = "pen"

export default async function removeNonPenPrices({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const pricingModule = container.resolve(Modules.PRICING)
  const apply = process.argv.includes("apply")

  const { data: allPrices } = await query.graph({
    entity: "price",
    fields: ["id", "currency_code", "amount", "price_set_id"],
    pagination: { take: 10000, skip: 0 },
  })

  const rows = allPrices || []
  const penRows = rows.filter(
    (p: any) => String(p.currency_code || "").toLowerCase() === PEN
  )
  const nonPenRows = rows.filter(
    (p: any) => String(p.currency_code || "").toLowerCase() !== PEN
  )

  const byCurrency = nonPenRows.reduce(
    (acc: Record<string, number>, p: any) => {
      const code = String(p.currency_code || "unknown").toLowerCase()
      acc[code] = (acc[code] || 0) + 1
      return acc
    },
    {}
  )

  const nonPenIds = nonPenRows.map((p: any) => p.id).filter(Boolean)
  const penCountBefore = penRows.length

  console.log("")
  console.log("=".repeat(70))
  console.log(`REMOVE NON-PEN — ${apply ? "APPLY" : "DRY-RUN"}`)
  console.log("=".repeat(70))
  console.log(`Precios PEN existentes (no se tocan): ${penCountBefore}`)
  console.log(`Precios no-PEN a eliminar: ${nonPenIds.length}`)
  if (Object.keys(byCurrency).length) {
    console.log("Por moneda:", byCurrency)
  }
  if (nonPenRows.length) {
    console.log(
      "Muestra:",
      nonPenRows.slice(0, 3).map((p: any) => ({
        id: p.id,
        currency_code: p.currency_code,
        amount: p.amount,
        price_set_id: p.price_set_id,
      }))
    )
  }

  if (apply && nonPenIds.length > 0) {
    for (let i = 0; i < nonPenIds.length; i += BATCH_SIZE) {
      const batch = nonPenIds.slice(i, i + BATCH_SIZE)
      await pricingModule.removePrices(batch)
      console.log(
        `  Eliminados ${Math.min(i + BATCH_SIZE, nonPenIds.length)}/${nonPenIds.length}`
      )
    }
  }

  if (apply && PRICE_PREF_TO_REMOVE.length > 0) {
    const idList = PRICE_PREF_TO_REMOVE.map((id) => `'${id}'`).join(",")
    const sql = `UPDATE price_preference SET deleted_at = NOW(), updated_at = NOW() WHERE id IN (${idList}) AND deleted_at IS NULL;`
    execSync(
      `docker exec medusa-db psql -U postgres -d medusa -c ${JSON.stringify(sql)}`,
      { stdio: "inherit" }
    )
    console.log(`price_preference retiradas (si pendían): ${PRICE_PREF_TO_REMOVE.length}`)
  } else if (!apply) {
    console.log(`price_preference a retirar (apply): ${PRICE_PREF_TO_REMOVE.length}`)
  }

  const { data: afterRows } = await query.graph({
    entity: "price",
    fields: ["id", "currency_code"],
    pagination: { take: 10000, skip: 0 },
  })

  const penAfter = (afterRows || []).filter(
    (p: any) => String(p.currency_code || "").toLowerCase() === PEN
  ).length
  const nonPenAfter = (afterRows || []).filter(
    (p: any) => String(p.currency_code || "").toLowerCase() !== PEN
  )

  const report = {
    apply,
    penBefore: penCountBefore,
    penAfter: apply ? penAfter : penCountBefore,
    nonPenBefore: nonPenIds.length,
    nonPenAfter: apply ? nonPenAfter.length : nonPenIds.length,
    byCurrencyBefore: byCurrency,
    byCurrencyAfter: apply
      ? nonPenAfter.reduce((acc: Record<string, number>, p: any) => {
          const code = String(p.currency_code || "unknown").toLowerCase()
          acc[code] = (acc[code] || 0) + 1
          return acc
        }, {})
      : byCurrency,
    removedIds: apply ? nonPenIds.length : 0,
  }

  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true })
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const reportPath = path.join(REPORT_DIR, `remove-non-pen-${stamp}.json`)
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  console.log("")
  console.log(`PEN tras operación: ${report.penAfter} (esperado: ${penCountBefore})`)
  console.log(`No-PEN tras operación: ${report.nonPenAfter} (esperado: 0)`)
  console.log(`Reporte: ${reportPath}`)
  console.log("=".repeat(70))

  if (apply && report.penAfter !== penCountBefore) {
    throw new Error(
      `ABORT: cambió el conteo PEN (${penCountBefore} → ${report.penAfter}). Revisar backup.`
    )
  }
  if (apply && report.nonPenAfter > 0) {
    throw new Error(`ABORT: quedan ${report.nonPenAfter} precios no-PEN.`)
  }
}
