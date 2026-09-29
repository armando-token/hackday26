import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

/**
 * Reconciliacion del catalogo Medusa contra products.json (plan maestro §14).
 *
 * Decisiones D1–D5 aprobadas 2026-08-31. Dry-run por defecto; idempotente.
 *
 *   npx medusa exec ./src/scripts/reconcile-catalog-cutover.ts
 *   npx medusa exec ./src/scripts/reconcile-catalog-cutover.ts apply
 */

const JSON_PRODUCTS = path.resolve(
  process.cwd(),
  "../../../b2b-storefront/src/lib/cn-catalog/data/products.json"
)

const REPORT_DIR = path.resolve(
  process.cwd(),
  "../../../md/auditoria-catalogo-20260831"
)

const CATEGORIES_TO_ACTIVATE = [
  "unit-heaters",
  "accesorios-entrenamiento",
  "sistemas-llave-en-mano",
  "sustratos-hidroponicos",
] as const

const DUPLICATE_LEAF_TO_RETIRE = "unit-heaters-industriales"

type PlannedAction = {
  step: string
  target: string
  detail: string
  applied?: boolean
  skipped?: string
}

function loadJsonCatalog(): any[] {
  const raw = JSON.parse(fs.readFileSync(JSON_PRODUCTS, "utf8"))
  return Array.isArray(raw) ? raw : raw.products || []
}

/** Medusa v2 almacena precios en unidad mayor (soles, no centavos). */
function penAmountFromJson(price: number): number {
  return Math.round(price * 100) / 100
}

function mapAvailability(json: any): {
  purchase_mode: string
  availability_mode: string
} {
  const quote = json.priceMode === "quote"
  const purchase_mode = quote ? "quote_only" : "buy_now"
  let availability_mode = "in_stock"
  if (json.availabilityMode === "backorder" || json.availabilityMode === "lead_time") {
    availability_mode = "lead_time"
  } else if (json.availabilityMode === "made_to_order") {
    availability_mode = "made_to_order"
  } else if (!json.inStock && !quote) {
    availability_mode = "out_of_stock" in json ? "discontinued" : "lead_time"
  } else if (!json.inStock) {
    availability_mode = "lead_time"
  }
  if (!json.inStock && quote) {
    availability_mode = "lead_time"
  }
  return { purchase_mode, availability_mode }
}

