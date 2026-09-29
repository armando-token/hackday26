import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

/**
 * Reconciliacion de integridad del PIM, previa al indice unico parcial.
 *
 * Plan maestro, seccion 8.2 y Fase 1 paso 1. Decision D3 aprobada el 2026-08-31:
 * los huerfanos se marcan como eliminados (soft delete), no se borran fisicamente.
 *
 * Es dry-run por defecto. Exige el argumento posicional `apply` para escribir, y
 * es idempotente: reejecutarlo tras aplicar no produce cambios.
 *
 * El CLI de Medusa solo admite argumentos posicionales, no flags con guiones.
 *
 *   npx medusa exec ./src/scripts/reconcile-pim-integrity.ts
 *   npx medusa exec ./src/scripts/reconcile-pim-integrity.ts apply
 */

const REPORT_DIR = path.resolve(
  process.cwd(),
  "../../../md/auditoria-catalogo-20260831"
)

export default async function reconcilePimIntegrity({ container, args }: ExecArgs) {
  const apply =
    (args || []).includes("apply") || process.env.PIM_RECONCILE_APPLY === "1"
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const pimService = container.resolve("b2bPim") as any

  const listFn =
    typeof pimService.listPimInfos === "function" ? "listPimInfos" : "listPimInfoes"
  const deleteFn =
    typeof pimService.softDeletePimInfos === "function"
      ? "softDeletePimInfos"
      : "softDeletePimInfoes"

  console.log("=".repeat(70))
  console.log(`RECONCILIACION PIM — modo ${apply ? "APPLY" : "DRY-RUN"}`)
  console.log("=".repeat(70))

  // Productos existentes, en cualquier estado (no solo publicados): un PIM de un
  // borrador no es huerfano.
  const { data: productos } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "status"],
    pagination: { take: 5000, skip: 0 },
  })
  const idsExistentes = new Set(productos.map((p: any) => p.id))
  console.log(`Productos existentes en Medusa: ${idsExistentes.size}`)

  const pims = await pimService[listFn]({}, { take: 5000 })
  console.log(`Registros PIM activos: ${pims.length}`)

  // ------------------------------------------------------------- huerfanos
  const huerfanos = pims.filter((p: any) => !idsExistentes.has(p.product_id))

  // -------------------------------------------------------------- duplicados
  const porProducto = new Map<string, any[]>()
  for (const p of pims) {
    if (!idsExistentes.has(p.product_id)) continue
    const l = porProducto.get(p.product_id) || []
    l.push(p)
    porProducto.set(p.product_id, l)
  }
  const duplicados = [...porProducto.entries()].filter(([, v]) => v.length > 1)

  console.log(`Huerfanos detectados: ${huerfanos.length}`)
  console.log(`product_id duplicados: ${duplicados.length}`)

  if (duplicados.length) {
    // El plan (8.2, paso 3) exige fallar si hay duplicados activos: elegir cual
    // conservar es una decision de datos, no automatizable.
    console.error("ABORTADO: existen product_id duplicados activos.")
    for (const [pid, filas] of duplicados) {
      console.error(`  ${pid}: ${filas.map((f: any) => f.id).join(", ")}`)
    }
    throw new Error(
      "Duplicados de product_id en pim_info. Resolucion manual requerida antes del indice unico."
    )
  }

  // Reporte previo obligatorio antes de tocar nada (plan 8.2, pasos 1 y 2).
  const reporte = {
    generatedAt: new Date().toISOString(),
    mode: apply ? "apply" : "dry-run",
    decision: "D3 — soft delete de huerfanos (aprobada 2026-08-31)",
    productosExistentes: idsExistentes.size,
    pimActivos: pims.length,
    huerfanos: huerfanos.map((h: any) => ({
      pim_info_id: h.id,
      product_id: h.product_id,
      item_number: h.item_number,
      mfr_model: h.mfr_model,
      purchase_mode: h.purchase_mode,
      availability_mode: h.availability_mode,
      specs_keys: h.specs ? Object.keys(h.specs).length : 0,
      created_at: h.created_at,
    })),
    duplicados: [],
  }

  fs.mkdirSync(REPORT_DIR, { recursive: true })
  const rp = path.join(REPORT_DIR, "pim-huerfanos-reporte.json")
  fs.writeFileSync(rp, JSON.stringify(reporte, null, 2))
  console.log(`Reporte de huerfanos: ${rp}`)

  for (const h of huerfanos) {
    console.log(
      `  huerfano ${h.id} -> product_id inexistente ${h.product_id} (item=${
        h.item_number || "-"
      })`
    )
  }

  if (!huerfanos.length) {
    console.log("Nada que reconciliar. El PIM ya cumple la invariante 1.")
    console.log("=".repeat(70))
    return
  }

  if (!apply) {
    console.log("")
    console.log("DRY-RUN: no se ha modificado nada.")
    console.log("Para aplicar: npx medusa exec ./src/scripts/reconcile-pim-integrity.ts apply")
    console.log("=".repeat(70))
    return
  }

  const ids = huerfanos.map((h: any) => h.id)
  await pimService[deleteFn](ids)
  console.log(`Soft delete aplicado a ${ids.length} registros.`)

  // Verificacion inmediata: releer y confirmar que ya no estan activos.
  const restantes = await pimService[listFn]({}, { take: 5000 })
  const siguenHuerfanos = restantes.filter(
    (p: any) => !idsExistentes.has(p.product_id)
  )
  if (siguenHuerfanos.length) {
    throw new Error(
      `Verificacion fallida: siguen ${siguenHuerfanos.length} huerfanos activos.`
    )
  }
  console.log(`Verificado: PIM activos ahora ${restantes.length}, huerfanos 0.`)
  console.log("=".repeat(70))
}
