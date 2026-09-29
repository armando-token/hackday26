import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function auditSystem({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const productModule = container.resolve(Modules.PRODUCT)
  const brandService = container.resolve("brandModuleService")
  const pimService = container.resolve("b2bPim")
  const regionService = container.resolve(Modules.REGION)
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)

  logger.info("==========================================================")
  logger.info("🔍 INICIANDO AUDITORÍA INTEGRAL DE SISTEMA Y BASE DE DATOS")
  logger.info("==========================================================")

  // 1. Audit Products
  const [products, totalProducts] = await productModule.listAndCountProducts({}, {
    relations: ["variants", "variants.prices", "categories"],
    take: 1000,
  })
  logger.info(`[PRODUCTOS] Total en base de datos: ${totalProducts}`)

  let withoutPrices = 0
  let withPenAndUsd = 0
  let withoutCategories = 0
  let withoutThumbnail = 0
  let withoutSku = 0

  for (const p of products) {
    const v = p.variants?.[0]
    if (!v) {
      logger.warn(`⚠️ Producto sin variantes: ${p.title} (${p.id})`)
      continue
    }
    if (!v.sku) withoutSku++
    if (!v.prices || v.prices.length === 0) {
      withoutPrices++
    } else {
      const pen = v.prices.some((pr: any) => pr.currency_code === "pen")
      const usd = v.prices.some((pr: any) => pr.currency_code === "usd")
      if (pen && usd) withPenAndUsd++
    }
    if (!p.categories || p.categories.length === 0) withoutCategories++
    if (!p.thumbnail) withoutThumbnail++
  }

  logger.info(`  - Productos con precios PEN y USD: ${withPenAndUsd}`)
  logger.info(`  - Productos de cotización/sin precio base: ${withoutPrices}`)
  logger.info(`  - Productos sin categoría asignada: ${withoutCategories}`)
  logger.info(`  - Productos sin thumbnail: ${withoutThumbnail}`)
  logger.info(`  - Productos sin SKU: ${withoutSku}`)

  // 2. Audit Categories
  const [categories, totalCategories] = await productModule.listAndCountProductCategories({}, {
    take: 200,
  })
  const activeCats = categories.filter((c: any) => c.is_active && !c.is_internal)
  const l1Cats = activeCats.filter((c: any) => !c.parent_category_id)
  const l2Cats = activeCats.filter((c: any) => !!c.parent_category_id)

  logger.info(`[CATEGORÍAS] Total categorías: ${totalCategories}`)
  logger.info(`  - Familias L1 (Raíz activas): ${l1Cats.length}`)
  logger.info(`  - Subcategorías L2 (Hojas activas): ${l2Cats.length}`)

  // 3. Audit Brands
  const [brands, totalBrands] = await brandService.listAndCountBrands({})
  logger.info(`[MARCAS] Total marcas en módulo Brand: ${totalBrands}`)
  const authBrands = brands.filter((b: any) => b.is_authorized_distributor)
  logger.info(`  - Marcas con Distribuidor Autorizado = true: ${authBrands.length}/${totalBrands}`)

  // 4. Audit PIM
  const pimInfos = await (pimService as any).listPimInfos({})
  logger.info(`[PIM B2B] Total registros de especificaciones PIM: ${pimInfos.length}`)
  let withSpecs = 0
  let withPdf = 0
  let quoteOnly = 0
  let buyNow = 0
  for (const info of pimInfos) {
    if (info.specs && Object.keys(info.specs).length > 0) withSpecs++
    if (info.technical_pdf) withPdf++
    if (info.purchase_mode === "quote_only") quoteOnly++
    if (info.purchase_mode === "buy_now") buyNow++
  }
  logger.info(`  - Productos con especificaciones técnicas estructuradas: ${withSpecs}`)
  logger.info(`  - Productos con Ficha Técnica PDF: ${withPdf}`)
  logger.info(`  - Productos con modalidad Comprar Directo: ${buyNow}`)
  logger.info(`  - Productos con modalidad Solo Cotización: ${quoteOnly}`)

  // 5. Audit Regions and Sales Channels
  const regions = await regionService.listRegions({})
  logger.info(`[REGIONES] Total regiones comerciales: ${regions.length}`)
  for (const r of regions) {
    logger.info(`  - Región: ${r.name} (${r.currency_code.toUpperCase()})`)
  }

  const channels = await salesChannelService.listSalesChannels({})
  logger.info(`[CANALES DE VENTA] Total canales: ${channels.length}`)

  logger.info("==========================================================")
  logger.info("✅ AUDITORÍA DE DATOS DE BACKEND FINALIZADA")
  logger.info("==========================================================")
}