export default async function reconcileCatalogCutover({
  container,
  args,
}: ExecArgs) {
  const apply =
    (args || []).includes("apply") ||
    process.env.CATALOG_RECONCILE_APPLY === "1"

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule = container.resolve(Modules.PRODUCT)
  const pricingModule = container.resolve(Modules.PRICING)
  const inventoryModule = container.resolve(Modules.INVENTORY)
  const pimService = container.resolve("b2bPim") as any
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const listPim =
    typeof pimService.listPimInfos === "function"
      ? "listPimInfos"
      : "listPimInfoes"
  const updatePim =
    typeof pimService.updatePimInfos === "function"
      ? "updatePimInfos"
      : "updatePimInfoes"
  const deletePim =
    typeof pimService.softDeletePimInfos === "function"
      ? "softDeletePimInfos"
      : "softDeletePimInfoes"

  const jsonProducts = loadJsonCatalog()
  const jsonByHandle = new Map(jsonProducts.map((p: any) => [p.handle, p]))

  const actions: PlannedAction[] = []

  console.log("=".repeat(70))
  console.log(`RECONCILIACION CATALOGO — modo ${apply ? "APPLY" : "DRY-RUN"}`)
  console.log(`JSON: ${jsonProducts.length} productos`)
  console.log("=".repeat(70))

  // listProductCategories omite categorias inactivas; el grafo incluye todas (D2).
  const { data: allCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "parent_category_id", "is_active"],
    pagination: { take: 500, skip: 0 },
  })
  const categoryByHandle = new Map(
    (allCategories || []).map((c: any) => [c.handle, c])
  )
  const categoryById = new Map((allCategories || []).map((c: any) => [c.id, c]))

  function buildExpectedCategoryIds(jp: any): string[] {
    const slugPath: string[] = jp.categoryPath?.length
      ? [...jp.categoryPath]
      : jp.categorySlug
        ? [jp.categorySlug]
        : []
    if (!slugPath.length) return []

    const ids: string[] = []
    for (const rawSlug of slugPath) {
      const slug =
        rawSlug === DUPLICATE_LEAF_TO_RETIRE ? "unit-heaters" : rawSlug
      const cat = categoryByHandle.get(slug)
      if (!cat) return []
      ids.push(cat.id)
    }
    return ids
  }

  const { data: medusaProducts } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "handle",
      "metadata",
      "thumbnail",
      "images.id",
      "images.url",
      "images.rank",
      "variants.id",
      "variants.sku",
      "variants.manage_inventory",
      "categories.id",
      "categories.handle",
      "categories.is_active",
      "categories.parent_category_id",
    ],
    filters: { status: "published" },
    pagination: { take: 1000, skip: 0 },
  })

  const medusaByHandle = new Map(
    (medusaProducts || []).map((p: any) => [p.handle, p])
  )

  // ------------------------------------------------------------------ 0 imágenes
  const allowImageReconcile =
    process.env.ALLOW_IMAGE_RECONCILE === "1" ||
    (args || []).includes("images") ||
    (args || []).includes("reconcile-images")

  if (!allowImageReconcile) {
    actions.push({
      step: "images",
      target: "catalog",
      detail:
        "Paso de imagenes omitido por defecto para proteger imagenes cargadas por Marketing en Medusa Admin. Usar ALLOW_IMAGE_RECONCILE=1 para forzar.",
    })
  } else {
    for (const jp of jsonProducts) {
      const mp = medusaByHandle.get(jp.handle)
      if (!mp) continue
      const jsonImages: string[] = jp.images?.length
        ? jp.images
        : jp.image
          ? [jp.image]
          : []
      if (!jsonImages.length) continue

      const currentCount = (mp.images || []).length
      if (currentCount >= jsonImages.length) continue

      const payload = jsonImages.map((url: string, rank: number) => ({ url, rank }))
      actions.push({
        step: "images",
        target: jp.handle,
        detail: `importar ${jsonImages.length} imagenes (actual ${currentCount})`,
      })

      if (apply) {
        await productModule.updateProducts(mp.id, {
          images: payload,
          thumbnail: jsonImages[0],
        })
      }
    }
  }

  // ----------------------------------------------------------- 1 PIM huérfanos
  const { data: allProductRows } = await query.graph({
    entity: "product",
    fields: ["id"],
    pagination: { take: 5000, skip: 0 },
  })
  const existingIds = new Set((allProductRows || []).map((p: any) => p.id))
  const pims = await pimService[listPim]({}, { take: 5000 })
  const huerfanos = pims.filter((p: any) => !existingIds.has(p.product_id))
  for (const h of huerfanos) {
    actions.push({
      step: "pim-orphan",
      target: h.id,
      detail: `soft delete PIM huerfano product_id=${h.product_id}`,
    })
  }
  if (apply && huerfanos.length) {
    await pimService[deletePim](huerfanos.map((h: any) => h.id))
  }

  // ---------------------------------------------- 2–3 categorías canónicas D2
  for (const handle of CATEGORIES_TO_ACTIVATE) {
    const cat = categoryByHandle.get(handle)
    if (!cat) {
      actions.push({
        step: "category-activate",
        target: handle,
        detail: "categoria no encontrada",
        skipped: "missing",
      })
      continue
    }
    if (cat.is_active === false) {
      actions.push({
        step: "category-activate",
        target: handle,
        detail: "activar categoria",
      })
      if (apply) {
        await productModule.updateProductCategories(cat.id, { is_active: true })
      }
    }
  }

  const dupLeaf = categoryByHandle.get(DUPLICATE_LEAF_TO_RETIRE)
  const canonLeaf = categoryByHandle.get("unit-heaters")
  if (dupLeaf && canonLeaf) {
    actions.push({
      step: "category-dedupe",
      target: DUPLICATE_LEAF_TO_RETIRE,
      detail: `desactivar duplicado; canonica=${canonLeaf.handle}`,
    })
    if (apply) {
      await productModule.updateProductCategories(dupLeaf.id, {
        is_active: false,
      })
    }
  }

  // ---------------------------------------- AUD-009 categorías inactivas con productos
  const inactiveAssigned = new Set<string>()
  for (const mp of medusaProducts || []) {
    for (const c of (mp as any).categories || []) {
      if (c.is_active === false) {
        inactiveAssigned.add(c.handle)
      }
    }
  }
  for (const handle of inactiveAssigned) {
    const cat = categoryByHandle.get(handle)
    if (!cat || cat.is_active !== false) continue
    actions.push({
      step: "category-activate-assigned",
      target: handle,
      detail: "activar categoria inactiva con productos publicados",
    })
    if (apply) {
      await productModule.updateProductCategories(cat.id, { is_active: true })
    }
  }

  // ----------------------------------------------------- 4–5 categorías producto
  for (const jp of jsonProducts) {
    const mp = medusaByHandle.get(jp.handle)
    if (!mp) continue

    const expectedIds = buildExpectedCategoryIds(jp)
    if (!expectedIds.length) continue

    const currentIds = [...new Set((mp.categories || []).map((c: any) => c.id))].sort()
    const nextIds = [...new Set(expectedIds)].sort()
    const same =
      currentIds.length === nextIds.length &&
      currentIds.every((id: string, i: number) => id === nextIds[i])

    if (!same) {
      actions.push({
        step: "product-categories",
        target: jp.handle,
        detail: `reemplazar ${currentIds.length} -> ${expectedIds.length} categorias`,
      })
      if (apply) {
        await productModule.updateProducts(mp.id, {
          category_ids: expectedIds,
        })
      }
    }
  }

  // ---------------------------------------------------------- 6 precio D1 + dup
  for (const jp of jsonProducts) {
    const mp = medusaByHandle.get(jp.handle)
    if (!mp || typeof jp.price !== "number" || jp.price <= 0) continue

    const variant = mp.variants?.[0]
    if (!variant) continue

    const { data: variantRows } = await query.graph({
      entity: "product_variant",
      fields: [
        "id",
        "price_set.id",
        "price_set.prices.id",
        "price_set.prices.amount",
        "price_set.prices.currency_code",
      ],
      filters: { id: variant.id },
    })
    const row = variantRows?.[0] as any
    const priceSet = row?.price_set
    if (!priceSet?.id) continue

    const penPrices = (priceSet.prices || []).filter(
      (p: any) => p.currency_code === "pen"
    )
    const targetPen = penAmountFromJson(jp.price)
    const needsPriceFix = penPrices.some(
      (p: any) => Math.abs(Number(p.amount) - targetPen) > 1
    )
    const needsDedupe = penPrices.length > 1

    if (needsPriceFix || needsDedupe) {
      actions.push({
        step: "price",
        target: jp.handle,
        detail: `PEN -> ${jp.price} (${targetPen}); duplicados=${penPrices.length}`,
      })
      if (apply) {
        await pricingModule.updatePriceSets(priceSet.id, {
          prices: [{ amount: targetPen, currency_code: "pen" }],
        })
      }
    }
  }

  // ------------------------------------------------------- 7 PIM disponibilidad
  const pimByProduct = new Map<string, any>()
  for (const p of await pimService[listPim]({}, { take: 5000 })) {
    pimByProduct.set(p.product_id, p)
  }

  for (const jp of jsonProducts) {
    const mp = medusaByHandle.get(jp.handle)
    if (!mp) continue
    const pim = pimByProduct.get(mp.id)
    if (!pim) continue

    const target = mapAvailability(jp)
    const needsUpdate =
      pim.purchase_mode !== target.purchase_mode ||
      pim.availability_mode !== target.availability_mode ||
      (target.availability_mode === "lead_time" && pim.lead_time_days != null)

    if (needsUpdate) {
      actions.push({
        step: "pim-availability",
        target: jp.handle,
        detail: `${pim.purchase_mode}/${pim.availability_mode} -> ${target.purchase_mode}/${target.availability_mode}`,
      })
      if (apply) {
        await pimService[updatePim]({
          id: pim.id,
          purchase_mode: target.purchase_mode,
          availability_mode: target.availability_mode,
          lead_time_days:
            target.availability_mode === "lead_time" ? null : pim.lead_time_days,
        })
      }
    }
  }

  // ---------------------------------------------------------- 7b metadata wc_id
  for (const jp of jsonProducts) {
    if (typeof jp.wcId !== "number" || jp.wcId <= 0) continue
    const mp = medusaByHandle.get(jp.handle)
    if (!mp) continue
    const current = Number((mp as any).metadata?.wc_id)
    if (current === jp.wcId) continue
    actions.push({
      step: "metadata-wc-id",
      target: jp.handle,
      detail: `wc_id ${current || "—"} -> ${jp.wcId}`,
    })
    if (apply) {
      await productModule.updateProducts(mp.id, {
        metadata: {
          ...((mp as any).metadata || {}),
          wc_id: jp.wcId,
        },
      })
    }
  }

  // ---------------------------------------------------------- 8 inventario D4
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
    pagination: { take: 10, skip: 0 },
  })
  const defaultLocationId = stockLocations?.[0]?.id as string | undefined

  const { data: allLevels } = await query.graph({
    entity: "inventory_level",
    fields: ["id", "stocked_quantity", "inventory_item_id", "location_id"],
    pagination: { take: 10000, skip: 0 },
  })
  const levelsByItem = new Map<string, any[]>()
  for (const level of allLevels || []) {
    const list = levelsByItem.get(level.inventory_item_id) || []
    list.push(level)
    levelsByItem.set(level.inventory_item_id, list)
  }

  for (const jp of jsonProducts) {
    const mp = medusaByHandle.get(jp.handle)
    if (!mp) continue
    const variant = mp.variants?.[0]
    if (!variant) continue

    const targetQty = jp.inStock ? 1 : 0

    const { data: links } = await query.graph({
      entity: "product_variant",
      fields: [
        "id",
        "inventory_items.inventory_item_id",
        "inventory_items.inventory.location_levels.id",
        "inventory_items.inventory.location_levels.location_id",
        "inventory_items.inventory.location_levels.stocked_quantity",
      ],
      filters: { id: variant.id },
    })
    const linkRow = links?.[0] as any
    const itemId =
      linkRow?.inventory_items?.[0]?.inventory_item_id ||
      linkRow?.inventory_items?.[0]?.inventory?.id

    if (!itemId) {
      if (jp.inStock !== undefined) {
        actions.push({
          step: "inventory",
          target: jp.handle,
          detail: `sin inventory_item; manage_inventory=${Boolean(jp.inStock)}`,
        })
        if (apply) {
          await productModule.updateProductVariants(variant.id, {
            manage_inventory: Boolean(jp.inStock),
            allow_backorder: !jp.inStock,
          })
        }
      }
      continue
    }

    const nestedLevel =
      linkRow?.inventory_items?.[0]?.inventory?.location_levels?.[0]
    const level =
      nestedLevel?.location_id != null
        ? nestedLevel
        : (levelsByItem.get(itemId) || [])[0]

    const locationId = level?.location_id || defaultLocationId
    if (!locationId) {
      actions.push({
        step: "inventory",
        target: jp.handle,
        detail: "sin stock_location para ajustar inventario",
        skipped: "missing-location",
      })
      continue
    }

    const currentQty = Number(level?.stocked_quantity ?? -1)
    if (currentQty === targetQty) continue

    actions.push({
      step: "inventory",
      target: jp.handle,
      detail: `stock ${currentQty < 0 ? "?" : currentQty} -> ${targetQty}`,
    })

    if (!apply) continue

    if (level?.id || level?.location_id) {
      await inventoryModule.updateInventoryLevels({
        inventory_item_id: itemId,
        location_id: locationId,
        stocked_quantity: targetQty,
      })
    } else {
      await inventoryModule.createInventoryLevels({
        inventory_item_id: itemId,
        location_id: locationId,
        stocked_quantity: targetQty,
      })
    }
  }

  // ------------------------------------------------------------------ reporte
  const byStep = new Map<string, number>()
  for (const a of actions) {
    byStep.set(a.step, (byStep.get(a.step) || 0) + 1)
  }

  const report = {
    generatedAt: new Date().toISOString(),
    mode: apply ? "apply" : "dry-run",
    decisions: ["D1", "D2", "D3", "D4", "D5"],
    totalActions: actions.length,
    byStep: Object.fromEntries(byStep),
    actions,
  }

  fs.mkdirSync(REPORT_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 15)
  const reportPath = path.join(REPORT_DIR, `reconcile-plan-${stamp}.json`)
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  console.log("")
  console.log(`Acciones planificadas: ${actions.length}`)
  for (const [step, count] of byStep) {
    console.log(`  ${step}: ${count}`)
  }
  console.log(`Reporte: ${reportPath}`)

  if (!apply) {
    console.log("")
    console.log("DRY-RUN: no se modifico Medusa.")
    console.log(
      "Para aplicar: npx medusa exec ./src/scripts/reconcile-catalog-cutover.ts apply"
    )
  } else {
    console.log("")
    console.log("APPLY completado. Ejecute verify-catalog-cutover.ts a continuacion.")
  }
  console.log("=".repeat(70))
}
