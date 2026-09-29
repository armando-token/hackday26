import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import * as fs from "fs"
import { assertDestructiveLegacyAllowed } from "./lib/legacy-script-guard"

export default async function enrichCatalogAll({ container }: ExecArgs) {
  assertDestructiveLegacyAllowed("enrich-catalog-all.ts")
  const logger = container.resolve("logger")
  const productModule = container.resolve(Modules.PRODUCT)
  const pricingModule = container.resolve(Modules.PRICING)
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const remoteLink = container.resolve("remoteLink")

  logger.info("Iniciando enriquecimiento completo de categorías y precios...")

  const rawProducts = JSON.parse(
    fs.readFileSync("/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/data/products.json", "utf-8")
  )

  const allCategories = await productModule.listProductCategories({}, { take: 200 })
  const categoryMap = new Map<string, any>()
  for (const c of allCategories) {
    categoryMap.set(c.handle, c)
  }

  const SLUG_ALIASES: Record<string, string> = {
    "accesorios-sensores": "temperatura-termopar-rtd",
    "transmisores-temperatura": "transmisores",
    "sistemas-llave-en-mano": "resistencias-proceso",
    "termostatos-industriales": "termostatos-linea",
    "gases-co2": "sensores-ambientales",
    "controles-anticongelamiento": "controles-deshielo",
    "ventiladores-alta-velocidad": "ventilacion",
    "accesorios-ventilacion": "ventilacion",
    "unidades-monitoreo": "plataformas",
    "monitoreo-energia": "gateways",
    "interfaces-industriales": "gateways",
    "monitoreo-inalambrico-climate": "gateways",
    "comunicacion-inalambrica": "gateways",
    "monitoreo-condicion-telik": "gateways",
    "sustratos-hidroponicos": "otros",
    "unit-heaters": "unit-heaters-industriales",
    "calentadores-tambor": "resistencias-proceso",
    "accesorios-entrenamiento": "otros",
    "deteccion-fugas": "sensores-ambientales",
    "reles-ssr": "io-relays",
  }

  const channels = await salesChannelModule.listSalesChannels({})
  const channelId = channels[0]?.id

  const allDbProducts = await productModule.listProducts({}, { relations: ["variants", "categories"], take: 1000 })
  logger.info(`Productos encontrados en DB: ${allDbProducts.length}`)

  // Create a map by title (normalized) and by handle
  const dbByTitle = new Map<string, any>()
  const dbByHandle = new Map<string, any>()
  for (const p of allDbProducts) {
    dbByTitle.set(p.title.trim().toLowerCase(), p)
    dbByHandle.set(p.handle.trim().toLowerCase(), p)
  }

  let catUpdated = 0
  let priceUpdated = 0

  for (let i = 0; i < rawProducts.length; i++) {
    const raw = rawProducts[i]
    const titleKey = raw.title.trim().toLowerCase()
    const handleKey = (raw.handle || "").trim().toLowerCase()

    const dbProd = dbByTitle.get(titleKey) || dbByHandle.get(handleKey)
    if (!dbProd) {
      continue
    }

    // 1. Assign Categories
    let targetSlug = raw.categorySlug || raw.leafSlug
    if (targetSlug && SLUG_ALIASES[targetSlug]) {
      targetSlug = SLUG_ALIASES[targetSlug]
    }
    const cat = targetSlug ? categoryMap.get(targetSlug) : null
    const categoryIds: string[] = []
    if (cat) {
      categoryIds.push(cat.id)
      if (cat.parent_category_id && !categoryIds.includes(cat.parent_category_id)) {
        categoryIds.push(cat.parent_category_id)
      }
    }

    const currentCatIds = (dbProd.categories || []).map((c: any) => c.id)
    if (categoryIds.length > 0 && currentCatIds.length === 0) {
      try {
        await productModule.updateProducts(dbProd.id, {
          category_ids: categoryIds,
        })
        catUpdated++
      } catch (e: any) {
        logger.warn(`Error al actualizar categorías para ${dbProd.title}: ${e.message}`)
      }
    }

    // 2. Price Sets
    const pricePen = raw.price && typeof raw.price === "number" && raw.price > 0 ? Math.round(raw.price * 100) : 0
    const priceUsd = pricePen > 0 ? Math.round((raw.price / 3.75) * 100) : 0
    const variant = dbProd.variants?.[0]

    if (variant && pricePen > 0) {
      try {
        const priceSet = await pricingModule.createPriceSets({
          prices: [
            { amount: pricePen, currency_code: "pen" },
            { amount: priceUsd, currency_code: "usd" },
          ],
        })

        await remoteLink.create([
          {
            productModuleService: { variant_id: variant.id },
            pricingModuleService: { price_set_id: priceSet.id },
          },
        ])
        priceUpdated++
      } catch (e) {}
    }

    // 3. Sales Channel Link
    if (channelId) {
      try {
        await remoteLink.create([
          {
            productModuleService: { product_id: dbProd.id },
            salesChannelModuleService: { sales_channel_id: channelId },
          },
        ])
      } catch (e) {}
    }
  }

  logger.info(`✅ Enriquecimiento completado:`)
  logger.info(`   - Categorías asignadas a productos: ${catUpdated}`)
  logger.info(`   - Precios (PEN/USD) vinculados a variantes: ${priceUpdated}`)
}
