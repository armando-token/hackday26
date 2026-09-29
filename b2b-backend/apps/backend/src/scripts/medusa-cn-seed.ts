import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import * as fs from "fs"
import * as path from "path"
import { assertDestructiveLegacyAllowed } from "./lib/legacy-script-guard"

export default async function medusaCnSeed({ container }: ExecArgs) {
  assertDestructiveLegacyAllowed("medusa-cn-seed.ts")
  const logger = container.resolve("logger")
  const productModule = container.resolve(Modules.PRODUCT)
  const regionService = container.resolve(Modules.REGION)
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
  const apiKeyService = container.resolve(Modules.API_KEY)
  const brandService = container.resolve("brandModuleService")
  const pimService = container.resolve("b2bPim")
  const remoteLink = container.resolve("remoteLink")
  const userModule = container.resolve(Modules.USER)
  const authIdentityModule = container.resolve(Modules.AUTH)

  logger.info("=========================================================")
  logger.info("🚀 INICIANDO MIGRACIÓN MAESTRA DEL CATÁLOGO CONTROL NAUTAS")
  logger.info("=========================================================")

  // -------------------------------------------------------------------------
  // 1. CANAL DE VENTAS Y API KEY
  // -------------------------------------------------------------------------
  let defaultSalesChannel = await salesChannelService.listSalesChannels({ name: "Default Sales Channel" })
  if (!defaultSalesChannel.length) {
    defaultSalesChannel = [
      await salesChannelService.createSalesChannels({
        name: "Default Sales Channel",
        description: "Canal de ventas B2B principal de Control Nautas",
      }),
    ]
  }
  const salesChannelId = defaultSalesChannel[0].id
  logger.info(`✅ Canal de Ventas Activo: ${defaultSalesChannel[0].name} (${salesChannelId})`)

  const apiKeys = await apiKeyService.listApiKeys({ title: "Industrial Storefront Key" })
  let pubKey = apiKeys[0]
  if (!pubKey) {
    pubKey = await apiKeyService.createApiKeys({
      title: "Industrial Storefront Key",
      type: "publishable",
      token: "pk_eb1292e091094841f6432858a500b61842aeca4ebe6a490d218b5db7a6b6985e",
      created_by: "seed",
    })
  }
  try {
    await remoteLink.create([
      {
        apiKeyModuleService: { apiKey_id: pubKey.id },
        salesChannelModuleService: { sales_channel_id: salesChannelId },
      },
    ])
    logger.info("✅ API Key Publishable vinculada al canal de ventas")
  } catch (e) {
    logger.info("ℹ️ API Key ya vinculada al canal de ventas")
  }

  // -------------------------------------------------------------------------
  // 2. REGIONES (PERÚ - PEN y USD)
  // -------------------------------------------------------------------------
  const allRegions = await regionService.listRegions({})
  let peRegion = allRegions.find((r: any) => r.currency_code === "pen" || r.name === "Perú")
  if (!peRegion) {
    try {
      peRegion = await regionService.createRegions({
        name: "Perú",
        currency_code: "pen",
        countries: ["pe"],
        payment_providers: ["manual"],
      })
      logger.info("✅ Región Perú (PEN - S/.) creada")
    } catch (e) {
      logger.info("ℹ️ Región Perú ya configurada")
    }
  } else {
    logger.info("✅ Región Perú (PEN - S/.) existente detectada")
  }

  let usRegion = allRegions.find((r: any) => r.currency_code === "usd" || r.name === "US" || r.name === "Internacional")
  if (!usRegion) {
    try {
      usRegion = await regionService.createRegions({
        name: "Internacional",
        currency_code: "usd",
        countries: ["cl", "co", "mx"],
        payment_providers: ["manual"],
      })
      logger.info("✅ Región Internacional (USD - $) creada")
    } catch (e) {
      logger.info("ℹ️ Región USD ya configurada")
    }
  } else {
    logger.info(`✅ Región USD existente detectada: ${usRegion.name}`)
  }
  logger.info("✅ Región Internacional (USD - $) configurada")

  // -------------------------------------------------------------------------
  // 3. LIMPIEZA DE PRODUCTOS / CATEGORÍAS STARTER DEMO (SWEATPANTS, ETC.)
  // -------------------------------------------------------------------------
  const currentProducts = await productModule.listProducts({}, { take: 1000 })
  for (const prod of currentProducts) {
    if (prod.handle?.includes("sweatpants") || prod.handle?.includes("shirt") || prod.handle?.includes("ind-prod-") || prod.handle?.includes("mfr-")) {
      try {
        await productModule.deleteProducts([prod.id])
        logger.info(`🧹 Eliminado producto de prueba demo: ${prod.title}`)
      } catch (e) {}
    }
  }

  const currentCategories = await productModule.listProductCategories({}, { take: 100 })
  for (const cat of currentCategories) {
    if (["shirts", "sweatshirts", "pants", "merch"].includes(cat.handle)) {
      try {
        await productModule.deleteProductCategories([cat.id])
        logger.info(`🧹 Eliminada categoría de prueba demo: ${cat.name}`)
      } catch (e) {}
    }
  }

  // -------------------------------------------------------------------------
  // 4. MARCAS OFICIALES DE DISTRIBUIDOR AUTORIZADO (MÓDULO BRAND)
  // -------------------------------------------------------------------------
  const BRANDS_DEF = [
    { name: "NOVUS Automation", handle: "novus", country: "Brasil", website: "https://www.novusautomation.com", isAuth: true, sort: 10 },
    { name: "Horner APG", handle: "horner", country: "Estados Unidos", website: "https://www.hornerautomation.com", isAuth: true, sort: 20 },
    { name: "ROCKWOOL", handle: "rockwool", country: "Dinamarca / Global", website: "https://www.rockwool.com", isAuth: true, sort: 30 },
    { name: "Chromalox", handle: "chromalox", country: "Estados Unidos", website: "https://www.chromalox.com", isAuth: true, sort: 40 },
    { name: "AKCP", handle: "akcp", country: "Estados Unidos / Global", website: "https://www.akcp.com", isAuth: true, sort: 50 },
    { name: "King Electric", handle: "king-electric", country: "Estados Unidos", website: "https://www.king-electric.com", isAuth: true, sort: 60 },
    { name: "MPI Melt Pressure", handle: "mpi", country: "Estados Unidos", website: "https://www.mpimeltpressure.com", isAuth: true, sort: 70 },
    { name: "Tzone Digital", handle: "tzone", country: "Global", website: "https://www.tzonedigital.com", isAuth: true, sort: 80 },
    { name: "EMS Kontrol", handle: "ems-kontrol", country: "Turquía", website: "https://www.emskontrol.com", isAuth: true, sort: 90 },
    { name: "Termolan", handle: "termolan", country: "Global", website: "https://www.termolan.pt", isAuth: true, sort: 100 },
    { name: "Sinopan", handle: "sinopan", country: "Global", website: "https://www.sinopan.com", isAuth: true, sort: 110 },
    { name: "Huanrui", handle: "huanrui", country: "Global", website: "https://www.huanrui.com", isAuth: true, sort: 120 },
    { name: "Perfect", handle: "perfect", country: "Global", website: "https://www.perfect.com", isAuth: true, sort: 130 },
    { name: "Control Nautas", handle: "control-nautas", country: "Perú", website: "https://www.controlnautas.com", isAuth: true, sort: 140 },
  ]

  const brandMap = new Map<string, any>()
  for (const b of BRANDS_DEF) {
    const existing = await brandService.listBrands({ handle: b.handle })
    let brandObj
    if (existing.length) {
      brandObj = existing[0]
      await brandService.updateBrands({
        id: brandObj.id,
        name: b.name,
        country_of_origin: b.country,
        website_url: b.website,
        is_authorized_distributor: b.isAuth,
        sort_order: b.sort,
      })
    } else {
      brandObj = await brandService.createBrands({
        name: b.name,
        handle: b.handle,
        country_of_origin: b.country,
        website_url: b.website,
        is_authorized_distributor: b.isAuth,
        sort_order: b.sort,
      })
    }
    brandMap.set(b.handle, brandObj)
    brandMap.set(b.name.toLowerCase(), brandObj)
    // Common aliases
    if (b.handle === "novus") brandMap.set("novus", brandObj)
    if (b.handle === "horner") brandMap.set("horner", brandObj)
    if (b.handle === "rockwool") brandMap.set("rockwool", brandObj)
    if (b.handle === "king-electric") brandMap.set("king electric", brandObj)
    if (b.handle === "mpi") brandMap.set("mpi", brandObj)
    if (b.handle === "tzone") brandMap.set("tzone", brandObj)
    if (b.handle === "ems-kontrol") brandMap.set("ems kontrol", brandObj)
  }
  logger.info(`✅ ${BRANDS_DEF.length} Marcas Oficiales de Distribuidor creadas/actualizadas en módulo Brand`)

  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // 5. TAXONOMÍA JERÁRQUICA: 10 FAMILIAS L1 Y 44 SUBCATEGORÍAS L2
  // -------------------------------------------------------------------------
  const TAXONOMY_L1 = [
    {
      name: "Aislamiento Térmico",
      handle: "aislamiento-termico",
      description: "Paneles de lana mineral, cañuelas, mantas, espuma elastomérica y paneles sándwich aislantes.",
      children: [
        { name: "Paneles y Placas de Lana Mineral", handle: "paneles-lana-roca" },
        { name: "Mantas y Cañuelas Aislantes", handle: "mantas-canuelas" },
        { name: "Aislamiento Elastomérico y Accesorios", handle: "espuma-elastomerica" },
        { name: "Paneles Sándwich Aislantes", handle: "paneles-sandwich" },
      ],
    },
    {
      name: "Automatización PLC y HMI",
      handle: "automatizacion-plc-hmi",
      description: "PLC+HMI todo en uno, PLC sin pantalla, E/S de expansión y módulos remotos.",
      children: [
        { name: "PLC + HMI Todo en Uno", handle: "plc-hmi" },
        { name: "PLC y Controladores sin Pantalla", handle: "controladores-remotos" },
        { name: "E/S de Expansión y E/S Remotas", handle: "expansion-io" },
        { name: "Accesorios y Entrenamiento", handle: "accesorios-entrenamiento" },
      ],
    },
    {
      name: "Registro de Datos",
      handle: "registro-de-datos",
      description: "Data loggers autónomos e industriales para cadena de frío y procesos.",
      children: [
        { name: "Data Loggers Cadena de Frío", handle: "loggers-cadena-frio" },
        { name: "Data Loggers Industriales", handle: "loggers-industriales" },
      ],
    },
    {
      name: "Comunicación Industrial e IoT",
      handle: "comunicacion-industrial",
      description: "Gateways 4G/Wi-Fi, convertidores de protocolo Modbus/Profibus, enlaces LoRa e interfaces IO-Link.",
      children: [
        { name: "Gateways IoT y Routers Industriales", handle: "gateways" },
        { name: "Gateways y Enlaces Inalámbricos / LoRa / RF", handle: "comunicacion-inalambrica" },
        { name: "Gateways, Convertidores e Interfaces Industriales", handle: "interfaces-industriales" },
      ],
    },
    {
      name: "Sensores y Transmisores Industriales",
      handle: "sensores-transmisores",
      description: "Sensores y transmisores de temperatura, humedad, presión, nivel y gases.",
      children: [
        { name: "Sensores de Temperatura", handle: "temperatura-termopar-rtd" },
        { name: "Transmisores de Temperatura", handle: "transmisores-temperatura" },
        { name: "Humedad y Temperatura", handle: "humedad-temperatura" },
        { name: "Presión, Presión Diferencial y Melt Pressure", handle: "presion-proceso" },
        { name: "Sensores de Nivel y Proximidad", handle: "nivel" },
        { name: "Gases Industriales y CO₂", handle: "gases-co2" },
        { name: "Accesorios de Sensores", handle: "accesorios-sensores" },
      ],
    },
    {
      name: "Calefacción Eléctrica",
      handle: "calefaccion-electrica",
      description: "Calefacción de ambiente y calentadores de proceso industrial.",
      children: [
        { name: "Calefactores de Pared, Techo y Gabinete", handle: "pared-conveccion" },
        { name: "Calefactores Portátiles e Industriales", handle: "portatiles" },
        { name: "Unit Heaters Comercial e Industrial", handle: "unit-heaters" },
        { name: "Calefactores de Zócalo", handle: "zocalo" },
        { name: "Calefactores Radiantes e Infrarrojos", handle: "radiante-infrarrojo" },
        { name: "Calefactores para Ducto, MAU y Plenum", handle: "ducto-mau-plenum" },
        { name: "Calefactores para Áreas Peligrosas / Antiexplosión", handle: "antiexplosion" },
        { name: "Calentadores de Cartucho", handle: "cartuchos" },
        { name: "Calentadores de Banda", handle: "bandas" },
        { name: "Calentadores de Tira (Strips)", handle: "strips" },
        { name: "Calentadores de Tambor", handle: "calentadores-tambor" },
        { name: "Calentadores Flexibles y Silicona", handle: "calentadores-flexibles" },
        { name: "Calentadores de Inmersión", handle: "inmersion" },
        { name: "Sistemas Llave en Mano", handle: "sistemas-llave-en-mano" },
        { name: "Termostatos de Calefacción", handle: "termostatos-linea" },
        { name: "Controles Anticongelamiento", handle: "controles-anticongelamiento" },
      ],
    },
    {
      name: "Cables Calefactores y Trazado Térmico",
      handle: "trazado-termico",
      description: "Cables autorregulables, deshielo de techos, suelo radiante y controles.",
      children: [
        { name: "Trazado Térmico de Tuberías y Proceso", handle: "cable-autorregulable" },
        { name: "Deshielo de Techos y Canaletas", handle: "techos-canalones" },
        { name: "Deshielo de Pavimentos / Snow Melt", handle: "deshielo-nieve" },
        { name: "Suelo Radiante Eléctrico", handle: "suelo-radiante" },
        { name: "Controles y Sensores de Heat Tracing", handle: "controles-deshielo" },
        { name: "Accesorios y Kits de Conexión", handle: "accesorios-trazado" },
      ],
    },
    {
      name: "Control e Indicación",
      handle: "control-e-indicacion",
      description: "Controladores PID de proceso, termostatos electrónicos ON/OFF, indicadores y relés SSR.",
      children: [
        { name: "Controladores PID de Proceso", handle: "controladores-pid" },
        { name: "Termostatos y Controladores Electrónicos", handle: "termostatos-industriales" },
        { name: "Indicadores de Proceso", handle: "indicadores-proceso" },
        { name: "Relés y SSR / Control de Potencia", handle: "reles-ssr" },
      ],
    },
    {
      name: "Monitoreo Industrial, Ambiental y Data Center",
      handle: "monitoreo-data-center",
      description: "Infraestructura crítica, plataformas AKCP, sensores ambientales RJ-45, fugas, energía y mantenimiento predictivo.",
      children: [
        { name: "Unidades, Plataformas y Módulos de Monitoreo", handle: "unidades-monitoreo" },
        { name: "Sensores Ambientales y Térmicos", handle: "sensores-ambientales" },
        { name: "Detección de Fugas de Agua y Combustible", handle: "deteccion-fugas" },
        { name: "Monitoreo de Energía, PUE y Consumos", handle: "monitoreo-energia" },
        { name: "Monitoreo de Condición y Mantenimiento Predictivo", handle: "monitoreo-condicion-telik" },
        { name: "Monitoreo Inalámbrico de Ambientes (Climate Air+)", handle: "monitoreo-inalambrico-climate" },
      ],
    },
    {
      name: "Otros y Agricultura",
      handle: "otros",
      description: "Sustratos hidropónicos, ventiladores industriales y accesorios.",
      children: [
        { name: "Sustratos Hidropónicos de Lana de Roca", handle: "sustratos-hidroponicos" },
        { name: "Ventiladores de Alta Velocidad y Circulación", handle: "ventiladores-alta-velocidad" },
        { name: "Accesorios y Kits para Ventiladores", handle: "accesorios-ventilacion" },
      ],
    },
  ]

  const categoryMap = new Map<string, any>()
  for (const l1 of TAXONOMY_L1) {
    let l1Cat = (await productModule.listProductCategories({ handle: l1.handle }))[0]
    if (!l1Cat) {
      l1Cat = await productModule.createProductCategories({
        name: l1.name,
        handle: l1.handle,
        description: l1.description,
      })
    }
    categoryMap.set(l1.handle, l1Cat)

    if (l1.children) {
      for (const l2 of l1.children) {
        let l2Cat = (await productModule.listProductCategories({ handle: l2.handle }))[0]
        if (!l2Cat) {
          l2Cat = await productModule.createProductCategories({
            name: l2.name,
            handle: l2.handle,
            parent_category_id: l1Cat.id,
          })
        }
        categoryMap.set(l2.handle, l2Cat)
      }
    }
  }
  logger.info(`✅ Taxonomía jerárquica (L1 + L2) sembrada en ProductCategory`)

  // -------------------------------------------------------------------------
  // 6. MIGRACIÓN DE LOS 523 PRODUCTOS INDUSTRIALES
  // -------------------------------------------------------------------------
  const productsJsonPath = path.resolve("/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/data/products.json")
  if (!fs.existsSync(productsJsonPath)) {
    throw new Error(`No se encontró el archivo de catálogo en: ${productsJsonPath}`)
  }

  const rawProducts = JSON.parse(fs.readFileSync(productsJsonPath, "utf-8"))
  logger.info(`📦 Cargando ${rawProducts.length} productos desde JSON...`)

  let createdCount = 0
  let updatedCount = 0
  const usedSkus = new Set<string>()
  const usedHandles = new Set<string>()

  for (let idx = 0; idx < rawProducts.length; idx++) {
    const p = rawProducts[idx]
    
    // Generate guaranteed unique handle
    let baseHandle = p.handle || p.slug || `cn-${p.itemNumber?.toLowerCase() || idx + 1}`
    baseHandle = baseHandle.toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-")
    let handle = baseHandle
    let hSuffix = 1
    while (usedHandles.has(handle)) {
      handle = `${baseHandle}-${++hSuffix}`
    }
    usedHandles.add(handle)
    
    // Determine category IDs
    const categoryIds: string[] = []
    const catSlug = p.categorySlug || p.leafSlug
    if (catSlug && categoryMap.has(catSlug)) {
      categoryIds.push(categoryMap.get(catSlug).id)
      const parent = categoryMap.get(catSlug).parent_category_id
      if (parent && !categoryIds.includes(parent)) {
        categoryIds.push(parent)
      }
    }

    // Determine Brand
    let brandObj = null
    if (p.brand) {
      const bKey = p.brand.toLowerCase().trim()
      brandObj = brandMap.get(bKey)
    }

    // Determine Prices
    const pricePen = p.price && typeof p.price === "number" && p.price > 0 ? Math.round(p.price * 100) : 0
    const priceUsd = pricePen > 0 ? Math.round((p.price / 3.75) * 100) : 0
    const purchaseMode = p.priceMode === "quote" || pricePen === 0 ? "quote_only" : "buy_now"

    // Thumbnail / Media
    const imagesList = Array.isArray(p.images) && p.images.length ? p.images : (p.image ? [p.image] : [])
    const thumbnail = imagesList[0] || "/cn-media/categories/calefaccion-electrica.webp"

    // Generate guaranteed unique SKU
    let baseSku = p.itemNumber || (p.mfrModel ? `${p.brand || 'CN'}-${p.mfrModel}` : `CN-${idx + 1}`)
    baseSku = baseSku.replace(/[\s\/\\]+/g, "-").substring(0, 45)
    let skuCode = baseSku
    let skuSuffix = 1
    while (usedSkus.has(skuCode)) {
      skuCode = `${baseSku}-${++skuSuffix}`
    }
    usedSkus.add(skuCode)

    try {
      // Check if product exists
      const existing = (await productModule.listProducts({ handle }))[0]

      let productId = ""
      if (existing) {
        productId = existing.id
        await productModule.updateProducts(productId, {
          title: p.title,
          subtitle: p.shortDescription ? p.shortDescription.substring(0, 255) : null,
          description: p.technicalDescription || p.shortDescription || p.title,
          thumbnail: thumbnail,
        })
        updatedCount++
      } else {
        const newProdDef: any = {
          title: p.title,
          handle: handle,
          subtitle: p.shortDescription ? p.shortDescription.substring(0, 255) : null,
          description: p.technicalDescription || p.shortDescription || p.title,
          thumbnail: thumbnail,
          status: "published",
          category_ids: categoryIds,
          options: [{ title: "Modelo", values: [p.mfrModel || "Estándar"] }],
          variants: [
            {
              title: p.mfrModel || "Estándar",
              sku: skuCode,
              manage_inventory: false,
              prices: pricePen > 0 ? [
                { amount: pricePen, currency_code: "pen" },
                { amount: priceUsd, currency_code: "usd" },
              ] : [],
              options: { Modelo: p.mfrModel || "Estándar" },
            },
          ],
        }

        const { result: created } = await createProductsWorkflow(container).run({
          input: {
            products: [newProdDef],
          },
        })
        if (created && created.length) {
          productId = created[0].id
          createdCount++
        }
      }

      // Link Brand
      if (productId && brandObj) {
        try {
          await remoteLink.create([
            {
              productModuleService: { product_id: productId },
              brandModuleService: { brand_id: brandObj.id },
            },
          ])
        } catch (e) {}
      }

      // Link Sales Channel
      if (productId) {
        try {
          await remoteLink.create([
            {
              productModuleService: { product_id: productId },
              salesChannelModuleService: { sales_channel_id: salesChannelId },
            },
          ])
        } catch (e) {}
      }

      // Create / Update PIM Info
      if (productId && pimService) {
        try {
          const existingPim = await pimService.listPimInfos({ product_id: productId })
          const pimData = {
            product_id: productId,
            mfr_model: p.mfrModel || null,
            item_number: p.itemNumber || null,
            purchase_mode: purchaseMode,
            availability_mode: p.availabilityMode || (p.inStock ? "in_stock" : "made_to_order"),
            oem_brand: p.brand || null,
            specs: p.specs || null,
            seo_title: `${p.title} | Control Nautas Perú`,
            seo_description: p.shortDescription ? p.shortDescription.substring(0, 160) : `${p.title} - Instrumentación Industrial B2B`,
          }

          if (existingPim.length) {
            await pimService.updatePimInfos({
              id: existingPim[0].id,
              ...pimData,
            })
          } else {
            await pimService.createPimInfos(pimData)
          }
        } catch (e) {}
      }

      if ((idx + 1) % 50 === 0 || idx + 1 === rawProducts.length) {
        logger.info(`⏳ Progreso: ${idx + 1}/${rawProducts.length} productos procesados (${createdCount} creados, ${updatedCount} actualizados)...`)
      }
    } catch (err: any) {
      logger.warn(`⚠️ Error procesando producto #${idx + 1} (${p.title}): ${err.message}`)
    }
  }

  logger.info(`=========================================================`)
  logger.info(`🎉 MIGRACIÓN COMPLETADA CON ÉXITO:`)
  logger.info(`   - Productos Creados: ${createdCount}`)
  logger.info(`   - Productos Actualizados: ${updatedCount}`)
  logger.info(`   - Total en Catálogo: ${createdCount + updatedCount}`)
  logger.info(`=========================================================`)
}
