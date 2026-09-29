import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import * as fs from "fs"
import * as path from "path"
import { assertDestructiveLegacyAllowed } from "./lib/legacy-script-guard"

export default async function fixCatalogData({ container }: ExecArgs) {
  assertDestructiveLegacyAllowed("fix-catalog-data.ts")
  const logger = container.resolve("logger")
  const productModule = container.resolve(Modules.PRODUCT)
  const pricingModule = container.resolve(Modules.PRICING)
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const remoteLink = container.resolve("remoteLink")

  logger.info("==========================================================")
  logger.info("🔧 REFINAMIENTO DE DATOS: CATEGORÍAS, PRECIOS Y LINKS")
  logger.info("==========================================================")

  // 1. Clean demo categories
  const allCats = await productModule.listProductCategories({}, { take: 200 })
  for (const c of allCats) {
    if (["shirts", "sweatshirts", "pants", "merch"].includes(c.handle)) {
      try {
        await productModule.deleteProductCategories([c.id])
        logger.info(`🧹 Eliminada categoría demo: ${c.name}`)
      } catch (e) {}
    }
  }

  // Reload categories
  const validCategories = await productModule.listProductCategories({}, { take: 200 })
  const categoryMap = new Map<string, any>()
  for (const c of validCategories) {
    categoryMap.set(c.handle, c)
  }

  // Alias dictionary for legacy/alternate subcategory slugs
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

  // Get default sales channel
  const salesChannels = await salesChannelModule.listSalesChannels({})
  const defaultChannelId = salesChannels[0]?.id

  // Load raw products
  const productsJsonPath = "/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/data/products.json"
  const rawProducts = JSON.parse(fs.readFileSync(productsJsonPath, "utf-8"))

  // Fetch all Medusa products with variants
  const [medusaProducts] = await productModule.listAndCountProducts({}, {
    relations: ["variants", "categories"],
    take: 1000,
  })
  const medusaMapByHandle = new Map<string, any>()
  for (const mp of medusaProducts) {
    medusaMapByHandle.set(mp.handle, mp)
  }

  logger.info(`Analizando ${rawProducts.length} productos para asignación de categorías y precios...`)

  let updatedCategoriesCount = 0
  let pricesCreatedCount = 0
  let linkedSalesChannelCount = 0

  for (let idx = 0; idx < rawProducts.length; idx++) {
    const raw = rawProducts[idx]
    
    // Find matching medusa product (by handle prefix or sku)
    const baseHandle = (raw.handle || raw.slug || `cn-${raw.itemNumber?.toLowerCase() || idx + 1}`)
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-")
    
    let medusaProd = medusaMapByHandle.get(baseHandle)
    if (!medusaProd) {
      // Find by matching title
      medusaProd = medusaProducts.find((p: any) => p.title === raw.title)
    }

    if (!medusaProd) continue

    // 1. Determine categories
    let targetSlug = raw.categorySlug || raw.leafSlug
    if (targetSlug && SLUG_ALIASES[targetSlug]) {
      targetSlug = SLUG_ALIASES[targetSlug]
    }

    const catObj = targetSlug ? categoryMap.get(targetSlug) : null
    const categoryIds: string[] = []
    if (catObj) {
      categoryIds.push(catObj.id)
      if (catObj.parent_category_id && !categoryIds.includes(catObj.parent_category_id)) {
        categoryIds.push(catObj.parent_category_id)
      }
    }

    // Update categories on product if missing
    const currentCatIds = (medusaProd.categories || []).map((c: any) => c.id)
    const needsCatUpdate = categoryIds.some((id) => !currentCatIds.includes(id))

    if (categoryIds.length > 0 && (needsCatUpdate || currentCatIds.length === 0)) {
      try {
        await productModule.updateProducts(medusaProd.id, {
          category_ids: categoryIds,
        })
        updatedCategoriesCount++
      } catch (e) {}
    }

    // 2. Pricing
    const pricePen = raw.price && typeof raw.price === "number" && raw.price > 0 ? Math.round(raw.price * 100) : 0
    const priceUsd = pricePen > 0 ? Math.round((raw.price / 3.75) * 100) : 0

    const variant = medusaProd.variants?.[0]
    if (variant && pricePen > 0) {
      try {
        // Create PriceSet with PEN and USD
        const priceSet = await pricingModule.createPriceSets({
          prices: [
            { amount: pricePen, currency_code: "pen" },
            { amount: priceUsd, currency_code: "usd" },
          ],
        })

        // Link Variant to PriceSet
        await remoteLink.create([
          {
            productModuleService: { variant_id: variant.id },
            pricingModuleService: { price_set_id: priceSet.id },
          },
        ])
        pricesCreatedCount++
      } catch (e) {}
    }

    // 3. Sales Channel Link
    if (defaultChannelId) {
      try {
        await remoteLink.create([
          {
            productModuleService: { product_id: medusaProd.id },
            salesChannelModuleService: { sales_channel_id: defaultChannelId },
          },
        ])
        linkedSalesChannelCount++
      } catch (e) {}
    }

    if ((idx + 1) % 100 === 0 || idx + 1 === rawProducts.length) {
      logger.info(`Progreso: ${idx + 1}/${rawProducts.length} procesados...`)
    }
  }

  logger.info("==========================================================")
  logger.info(`✅ REFINAMIENTO EXITOSO:`)
  logger.info(`   - Categorías actualizadas en productos: ${updatedCategoriesCount}`)
  logger.info(`   - PriceSets creados (PEN y USD): ${pricesCreatedCount}`)
  logger.info(`   - Productos vinculados a canal de ventas: ${linkedSalesChannelCount}`)
  logger.info("==========================================================")
}
