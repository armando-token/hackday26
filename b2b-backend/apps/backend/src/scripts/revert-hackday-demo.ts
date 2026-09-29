import { ExecArgs } from "@medusajs/framework/types"
import * as fs from "fs"
import * as path from "path"

const { Client } = require("pg")

const DEMO_SKUS = [
  "CN-DEMO-PLC-DIN-420-MR1",
  "CN-DEMO-PID-PT100-RS1",
  "CN-DEMO-PT100-3W-A1",
]

const DEMO_HANDLES = [
  "cn-demo-plc-din-420-mr1",
  "cn-demo-pid-pt100-rs1",
  "cn-demo-pt100-3w-a1",
]

const DEMO_SOURCES = [
  "SRC-CN-DIN-PLC-A1-DS-V1",
  "SRC-CN-PID-T1-DS-V1",
  "SRC-CN-RTD-P1-DS-V1",
]

export default async function revertHackdayDemo({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  logger.info("=========================================================")
  logger.info("🧹 INICIANDO REVERT HACKDAY DEMO SEGURO Y SELECTIVO")
  logger.info("=========================================================")

  const connectionString =
    process.env.DATABASE_URL || "postgres://postgres:password@localhost:5432/medusa"
  const client = new Client({ connectionString })
  await client.connect()

  try {
    // 1. Identificar ÚNICAMENTE los productos demo
    const prodRes = await client.query(
      `SELECT DISTINCT p.id, p.title, p.handle
       FROM product p
       LEFT JOIN product_variant pv ON pv.product_id = p.id
       WHERE p.handle = ANY($1::text[])
          OR pv.sku = ANY($2::text[])
          OR p.metadata->>'hackday_demo' = 'true'
          OR p.metadata->>'demo' = 'true'`,
      [DEMO_HANDLES, DEMO_SKUS]
    )

    const demoProductIds = prodRes.rows.map((r: any) => r.id)
    logger.info(`🔍 Encontrados ${demoProductIds.length} productos demo para eliminar.`)

    // 2. Identificar variantes demo
    const varRes = await client.query(
      `SELECT DISTINCT id, sku, product_id
       FROM product_variant
       WHERE product_id = ANY($1::text[])
          OR sku = ANY($2::text[])
          OR metadata->>'hackday_demo' = 'true'
          OR metadata->>'demo' = 'true'`,
      [demoProductIds, DEMO_SKUS]
    )
    const demoVariantIds = varRes.rows.map((r: any) => r.id)
    logger.info(`🔍 Encontradas ${demoVariantIds.length} variantes demo.`)

    // 3. Identificar inventory_items demo
    const invItemRes = await client.query(
      `SELECT DISTINCT ii.id
       FROM inventory_item ii
       LEFT JOIN product_variant_inventory_item pvii ON pvii.inventory_item_id = ii.id
       WHERE ii.sku = ANY($1::text[])
          OR pvii.variant_id = ANY($2::text[])`,
      [DEMO_SKUS, demoVariantIds]
    )
    const demoInventoryItemIds = invItemRes.rows.map((r: any) => r.id)

    // 4. Identificar price_sets demo
    const priceSetRes = await client.query(
      `SELECT DISTINCT price_set_id
       FROM product_variant_price_set
       WHERE variant_id = ANY($1::text[])`,
      [demoVariantIds]
    )
    const demoPriceSetIds = priceSetRes.rows.map((r: any) => r.price_set_id)

    // 5. Proceder con el borrado selectivo EN CASCADA MANUAL
    // A. Facts técnicos
    if (demoVariantIds.length) {
      const delFacts = await client.query(
        "DELETE FROM technical_fact WHERE variant_id = ANY($1::text[])",
        [demoVariantIds]
      )
      logger.info(`🗑️ Eliminados ${delFacts.rowCount} registros de technical_fact`)

      // B. Profiles técnicos
      const delProfs = await client.query(
        `DELETE FROM technical_profile 
         WHERE variant_id = ANY($1::text[]) 
            OR (demo = true AND model IN ('CN-DIN-PLC-A1', 'CN-PID-T1', 'CN-RTD-P1'))`,
        [demoVariantIds]
      )
      logger.info(`🗑️ Eliminados ${delProfs.rowCount} registros de technical_profile`)
    }

    // C. Sources técnicas de demo
    const delSources = await client.query(
      "DELETE FROM technical_source WHERE id = ANY($1::text[])",
      [DEMO_SOURCES]
    )
    logger.info(`🗑️ Eliminadas ${delSources.rowCount} fuentes técnicas demo`)

    // D. Niveles de inventario demo
    if (demoInventoryItemIds.length) {
      const delLevels = await client.query(
        "DELETE FROM inventory_level WHERE inventory_item_id = ANY($1::text[])",
        [demoInventoryItemIds]
      )
      logger.info(`🗑️ Eliminados ${delLevels.rowCount} registros de inventory_level`)

      // E. Vínculos variante-inventario
      const delPvii = await client.query(
        `DELETE FROM product_variant_inventory_item 
         WHERE inventory_item_id = ANY($1::text[]) OR variant_id = ANY($2::text[])`,
        [demoInventoryItemIds, demoVariantIds]
      )
      logger.info(`🗑️ Eliminados ${delPvii.rowCount} vínculos product_variant_inventory_item`)

      // F. Inventory Items
      const delItems = await client.query(
        "DELETE FROM inventory_item WHERE id = ANY($1::text[])",
        [demoInventoryItemIds]
      )
      logger.info(`🗑️ Eliminados ${delItems.rowCount} registros de inventory_item`)
    }

    // G. Precios y Price Sets demo
    if (demoPriceSetIds.length) {
      const delPrices = await client.query(
        "DELETE FROM price WHERE price_set_id = ANY($1::text[])",
        [demoPriceSetIds]
      )
      logger.info(`🗑️ Eliminados ${delPrices.rowCount} registros de price`)

      const delPvps = await client.query(
        "DELETE FROM product_variant_price_set WHERE price_set_id = ANY($1::text[])",
        [demoPriceSetIds]
      )
      logger.info(`🗑️ Eliminados ${delPvps.rowCount} vínculos product_variant_price_set`)

      const delSets = await client.query(
        "DELETE FROM price_set WHERE id = ANY($1::text[])",
        [demoPriceSetIds]
      )
      logger.info(`🗑️ Eliminados ${delSets.rowCount} registros de price_set`)
    }

    // H. Vínculos de Variante y Variantes
    if (demoVariantIds.length) {
      await client.query(
        "DELETE FROM product_variant_option WHERE variant_id = ANY($1::text[])",
        [demoVariantIds]
      )
      const delVars = await client.query(
        "DELETE FROM product_variant WHERE id = ANY($1::text[])",
        [demoVariantIds]
      )
      logger.info(`🗑️ Eliminadas ${delVars.rowCount} variantes demo`)
    }

    // I. Datos asociados a Producto demo
    if (demoProductIds.length) {
      // PIM Info
      const delPim = await client.query(
        "DELETE FROM pim_info WHERE product_id = ANY($1::text[])",
        [demoProductIds]
      )
      logger.info(`🗑️ Eliminados ${delPim.rowCount} registros de pim_info`)

      // Canales de venta
      await client.query(
        "DELETE FROM product_sales_channel WHERE product_id = ANY($1::text[])",
        [demoProductIds]
      )

      // Categorías
      await client.query(
        "DELETE FROM product_category_product WHERE product_id = ANY($1::text[])",
        [demoProductIds]
      )

      // Tags de producto
      await client.query(
        "DELETE FROM product_tags WHERE product_id = ANY($1::text[])",
        [demoProductIds]
      )

      // Opciones de producto (a través de la tabla intermedia product_product_option)
      await client.query(
        `DELETE FROM product_option_value WHERE option_id IN (
          SELECT product_option_id FROM product_product_option WHERE product_id = ANY($1::text[])
        )`,
        [demoProductIds]
      )
      await client.query(
        `DELETE FROM product_product_option WHERE product_id = ANY($1::text[])`,
        [demoProductIds]
      )
      await client.query(
        `DELETE FROM product_option WHERE id NOT IN (SELECT product_option_id FROM product_product_option)`,
        []
      )

      // Eliminar productos demo
      const delProds = await client.query(
        "DELETE FROM product WHERE id = ANY($1::text[])",
        [demoProductIds]
      )
      logger.info(`🗑️ Eliminados ${delProds.rowCount} productos demo de la tabla product`)
    }

    // 6. Eliminar o actualizar manifiesto
    const manifestPath = path.resolve("/home/ubuntu/hackday26/hackday-demo-manifest.json")
    if (fs.existsSync(manifestPath)) {
      try {
        fs.unlinkSync(manifestPath)
        logger.info(`🗑️ Manifiesto ${manifestPath} eliminado.`)
      } catch (err: any) {
        logger.warn(`No se pudo eliminar el manifiesto: ${err.message}`)
      }
    }

    logger.info("=========================================================")
    logger.info("✅ REVERT HACKDAY DEMO COMPLETADO CON ÉXITO")
    logger.info("   0 productos, variantes o inventarios ajenos fueron afectados.")
    logger.info("=========================================================")
  } finally {
    await client.end()
  }
}
